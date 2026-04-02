"use client";

import { useState, useEffect, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth, MOCK_USERS } from "@/src/context/AuthContext";
import { Package, Mail, Lock, LogIn, Eye, EyeOff } from "lucide-react";
import ThemeToggle from "@/src/components/ui/ThemeToggle";
import clsx from "clsx";

export default function LoginPage() {
    const { login, isAuthenticated } = useAuth();
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isAuthenticated) {
            router.replace("/dashboard");
        }
    }, [isAuthenticated, router]);

    function validate(): boolean {
        const newErrors: typeof errors = {};


        if (!email.trim()) {
            newErrors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            newErrors.email = "Enter a valid email address";
        }


        if (!password.trim()) {
            newErrors.password = "Password is required";
        } else if (password.length < 6) {
            newErrors.password = "Password must be at least 6 characters";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        if (!validate()) return;

        setIsSubmitting(true);
        setErrors({});

        await new Promise((r) => setTimeout(r, 800));

        const mockUser = MOCK_USERS[email.toLowerCase()];

        if (!mockUser || mockUser.password !== password) {
            setErrors({ general: "Invalid email or password. Try the demo credentials below." });
            setIsSubmitting(false);
            return;
        }

        login(email.toLowerCase(), mockUser.role);
        setIsSubmitting(false);
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950 px-4">
            <div className="absolute right-4 top-4 z-10 sm:right-8 sm:top-8">
                <ThemeToggle />
            </div>
            <div className="pointer-events-none fixed inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-indigo-400/20 blur-3xl dark:bg-indigo-600/10" />
                <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-blue-400/20 blur-3xl dark:bg-blue-600/10" />
                <div className="absolute top-1/2 left-1/2 h-60 w-60 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-400/10 blur-3xl dark:bg-violet-600/5" />
            </div>

            <div className="relative w-full max-w-md">
                <div className="rounded-2xl border border-white/60 bg-white/70 p-8 shadow-2xl shadow-indigo-500/10 backdrop-blur-xl dark:border-white/10 dark:bg-gray-900/70 dark:shadow-indigo-500/5">

                    <div className="mb-8 text-center">
                        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/30">
                            <Package className="h-7 w-7 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                            Welcome back
                        </h1>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Sign in to the Commodities Management System
                        </p>
                    </div>

                    {errors.general && (
                        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800/50 dark:bg-red-900/20 dark:text-red-400">
                            {errors.general}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                        <div>
                            <label
                                htmlFor="login-email"
                                className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300"
                            >
                                Email
                            </label>
                            <div className="relative">
                                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                                <input
                                    id="login-email"
                                    type="email"
                                    autoComplete="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                                    }}
                                    className={clsx(
                                        "w-full rounded-xl border py-2.5 pl-10 pr-4 text-sm outline-none transition-all",
                                        "bg-white dark:bg-gray-800/50",
                                        "text-gray-900 dark:text-gray-100",
                                        "placeholder:text-gray-400 dark:placeholder:text-gray-500",
                                        errors.email
                                            ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200 dark:border-red-600 dark:focus:ring-red-900/40"
                                            : "border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 dark:border-gray-700 dark:focus:border-indigo-500 dark:focus:ring-indigo-900/40"
                                    )}
                                />
                            </div>
                            {errors.email && (
                                <p className="mt-1.5 text-xs text-red-500 dark:text-red-400">{errors.email}</p>
                            )}
                        </div>

                        <div>
                            <label
                                htmlFor="login-password"
                                className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300"
                            >
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                                <input
                                    id="login-password"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="current-password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                        if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                                    }}
                                    className={clsx(
                                        "w-full rounded-xl border py-2.5 pl-10 pr-11 text-sm outline-none transition-all",
                                        "bg-white dark:bg-gray-800/50",
                                        "text-gray-900 dark:text-gray-100",
                                        "placeholder:text-gray-400 dark:placeholder:text-gray-500",
                                        errors.password
                                            ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200 dark:border-red-600 dark:focus:ring-red-900/40"
                                            : "border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 dark:border-gray-700 dark:focus:border-indigo-500 dark:focus:ring-indigo-900/40"
                                    )}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="mt-1.5 text-xs text-red-500 dark:text-red-400">{errors.password}</p>
                            )}
                        </div>

                        <button
                            id="login-submit"
                            type="submit"
                            disabled={isSubmitting}
                            className={clsx(
                                "group flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white transition-all",
                                "bg-gradient-to-r from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/25",
                                "hover:from-indigo-600 hover:to-violet-700 hover:shadow-xl hover:shadow-indigo-500/30",
                                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900",
                                "disabled:cursor-not-allowed disabled:opacity-60"
                            )}
                        >
                            {isSubmitting ? (
                                <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                            ) : (
                                <>
                                    <LogIn className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                                    Sign In
                                </>
                            )}
                        </button>
                    </form>

                    <div className="my-6 flex items-center gap-3">
                        <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
                        <span className="text-xs font-medium text-gray-400 dark:text-gray-500">
                            DEMO CREDENTIALS
                        </span>
                        <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
                    </div>
                    <div className="space-y-2.5">
                        <DemoCredential
                            role="Manager"
                            email="manager@commodities.com"
                            password="manager123"
                            onUse={() => {
                                setEmail("manager@commodities.com");
                                setPassword("manager123");
                                setErrors({});
                            }}
                        />
                        <DemoCredential
                            role="StoreKeeper"
                            email="storekeeper@commodities.com"
                            password="keeper123"
                            onUse={() => {
                                setEmail("storekeeper@commodities.com");
                                setPassword("keeper123");
                                setErrors({});
                            }}
                        />
                    </div>
                </div>

                <p className="mt-6 text-center text-xs text-gray-400 dark:text-gray-500">
                    Commodities Management System &copy; {new Date().getFullYear()}
                </p>
            </div>
        </div>
    );
}


function DemoCredential({
    role,
    email,
    password,
    onUse,
}: {
    role: string;
    email: string;
    password: string;
    onUse: () => void;
}) {
    return (
        <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50/50 px-4 py-2.5 dark:border-gray-800 dark:bg-gray-800/30">
            <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    {role}
                </p>
                <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                    {email} / {password}
                </p>
            </div>
            <button
                type="button"
                onClick={onUse}
                className="ml-3 rounded-lg bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-600 transition-colors hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400 dark:hover:bg-indigo-900/50"
            >
                Use
            </button>
        </div>
    );
}
