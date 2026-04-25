from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from database import get_supabase
 
router = APIRouter(prefix="/agents", tags=["agents"])
 
PRESET_AGENTS = [
    {"role": "Finance",   "icon": "💰", "color": "#10b981", "persona": "You are a Finance Agent. You analyze costs, budgets, revenue projections, and financial risks with precision and data-driven insight."},
    {"role": "Marketing", "icon": "📢", "color": "#f59e0b", "persona": "You are a Marketing Agent. You craft go-to-market strategies, content plans, audience targeting, and growth campaigns."},
    {"role": "Product",   "icon": "🛠️", "color": "#3b82f6", "persona": "You are a Product Agent. You define features, prioritize roadmaps, write specs, and translate user needs into actionable product decisions."},
    {"role": "Operations","icon": "⚙️", "color": "#8b5cf6", "persona": "You are an Operations Agent. You optimize processes, manage timelines, identify bottlenecks, and ensure execution efficiency."},
    {"role": "Sales",     "icon": "🤝", "color": "#ef4444", "persona": "You are a Sales Agent. You build pipelines, craft outreach, handle objections, and close deals with persuasive communication."},
    {"role": "Legal",     "icon": "⚖️", "color": "#6b7280", "persona": "You are a Legal Agent. You review contracts, flag risks, ensure compliance, and provide structured legal reasoning."},
]
 
 
class AgentCreate(BaseModel):
    workspace_id: str
    name: str
    role: str
    persona: Optional[str] = ""
    color: Optional[str] = "#7c3aed"
    icon: Optional[str] = "🤖"
 
 
class AgentUpdate(BaseModel):
    name: Optional[str] = None
    persona: Optional[str] = None
    color: Optional[str] = None
    icon: Optional[str] = None
    is_active: Optional[bool] = None
 
 
@router.get("/presets")
async def get_presets():
    return PRESET_AGENTS
 
 
@router.get("/{workspace_id}")
async def list_agents(workspace_id: str):
    try:
        db = get_supabase()
        res = db.table("agents").select("*").eq("workspace_id", workspace_id).order("created_at").execute()
        return res.data
    except Exception as e:
        raise HTTPException(500, str(e))
 
 
@router.post("")
async def create_agent(data: AgentCreate):
    try:
        db = get_supabase()
 
        # Check agent limit
        sub = db.table("subscriptions").select("agent_limit").eq("workspace_id", data.workspace_id).maybe_single().execute()
        limit = sub.data["agent_limit"] if sub.data else 2
        count_res = db.table("agents").select("id", count="exact").eq("workspace_id", data.workspace_id).execute()
        if (count_res.count or 0) >= limit:
            raise HTTPException(403, f"Agent limit reached ({limit}). Upgrade your plan.")
 
        res = db.table("agents").insert({
            "workspace_id": data.workspace_id,
            "name": data.name,
            "role": data.role,
            "persona": data.persona,
            "color": data.color,
            "icon": data.icon,
        }).execute()
        return res.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, str(e))
 
 
@router.patch("/{agent_id}")
async def update_agent(agent_id: str, data: AgentUpdate):
    try:
        db = get_supabase()
        payload = {k: v for k, v in data.dict().items() if v is not None}
        res = db.table("agents").update(payload).eq("id", agent_id).execute()
        return res.data[0]
    except Exception as e:
        raise HTTPException(500, str(e))
 
 
@router.delete("/{agent_id}")
async def delete_agent(agent_id: str):
    try:
        db = get_supabase()
        db.table("agents").delete().eq("id", agent_id).execute()
        return {"message": "Agent deleted"}
    except Exception as e:
        raise HTTPException(500, str(e))