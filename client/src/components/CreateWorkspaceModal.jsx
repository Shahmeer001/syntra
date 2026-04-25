import { useState } from "react";

const INDUSTRIES = ["Tech", "Finance", "Marketing", "Healthcare", "E-commerce", "Education", "Other"];

export default function CreateWorkspaceModal({ onClose, onCreate }) {
    const [form, setForm] = useState({ name: "", description: "", industry: "" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

    const submit = async () => {
        if (!form.name.trim()) { setError("Name is required"); return; }
        setLoading(true);
        try { await onCreate(form); }
        catch (e) { setError(e.message); setLoading(false); }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">New Workspace</h2>
                    <button className="modal-close" onClick={onClose}>✕</button>
                </div>
                <div className="modal-body">
                    <div className="field">
                        <label className="field-label">Name *</label>
                        <input className="input" placeholder="e.g. My SaaS Startup" value={form.name} onChange={(e) => set("name", e.target.value)} />
                    </div>
                    <div className="field">
                        <label className="field-label">Description</label>
                        <input className="input" placeholder="What is this workspace for?" value={form.description} onChange={(e) => set("description", e.target.value)} />
                    </div>
                    <div className="field">
                        <label className="field-label">Industry</label>
                        <select className="input" value={form.industry} onChange={(e) => set("industry", e.target.value)}>
                            <option value="">Select industry...</option>
                            {INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
                        </select>
                    </div>
                    {error && <div className="error-msg">{error}</div>}
                </div>
                <div className="modal-footer">
                    <button className="btn-outline" onClick={onClose}>Cancel</button>
                    <button className="btn-primary" onClick={submit} disabled={loading}>
                        {loading ? "Creating..." : "Create Workspace →"}
                    </button>
                </div>
            </div>
        </div>
    );
}