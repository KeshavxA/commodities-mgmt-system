"use client";

import {
    createContext,
    useContext,
    useEffect,
    useState,
    useCallback,
    type ReactNode,
} from "react";

export type Permission =
    | "dashboard:view"
    | "products:read"
    | "products:create"
    | "products:edit"
    | "products:delete"
    | "orders:read"
    | "orders:create"
    | "orders:approve"
    | "suppliers:read"
    | "suppliers:manage"
    | "audit:view"
    | "roles:manage";

export interface Role {
    id: string;
    name: string;
    permissions: Permission[];
    isSystem?: boolean; // System roles cannot be deleted
}

interface RBACContextType {
    roles: Role[];
    hasPermission: (roleId: string, permission: Permission) => boolean;
    hasAnyPermission: (roleId: string, permissions: Permission[]) => boolean;
    createRole: (name: string, permissions: Permission[]) => void;
    updateRole: (id: string, permissions: Permission[]) => void;
    deleteRole: (id: string) => void;
    getRoleName: (id: string) => string;
}

const RBACContext = createContext<RBACContextType | undefined>(undefined);
const STORAGE_KEY = "commodities-rbac-roles";

// Default roles if none exist
const DEFAULT_ROLES: Role[] = [
    {
        id: "role_manager",
        name: "Manager",
        isSystem: true,
        permissions: [
            "dashboard:view",
            "products:read",
            "products:create",
            "products:edit",
            "products:delete",
            "orders:read",
            "orders:create",
            "orders:approve",
            "suppliers:read",
            "suppliers:manage",
            "audit:view",
            "roles:manage",
        ],
    },
    {
        id: "role_storekeeper",
        name: "Store Keeper",
        isSystem: true,
        permissions: [
            "products:read",
            "products:edit",
            "orders:read",
            "orders:create",
            "suppliers:read",
        ],
    },
];

export function RBACProvider({ children }: { children: ReactNode }) {
    const [roles, setRoles] = useState<Role[]>([]);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                setRoles(JSON.parse(stored));
            } else {
                setRoles(DEFAULT_ROLES);
                localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_ROLES));
            }
        } catch {
            setRoles(DEFAULT_ROLES);
        }
        setMounted(true);
    }, []);

    const hasPermission = useCallback((roleId: string, permission: Permission) => {
        const role = roles.find((r) => r.id === roleId);
        if (!role) return false;
        return role.permissions.includes(permission);
    }, [roles]);

    const hasAnyPermission = useCallback((roleId: string, permissions: Permission[]) => {
        const role = roles.find((r) => r.id === roleId);
        if (!role) return false;
        return permissions.some((p) => role.permissions.includes(p));
    }, [roles]);

    const createRole = useCallback((name: string, permissions: Permission[]) => {
        setRoles((prev) => {
            const newRole: Role = {
                id: `role_${Date.now()}`,
                name,
                permissions,
                isSystem: false,
            };
            const updated = [...prev, newRole];
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
            return updated;
        });
    }, []);

    const updateRole = useCallback((id: string, permissions: Permission[]) => {
        setRoles((prev) => {
            const updated = prev.map((r) =>
                r.id === id ? { ...r, permissions } : r
            );
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
            return updated;
        });
    }, []);

    const deleteRole = useCallback((id: string) => {
        setRoles((prev) => {
            const role = prev.find((r) => r.id === id);
            if (role?.isSystem) return prev; // Cannot delete system roles
            
            const updated = prev.filter((r) => r.id !== id);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
            return updated;
        });
    }, []);

    const getRoleName = useCallback((id: string) => {
        const role = roles.find((r) => r.id === id);
        return role ? role.name : "Unknown Role";
    }, [roles]);

    if (!mounted) {
        return <>{children}</>;
    }

    return (
        <RBACContext.Provider value={{ roles, hasPermission, hasAnyPermission, createRole, updateRole, deleteRole, getRoleName }}>
            {children}
        </RBACContext.Provider>
    );
}

export function useRBAC(): RBACContextType {
    const ctx = useContext(RBACContext);
    if (!ctx) {
        throw new Error("useRBAC must be used within an <RBACProvider>");
    }
    return ctx;
}
