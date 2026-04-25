import { useState } from "react";
import { collaborationApi } from "../lib/api";

export default function AgentOutputPanel({ task, processing }) {
    const [collab, setCollab] = useState(null);
    const [running, setRunning] = useState(false);
    const [collabError, setCollabError] = useState("");

    const output = task?.agent_output || {};

    const handleCollaborate = async () => {
        setRunning(true);
        setCollabError("");
        try {
            const result = await collaborationApi.run(task.id);
            setCollab(result);
        } catch (e) {
            setCollabError(e.message);
        } finally {
            setRunning(false);
        }
    };

    if (processing) return (
        <aside className="output-panel">
            <div className="output-panel-header">
                <div className="panel-agent-avatar">🤖</div>
                <div>
                    <div className="panel-agent-name">Syntra Agent</div>
                    <div className="panel-agent-status processing">● Processing...</div>
                </div>
            </div>
            <div className="panel-thinking">
                <div className="thinking-dot" /><div className="thinking-dot" /><div className="thinking-dot" />
            </div>
            <p className="panel-thinking-text">Analyzing task, determining priority, generating subtasks...</p>
        </aside>
    );

    if (!task) return (
        <aside className="output-panel">
            <div className="output-panel-header">
                <div className="panel-agent-avatar">🤖</div>
                <div>
                    <div className="panel-agent-name">Syntra Agent</div>
                    <div className="panel-agent-status idle">● Idle</div>
                </div>
            </div>
            <div className="panel-empty">
                <div className="panel-empty-icon">💭</div>
                <p>Click a task to see the agent's analysis, priority reasoning, and subtask breakdown.</p>
            </div>
        </aside>
    );

    return (
        <aside className="output-panel">
            <div className="output-panel-header">
                <div className="panel-agent-avatar">🤖</div>
                <div>
                    <div className="panel-agent-name">Syntra Agent</div>
                    <div className="panel-agent-status active">● Active</div>
                </div>
            </div>

            {/* Thought log */}
            {output.thoughts?.length > 0 && (
                <div className="panel-section">
                    <div className="panel-section-label">🧠 Agent Thoughts</div>
                    <div className="thought-log">
                        {output.thoughts.map((t, i) => (
                            <div key={i} className="thought-item">{t}</div>
                        ))}
                    </div>
                </div>
            )}

            {/* Reasoning */}
            {output.reasoning && (
                <div className="panel-section">
                    <div className="panel-section-label">📋 Analysis</div>
                    <p className="panel-reasoning">{output.reasoning}</p>
                </div>
            )}

            {/* Subtasks */}
            {output.subtasks?.length > 0 && (
                <div className="panel-section">
                    <div className="panel-section-label">🔨 Subtasks</div>
                    <div className="subtask-list">
                        {output.subtasks.map((sub, i) => (
                            <div key={i} className="subtask-item">
                                <div className="subtask-num">{sub.order || i + 1}</div>
                                <div>
                                    <div className="subtask-title">{sub.title}</div>
                                    <div className="subtask-desc">{sub.description}</div>
                                    {sub.estimated_time && <div className="subtask-time">⏱ {sub.estimated_time}</div>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Collaboration */}
            <div className="panel-section">
                <div className="panel-section-label">🔄 Agent Collaboration</div>
                {collabError && <div className="error-msg" style={{ marginBottom: 8 }}>{collabError}</div>}
                {!collab ? (
                    <button className="btn-collab" onClick={handleCollaborate} disabled={running}>
                        {running ? "Running collaboration..." : "🤝 Run Multi-Agent Collaboration"}
                    </button>
                ) : (
                    <div className="collab-result">
                        {collab.messages?.map((m, i) => (
                            <div key={i} className="collab-message">
                                <span className="collab-agent" style={{ color: m.agent_color }}>{m.agent_icon} {m.agent_name}</span>
                                <p className="collab-content">{m.content}</p>
                            </div>
                        ))}
                        {collab.summary && (
                            <div className="collab-summary">
                                <div className="panel-section-label">✅ Summary</div>
                                <p>{collab.summary}</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </aside>
    );
}