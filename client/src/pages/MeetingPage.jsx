import { useState, useEffect, useRef } from "react";
import { useApp } from "../lib/context";
import { meetingApi, agentApi } from "../lib/api";
import { useSSE } from "../hooks/useSSE";
import MeetingMessage from "../components/MeetingMessage";
import MeetingInput from "../components/MeetingInput";

export default function MeetingPage() {
    const { activeWorkspace } = useApp();
    const { messages, streaming, done, startStream, reset } = useSSE();
    const [agents, setAgents] = useState([]);
    const [history, setHistory] = useState([]);
    const [sessionId, setSessionId] = useState(null);
    const [currentTopic, setCurrentTopic] = useState("");
    const [error, setError] = useState("");
    const bottomRef = useRef(null);

    useEffect(() => {
        agentApi.list(activeWorkspace.id).then(setAgents).catch(() => { });
        meetingApi.getMessages(activeWorkspace.id).then(setHistory).catch(() => { });
    }, [activeWorkspace.id]);

    // Auto scroll
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, history]);

    const handleStart = async (topic) => {
        if (!topic.trim()) return;
        setError("");
        setCurrentTopic(topic);

        try {
            const { session_id } = await meetingApi.start({
                workspace_id: activeWorkspace.id,
                topic,
            });
            setSessionId(session_id);

            const url = meetingApi.streamUrl(activeWorkspace.id, session_id, topic);
            startStream(url);
        } catch (e) {
            setError(e.message);
        }
    };

    const handleClear = async () => {
        reset();
        setHistory([]);
        setSessionId(null);
        setCurrentTopic("");
        await meetingApi.clear(activeWorkspace.id);
    };

    const allMessages = sessionId
        ? messages
        : history;

    return (
        <div className="meeting-layout">
            <div className="meeting-header">
                <div>
                    <h2 className="page-title">Meeting Room</h2>
                    <p className="page-sub">
                        Give your AI team a topic — watch them collaborate in real time.
                        {agents.length > 0 && <span className="agent-count-badge">{agents.length} agents active</span>}
                    </p>
                </div>
                {allMessages.length > 0 && (
                    <button className="btn-outline" onClick={handleClear}>Clear History</button>
                )}
            </div>

            {error && <div className="error-msg">{error}</div>}

            {agents.length === 0 && (
                <div className="meeting-warn">
                    ⚠️ No agents found. Go to the Agents tab to add team members first.
                </div>
            )}

            <div className="meeting-feed">
                {allMessages.length === 0 && !streaming && (
                    <div className="meeting-empty">
                        <div className="meeting-empty-icon">💬</div>
                        <h3>Start a meeting</h3>
                        <p>Type a topic below and your AI team will weigh in — one agent at a time.</p>
                    </div>
                )}

                {currentTopic && (
                    <div className="meeting-topic-pill">
                        📌 Topic: <strong>{currentTopic}</strong>
                    </div>
                )}

                {allMessages.map((msg, i) => (
                    <MeetingMessage key={i} message={msg} />
                ))}

                {streaming && (
                    <div className="meeting-typing">
                        <div className="typing-dots">
                            <span /><span /><span />
                        </div>
                        <span>Agent responding...</span>
                    </div>
                )}

                {done && (
                    <div className="meeting-done-banner">
                        ✅ Meeting complete — {messages.length} agent{messages.length !== 1 ? "s" : ""} responded
                    </div>
                )}

                <div ref={bottomRef} />
            </div>

            <MeetingInput
                onSubmit={handleStart}
                disabled={streaming || agents.length === 0}
            />
        </div>
    );
}