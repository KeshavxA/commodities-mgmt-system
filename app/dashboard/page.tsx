"use client";

import { useMemo } from "react";
import PermissionGuard from "@/src/components/auth/PermissionGuard";
import { useAuth } from "@/src/context/AuthContext";
import Navbar from "@/src/components/layout/Navbar";
import Sidebar from "@/src/components/layout/Sidebar";

import { useProducts } from "@/src/context/ProductContext";
import { exportProductsToCSV } from "@/src/utils/exportUtils";
import {
    Package,
    TrendingUp,
    AlertTriangle,
    Layers,
    BarChart3,
    PieChart as PieChartIcon,
    TrendingUp as TrendingIcon,
    Download,
    Printer,
} from "lucide-react";
import clsx from "clsx";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    AreaChart,
    Area,
    Legend,
    LineChart,
    Line,
    ReferenceLine
} from "recharts";
import { Activity } from "lucide-react";

export default function DashboardPage() {
    return (
        <PermissionGuard requiredPermissions={["dashboard:view"]}>
            <DashboardContent />
        </PermissionGuard>
    );
}

function DashboardContent() {
    const { user } = useAuth();
    const { products } = useProducts();

    const totalProducts = products.length;
    const lowStockItems = products.filter((p) => p.stock <= p.minThreshold);
    const totalValue = products.reduce((sum, p) => sum + p.price * p.stock, 0);
    const totalCategories = new Set(products.map((p) => p.category)).size;

    function formatCurrency(n: number): string {
        if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
        if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
        return `$${n.toFixed(2)}`;
    }

    const topStockData = useMemo(() => {
        return [...products]
            .sort((a, b) => b.stock - a.stock)
            .slice(0, 5)
            .map((p) => ({
                name: p.name.split(" ")[0],
                stock: p.stock,
            }));
    }, [products]);

    const categoryData = useMemo(() => {
        const map = new Map<string, number>();
        products.forEach((p) => {
            const val = map.get(p.category) || 0;
            map.set(p.category, val + p.price * p.stock);
        });
        return Array.from(map.entries())
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);
    }, [products]);

    const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#f43f5e", "#8b5cf6", "#06b6d4"];

    const trendData = useMemo(() => {

        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
        let base = totalValue * 0.75;
        return months.map((month, i) => {
            if (i === months.length - 1) return { month, value: totalValue };
            const variance = base * (Math.random() * 0.05 + 0.02);
            base += variance;
            return { month, value: Math.floor(base) };
        });
    }, [totalValue]);

    const { forecastData, atRiskProducts } = useMemo(() => {

        const forecastProducts = products
            .filter(p => p.stock > 0)
            .map(p => {

                const dailyConsumption = Math.max(1, Math.floor(p.stock * (Math.random() * 0.04 + 0.01)));
                const daysUntilZero = Math.floor(p.stock / dailyConsumption);
                return { ...p, dailyConsumption, daysUntilZero };
            })
            .sort((a, b) => a.daysUntilZero - b.daysUntilZero)
            .slice(0, 5);

        const days = Array.from({ length: 30 }, (_, i) => `Day ${i + 1}`);

        const data = days.map((dayLabel, dayIndex) => {
            const dataPoint: any = { day: dayLabel };
            forecastProducts.forEach((p, i) => {
                const projectedStock = Math.max(0, p.stock - (p.dailyConsumption * dayIndex));
                dataPoint[`product_${i}`] = projectedStock;
            });
            return dataPoint;
        });

        return { forecastData: data, atRiskProducts: forecastProducts };
    }, [products]);

    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
            <Sidebar />

            <div className="flex flex-1 flex-col">
                <Navbar />

                <main className="flex-1 p-6 lg:p-8">
                    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
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
                        <div className="flex gap-2 print:hidden">
                            <button
                                onClick={() => exportProductsToCSV(products)}
                                className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                            >
                                <Download className="h-4 w-4" />
                                <span className="hidden sm:inline">Export CSV</span>
                            </button>
                            <button
                                onClick={() => window.print()}
                                className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                            >
                                <Printer className="h-4 w-4" />
                                <span className="hidden sm:inline">Print / PDF</span>
                            </button>
                        </div>
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
                                        {lowStockItems.length > 1 ? "s" : ""} below their individual minimum thresholds.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="mt-8 grid gap-6 lg:grid-cols-2">

                        <div className="col-span-1 lg:col-span-2 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                            <div className="mb-4 flex items-center gap-2">
                                <TrendingIcon className="h-5 w-5 text-indigo-500" />
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    6-Month Portfolio Value Trend
                                </h2>
                            </div>
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={trendData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" className="dark:opacity-20" />
                                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 12, fill: '#6b7280' }}
                                            tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`}
                                        />
                                        <Tooltip
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                            formatter={(value: any) => [formatCurrency(Number(value)), "Total Value"]}
                                        />
                                        <Area type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                            <div className="mb-4 flex items-center gap-2">
                                <BarChart3 className="h-5 w-5 text-emerald-500" />
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Top 5 Highest Volume
                                </h2>
                            </div>
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={topStockData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" className="dark:opacity-20" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 12, fill: '#6b7280' }}
                                            tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`}
                                        />
                                        <Tooltip
                                            cursor={{ fill: 'rgba(0,0,0,0.04)' }}
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                            formatter={(value: any) => [Number(value).toLocaleString(), "Stock Level"]}
                                        />
                                        <Bar dataKey="stock" fill="#10b981" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                            <div className="mb-4 flex items-center gap-2">
                                <PieChartIcon className="h-5 w-5 text-amber-500" />
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Value by Category
                                </h2>
                            </div>
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={categoryData}
                                            cx="50%"
                                            cy="45%"
                                            innerRadius={60}
                                            outerRadius={90}
                                            paddingAngle={5}
                                            dataKey="value"
                                            stroke="none"
                                        >
                                            {categoryData.map((entry: any, index: number) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                            formatter={(value: any) => [formatCurrency(Number(value)), "Value"]}
                                        />
                                        <Legend
                                            verticalAlign="bottom"
                                            height={36}
                                            iconType="circle"
                                            wrapperStyle={{ fontSize: '12px', color: '#6b7280' }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="col-span-1 lg:col-span-2 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                            <div className="mb-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                                <div className="flex items-center gap-2">
                                    <Activity className="h-5 w-5 text-rose-500" />
                                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                        30-Day Stock Depletion Forecast
                                    </h2>
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                    Tracking top 5 fastest moving items
                                </div>
                            </div>
                            <div className="h-[350px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={forecastData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" className="dark:opacity-20" />
                                        <XAxis
                                            dataKey="day"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 12, fill: '#6b7280' }}
                                            dy={10}
                                            minTickGap={20}
                                        />
                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 12, fill: '#6b7280' }}
                                        />
                                        <Tooltip
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                            formatter={(value: any, name: any) => {
                                                const productIndex = parseInt(String(name).split('_')[1]);
                                                const productName = atRiskProducts[productIndex]?.name || "Item";
                                                return [value, productName];
                                            }}
                                            labelFormatter={(label) => `Forecast: ${label}`}
                                        />
                                        <Legend
                                            verticalAlign="bottom"
                                            height={36}
                                            iconType="circle"
                                            wrapperStyle={{ fontSize: '12px', color: '#6b7280', paddingTop: '10px' }}
                                            formatter={(value: any) => {
                                                const idx = parseInt(String(value).split('_')[1]);
                                                return atRiskProducts[idx]?.name.split(' ')[0] || value;
                                            }}
                                        />
                                        <ReferenceLine y={0} stroke="#ef4444" strokeDasharray="3 3" label={{ position: 'insideTopLeft', value: 'Zero Stock', fill: '#ef4444', fontSize: 12 }} />

                                        {atRiskProducts.map((p, idx) => (
                                            <Line
                                                key={idx}
                                                type="monotone"
                                                dataKey={`product_${idx}`}
                                                stroke={COLORS[idx % COLORS.length]}
                                                strokeWidth={3}
                                                dot={false}
                                                activeDot={{ r: 6, strokeWidth: 0 }}
                                            />
                                        ))}
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="mt-6 rounded-xl border border-gray-100 bg-gray-50/50 p-4 dark:border-gray-800 dark:bg-gray-800/30">
                                <h3 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                                    Physical Locations of At-Risk Items
                                </h3>
                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                    {atRiskProducts.map((p, i) => (
                                        <div key={i} className="flex items-start gap-2 text-sm">
                                            <div className="mt-0.5 h-2 w-2 flex-shrink-0 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                                            <div>
                                                <div className="font-medium text-gray-900 dark:text-white">{p.name}</div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                                    {p.location ? (
                                                        <span>{p.location.warehouse} &middot; Aisle {p.location.aisle} &middot; Bin {p.location.bin}</span>
                                                    ) : (
                                                        <span className="italic">Location not assigned</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

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
                                        {[...products]
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
