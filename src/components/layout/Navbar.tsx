"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/src/context/AuthContext";
import { useLanguage } from "@/src/context/LanguageContext";
import ThemeToggle from "@/src/components/ui/ThemeToggle";
import { LogOut, User, ChevronDown } from "lucide-react";
import clsx from "clsx";
import { useState, useRef, useEffect } from "react";

export default function Navbar() {
    const { user, logout } = useAuth();
    const { language, setLanguage, t } = useLanguage();
    const pathname = usePathname();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    function getTitleFromPath(path: string): string {
        if (path === "/") return t("home");
        if (path.startsWith("/dashboard")) return t("dashboard");
        if (path.startsWith("/commodities")) return t("commodities");
        if (path.startsWith("/orders")) return t("orders");
        if (path.startsWith("/settings")) return t("settings");
        return path.replace("/", "");
    }

    return (
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white/80 pl-14 pr-6 backdrop-blur-md dark:border-gray-800 dark:bg-gray-900/80 lg:px-6">
            <div className="flex items-center gap-3">
                <span className="text-sm font-medium capitalize text-gray-500 dark:text-gray-400">
                    {getTitleFromPath(pathname)}
                </span>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative">
                    <select
                        id="language-select"
                        value={language}
                        onChange={(e) =>
                            setLanguage(e.target.value as "en" | "de" | "fr")
                        }
                        className={clsx(
                            "rounded-xl border px-2 py-1 text-xs font-medium outline-none transition-colors",
                            "bg-white/80 text-gray-700 border-gray-200 hover:border-indigo-400 dark:bg-gray-900/80 dark:text-gray-200 dark:border-gray-700 dark:hover:border-indigo-500"
                        )}
                    >
                        <option value="en">English</option>
                        <option value="de">Deutsch</option>
                        <option value="fr">Français</option>
                    </select>
                </div>

                <ThemeToggle />

                {user && (
                    <div ref={dropdownRef} className="relative">
                        <button
                            id="user-menu-button"
                            type="button"
                            onClick={() => setDropdownOpen((v) => !v)}
                            className={clsx(
                                "flex items-center gap-2 rounded-xl border px-3 py-1.5 text-sm transition-colors",
                                "border-gray-200 bg-gray-50 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
                            )}
                        >
                            <span
                                className={clsx(
                                    "flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold text-white",
                                    user.role === "Manager"
                                        ? "bg-gradient-to-br from-violet-500 to-indigo-600"
                                        : "bg-gradient-to-br from-emerald-500 to-teal-600"
                                )}
                            >
                                {user.email[0].toUpperCase()}
                            </span>
                            <span className="hidden font-medium text-gray-700 dark:text-gray-200 sm:inline">
                                {user.email.split("@")[0]}
                            </span>
                            <ChevronDown
                                className={clsx(
                                    "h-3.5 w-3.5 text-gray-400 transition-transform duration-200",
                                    dropdownOpen && "rotate-180"
                                )}
                            />
                        </button>

                        {dropdownOpen && (
                            <div className="absolute right-0 mt-2 w-56 origin-top-right animate-in rounded-xl border border-gray-200 bg-white p-1.5 shadow-lg dark:border-gray-700 dark:bg-gray-800">

                                <div className="border-b border-gray-100 px-3 py-2.5 dark:border-gray-700">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                        {user.email}
                                    </p>
                                    <p
                                        className={clsx(
                                            "mt-0.5 text-xs font-medium",
                                            user.role === "Manager"
                                                ? "text-violet-600 dark:text-violet-400"
                                                : "text-emerald-600 dark:text-emerald-400"
                                        )}
                                    >
                                        {user.role}
                                    </p>
                                </div>

                                <div className="py-1">
                                    <Link
                                        href="/dashboard"
                                        onClick={() => setDropdownOpen(false)}
                                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700/50"
                                    >
                                        <User className="h-4 w-4" />
                                        {t("profile")}
                                    </Link>
                                </div>

                                <div className="border-t border-gray-100 pt-1 dark:border-gray-700">
                                    <button
                                        id="logout-button"
                                        type="button"
                                        onClick={() => {
                                            setDropdownOpen(false);
                                            logout();
                                        }}
                                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                                    >
                                        <LogOut className="h-4 w-4" />
                                        {t("signOut")}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </header>
    );
}
