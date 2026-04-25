import { useState } from "react";
import { useApp } from "../lib/context";
import DashboardPage from "./DashboardPage";
import AgentsPage from "./AgentsPage";
import TasksPage from "./TasksPage";
import MeetingPage from "./MeetingPage";
import BillingPage from "./BillingPage";

const NAV = [
    { key: "dashboard", icon: "📊", label: "Dashboard" },
    { key: "agents", icon: "🤖", label: "Agents" },
    { key: "tasks", icon: "📋", label: "Tasks" },
    { key: "meeting", icon: "💬", label: "Meeting Room" },
    { key: "billing", icon: "💳", label: "Billing" },
];

export default function WorkspaceShell() {
    const { activeWorkspace, leaveWorkspace } = useApp();
    const [tab, setTab] = useState("dashboard");

    const Page = {
        dashboard: DashboardPage,
        agents: AgentsPage,
        tasks: TasksPage,
        meeting: MeetingPage,
        billing: BillingPage,
    }[tab] || DashboardPage;

    return (
        <div className="shell">
            <aside className="sidebar">
                <div className="sidebar-top">
                    <div className="brand">
                        <div className="brand-icon">⚡</div>
                        <span className="brand-name">Syntra</span>
                    </div>

                    <div className="ws-info">
                        <div className="ws-info-name">{activeWorkspace?.name}</div>
                        <div className="ws-info-desc">{activeWorkspace?.description || "No description"}</div>
                    </div>

                    <nav className="nav">
                        {NAV.map((item) => (
                            <button
                                key={item.key}
                                className={`nav-item ${tab === item.key ? "nav-item--active" : ""}`}
                                onClick={() => setTab(item.key)}
                            >
                                <span className="nav-icon">{item.icon}</span>
                                <span className="nav-label">{item.label}</span>
                            </button>
                        ))}
                    </nav>
                </div>

                <button className="btn-back-home" onClick={leaveWorkspace}>
                    ← All Workspaces
                </button>
            </aside>

            <main className="shell-main">
                <Page />
            </main>
        </div>
    );
}