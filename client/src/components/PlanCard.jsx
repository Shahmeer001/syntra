export default function PlanCard({ plan, currentPlan, onUpgrade, upgrading }) {
    const isCurrent = currentPlan === plan.key;
    const isDowngrade = plan.key === "free" && currentPlan !== "free";

    return (
        <div className={`plan-card ${plan.highlight ? "plan-card--highlight" : ""} ${isCurrent ? "plan-card--current" : ""}`}>
            {plan.highlight && <div className="plan-popular-badge">Most Popular</div>}
            {isCurrent && <div className="plan-current-badge">Current Plan</div>}

            <div className="plan-header">
                <h3 className="plan-name">{plan.name}</h3>
                <div className="plan-price">
                    <span className="plan-price-amount">${plan.price}</span>
                    {plan.price > 0 && <span className="plan-price-period">/mo</span>}
                </div>
                <p className="plan-desc">{plan.description}</p>
            </div>

            <ul className="plan-features">
                {plan.features.map((f) => (
                    <li key={f} className="plan-feature">
                        <span className="plan-check">✓</span>
                        {f}
                    </li>
                ))}
            </ul>

            <button
                className={`plan-cta ${plan.highlight ? "btn-primary" : "btn-outline"} ${isCurrent ? "plan-cta--current" : ""}`}
                onClick={() => !isCurrent && !isDowngrade && onUpgrade(plan.key)}
                disabled={isCurrent || isDowngrade || upgrading}
            >
                {upgrading ? "Redirecting..." : isCurrent ? "Current Plan" : isDowngrade ? "Downgrade" : plan.cta}
            </button>
        </div>
    );
}