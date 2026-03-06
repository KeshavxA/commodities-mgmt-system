"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/src/context/AuthContext";
import {
    Package,
    LayoutDashboard,
    Boxes,
    ClipboardList,
    Settings,
    ChevronLeft,
} from "lucide-react";
import clsx from "clsx";
import { useState } from "react";

const navigation = [
    {
        name: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
        managerOnly: true,
    },
    {
        name: "Commodities",
        href: "/commodities",
        icon: Boxes,
        managerOnly: false,
    },
    {
        name: "Orders",
        href: "/orders",
        icon: ClipboardList,
        managerOnly: false,
    },
    {
        name: "Settings",
        href: "/settings",
        icon: Settings,
        managerOnly: false,
    },
];

export default function Sidebar() {
    const { user } = useAuth();
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(false);

    const visibleLinks = navigation.filter(
        (item) => !item.managerOnly || user?.role === "Manager"
    );

    return (
        <aside
            className={clsx(
                "sticky top-0 flex h-screen flex-col border-r border-gray-200 bg-white transition-all duration-300 dark:border-gray-800 dark:bg-gray-900",
                collapsed ? "w-[4.5rem]" : "w-60"
            )}
        >
            {/* Logo */}
            <div className="flex h-16 items-center gap-3 border-b border-gray-200 px-4 dark:border-gray-800">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-md shadow-indigo-500/25">
                    <Package className="h-5 w-5 text-white" />
                </div>
                {!collapsed && (
                    <span className="text-sm font-bold tracking-tight text-gray-900 dark:text-white">
                        CMS
                    </span>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1 px-3 py-4">
                {visibleLinks.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            id={`sidebar-link-${item.name.toLowerCase()}`}
                            className={clsx(
                                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                                isActive
                                    ? "bg-indigo-50 text-indigo-700 shadow-sm dark:bg-indigo-900/20 dark:text-indigo-400"
                                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                            )}
                            title={item.name}
                        >
                            <item.icon
                                className={clsx(
                                    "h-5 w-5 shrink-0 transition-colors",
                                    isActive
                                        ? "text-indigo-600 dark:text-indigo-400"
                                        : "text-gray-400 group-hover:text-gray-600 dark:text-gray-500 dark:group-hover:text-gray-300"
                                )}
                            />
                            {!collapsed && <span>{item.name}</span>}
                        </Link>
                    );
                })}
            </nav>

            {/* Collapse toggle */}
            <div className="border-t border-gray-200 px-3 py-3 dark:border-gray-800">
                <button
                    id="sidebar-collapse-toggle"
                    type="button"
                    onClick={() => setCollapsed((c) => !c)}
                    className="flex w-full items-center justify-center rounded-xl py-2 text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
                    aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                    <ChevronLeft
                        className={clsx(
                            "h-5 w-5 transition-transform duration-300",
                            collapsed && "rotate-180"
                        )}
                    />
                </button>
            </div>
        </aside>
    );
}
