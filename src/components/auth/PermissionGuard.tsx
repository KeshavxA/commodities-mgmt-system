"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/context/AuthContext";
import { useRBAC, type Permission } from "@/src/context/RBACContext";

interface PermissionGuardProps {
    requiredPermissions: Permission[];
    requireAll?: boolean;
    fallbackUrl?: string;
    children: React.ReactNode;
}

export default function PermissionGuard({
    requiredPermissions,
    requireAll = false,
    fallbackUrl = "/commodities",
    children,
}: PermissionGuardProps) {
    const { user, isAuthenticated } = useAuth();
    const { hasPermission, hasAnyPermission } = useRBAC();
    const router = useRouter();

    const checkAccess = () => {
        if (!user) return false;
        if (requiredPermissions.length === 0) return true;
        
        if (requireAll) {
            return requiredPermissions.every(p => hasPermission(user.role, p));
        }
        return hasAnyPermission(user.role, requiredPermissions);
    };

    const hasAccess = checkAccess();

    useEffect(() => {
        if (!isAuthenticated) {
            router.replace("/login");
            return;
        }

        if (user && !hasAccess) {
            router.replace(fallbackUrl);
        }
    }, [isAuthenticated, user, hasAccess, fallbackUrl, router]);

    if (!isAuthenticated || !user || !hasAccess) {
        return null;
    }

    return <>{children}</>;
}
