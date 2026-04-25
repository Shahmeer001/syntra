import { useState, useEffect } from "react";
import { agentApi } from "../lib/api";

const COLORS = ["#10b981", "#f59e0b", "#3b82f6", "#8b5cf6", "#ef4444", "#6b7280", "#ec4899", "#06b6d4"];
const ICONS = ["🤖", "💰", "📢", "🛠️", "⚙️", "🤝", "⚖️", "🧠", "📊", "🎯", "🚀", "💡"];

export default function CreateAgentModal({ onClose, onCreate }) {
    const [presets, setPresets] = useState([]);
    const [form, setForm] = useState({ name: "", role: "", persona: "", color: COLORS[0], icon: "🤖" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

    useEffect(() => { agentApi.presets().then(setPresets).catch(() => { }); }, []);

    const applyPreset = (preset) => {
        setForm((f) => ({
            ...f,
            role: preset.role,
            icon: preset.icon,
            color: preset.color,
            persona: preset.persona,
            name: f.name || preset.role + " Agent",
        }));
    };

    const submit = async () => {
        if (!form.name.trim() || !form.role.trim()) { setError("Name and Role are required"); return; }
        setLoading(true);
        try { await onCreate(form); }
        catch (e) { setError(e.message); setLoading(false); }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal modal--wide" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">Add Agent</h2>
                    <button className="modal-close" onClick={onClose}>✕</button>
                </div>
                <div className="modal-body">
                    {/* Presets */}
                    <div className="field">
                        <label className="field-label">Quick Presets</label>
                        <div className="preset-grid">
                            {presets.map((p) => (
                                <button key={p.role} className="preset-btn" onClick={() => applyPreset(p)}
                                    style={{ borderColor: p.color + "44", color: p.color }}>
                                    {p.icon} {p.role}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="field-row">
                        <div className="field">
                            <label className="field-label">Agent Name *</label>
                            <input className="input" placeholder="e.g. Finance Agent" value={form.name} onChange={(e) => set("name", e.target.value)} />
                        </div>
                        <div className="field">
                            <label className="field-label">Role *</label>
                            <input className="input" placeholder="e.g. Finance" value={form.role} onChange={(e) => set("role", e.target.value)} />
                        </div>
                    </div>

                    <div className="field">
                        <label className="field-label">Persona / System Prompt</label>
                        <textarea className="input textarea" rows={3} placeholder="Describe how this agent should think and respond..."
                            value={form.persona} onChange={(e) => set("persona", e.target.value)} />
                    </div>

                    {/* Icon picker */}
                    <div className="field">
                        <label className="field-label">Icon</label>
                        <div className="icon-grid">
                            {ICONS.map((icon) => (
                                <button key={icon} className={`icon-btn ${form.icon === icon ? "icon-btn--active" : ""}`}
                                    onClick={() => set("icon", icon)}>{icon}</button>
                            ))}
                        </div>
                    </div>

                    {/* Color picker */}
                    <div className="field">
                        <label className="field-label">Color</label>
                        <div className="color-grid">
                            {COLORS.map((c) => (
                                <button key={c} className={`color-btn ${form.color === c ? "color-btn--active" : ""}`}
                                    style={{ background: c }} onClick={() => set("color", c)} />
                            ))}
                        </div>
                    </div>

                    {/* Preview */}
                    <div className="agent-preview" style={{ "--agent-color": form.color }}>
                        <div className="agent-preview-avatar" style={{ background: form.color + "22", border: `1px solid ${form.color}44` }}>
                            {form.icon}
                        </div>
                        <div>
                            <div className="agent-preview-name">{form.name || "Agent Name"}</div>
                            <div className="agent-preview-role" style={{ color: form.color }}>{form.role || "Role"}</div>
                        </div>
                    </div>

                    {error && <div className="error-msg">{error}</div>}
                </div>
                <div className="modal-footer">
                    <button className="btn-outline" onClick={onClose}>Cancel</button>
                    <button className="btn-primary" onClick={submit} disabled={loading}>
                        {loading ? "Adding..." : "Add Agent →"}
                    </button>
                </div>
            </div>
        </div>
    );
}