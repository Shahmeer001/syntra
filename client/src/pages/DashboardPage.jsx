import { useState, useEffect } from "react";
import { useApp } from "../lib/context";
import { workspaceApi } from "../lib/api";

export default function DashboardPage() {
    const { activeWorkspace } = useApp();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        workspaceApi.stats(activeWorkspace.id)
            .then(setStats)
            .catch(() => { })
            .finally(() => setLoading(false));
    }, [activeWorkspace.id]);

    const STAT_CARDS = stats ? [
        { label: "Agents", value: stats.total_agents, color: "#a78bfa", icon: "🤖" },
        { label: "Total Tasks", value: stats.total_tasks, color: "#60a5fa", icon: "📋" },
        { label: "In Progress", value: stats.in_progress, color: "#fbbf24", icon: "⚙️" },
        { label: "Completed", value: stats.done, color: "#34d399", icon: "✅" },
    ] : [];

    return (
        <div className="page">
            <div className="page-header">
                <h2 className="page-title">Dashboard</h2>
                <p className="page-sub">
                    Overview of <strong>{activeWorkspace.name}</strong>
                    {stats && (
                        <span className={`plan-badge plan-badge--${stats.plan}`}>
                            {stats.plan.toUpperCase()}
                        </span>
                    )}
                </p>
            </div>

            {/* Stats */}
            {!loading && (
                <div className="stats-grid">
                    {STAT_CARDS.map((s) => (
                        <div className="stat-card" key={s.label} style={{ "--accent-color": s.color }}>
                            <div className="stat-icon">{s.icon}</div>
                            <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
                            <div className="stat-label">{s.label}</div>
                        </div>
                    ))}
                </div>
            )}

            {/* Workspace Details */}
            <div className="detail-card">
                <h3 className="detail-title">Workspace Details</h3>
                <div className="detail-rows">
                    {[
                        { k: "Name", v: activeWorkspace.name },
                        { k: "Description", v: activeWorkspace.description || "—" },
                        { k: "Industry", v: activeWorkspace.industry || "—" },
                        { k: "Plan", v: stats?.plan?.toUpperCase() || "FREE" },
                        { k: "Agent Limit", v: stats ? `${stats.total_agents} / ${stats.agent_limit}` : "—" },
                        { k: "Created", v: new Date(activeWorkspace.created_at).toLocaleDateString() },
                    ].map(({ k, v }) => (
                        <div className="detail-row" key={k}>
                            <span className="detail-key">{k}</span>
                            <span className="detail-val">{v}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Quick guide */}
            <div className="guide-card">
                <h3 className="detail-title">🗺 Getting Started</h3>
                <div className="guide-steps">
                    {[
                        { step: 1, icon: "🤖", title: "Add Agents", desc: "Go to Agents → add Finance, Marketing, Product agents" },
                        { step: 2, icon: "📋", title: "Assign Tasks", desc: "Go to Tasks → create a task and assign it to an agent" },
                        { step: 3, icon: "💬", title: "Hold a Meeting", desc: "Go to Meeting Room → give your team a topic to discuss" },
                        { step: 4, icon: "💳", title: "Upgrade Plan", desc: "Go to Billing → unlock unlimited agents and tasks" },
                    ].map((s) => (
                        <div className="guide-step" key={s.step}>
                            <div className="guide-num">{s.step}</div>
                            <div className="guide-icon">{s.icon}</div>
                            <div>
                                <div className="guide-title">{s.title}</div>
                                <div className="guide-desc">{s.desc}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}