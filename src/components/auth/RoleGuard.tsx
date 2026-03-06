"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, type UserRole } from "@/src/context/AuthContext";

interface RoleGuardProps {
    /** The roles that are allowed to view this content */
    allowedRoles: UserRole[];
    /** Where to redirect if the user's role is not allowed (defaults to /commodities) */
    fallbackUrl?: string;
    children: React.ReactNode;
}

/**
 * Wraps a page/route so only users with the specified role(s) can view it.
 * - Unauthenticated users → /login
 * - Authenticated but wrong role → fallbackUrl (default: /commodities)
 */
export default function RoleGuard({
    allowedRoles,
    fallbackUrl = "/commodities",
    children,
}: RoleGuardProps) {
    const { user, isAuthenticated } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isAuthenticated) {
            router.replace("/login");
            return;
        }

        if (user && !allowedRoles.includes(user.role)) {
            router.replace(fallbackUrl);
        }
    }, [isAuthenticated, user, allowedRoles, fallbackUrl, router]);

    // Don't render anything while redirecting
    if (!isAuthenticated || !user || !allowedRoles.includes(user.role)) {
        return null;
    }

    return <>{children}</>;
}
