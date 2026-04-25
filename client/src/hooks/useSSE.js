import { useState, useRef, useCallback } from "react";

export function useSSE() {
    const [messages, setMessages] = useState([]);
    const [streaming, setStreaming] = useState(false);
    const [done, setDone] = useState(false);
    const sourceRef = useRef(null);

    const startStream = useCallback((url) => {
        // Close existing connection
        if (sourceRef.current) {
            sourceRef.current.close();
        }

        setMessages([]);
        setStreaming(true);
        setDone(false);

        const source = new EventSource(url);
        sourceRef.current = source;

        source.onmessage = (e) => {
            try {
                const data = JSON.parse(e.data);
                if (data.type === "done") {
                    setStreaming(false);
                    setDone(true);
                    source.close();
                    return;
                }
                setMessages((prev) => [...prev, data]);
            } catch (err) {
                console.error("SSE parse error:", err);
            }
        };

        source.onerror = () => {
            setStreaming(false);
            source.close();
        };
    }, []);

    const stop = useCallback(() => {
        if (sourceRef.current) {
            sourceRef.current.close();
        }
        setStreaming(false);
    }, []);

    const reset = useCallback(() => {
        stop();
        setMessages([]);
        setDone(false);
    }, [stop]);

    return { messages, streaming, done, startStream, stop, reset };
}