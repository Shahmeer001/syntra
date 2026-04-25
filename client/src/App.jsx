import { AppProvider, useApp } from "./lib/context";
import Home from "./pages/Home";
import WorkspaceShell from "./pages/WorkspaceShell";

function Router() {
    const { activePage } = useApp();
    return activePage === "workspace" ? <WorkspaceShell /> : <Home />;
}

export default function App() {
    return (
        <AppProvider>
            <Router />
        </AppProvider>
    );
}