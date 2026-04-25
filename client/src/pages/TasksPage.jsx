import { useState, useEffect } from "react";
import { useApp } from "../lib/context";
import { taskApi, agentApi } from "../lib/api";
import TaskCard from "../components/TaskCard";
import CreateTaskModal from "../components/CreateTaskModal";
import AgentOutputPanel from "../components/AgentOutputPanel";

const COLUMNS = [
    { key: "pending", label: "Pending", icon: "⏳", color: "#fbbf24" },
    { key: "in_progress", label: "In Progress", icon: "⚙️", color: "#60a5fa" },
    { key: "done", label: "Done", icon: "✅", color: "#34d399" },
];

export default function TasksPage() {
    const { activeWorkspace } = useApp();
    const [tasks, setTasks] = useState([]);
    const [agents, setAgents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [selected, setSelected] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => { init(); }, []);

    const init = async () => {
        try {
            const [t, a] = await Promise.all([
                taskApi.list(activeWorkspace.id),
                agentApi.list(activeWorkspace.id),
            ]);
            setTasks(t);
            setAgents(a);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (data) => {
        setProcessing(true);
        setShowModal(false);
        setError("");
        try {
            const task = await taskApi.create({ ...data, workspace_id: activeWorkspace.id });
            setTasks((prev) => [task, ...prev]);
            setSelected(task);
        } catch (e) {
            setError(e.message);
        } finally {
            setProcessing(false);
        }
    };

    const handleStatus = async (taskId, status) => {
        const updated = await taskApi.updateStatus(taskId, status);
        setTasks((prev) => prev.map((t) => t.id === taskId ? updated : t));
        if (selected?.id === taskId) setSelected(updated);
    };

    const handleDelete = async (taskId) => {
        await taskApi.delete(taskId);
        setTasks((prev) => prev.filter((t) => t.id !== taskId));
        if (selected?.id === taskId) setSelected(null);
    };

    const byStatus = (s) => tasks.filter((t) => t.status === s);

    return (
        <div className="tasks-layout">
            <div className="tasks-main">
                <div className="page-header-row">
                    <div>
                        <h2 className="page-title">Tasks</h2>
                        <p className="page-sub">Assign tasks to agents. Each agent analyzes, prioritizes, and breaks them into subtasks.</p>
                    </div>
                    <button className="btn-primary" onClick={() => setShowModal(true)} disabled={processing}>
                        {processing ? "🧠 Processing..." : "+ New Task"}
                    </button>
                </div>

                {error && <div className="error-msg">{error}</div>}

                {loading ? (
                    <div className="loading-state">Loading tasks...</div>
                ) : (
                    <div className="kanban">
                        {COLUMNS.map((col) => (
                            <div className="kanban-col" key={col.key}>
                                <div className="kanban-col-header" style={{ borderBottomColor: col.color }}>
                                    <span>{col.icon}</span>
                                    <span>{col.label}</span>
                                    <span className="kanban-count">{byStatus(col.key).length}</span>
                                </div>
                                <div className="kanban-col-body">
                                    {byStatus(col.key).length === 0 && (
                                        <div className="kanban-empty">No tasks</div>
                                    )}
                                    {byStatus(col.key).map((task) => (
                                        <TaskCard
                                            key={task.id}
                                            task={task}
                                            selected={selected?.id === task.id}
                                            onClick={() => setSelected(task)}
                                            onStatus={handleStatus}
                                            onDelete={handleDelete}
                                        />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <AgentOutputPanel task={selected} processing={processing} />

            {showModal && (
                <CreateTaskModal
                    agents={agents}
                    onClose={() => setShowModal(false)}
                    onCreate={handleCreate}
                />
            )}
        </div>
    );
}