"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/context/AuthContext";
import Navbar from "@/src/components/layout/Navbar";
import Sidebar from "@/src/components/layout/Sidebar";
import {
    Package,
    TrendingUp,
    ShoppingCart,
    AlertTriangle,
} from "lucide-react";
import clsx from "clsx";

export default function DashboardPage() {
    const { user, isAuthenticated } = useAuth();
    const router = useRouter();

    // Redirect to login if not authenticated
    useEffect(() => {
        if (!isAuthenticated) {
            router.replace("/login");
        }
    }, [isAuthenticated, router]);

    if (!isAuthenticated || !user) return null;

    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
            <Sidebar />

            <div className="flex flex-1 flex-col">
                <Navbar />

                <main className="flex-1 p-6 lg:p-8">
                    {/* Page header */}
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                            Dashboard
                        </h1>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Welcome back,{" "}
                            <span className="font-medium text-gray-700 dark:text-gray-300">
                                {user.email}
                            </span>{" "}
                            &middot;{" "}
                            <span
                                className={clsx(
                                    "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                                    user.role === "Manager"
                                        ? "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400"
                                        : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                                )}
                            >
                                {user.role}
                            </span>
                        </p>
                    </div>

                    {/* Stats grid */}
                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                        <StatCard
                            icon={<Package className="h-5 w-5" />}
                            label="Total Commodities"
                            value="1,284"
                            change="+12%"
                            positive
                            color="indigo"
                        />
                        <StatCard
                            icon={<TrendingUp className="h-5 w-5" />}
                            label="Total Value"
                            value="$4.2M"
                            change="+8.1%"
                            positive
                            color="emerald"
                        />
                        <StatCard
                            icon={<ShoppingCart className="h-5 w-5" />}
                            label="Pending Orders"
                            value="42"
                            change="-3%"
                            positive={false}
                            color="amber"
                        />
                        <StatCard
                            icon={<AlertTriangle className="h-5 w-5" />}
                            label="Low Stock Alerts"
                            value="7"
                            change="+2"
                            positive={false}
                            color="red"
                        />
                    </div>

                    {/* Placeholder content area */}
                    <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-8 text-center dark:border-gray-800 dark:bg-gray-900">
                        <Package className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600" />
                        <h2 className="mt-4 text-lg font-semibold text-gray-700 dark:text-gray-300">
                            Commodity Analytics
                        </h2>
                        <p className="mt-1 text-sm text-gray-400 dark:text-gray-500">
                            Charts and detailed reports will appear here.
                        </p>
                    </div>
                </main>
            </div>
        </div>
    );
}

/* ─── Stat Card ───────────────────────────────────────────── */
type CardColor = "indigo" | "emerald" | "amber" | "red";

const colorMap: Record<
    CardColor,
    { bg: string; icon: string; badge: string }
> = {
    indigo: {
        bg: "bg-indigo-50 dark:bg-indigo-900/20",
        icon: "text-indigo-600 dark:text-indigo-400",
        badge: "text-indigo-600 bg-indigo-50 dark:text-indigo-400 dark:bg-indigo-900/30",
    },
    emerald: {
        bg: "bg-emerald-50 dark:bg-emerald-900/20",
        icon: "text-emerald-600 dark:text-emerald-400",
        badge: "text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/30",
    },
    amber: {
        bg: "bg-amber-50 dark:bg-amber-900/20",
        icon: "text-amber-600 dark:text-amber-400",
        badge: "text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-900/30",
    },
    red: {
        bg: "bg-red-50 dark:bg-red-900/20",
        icon: "text-red-600 dark:text-red-400",
        badge: "text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/30",
    },
};

function StatCard({
    icon,
    label,
    value,
    change,
    positive,
    color,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
    change: string;
    positive: boolean;
    color: CardColor;
}) {
    const c = colorMap[color];
    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between">
                <div className={clsx("flex h-10 w-10 items-center justify-center rounded-xl", c.bg)}>
                    <span className={c.icon}>{icon}</span>
                </div>
                <span
                    className={clsx(
                        "rounded-full px-2 py-0.5 text-xs font-medium",
                        positive
                            ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
                            : "bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                    )}
                >
                    {change}
                </span>
            </div>
            <p className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
            <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">{label}</p>
        </div>
    );
}
