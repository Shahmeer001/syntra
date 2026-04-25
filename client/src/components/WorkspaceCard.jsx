import { useState } from "react";

const ICONS = { Tech: "💻", Finance: "💰", Marketing: "📢", Healthcare: "🏥", "E-commerce": "🛒", Education: "📚", Other: "🏢", "": "🏢" };

export default function WorkspaceCard({ workspace, onEnter, onDelete }) {
    const [confirm, setConfirm] = useState(false);

    const handleDelete = (e) => {
        e.stopPropagation();
        if (confirm) { onDelete(); return; }
        setConfirm(true);
        setTimeout(() => setConfirm(false), 3000);
    };

    return (
        <div className="ws-card" onClick={onEnter}>
            <div className="ws-card-top">
                <span className="ws-card-icon">{ICONS[workspace.industry] || "🏢"}</span>
                <button className={`ws-delete-btn ${confirm ? "ws-delete-btn--confirm" : ""}`} onClick={handleDelete}>
                    {confirm ? "Sure?" : "✕"}
                </button>
            </div>
            <h3 className="ws-card-name">{workspace.name}</h3>
            {workspace.description && <p className="ws-card-desc">{workspace.description}</p>}
            <div className="ws-card-footer">
                <div className="ws-card-meta">
                    {workspace.industry && <span className="tag">{workspace.industry}</span>}
                    <span className="ws-card-date">{new Date(workspace.created_at).toLocaleDateString()}</span>
                </div>
                <span className="ws-card-enter">Open →</span>
            </div>
        </div>
    );
}