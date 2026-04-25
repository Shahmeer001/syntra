import { useState, useEffect } from "react";
import { workspaceApi } from "../lib/api";
import { useApp } from "../lib/context";
import WorkspaceCard from "../components/WorkspaceCard";
import CreateWorkspaceModal from "../components/CreateWorkspaceModal";

export default function Home() {
    const { enterWorkspace } = useApp();
    const [workspaces, setWorkspaces] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => { fetch(); }, []);

    const fetch = async () => {
        try {
            setWorkspaces(await workspaceApi.list());
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (data) => {
        const ws = await workspaceApi.create(data);
        setWorkspaces((prev) => [ws, ...prev]);
        setShowModal(false);
        enterWorkspace(ws);
    };

    const handleDelete = async (id) => {
        await workspaceApi.delete(id);
        setWorkspaces((prev) => prev.filter((w) => w.id !== id));
    };

    return (
        <div className="home">
            <header className="home-hero">
                <div className="hero-badge">Multi-Agent AI Business OS</div>
                <h1 className="hero-title">
                    Your AI business team,<br />
                    <span className="hero-accent">in one place.</span>
                </h1>
                <p className="hero-sub">
                    Create a workspace, add specialized AI agents, assign tasks, and watch them collaborate — all in real time.
                </p>
                <button className="btn-primary hero-cta" onClick={() => setShowModal(true)}>
                    + Create Workspace
                </button>
            </header>

            <section className="home-section">
                <div className="section-row">
                    <h2 className="section-title">
                        {loading ? "Loading..." : `Workspaces (${workspaces.length})`}
                    </h2>
                    {workspaces.length > 0 && (
                        <button className="btn-outline" onClick={() => setShowModal(true)}>+ New</button>
                    )}
                </div>

                {error && <div className="error-msg">{error}</div>}

                {!loading && workspaces.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">🚀</div>
                        <h3>No workspaces yet</h3>
                        <p>Create your first workspace to get started with your AI team.</p>
                        <button className="btn-primary" onClick={() => setShowModal(true)}>
                            Create First Workspace
                        </button>
                    </div>
                ) : (
                    <div className="workspace-grid">
                        {workspaces.map((ws) => (
                            <WorkspaceCard
                                key={ws.id}
                                workspace={ws}
                                onEnter={() => enterWorkspace(ws)}
                                onDelete={() => handleDelete(ws.id)}
                            />
                        ))}
                    </div>
                )}
            </section>

            {showModal && (
                <CreateWorkspaceModal
                    onClose={() => setShowModal(false)}
                    onCreate={handleCreate}
                />
            )}
        </div>
    );
}