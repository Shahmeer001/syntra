from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from database import get_supabase
from agents.meeting_agent import stream_meeting
import json
import uuid

router = APIRouter(prefix="/meeting", tags=["meeting"])


class MeetingStart(BaseModel):
    workspace_id: str
    topic: str


@router.post("/start")
async def start_meeting(data: MeetingStart):
    """Start a meeting — returns session_id, then client subscribes to /stream/{session_id}"""
    try:
        db = get_supabase()
        agents = db.table("agents").select("*").eq("workspace_id", data.workspace_id).eq("is_active", True).execute().data
        if not agents:
            raise HTTPException(400, "No active agents found in this workspace")

        session_id = str(uuid.uuid4())

        # Save user topic message
        db.table("meeting_messages").insert({
            "workspace_id": data.workspace_id,
            "agent_name": "You",
            "agent_icon": "👤",
            "agent_color": "#6b7280",
            "content": data.topic,
            "message_type": "user",
            "session_id": session_id,
        }).execute()

        return {"session_id": session_id, "agent_count": len(agents)}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, str(e))


@router.get("/stream/{workspace_id}/{session_id}")
async def stream_meeting_sse(workspace_id: str, session_id: str, topic: str):
    """SSE endpoint — streams agent responses one by one"""
    try:
        db = get_supabase()
        agents = db.table("agents").select("*").eq("workspace_id", workspace_id).eq("is_active", True).execute().data

        async def event_generator():
            async for message in stream_meeting(topic=topic, agents=agents, session_id=session_id):
                # Save to DB
                db.table("meeting_messages").insert({
                    "workspace_id": workspace_id,
                    "agent_id": message.get("agent_id"),
                    "agent_name": message["agent_name"],
                    "agent_icon": message["agent_icon"],
                    "agent_color": message["agent_color"],
                    "content": message["content"],
                    "message_type": "agent",
                    "session_id": session_id,
                }).execute()

                yield f"data: {json.dumps(message)}\n\n"

            yield f"data: {json.dumps({'type': 'done'})}\n\n"

        return StreamingResponse(
            event_generator(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "X-Accel-Buffering": "no",
            }
        )
    except Exception as e:
        raise HTTPException(500, str(e))


@router.get("/{workspace_id}/messages")
async def get_meeting_messages(workspace_id: str, session_id: str = None):
    try:
        db = get_supabase()
        query = db.table("meeting_messages").select("*").eq("workspace_id", workspace_id)
        if session_id:
            query = query.eq("session_id", session_id)
        res = query.order("created_at").execute()
        return res.data
    except Exception as e:
        raise HTTPException(500, str(e))


@router.delete("/{workspace_id}/messages")
async def clear_meeting_messages(workspace_id: str):
    try:
        db = get_supabase()
        db.table("meeting_messages").delete().eq("workspace_id", workspace_id).execute()
        return {"message": "Meeting history cleared"}
    except Exception as e:
        raise HTTPException(500, str(e))