import { useState } from "react";
import "./TaskDetailModal.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function TaskDetailModal({ task, logs = [], onClose }) {
    const [copiedLog, setCopiedLog] = useState(null);

    const getLogIcon = (logType) => ({
        info: "ℹ️", progress: "⚙️", success: "✅", error: "❌", warning: "⚠️"
    }[logType] || "📝");

    const getLogColor = (logType) => ({
        info: "#6B7280", progress: "#3B82F6", success: "#10B981", error: "#EF4444", warning: "#F59E0B"
    }[logType] || "#6B7280");

    const copyToClipboard = (text, id) => {
        navigator.clipboard.writeText(text);
        setCopiedLog(id);
        setTimeout(() => setCopiedLog(null), 2000);
    };

    const formatTime = (timestamp) =>
        new Date(timestamp).toLocaleTimeString("en-US", {
            hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true,
        });

    const statusColors = {
        pending: "#FBBF24", in_progress: "#60A5FA", done: "#34D399",
    };

    // Collect all generated files from logs
    const generatedFiles = logs
        .filter((log) => log.execution_data?.type === "file" && log.execution_data?.file)
        .map((log) => ({
            filename: log.execution_data.file,
            download_url: log.execution_data.download_url,
        }));

    const handleDownload = (filename) => {
        const url = `${API_URL}/outputs/${filename}`;
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content task-detail-modal" onClick={(e) => e.stopPropagation()}>

                {/* Header */}
                <div className="modal-header">
                    <div>
                        <h2>{task.title}</h2>
                        <p className="task-description">{task.description}</p>
                    </div>
                    <button className="modal-close-btn" onClick={onClose}>✕</button>
                </div>

                {/* Status Bar */}
                <div className="task-status-bar">
                    <div className="status-item">
                        <div className="status-badge" style={{ backgroundColor: statusColors[task.status], color: "white" }}>
                            {task.status === "pending" && "⏳ Pending"}
                            {task.status === "in_progress" && "⚙️ In Progress"}
                            {task.status === "done" && "✅ Done"}
                        </div>
                    </div>
                    <div className="status-item">
                        <label>Priority</label>
                        <span className="priority-badge">{task.priority || "N/A"}</span>
                    </div>
                    <div className="status-item">
                        <label>Logs</label>
                        <span className="log-count">{logs.length}</span>
                    </div>
                    {generatedFiles.length > 0 && (
                        <div className="status-item">
                            <label>Files</label>
                            <span className="log-count">📄 {generatedFiles.length}</span>
                        </div>
                    )}
                </div>

                {/* Execution Timeline */}
                <div className="execution-logs">
                    <div className="logs-header">
                        <h3>Execution Timeline</h3>
                        {task.status === "in_progress" && (
                            <span className="executing-badge">🔄 Executing...</span>
                        )}
                    </div>

                    {logs.length === 0 ? (
                        <div className="no-logs">
                            {task.status === "pending" && "🕐 Waiting to start..."}
                            {task.status === "in_progress" && "🧠 Agent is working..."}
                            {task.status === "done" && "No execution logs recorded"}
                        </div>
                    ) : (
                        <div className="logs-timeline">
                            {logs.map((log, idx) => (
                                <div key={log.id || idx} className="log-entry">
                                    <div className="log-indicator">
                                        <div className="log-icon" style={{ color: getLogColor(log.log_type) }}>
                                            {getLogIcon(log.log_type)}
                                        </div>
                                        {idx < logs.length - 1 && <div className="log-line" />}
                                    </div>

                                    <div className="log-content">
                                        <div className="log-header-row">
                                            <span className="log-message">{log.message}</span>
                                            <span className="log-time">{formatTime(log.created_at)}</span>
                                        </div>

                                        {/* Tool preview */}
                                        {log.execution_data?.preview && (
                                            <div className="log-data">
                                                <div className="data-item">{log.execution_data.preview}</div>
                                            </div>
                                        )}

                                        {/* Priority */}
                                        {log.execution_data?.priority && (
                                            <div className="log-data">
                                                <div className="data-item">
                                                    🎯 Priority: <strong>{log.execution_data.priority}</strong>
                                                </div>
                                            </div>
                                        )}

                                        {/* Subtasks */}
                                        {log.execution_data?.subtasks && (
                                            <div className="log-data">
                                                <div className="data-item subtasks-list">
                                                    {log.execution_data.subtasks.map((st, i) => (
                                                        <div key={i} className="subtask-item">
                                                            {i + 1}. {st.title}
                                                            <span className="subtask-time">{st.estimated_time}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Error */}
                                        {log.execution_data?.error && (
                                            <div className="log-data">
                                                <div className="data-item error">⚠️ {log.execution_data.error}</div>
                                            </div>
                                        )}

                                        {/* Copy button */}
                                        <button
                                            className="log-copy-btn"
                                            onClick={() => copyToClipboard(log.message, log.id)}
                                        >
                                            {copiedLog === log.id ? "✓ Copied" : "📋"}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* ============================================
            GENERATED FILES SECTION — NEW
        ============================================ */}
                {generatedFiles.length > 0 && (
                    <div className="generated-files-section">
                        <h3>📁 Generated Files</h3>
                        <div className="files-list">
                            {generatedFiles.map((file, idx) => (
                                <div key={idx} className="file-item">
                                    <div className="file-info">
                                        <span className="file-icon">📄</span>
                                        <span className="file-name">{file.filename}</span>
                                    </div>
                                    <button
                                        className="btn-download"
                                        onClick={() => handleDownload(file.filename)}
                                    >
                                        ⬇ Download
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Footer */}
                <div className="modal-footer">
                    <button className="btn-secondary" onClick={onClose}>Close</button>
                    {task.status === "in_progress" && (
                        <span className="auto-refresh-info">🔄 Auto-refreshing...</span>
                    )}
                </div>
            </div>
        </div>
    );
}