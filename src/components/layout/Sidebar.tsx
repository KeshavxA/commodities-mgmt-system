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
    LogOut,
    Menu,
    X,
    Shield,
    Warehouse,
} from "lucide-react";
import clsx from "clsx";
import { useState, useEffect } from "react";

/* ─── Navigation items ────────────────────────────────────── */
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
    const { user, logout } = useAuth();
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    // Close mobile menu on route change
    useEffect(() => {
        setMobileOpen(false);
    }, [pathname]);

    // Close mobile menu on resize to desktop
    useEffect(() => {
        function onResize() {
            if (window.innerWidth >= 1024) setMobileOpen(false);
        }
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, []);

    // Prevent body scroll when mobile menu is open
    useEffect(() => {
        document.body.style.overflow = mobileOpen ? "hidden" : "";
        return () => {
            document.body.style.overflow = "";
        };
    }, [mobileOpen]);

    const visibleLinks = navigation.filter(
        (item) => !item.managerOnly || user?.role === "Manager"
    );

    const isManager = user?.role === "Manager";
    const RoleIcon = isManager ? Shield : Warehouse;

    /* ─── Sidebar content (shared desktop & mobile) ──────── */
    function SidebarContent() {
        return (
            <>
                {/* Logo */}
                <div className="flex h-16 items-center justify-between border-b border-gray-200 px-4 dark:border-gray-800">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-md shadow-indigo-500/25">
                            <Package className="h-5 w-5 text-white" />
                        </div>
                        {!collapsed && (
                            <span className="text-sm font-bold tracking-tight text-gray-900 dark:text-white">
                                CMS
                            </span>
                        )}
                    </div>

                    {/* Close button – mobile only */}
                    <button
                        type="button"
                        onClick={() => setMobileOpen(false)}
                        className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 lg:hidden dark:hover:bg-gray-800 dark:hover:text-gray-300"
                        aria-label="Close sidebar"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Navigation links */}
                <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
                    {visibleLinks.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                id={`sidebar-link-${item.name.toLowerCase()}`}
                                className={clsx(
                                    "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                                    isActive
                                        ? "bg-indigo-50 text-indigo-700 shadow-sm dark:bg-indigo-900/20 dark:text-indigo-400"
                                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                                )}
                                title={item.name}
                            >
                                {/* Active indicator bar */}
                                {isActive && (
                                    <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-indigo-500 dark:bg-indigo-400" />
                                )}

                                <item.icon
                                    className={clsx(
                                        "h-5 w-5 shrink-0 transition-colors duration-200",
                                        isActive
                                            ? "text-indigo-600 dark:text-indigo-400"
                                            : "text-gray-400 group-hover:text-gray-600 dark:text-gray-500 dark:group-hover:text-gray-300"
                                    )}
                                />
                                {!collapsed && <span>{item.name}</span>}

                                {/* Manager-only badge – when sidebar is expanded */}
                                {!collapsed && item.managerOnly && (
                                    <span className="ml-auto rounded-md bg-violet-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-violet-600 dark:bg-violet-900/30 dark:text-violet-400">
                                        Admin
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* ─── User info + Logout ───────────────────────────── */}
                <div className="border-t border-gray-200 p-3 dark:border-gray-800">
                    {/* User card */}
                    {user && !collapsed && (
                        <div className="mb-3 flex items-center gap-3 rounded-xl bg-gray-50 px-3 py-2.5 dark:bg-gray-800/50">
                            <div
                                className={clsx(
                                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white",
                                    isManager
                                        ? "bg-gradient-to-br from-violet-500 to-indigo-600"
                                        : "bg-gradient-to-br from-emerald-500 to-teal-600"
                                )}
                            >
                                {user.email[0].toUpperCase()}
                            </div>
                            <div className="min-w-0">
                                <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                                    {user.email.split("@")[0]}
                                </p>
                                <div className="flex items-center gap-1">
                                    <RoleIcon className="h-3 w-3 text-gray-400 dark:text-gray-500" />
                                    <span
                                        className={clsx(
                                            "text-[11px] font-medium",
                                            isManager
                                                ? "text-violet-600 dark:text-violet-400"
                                                : "text-emerald-600 dark:text-emerald-400"
                                        )}
                                    >
                                        {user.role}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Collapsed: user avatar only */}
                    {user && collapsed && (
                        <div className="mb-3 flex justify-center">
                            <div
                                className={clsx(
                                    "flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold text-white",
                                    isManager
                                        ? "bg-gradient-to-br from-violet-500 to-indigo-600"
                                        : "bg-gradient-to-br from-emerald-500 to-teal-600"
                                )}
                                title={`${user.email} (${user.role})`}
                            >
                                {user.email[0].toUpperCase()}
                            </div>
                        </div>
                    )}

                    {/* Logout button */}
                    <button
                        id="sidebar-logout"
                        type="button"
                        onClick={logout}
                        className={clsx(
                            "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                            "text-red-500 hover:bg-red-50 hover:text-red-600 dark:text-red-400 dark:hover:bg-red-900/20 dark:hover:text-red-300",
                            collapsed && "justify-center"
                        )}
                        title="Logout"
                    >
                        <LogOut className="h-5 w-5 shrink-0" />
                        {!collapsed && <span>Logout</span>}
                    </button>

                    {/* Collapse toggle – desktop only */}
                    <button
                        id="sidebar-collapse-toggle"
                        type="button"
                        onClick={() => setCollapsed((c) => !c)}
                        className="mt-1 hidden w-full items-center justify-center rounded-xl py-2 text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-600 lg:flex dark:hover:bg-gray-800 dark:hover:text-gray-300"
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
            </>
        );
    }

    return (
        <>
            {/* ─── Mobile hamburger trigger ─────────────────────── */}
            <button
                id="mobile-menu-button"
                type="button"
                onClick={() => setMobileOpen(true)}
                className="fixed left-4 top-4 z-40 flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white/90 text-gray-600 shadow-sm backdrop-blur-sm transition-colors hover:bg-gray-50 lg:hidden dark:border-gray-700 dark:bg-gray-900/90 dark:text-gray-300 dark:hover:bg-gray-800"
                aria-label="Open sidebar"
            >
                <Menu className="h-5 w-5" />
            </button>

            {/* ─── Mobile overlay ───────────────────────────────── */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* ─── Mobile drawer ────────────────────────────────── */}
            <aside
                className={clsx(
                    "fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-gray-200 bg-white transition-transform duration-300 lg:hidden dark:border-gray-800 dark:bg-gray-900",
                    mobileOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <SidebarContent />
            </aside>

            {/* ─── Desktop sidebar ──────────────────────────────── */}
            <aside
                className={clsx(
                    "sticky top-0 hidden h-screen flex-col border-r border-gray-200 bg-white transition-all duration-300 lg:flex dark:border-gray-800 dark:bg-gray-900",
                    collapsed ? "w-[4.5rem]" : "w-60"
                )}
            >
                <SidebarContent />
            </aside>
        </>
    );
}
