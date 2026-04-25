import { useState, useEffect } from "react";
import { useApp } from "../lib/context";
import { agentApi } from "../lib/api";
import AgentCard from "../components/AgentCard";
import CreateAgentModal from "../components/CreateAgentModal";

export default function AgentsPage() {
    const { activeWorkspace } = useApp();
    const [agents, setAgents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => { fetchAgents(); }, []);

    const fetchAgents = async () => {
        try {
            setAgents(await agentApi.list(activeWorkspace.id));
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (data) => {
        const agent = await agentApi.create({ ...data, workspace_id: activeWorkspace.id });
        setAgents((prev) => [...prev, agent]);
        setShowModal(false);
    };

    const handleDelete = async (id) => {
        await agentApi.delete(id);
        setAgents((prev) => prev.filter((a) => a.id !== id));
    };

    const handleToggle = async (agent) => {
        const updated = await agentApi.update(agent.id, { is_active: !agent.is_active });
        setAgents((prev) => prev.map((a) => a.id === agent.id ? updated : a));
    };

    return (
        <div className="page">
            <div className="page-header-row">
                <div>
                    <h2 className="page-title">Agents</h2>
                    <p className="page-sub">Your AI team members. Each agent has a specialized role and persona.</p>
                </div>
                <button className="btn-primary" onClick={() => setShowModal(true)}>+ Add Agent</button>
            </div>

            {error && <div className="error-msg">{error}</div>}

            {loading ? (
                <div className="loading-state">Loading agents...</div>
            ) : agents.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">🤖</div>
                    <h3>No agents yet</h3>
                    <p>Add your first AI agent to start building your team.</p>
                    <button className="btn-primary" onClick={() => setShowModal(true)}>Add First Agent</button>
                </div>
            ) : (
                <div className="agents-grid">
                    {agents.map((agent) => (
                        <AgentCard
                            key={agent.id}
                            agent={agent}
                            onDelete={() => handleDelete(agent.id)}
                            onToggle={() => handleToggle(agent)}
                        />
                    ))}
                </div>
            )}

            {showModal && (
                <CreateAgentModal
                    onClose={() => setShowModal(false)}
                    onCreate={handleCreate}
                />
            )}
        </div>
    );
}