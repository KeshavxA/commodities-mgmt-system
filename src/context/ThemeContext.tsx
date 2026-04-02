"use client";

import {
    createContext,
    useContext,
    useEffect,
    useState,
    useCallback,
    type ReactNode,
} from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
    setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = "commodities-theme";

function getInitialTheme(): Theme {
    if (typeof window === "undefined") return "light";

    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
    if (stored === "light" || stored === "dark") return stored;

    if (window.matchMedia("(prefers-color-scheme: dark)").matches) return "dark";

    return "light";
}


function applyThemeToDOM(theme: Theme) {
    const root = document.documentElement;
    if (theme === "dark") {
        root.classList.add("dark");
    } else {
        root.classList.remove("dark");
    }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setThemeState] = useState<Theme>("light");
    const [mounted, setMounted] = useState(false);


    useEffect(() => {
        const initial = getInitialTheme();
        setThemeState(initial);
        applyThemeToDOM(initial);
        setMounted(true);
    }, []);

    const setTheme = useCallback((next: Theme) => {
        setThemeState(next);
        localStorage.setItem(STORAGE_KEY, next);
        applyThemeToDOM(next);
    }, []);

    const toggleTheme = useCallback(() => {
        setThemeState((prev) => {
            const next: Theme = prev === "light" ? "dark" : "light";
            localStorage.setItem(STORAGE_KEY, next);
            applyThemeToDOM(next);
            return next;
        });
    }, []);


    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
            <div className={!mounted ? "invisible" : ""}>
                {children}
            </div>
        </ThemeContext.Provider>
    );
}


export function useTheme(): ThemeContextType {
    const ctx = useContext(ThemeContext);
    if (!ctx) {
        throw new Error("useTheme must be used within a <ThemeProvider>");
    }
    return ctx;
}
