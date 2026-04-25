from fastapi import APIRouter, HTTPException
from database import get_supabase
from agents.collaboration_agent import run_collaboration

router = APIRouter(prefix="/collaboration", tags=["collaboration"])


@router.post("/{task_id}")
async def start_collaboration(task_id: str):
    try:
        db = get_supabase()

        # Get task
        task = db.table("tasks").select("*, agents(*)").eq("id", task_id).single().execute().data
        if not task:
            raise HTTPException(404, "Task not found")

        # Get all agents in workspace
        agents = db.table("agents").select("*").eq("workspace_id", task["workspace_id"]).eq("is_active", True).execute().data
        if len(agents) < 2:
            raise HTTPException(400, "Need at least 2 active agents to collaborate")

        # Run multi-agent graph
        result = run_collaboration(task=task, agents=agents)

        # Save collaboration record
        collab = db.table("collaborations").insert({
            "workspace_id": task["workspace_id"],
            "task_id": task_id,
            "messages": result["messages"],
            "summary": result["summary"],
            "status": "done",
        }).execute().data[0]

        return collab
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, str(e))


@router.get("/{task_id}")
async def get_collaboration(task_id: str):
    try:
        db = get_supabase()
        res = db.table("collaborations").select("*").eq("task_id", task_id).maybe_single().execute()
        return res.data
    except Exception as e:
        raise HTTPException(500, str(e))