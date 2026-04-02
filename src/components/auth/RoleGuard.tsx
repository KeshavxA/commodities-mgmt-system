"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, type UserRole } from "@/src/context/AuthContext";

interface RoleGuardProps {
    allowedRoles: UserRole[];
    fallbackUrl?: string;
    children: React.ReactNode;
}


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

    if (!isAuthenticated || !user || !allowedRoles.includes(user.role)) {
        return null;
    }

    return <>{children}</>;
}
