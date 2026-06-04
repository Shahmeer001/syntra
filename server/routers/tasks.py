"""
routers/tasks.py - Task management endpoints
Updated to support autonomous background execution with logging.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from database import get_supabase
from agents.task_agent import run_task_agent
from task_executor import execute_task_background
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/tasks", tags=["tasks"])


class TaskCreate(BaseModel):
    workspace_id: str
    assigned_agent_id: Optional[str] = None
    title: str
    description: Optional[str] = ""


class TaskStatusUpdate(BaseModel):
    status: str


# ============================================
# GET: List all tasks in a workspace
# ============================================
@router.get("/{workspace_id}")
async def list_tasks(workspace_id: str):
    """
    Fetch all tasks for a workspace with agent info.
    Tasks will be in: pending, in_progress, or done status.
    """
    try:
        db = get_supabase()
        res = db.table("tasks") \
            .select("*, agents(name, icon, color, role)") \
            .eq("workspace_id", workspace_id) \
            .order("created_at", desc=True) \
            .execute()
        return res.data
    except Exception as e:
        logger.error(f"Failed to list tasks: {e}")
        raise HTTPException(500, str(e))


# ============================================
# POST: Create a new task (starts async execution)
# ============================================
@router.post("")
async def create_task(data: TaskCreate):
    """
    Create a task and immediately start autonomous execution.
    
    Flow:
    1. Insert task with 'pending' status
    2. Start background agent execution
    3. Return task immediately (execution happens async)
    4. Client polls execution_logs endpoint for progress
    
    Returns: Task object with pending status
    """
    try:
        db = get_supabase()

        # Get agent persona if assigned
        agent = None
        if data.assigned_agent_id:
            agent_res = db.table("agents") \
                .select("*") \
                .eq("id", data.assigned_agent_id) \
                .single() \
                .execute()
            agent = agent_res.data

        # === INSERT TASK WITH PENDING STATUS ===
        task_res = db.table("tasks").insert({
            "workspace_id": data.workspace_id,
            "assigned_agent_id": data.assigned_agent_id,
            "title": data.title,
            "description": data.description,
            "status": "pending",  # Will be updated to in_progress, then done
            "priority": "Medium",  # Placeholder - agent will assess
            "agent_output": {},
        }).execute()

        task = task_res.data[0]
        task_id = task["id"]

        # Attach agent info for the frontend to prevent UI crashes
        if agent:
            task["agents"] = {
                "name": agent.get("name", "Unknown"),
                "icon": agent.get("icon", "🤖"),
                "color": agent.get("color", "#7c3aed"),
                "role": agent.get("role", "General")
            }
        else:
            task["agents"] = None

        # === START BACKGROUND EXECUTION ===
        # This starts async execution without blocking the response
        await execute_task_background(
            task_id=task_id,
            title=data.title,
            description=data.description,
            agent_id=data.assigned_agent_id,
            agent_persona=agent["persona"] if agent else None,
            agent_role=agent["role"] if agent else "General",
        )

        return task

    except Exception as e:
        logger.error(f"Failed to create task: {e}")
        raise HTTPException(500, str(e))


# ============================================
# GET: Fetch execution logs for a task
# ============================================
@router.get("/{task_id}/logs")
async def get_execution_logs(task_id: str):
    """
    Fetch execution logs for a specific task.
    Use this to show real-time progress in the frontend.
    
    Returns: Array of log entries ordered by timestamp.
    """
    try:
        db = get_supabase()
        res = db.table("execution_logs") \
            .select("*") \
            .eq("task_id", task_id) \
            .order("created_at", desc=False) \
            .execute()
        return res.data
    except Exception as e:
        logger.error(f"Failed to get logs for task {task_id}: {e}")
        raise HTTPException(500, str(e))


# ============================================
# PATCH: Manually update task status
# ============================================
@router.patch("/{task_id}/status")
async def update_task_status(task_id: str, data: TaskStatusUpdate):
    """
    Manually update task status (normally auto-updated by executor).
    Can be used to cancel, reopen, or override status.
    """
    try:
        db = get_supabase()
        
        # Validate status
        valid_statuses = ["pending", "in_progress", "done"]
        if data.status not in valid_statuses:
            raise HTTPException(400, f"Invalid status. Must be one of: {valid_statuses}")
        
        res = db.table("tasks") \
            .update({
                "status": data.status,
                "updated_at": "now()",
            }) \
            .eq("id", task_id) \
            .execute()
        
        return res.data[0]
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to update task status: {e}")
        raise HTTPException(500, str(e))


# ============================================
# DELETE: Delete a task
# ============================================
@router.delete("/{task_id}")
async def delete_task(task_id: str):
    """
    Delete a task and all associated execution logs.
    """
    try:
        db = get_supabase()
        
        # Delete task (cascade will delete execution_logs)
        db.table("tasks").delete().eq("id", task_id).execute()
        
        logger.info(f"Task {task_id} deleted")
        return {"message": "Task deleted successfully"}
    except Exception as e:
        logger.error(f"Failed to delete task: {e}")
        raise HTTPException(500, str(e))