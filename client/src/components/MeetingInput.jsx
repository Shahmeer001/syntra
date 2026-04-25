import { useState } from "react";

export default function MeetingInput({ onSubmit, disabled }) {
    const [topic, setTopic] = useState("");

    const handle = () => {
        if (!topic.trim() || disabled) return;
        onSubmit(topic.trim());
        setTopic("");
    };

    const onKey = (e) => {
        if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handle(); }
    };

    return (
        <div className="meeting-input-bar">
            <textarea
                className="meeting-input"
                placeholder="Give your team a topic to discuss... (e.g. 'Should we launch a freemium tier?')"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                onKeyDown={onKey}
                disabled={disabled}
                rows={2}
            />
            <button
                className="meeting-send-btn"
                onClick={handle}
                disabled={disabled || !topic.trim()}
            >
                {disabled ? "⏳" : "▶ Start Meeting"}
            </button>
        </div>
    );
}