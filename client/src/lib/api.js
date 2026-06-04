/**
 * api.js - API client for Syntra
 * Updated with execution logs endpoints for real-time task progress.
 */

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// ============================================
// Task API
// ============================================
export const taskApi = {
    /**
     * List all tasks in a workspace
     */
    async list(workspaceId) {
        const res = await fetch(`${BASE_URL}/tasks/${workspaceId}`);
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    },

    /**
     * Create a new task (starts async execution automatically)
     */
    async create(data) {
        const res = await fetch(`${BASE_URL}/tasks`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    },

    /**
     * Get execution logs for a task (for real-time progress)
     * Use this to poll for status updates
     */
    async getExecutionLogs(taskId) {
        const res = await fetch(`${BASE_URL}/tasks/${taskId}/logs`);
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    },

    /**
     * Update task status (pending, in_progress, done)
     */
    async updateStatus(taskId, status) {
        const res = await fetch(`${BASE_URL}/tasks/${taskId}/status`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status }),
        });
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    },

    /**
     * Delete a task
     */
    async delete(taskId) {
        const res = await fetch(`${BASE_URL}/tasks/${taskId}`, {
            method: "DELETE",
        });
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    },
};

// ============================================
// Agent API
// ============================================
export const agentApi = {
    /**
     * Get agent presets
     */
    async presets() {
        const res = await fetch(`${BASE_URL}/agents/presets`);
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    },

    /**
     * List all agents in a workspace
     */
    async list(workspaceId) {
        const res = await fetch(`${BASE_URL}/agents/${workspaceId}`);
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    },

    /**
     * Create a new agent
     */
    async create(data) {
        const res = await fetch(`${BASE_URL}/agents`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    },

    /**
     * Update an agent
     */
    async update(agentId, data) {
        const res = await fetch(`${BASE_URL}/agents/${agentId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    },

    /**
     * Delete an agent
     */
    async delete(agentId) {
        const res = await fetch(`${BASE_URL}/agents/${agentId}`, {
            method: "DELETE",
        });
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    },
};

// ============================================
// Workspace API
// ============================================
export const workspaceApi = {
    /**
     * Get workspace stats
     */
    async stats(workspaceId) {
        const res = await fetch(`${BASE_URL}/workspaces/${workspaceId}/stats`);
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    },

    /**
     * List all workspaces
     */
    async list() {
        const res = await fetch(`${BASE_URL}/workspaces`);
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    },

    /**
     * Create a new workspace
     */
    async create(data) {
        const res = await fetch(`${BASE_URL}/workspaces`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    },

    /**
     * Get a single workspace
     */
    async get(workspaceId) {
        const res = await fetch(`${BASE_URL}/workspaces/${workspaceId}`);
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    },

    /**
     * Update a workspace
     */
    async update(workspaceId, data) {
        const res = await fetch(`${BASE_URL}/workspaces/${workspaceId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    },

    /**
     * Delete a workspace
     */
    async delete(workspaceId) {
        const res = await fetch(`${BASE_URL}/workspaces/${workspaceId}`, {
            method: "DELETE",
        });
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    },
};

// ============================================
// Collaboration API
// ============================================
export const collaborationApi = {
    /**
     * Run collaboration for a task
     */
    async run(taskId) {
        const res = await fetch(`${BASE_URL}/collaboration/${taskId}`, {
            method: "POST",
        });
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    },

    /**
     * Get collaboration for a task
     */
    async get(taskId) {
        const res = await fetch(`${BASE_URL}/collaborations/${taskId}`);
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    },

    /**
     * Create collaboration for a task
     */
    async create(data) {
        const res = await fetch(`${BASE_URL}/collaborations`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    },

    /**
     * Add message to collaboration
     */
    async addMessage(collaborationId, data) {
        const res = await fetch(`${BASE_URL}/collaborations/${collaborationId}/messages`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    },
};

// ============================================
// Meeting API
// ============================================
export const meetingApi = {
    /**
     * Start a meeting
     */
    async start(data) {
        const res = await fetch(`${BASE_URL}/meeting/start`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    },

    /**
     * Clear meeting messages
     */
    async clear(workspaceId) {
        const res = await fetch(`${BASE_URL}/meeting/${workspaceId}/messages`, {
            method: "DELETE",
        });
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    },

    /**
     * Get event stream URL for a meeting
     */
    streamUrl(workspaceId, sessionId, topic) {
        return `${BASE_URL}/meeting/stream/${workspaceId}/${sessionId}?topic=${encodeURIComponent(topic)}`;
    },

    /**
     * Get meeting messages for a workspace
     */
    async getMessages(workspaceId, sessionId) {
        const res = await fetch(
            `${BASE_URL}/meeting/${workspaceId}?session_id=${sessionId}`
        );
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    },

    /**
     * Send a message in meeting
     */
    async sendMessage(data) {
        const res = await fetch(`${BASE_URL}/meeting`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    },
};

// ============================================
// Billing API
// ============================================
export const billingApi = {
    /**
     * Get subscription for workspace
     */
    async getSubscription(workspaceId) {
        const res = await fetch(`${BASE_URL}/billing/subscription/${workspaceId}`);
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    },

    /**
     * Create checkout session
     */
    async createCheckout(data) {
        const res = await fetch(`${BASE_URL}/billing/checkout`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    },
};