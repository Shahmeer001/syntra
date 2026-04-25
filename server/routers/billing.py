from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from database import get_supabase
# import stripe
import os
from dotenv import load_dotenv

load_dotenv()

# stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

PLANS = {
    "starter": {
        "name": "Starter",
        "price": 19,
        "agent_limit": 5,
        "task_limit": 100,
        "price_id": os.getenv("STRIPE_STARTER_PRICE_ID", "price_starter"),
    },
    "pro": {
        "name": "Pro",
        "price": 49,
        "agent_limit": 999,
        "task_limit": 999,
        "price_id": os.getenv("STRIPE_PRO_PRICE_ID", "price_pro"),
    },
}

router = APIRouter(prefix="/billing", tags=["billing"])


class CheckoutCreate(BaseModel):
    workspace_id: str
    plan: str  # starter | pro


@router.get("/{workspace_id}")
async def get_subscription(workspace_id: str):
    try:
        db = get_supabase()
        res = db.table("subscriptions").select("*").eq("workspace_id", workspace_id).maybe_single().execute()
        return res.data or {"plan": "free", "agent_limit": 2, "task_limit": 10}
    except Exception as e:
        raise HTTPException(500, str(e))


@router.post("/checkout")
async def create_checkout(data: CheckoutCreate):
    try:
        plan = PLANS.get(data.plan)
        if not plan:
            raise HTTPException(400, "Invalid plan")

        # Mock Stripe checkout URL for now
        return {"url": f"{FRONTEND_URL}/?success=true&workspace_id={data.workspace_id}&mock_checkout=true"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, str(e))


@router.post("/webhook")
async def stripe_webhook(request: Request):
    # Stripe is disabled
    return {"received": True}