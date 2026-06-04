/**
 * TasksPage.jsx - Updated to show real-time execution progress
 * Auto-polls execution logs while task is running.
 */

import { useState, useEffect } from "react";
import { useApp } from "../lib/context";
import { taskApi, agentApi } from "../lib/api";
import TaskCard from "../components/TaskCard";
import CreateTaskModal from "../components/CreateTaskModal";
import TaskDetailModal from "../components/TaskDetailModal";
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
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selected, setSelected] = useState(null);
    const [executionLogs, setExecutionLogs] = useState([]);
    const [error, setError] = useState("");
    const [pollInterval, setPollInterval] = useState(null);

    useEffect(() => {
        init();
    }, []);

    // === Auto-refresh tasks ===
    useEffect(() => {
        const refreshTasks = async () => {
            try {
                const t = await taskApi.list(activeWorkspace.id);
                setTasks(t);

                // Update selected task if it changed
                if (selected) {
                    const updated = t.find((task) => task.id === selected.id);
                    if (updated) setSelected(updated);
                }
            } catch (e) {
                console.error("Failed to refresh tasks:", e);
            }
        };

        const interval = setInterval(refreshTasks, 2000); // Poll every 2 seconds
        return () => clearInterval(interval);
    }, [selected?.id]);

    // === Poll execution logs for selected task ===
    useEffect(() => {
        if (!selected) return;

        const fetchLogs = async () => {
            try {
                const logs = await taskApi.getExecutionLogs(selected.id);
                setExecutionLogs(logs);
            } catch (e) {
                console.error("Failed to fetch logs:", e);
            }
        };

        // Fetch immediately
        fetchLogs();

        // Only poll if task is in_progress
        if (selected.status === "in_progress") {
            const interval = setInterval(fetchLogs, 1000); // Poll every 1 second
            setPollInterval(interval);
            return () => clearInterval(interval);
        }
    }, [selected?.id, selected?.status]);

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
            // Create task - execution starts automatically in background
            const task = await taskApi.create({
                ...data,
                workspace_id: activeWorkspace.id,
            });
            setTasks((prev) => [task, ...prev]);
            setSelected(task);
            setShowDetailModal(true); // Show detail modal to watch progress
        } catch (e) {
            setError(e.message);
        } finally {
            setProcessing(false);
        }
    };

    const handleStatus = async (taskId, status) => {
        try {
            const updated = await taskApi.updateStatus(taskId, status);
            setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
            if (selected?.id === taskId) setSelected(updated);
        } catch (e) {
            setError(e.message);
        }
    };

    const handleDelete = async (taskId) => {
        try {
            await taskApi.delete(taskId);
            setTasks((prev) => prev.filter((t) => t.id !== taskId));
            if (selected?.id === taskId) setSelected(null);
        } catch (e) {
            setError(e.message);
        }
    };

    const byStatus = (s) => tasks.filter((t) => t.status === s);

    return (
        <div className="tasks-layout">
            <div className="tasks-main">
                <div className="page-header-row">
                    <div>
                        <h2 className="page-title">Tasks</h2>
                        <p className="page-sub">
                            Assign tasks to agents. Each agent analyzes, prioritizes, and
                            breaks them into subtasks autonomously.
                        </p>
                    </div>
                    <button
                        className="btn-primary"
                        onClick={() => setShowModal(true)}
                        disabled={processing}
                    >
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
                                <div
                                    className="kanban-col-header"
                                    style={{ borderBottomColor: col.color }}
                                >
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
                                            onClick={() => {
                                                setSelected(task);
                                                setShowDetailModal(true);
                                            }}
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

            {/* Side panel for selected task */}
            <AgentOutputPanel task={selected} processing={processing} />

            {/* Create Task Modal */}
            {showModal && (
                <CreateTaskModal
                    agents={agents}
                    onClose={() => setShowModal(false)}
                    onCreate={handleCreate}
                />
            )}

            {/* Task Detail Modal - shows execution log */}
            {showDetailModal && selected && (
                <TaskDetailModal
                    task={selected}
                    logs={executionLogs}
                    onClose={() => setShowDetailModal(false)}
                />
            )}
        </div>
    );
}