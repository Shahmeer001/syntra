import { useState } from "react";

export default function CreateTaskModal({ agents, onClose, onCreate }) {
    const [form, setForm] = useState({ title: "", description: "", assigned_agent_id: "" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

    const submit = async () => {
        if (!form.title.trim()) { setError("Title is required"); return; }
        setLoading(true);
        try { await onCreate({ ...form, assigned_agent_id: form.assigned_agent_id || null }); }
        catch (e) { setError(e.message); setLoading(false); }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">New Task</h2>
                    <button className="modal-close" onClick={onClose}>✕</button>
                </div>
                <div className="modal-body">
                    <div className="field">
                        <label className="field-label">Task Title *</label>
                        <input className="input" placeholder="e.g. Create Q4 budget forecast" value={form.title} onChange={(e) => set("title", e.target.value)} />
                    </div>
                    <div className="field">
                        <label className="field-label">Description</label>
                        <textarea className="input textarea" rows={3} placeholder="Describe the task in detail. The agent will analyze, prioritize, and break it into subtasks."
                            value={form.description} onChange={(e) => set("description", e.target.value)} />
                    </div>
                    <div className="field">
                        <label className="field-label">Assign to Agent</label>
                        <select className="input" value={form.assigned_agent_id} onChange={(e) => set("assigned_agent_id", e.target.value)}>
                            <option value="">No agent (unassigned)</option>
                            {agents.filter((a) => a.is_active).map((a) => (
                                <option key={a.id} value={a.id}>{a.icon} {a.name} ({a.role})</option>
                            ))}
                        </select>
                    </div>
                    <div className="task-modal-note">
                        🧠 The agent will analyze this task using LangGraph + Groq and return priority, reasoning, and subtasks.
                    </div>
                    {error && <div className="error-msg">{error}</div>}
                </div>
                <div className="modal-footer">
                    <button className="btn-outline" onClick={onClose}>Cancel</button>
                    <button className="btn-primary" onClick={submit} disabled={loading}>
                        {loading ? "Submitting to Agent..." : "Submit to Agent →"}
                    </button>
                </div>
            </div>
        </div>
    );
}