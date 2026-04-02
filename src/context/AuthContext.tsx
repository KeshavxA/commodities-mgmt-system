"use client";

import {
    createContext,
    useContext,
    useEffect,
    useState,
    useCallback,
    type ReactNode,
} from "react";
import { useRouter } from "next/navigation";


export type UserRole = "Manager" | "StoreKeeper";

export interface User {
    email: string;
    role: UserRole;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    login: (email: string, role: UserRole) => void;
    logout: () => void;
}

const MOCK_USERS: Record<string, { password: string; role: UserRole }> = {
    "manager@commodities.com": { password: "manager123", role: "Manager" },
    "storekeeper@commodities.com": {
        password: "keeper123",
        role: "StoreKeeper",
    },
};

export { MOCK_USERS };

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = "commodities-auth-user";

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [mounted, setMounted] = useState(false);
    const router = useRouter();

    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed: User = JSON.parse(stored);
                if (parsed.email && parsed.role) {
                    setUser(parsed);
                }
            }
        } catch {
            localStorage.removeItem(STORAGE_KEY);
        }
        setMounted(true);
    }, []);

    const login = useCallback(
        (email: string, role: UserRole) => {
            const newUser: User = { email, role };
            setUser(newUser);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
            router.push("/dashboard");
        },
        [router]
    );

    const logout = useCallback(() => {
        setUser(null);
        localStorage.removeItem(STORAGE_KEY);
        router.push("/login");
    }, [router]);

    if (!mounted) {
        return null;
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}


export function useAuth(): AuthContextType {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error("useAuth must be used within an <AuthProvider>");
    }
    return ctx;
}
