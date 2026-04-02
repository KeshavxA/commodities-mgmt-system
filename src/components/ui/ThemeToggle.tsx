"use client";

import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/src/context/ThemeContext";
import clsx from "clsx";


export default function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <div className="h-9 w-[4.25rem]" />;
    }

    const isDark = theme === "dark";

    return (
        <button
            id="theme-toggle"
            type="button"
            aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
            onClick={toggleTheme}
            className={clsx(
                "relative inline-flex h-9 w-[4.25rem] items-center rounded-full",
                "border border-neutral-300 dark:border-neutral-600",
                "bg-gradient-to-r transition-all duration-500 ease-in-out",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
                isDark
                    ? "from-indigo-600 to-violet-700 focus-visible:ring-violet-500"
                    : "from-amber-300 to-orange-400 focus-visible:ring-amber-400",
                "cursor-pointer shadow-md hover:shadow-lg"
            )}
        >

            <span
                className={clsx(
                    "absolute left-1 flex h-7 w-7 items-center justify-center rounded-full",
                    "bg-white shadow-sm transition-transform duration-500 ease-[cubic-bezier(.68,-.55,.27,1.55)]",
                    isDark && "translate-x-[1.75rem]"
                )}
            >
                {isDark ? (
                    <Moon className="h-4 w-4 text-violet-600 transition-transform duration-300 rotate-0" />
                ) : (
                    <Sun className="h-4 w-4 text-amber-500 transition-transform duration-300 rotate-0" />
                )}
            </span>

            <span className="pointer-events-none absolute inset-0 flex items-center justify-between px-2.5">
                <Sun
                    className={clsx(
                        "h-3.5 w-3.5 transition-opacity duration-500",
                        isDark ? "opacity-30 text-amber-300" : "opacity-0"
                    )}
                />
                <Moon
                    className={clsx(
                        "h-3.5 w-3.5 transition-opacity duration-500",
                        isDark ? "opacity-0" : "opacity-30 text-violet-300"
                    )}
                />
            </span>
        </button>
    );
}
