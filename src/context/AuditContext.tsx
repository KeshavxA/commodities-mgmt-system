"use client";

import {
    createContext,
    useContext,
    useEffect,
    useState,
    useCallback,
    type ReactNode,
} from "react";
import { type User } from "./AuthContext";

export type AuditAction = "CREATE" | "UPDATE" | "DELETE";

export interface AuditLog {
    id: string;
    action: AuditAction;
    details: string;
    userEmail: string;
    role: string;
    timestamp: string;
}

interface AuditContextType {
    logs: AuditLog[];
    logAction: (action: AuditAction, details: string, user: User) => void;
}

const AuditContext = createContext<AuditContextType | undefined>(undefined);
const STORAGE_KEY = "commodities-audit-logs";

export function AuditProvider({ children }: { children: ReactNode }) {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                setLogs(JSON.parse(stored));
            }
        } catch {
            // ignore
        }
        setMounted(true);
    }, []);

    const logAction = useCallback((action: AuditAction, details: string, user: User) => {
        setLogs((prev) => {
            const newLog: AuditLog = {
                id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                action,
                details,
                userEmail: user.email,
                role: user.role,
                timestamp: new Date().toISOString(),
            };
            const updated = [newLog, ...prev];
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
            } catch {
                // ignore
            }
            return updated;
        });
    }, []);

    // We don't block render on mount because children (like AuthContext) might be needed.
    // However, if we don't render children until mounted, it avoids hydration mismatch.
    if (!mounted) {
        return <>{children}</>;
    }

    return (
        <AuditContext.Provider value={{ logs, logAction }}>
            {children}
        </AuditContext.Provider>
    );
}

export function useAudit(): AuditContextType {
    const ctx = useContext(AuditContext);
    if (!ctx) {
        throw new Error("useAudit must be used within an <AuditProvider>");
    }
    return ctx;
}
