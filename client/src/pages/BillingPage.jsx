import { useState, useEffect } from "react";
import { useApp } from "../lib/context";
import { billingApi } from "../lib/api";
import PlanCard from "../components/PlanCard";

const PLANS = [
    {
        key: "free",
        name: "Free",
        price: 0,
        description: "Get started with your AI team",
        features: ["2 AI agents", "10 tasks/month", "Meeting room access", "Dashboard"],
        cta: "Current Plan",
        highlight: false,
    },
    {
        key: "starter",
        name: "Starter",
        price: 19,
        description: "For solo founders and freelancers",
        features: ["5 AI agents", "100 tasks/month", "Agent collaboration", "Priority support"],
        cta: "Upgrade to Starter",
        highlight: false,
    },
    {
        key: "pro",
        name: "Pro",
        price: 49,
        description: "For teams running everything on Syntra",
        features: ["Unlimited agents", "Unlimited tasks", "Full collaboration", "Custom personas", "API access"],
        cta: "Upgrade to Pro",
        highlight: true,
    },
];

export default function BillingPage() {
    const { activeWorkspace } = useApp();
    const [sub, setSub] = useState(null);
    const [loading, setLoading] = useState(true);
    const [upgrading, setUpgrading] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        billingApi.getSubscription(activeWorkspace.id)
            .then(setSub)
            .catch(() => { })
            .finally(() => setLoading(false));
    }, [activeWorkspace.id]);

    const handleUpgrade = async (planKey) => {
        if (planKey === "free") return;
        setUpgrading(planKey);
        setError("");
        try {
            const { url } = await billingApi.createCheckout({
                workspace_id: activeWorkspace.id,
                plan: planKey,
            });
            window.location.href = url;
        } catch (e) {
            setError(e.message);
            setUpgrading("");
        }
    };

    return (
        <div className="page">
            <div className="page-header">
                <h2 className="page-title">Billing & Plans</h2>
                <p className="page-sub">
                    Current plan:
                    <span className={`plan-badge plan-badge--${sub?.plan || "free"}`}>
                        {(sub?.plan || "free").toUpperCase()}
                    </span>
                </p>
            </div>

            {error && <div className="error-msg">{error}</div>}

            {loading ? (
                <div className="loading-state">Loading plans...</div>
            ) : (
                <div className="plans-grid">
                    {PLANS.map((plan) => (
                        <PlanCard
                            key={plan.key}
                            plan={plan}
                            currentPlan={sub?.plan || "free"}
                            onUpgrade={handleUpgrade}
                            upgrading={upgrading === plan.key}
                        />
                    ))}
                </div>
            )}

            <div className="billing-note">
                ⚡ Powered by Stripe. Cancel anytime. No hidden fees.
            </div>
        </div>
    );
}