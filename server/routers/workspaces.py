from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from database import get_supabase
 
router = APIRouter(prefix="/workspaces", tags=["workspaces"])
 
 
class WorkspaceCreate(BaseModel):
    name: str
    description: Optional[str] = ""
    industry: Optional[str] = ""
 
 
class WorkspaceUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    industry: Optional[str] = None
 
 
@router.get("")
async def list_workspaces():
    try:
        db = get_supabase()
        res = db.table("workspaces").select("*").order("created_at", desc=True).execute()
        return res.data
    except Exception as e:
        raise HTTPException(500, str(e))
 
 
@router.post("")
async def create_workspace(data: WorkspaceCreate):
    try:
        db = get_supabase()
        ws = db.table("workspaces").insert({
            "name": data.name,
            "description": data.description,
            "industry": data.industry,
        }).execute().data[0]
 
        # Auto-create free subscription
        db.table("subscriptions").insert({
            "workspace_id": ws["id"],
            "plan": "free",
            "agent_limit": 2,
            "task_limit": 10,
        }).execute()
 
        return ws
    except Exception as e:
        raise HTTPException(500, str(e))
 
 
@router.get("/{workspace_id}")
async def get_workspace(workspace_id: str):
    try:
        db = get_supabase()
        res = db.table("workspaces").select("*").eq("id", workspace_id).single().execute()
        return res.data
    except Exception as e:
        raise HTTPException(404, "Workspace not found")
 
 
@router.patch("/{workspace_id}")
async def update_workspace(workspace_id: str, data: WorkspaceUpdate):
    try:
        db = get_supabase()
        payload = {k: v for k, v in data.dict().items() if v is not None}
        res = db.table("workspaces").update(payload).eq("id", workspace_id).execute()
        return res.data[0]
    except Exception as e:
        raise HTTPException(500, str(e))
 
 
@router.delete("/{workspace_id}")
async def delete_workspace(workspace_id: str):
    try:
        db = get_supabase()
        db.table("workspaces").delete().eq("id", workspace_id).execute()
        return {"message": "Workspace deleted"}
    except Exception as e:
        raise HTTPException(500, str(e))
 
 
@router.get("/{workspace_id}/stats")
async def workspace_stats(workspace_id: str):
    try:
        db = get_supabase()
        agents = db.table("agents").select("id", count="exact").eq("workspace_id", workspace_id).execute()
        tasks  = db.table("tasks").select("id,status").eq("workspace_id", workspace_id).execute()
        sub    = db.table("subscriptions").select("*").eq("workspace_id", workspace_id).maybe_single().execute()
 
        task_list = tasks.data or []
        return {
            "total_agents": agents.count or 0,
            "total_tasks":  len(task_list),
            "pending":      sum(1 for t in task_list if t["status"] == "pending"),
            "in_progress":  sum(1 for t in task_list if t["status"] == "in_progress"),
            "done":         sum(1 for t in task_list if t["status"] == "done"),
            "plan":         sub.data["plan"] if sub.data else "free",
            "agent_limit":  sub.data["agent_limit"] if sub.data else 2,
        }
    except Exception as e:
        raise HTTPException(500, str(e))
 