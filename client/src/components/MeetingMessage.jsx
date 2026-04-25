export default function MeetingMessage({ message }) {
    const isUser = message.message_type === "user";
    const isSummary = message.type === "summary";

    if (isUser) return (
        <div className="meeting-msg meeting-msg--user">
            <div className="meeting-msg-bubble meeting-msg-bubble--user">
                <span className="meeting-msg-you">You</span>
                <p>{message.content}</p>
            </div>
        </div>
    );

    if (isSummary) return (
        <div className="meeting-msg meeting-msg--summary">
            <div className="meeting-summary-card">
                <div className="meeting-summary-header">
                    <span>⚡</span>
                    <span>Syntra — Meeting Summary</span>
                </div>
                <p className="meeting-summary-content">{message.content}</p>
            </div>
        </div>
    );

    return (
        <div className="meeting-msg">
            <div className="meeting-msg-avatar" style={{ background: (message.agent_color || "#6d28d9") + "22", border: `1px solid ${(message.agent_color || "#6d28d9")}44` }}>
                {message.agent_icon || "🤖"}
            </div>
            <div className="meeting-msg-body">
                <div className="meeting-msg-meta">
                    <span className="meeting-msg-name" style={{ color: message.agent_color || "#a78bfa" }}>
                        {message.agent_name}
                    </span>
                    {message.agent_role && (
                        <span className="meeting-msg-role">{message.agent_role}</span>
                    )}
                </div>
                <div className="meeting-msg-bubble">
                    <p>{message.content}</p>
                </div>
            </div>
        </div>
    );
}