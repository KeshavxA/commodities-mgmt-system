"use client";

import RoleGuard from "@/src/components/auth/RoleGuard";
import { useAuth } from "@/src/context/AuthContext";
import Navbar from "@/src/components/layout/Navbar";
import Sidebar from "@/src/components/layout/Sidebar";
import ProductTable from "@/src/components/products/ProductTable";
import {
    sampleProducts,
    getTotalProducts,
    getLowStockProducts,
    getTotalValue,
    getCategories,
} from "@/src/data/sampleProducts";
import {
    Package,
    TrendingUp,
    AlertTriangle,
    Layers,
    BarChart3,
} from "lucide-react";
import clsx from "clsx";

export default function DashboardPage() {
    return (
        <RoleGuard allowedRoles={["Manager"]}>
            <DashboardContent />
        </RoleGuard>
    );
}

function DashboardContent() {
    const { user } = useAuth();
    const totalProducts = getTotalProducts();
    const lowStockItems = getLowStockProducts();
    const totalValue = getTotalValue();
    const totalCategories = getCategories().length;

    function formatCurrency(n: number): string {
        if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
        if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
        return `$${n.toFixed(2)}`;
    }

    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
            <Sidebar />

            <div className="flex flex-1 flex-col">
                <Navbar />

                <main className="flex-1 p-6 lg:p-8">
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                            Dashboard
                        </h1>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Welcome back,{" "}
                            <span className="font-medium text-gray-700 dark:text-gray-300">
                                {user?.email}
                            </span>{" "}
                            &middot;{" "}
                            <span className="inline-flex items-center rounded-full bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-700 dark:bg-violet-900/30 dark:text-violet-400">
                                {user?.role}
                            </span>
                        </p>
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                        <StatCard
                            icon={<Package className="h-5 w-5" />}
                            label="Total Products"
                            value={totalProducts.toLocaleString()}
                            subtitle={`across ${totalCategories} categories`}
                            color="indigo"
                        />
                        <StatCard
                            icon={<AlertTriangle className="h-5 w-5" />}
                            label="Low Stock"
                            value={lowStockItems.length.toLocaleString()}
                            subtitle="items below threshold"
                            color="red"
                        />
                        <StatCard
                            icon={<TrendingUp className="h-5 w-5" />}
                            label="Total Value"
                            value={formatCurrency(totalValue)}
                            subtitle="portfolio valuation"
                            color="emerald"
                        />
                        <StatCard
                            icon={<Layers className="h-5 w-5" />}
                            label="Categories"
                            value={totalCategories.toLocaleString()}
                            subtitle="commodity groups"
                            color="amber"
                        />
                    </div>

                    {lowStockItems.length > 0 && (
                        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50/50 p-4 dark:border-red-900/50 dark:bg-red-900/10">
                            <div className="flex items-start gap-3">
                                <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500 dark:text-red-400" />
                                <div>
                                    <h3 className="text-sm font-semibold text-red-800 dark:text-red-300">
                                        Low Stock Alert
                                    </h3>
                                    <p className="mt-0.5 text-sm text-red-600 dark:text-red-400">
                                        {lowStockItems.map((p) => p.name).join(", ")} —{" "}
                                        {lowStockItems.length} item
                                        {lowStockItems.length > 1 ? "s" : ""} below the threshold of
                                        50 units.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="mt-8">
                        <div className="mb-4 flex items-center gap-2">
                            <BarChart3 className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Top Commodities by Value
                            </h2>
                        </div>
                        <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead>
                                        <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900/60">
                                            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                                Rank
                                            </th>
                                            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                                Commodity
                                            </th>
                                            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                                Price
                                            </th>
                                            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                                Stock
                                            </th>
                                            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                                Total Value
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 bg-white dark:divide-gray-800 dark:bg-gray-900">
                                        {[...sampleProducts]
                                            .sort((a, b) => b.price * b.stock - a.price * a.stock)
                                            .slice(0, 5)
                                            .map((p, i) => (
                                                <tr
                                                    key={p.id}
                                                    className="transition-colors hover:bg-gray-50/60 dark:hover:bg-gray-800/40"
                                                >
                                                    <td className="px-4 py-3">
                                                        <span
                                                            className={clsx(
                                                                "inline-flex h-6 w-6 items-center justify-center rounded-lg text-xs font-bold",
                                                                i === 0
                                                                    ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                                                                    : i === 1
                                                                        ? "bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                                                                        : i === 2
                                                                            ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                                                                            : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                                                            )}
                                                        >
                                                            {i + 1}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">
                                                        {p.name}
                                                    </td>
                                                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                                                        ${p.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                    </td>
                                                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                                                        {p.stock.toLocaleString()} {p.unit}
                                                    </td>
                                                    <td className="px-4 py-3 font-semibold text-gray-900 dark:text-gray-100">
                                                        {formatCurrency(p.price * p.stock)}
                                                    </td>
                                                </tr>
                                            ))}
                                           </tbody>
                                  </table>
                                 </div>
                             </div>
                           </div>
                </main>
            </div>
        </div>
    );
}

type CardColor = "indigo" | "emerald" | "amber" | "red";

const colorMap: Record<CardColor, { bg: string; icon: string }> = {
    indigo: {
        bg: "bg-indigo-50 dark:bg-indigo-900/20",
        icon: "text-indigo-600 dark:text-indigo-400",
    },
    emerald: {
        bg: "bg-emerald-50 dark:bg-emerald-900/20",
        icon: "text-emerald-600 dark:text-emerald-400",
    },
    amber: {
        bg: "bg-amber-50 dark:bg-amber-900/20",
        icon: "text-amber-600 dark:text-amber-400",
    },
    red: {
        bg: "bg-red-50 dark:bg-red-900/20",
        icon: "text-red-600 dark:text-red-400",
    },
};

function StatCard({
    icon,
    label,
    value,
    subtitle,
    color,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
    subtitle: string;
    color: CardColor;
}) {
    const c = colorMap[color];
    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center gap-3">
                <div
                    className={clsx(
                        "flex h-10 w-10 items-center justify-center rounded-xl",
                        c.bg
                    )}
                >
                    <span className={c.icon}>{icon}</span>
                </div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {label}
                </p>
            </div>
            <p className="mt-3 text-3xl font-bold text-gray-900 dark:text-white">
                {value}
            </p>
            <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">
                {subtitle}
            </p>
        </div>
    );
}
