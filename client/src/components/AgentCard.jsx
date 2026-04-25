export default function AgentCard({ agent, onDelete, onToggle }) {
    return (
        <div className={`agent-card ${!agent.is_active ? "agent-card--inactive" : ""}`}
            style={{ "--agent-color": agent.color }}>
            <div className="agent-card-top">
                <div className="agent-avatar" style={{ background: agent.color + "22", border: `1px solid ${agent.color}44` }}>
                    <span>{agent.icon}</span>
                </div>
                <div className="agent-card-actions">
                    <button className="agent-toggle-btn" onClick={onToggle} title={agent.is_active ? "Deactivate" : "Activate"}>
                        {agent.is_active ? "●" : "○"}
                    </button>
                    <button className="agent-delete-btn" onClick={onDelete}>✕</button>
                </div>
            </div>

            <h3 className="agent-name">{agent.name}</h3>
            <div className="agent-role-badge" style={{ color: agent.color, background: agent.color + "18", border: `1px solid ${agent.color}33` }}>
                {agent.role}
            </div>
            {agent.persona && (
                <p className="agent-persona">{agent.persona.slice(0, 100)}{agent.persona.length > 100 ? "..." : ""}</p>
            )}

            <div className="agent-status">
                <span className={`status-dot ${agent.is_active ? "status-dot--active" : "status-dot--inactive"}`} />
                {agent.is_active ? "Active" : "Inactive"}
            </div>
        </div>
    );
}