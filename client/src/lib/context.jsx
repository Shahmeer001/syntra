import { createContext, useContext, useState } from "react";

const AppContext = createContext(null);

export function AppProvider({ children }) {
    const [activeWorkspace, setActiveWorkspace] = useState(null);
    const [activePage, setActivePage] = useState("home");

    const enterWorkspace = (ws) => {
        setActiveWorkspace(ws);
        setActivePage("workspace");
    };

    const leaveWorkspace = () => {
        setActiveWorkspace(null);
        setActivePage("home");
    };

    const updateWorkspace = (updated) => {
        setActiveWorkspace(updated);
    };

    return (
        <AppContext.Provider value={{
            activeWorkspace,
            activePage,
            enterWorkspace,
            leaveWorkspace,
            updateWorkspace,
        }}>
            {children}
        </AppContext.Provider>
    );
}

export const useApp = () => useContext(AppContext);