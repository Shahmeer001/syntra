from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from database import get_supabase
from agents.task_agent import run_task_agent

router = APIRouter(prefix="/tasks", tags=["tasks"])


class TaskCreate(BaseModel):
    workspace_id: str
    assigned_agent_id: Optional[str] = None
    title: str
    description: Optional[str] = ""


class TaskStatusUpdate(BaseModel):
    status: str


@router.get("/{workspace_id}")
async def list_tasks(workspace_id: str):
    try:
        db = get_supabase()
        res = db.table("tasks").select("*, agents(name, icon, color, role)").eq("workspace_id", workspace_id).order("created_at", desc=True).execute()
        return res.data
    except Exception as e:
        raise HTTPException(500, str(e))


@router.post("")
async def create_task(data: TaskCreate):
    try:
        db = get_supabase()

        # Get agent persona if assigned
        agent = None
        if data.assigned_agent_id:
            agent_res = db.table("agents").select("*").eq("id", data.assigned_agent_id).single().execute()
            agent = agent_res.data

        # Run LangGraph task agent
        agent_output = run_task_agent(
            title=data.title,
            description=data.description,
            agent_persona=agent["persona"] if agent else None,
            agent_role=agent["role"] if agent else "General",
        )

        res = db.table("tasks").insert({
            "workspace_id": data.workspace_id,
            "assigned_agent_id": data.assigned_agent_id,
            "title": data.title,
            "description": data.description,
            "priority": agent_output.get("priority", "Medium"),
            "status": "pending",
            "agent_output": agent_output,
        }).execute()

        return res.data[0]
    except Exception as e:
        raise HTTPException(500, str(e))


@router.patch("/{task_id}/status")
async def update_task_status(task_id: str, data: TaskStatusUpdate):
    try:
        db = get_supabase()
        res = db.table("tasks").update({
            "status": data.status,
            "updated_at": "now()",
        }).eq("id", task_id).execute()
        return res.data[0]
    except Exception as e:
        raise HTTPException(500, str(e))


@router.delete("/{task_id}")
async def delete_task(task_id: str):
    try:
        db = get_supabase()
        db.table("tasks").delete().eq("id", task_id).execute()
        return {"message": "Task deleted"}
    except Exception as e:
        raise HTTPException(500, str(e))