const BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

async function req(path, options = {}) {
    const res = await fetch(`${BASE}${path}`, {
        headers: { "Content-Type": "application/json" },
        ...options,
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: "Request failed" }));
        throw new Error(err.detail || "Request failed");
    }
    return res.json();
}

// ── Workspaces ───────────────────────────────────────────────
export const workspaceApi = {
    list: () => req("/workspaces"),
    create: (data) => req("/workspaces", { method: "POST", body: JSON.stringify(data) }),
    get: (id) => req(`/workspaces/${id}`),
    update: (id, data) => req(`/workspaces/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    delete: (id) => req(`/workspaces/${id}`, { method: "DELETE" }),
    stats: (id) => req(`/workspaces/${id}/stats`),
};

// ── Agents ───────────────────────────────────────────────────
export const agentApi = {
    presets: () => req("/agents/presets"),
    list: (wsId) => req(`/agents/${wsId}`),
    create: (data) => req("/agents", { method: "POST", body: JSON.stringify(data) }),
    update: (id, data) => req(`/agents/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    delete: (id) => req(`/agents/${id}`, { method: "DELETE" }),
};

// ── Tasks ────────────────────────────────────────────────────
export const taskApi = {
    list: (wsId) => req(`/tasks/${wsId}`),
    create: (data) => req("/tasks", { method: "POST", body: JSON.stringify(data) }),
    updateStatus: (id, status) => req(`/tasks/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),
    delete: (id) => req(`/tasks/${id}`, { method: "DELETE" }),
};

// ── Collaboration ────────────────────────────────────────────
export const collaborationApi = {
    run: (taskId) => req(`/collaboration/${taskId}`, { method: "POST" }),
    get: (taskId) => req(`/collaboration/${taskId}`),
};

// ── Meeting ──────────────────────────────────────────────────
export const meetingApi = {
    start: (data) => req("/meeting/start", { method: "POST", body: JSON.stringify(data) }),
    getMessages: (wsId, sessionId) => req(`/meeting/${wsId}/messages${sessionId ? `?session_id=${sessionId}` : ""}`),
    clear: (wsId) => req(`/meeting/${wsId}/messages`, { method: "DELETE" }),
    streamUrl: (wsId, sessionId, topic) =>
        `${BASE}/meeting/stream/${wsId}/${sessionId}?topic=${encodeURIComponent(topic)}`,
};

// ── Billing ──────────────────────────────────────────────────
export const billingApi = {
    getSubscription: (wsId) => req(`/billing/${wsId}`),
    createCheckout: (data) => req("/billing/checkout", { method: "POST", body: JSON.stringify(data) }),
};