const PRIORITY = {
    High: { bg: "#fee2e2", text: "#dc2626", border: "#fca5a5" },
    Medium: { bg: "#fef3c7", text: "#d97706", border: "#fcd34d" },
    Low: { bg: "#dcfce7", text: "#16a34a", border: "#86efac" },
};

export default function TaskCard({ task, selected, onClick, onStatus, onDelete }) {
    const p = PRIORITY[task.priority] || PRIORITY.Medium;
    const agent = task.agents;

    return (
        <div className={`task-card ${selected ? "task-card--selected" : ""}`} onClick={onClick}>
            <div className="task-card-top">
                <span className="priority-badge" style={{ background: p.bg, color: p.text, border: `1px solid ${p.border}` }}>
                    {task.priority}
                </span>
                <button className="task-delete-btn" onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}>✕</button>
            </div>

            <h4 className="task-title">{task.title}</h4>
            {task.description && <p className="task-desc">{task.description}</p>}

            {agent && (
                <div className="task-agent" style={{ color: agent.color }}>
                    <span>{agent.icon}</span>
                    <span>{agent.name}</span>
                </div>
            )}

            <div className="task-meta">
                <span className="task-subtask-count">
                    🔨 {task.agent_output?.subtasks?.length || 0} subtasks
                </span>
            </div>

            <select
                className="task-status-select"
                value={task.status}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => onStatus(task.id, e.target.value)}
            >
                <option value="pending">⏳ Pending</option>
                <option value="in_progress">⚙️ In Progress</option>
                <option value="done">✅ Done</option>
            </select>
        </div>
    );
}