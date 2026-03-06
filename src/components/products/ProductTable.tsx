"use client";

import { useState, useMemo } from "react";
import {
    Search,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    AlertTriangle,
    Filter,
} from "lucide-react";
import clsx from "clsx";
import {
    sampleProducts,
    LOW_STOCK_THRESHOLD,
    getCategories,
    type Product,
} from "@/src/data/sampleProducts";

type SortKey = keyof Pick<Product, "name" | "category" | "price" | "stock">;
type SortDir = "asc" | "desc";

export default function ProductTable() {
    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("All");
    const [sortKey, setSortKey] = useState<SortKey>("name");
    const [sortDir, setSortDir] = useState<SortDir>("asc");

    const categories = useMemo(() => ["All", ...getCategories()], []);

    // Filter + sort
    const filtered = useMemo(() => {
        let list = sampleProducts;

        // Search
        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter(
                (p) =>
                    p.name.toLowerCase().includes(q) ||
                    p.id.toLowerCase().includes(q) ||
                    p.category.toLowerCase().includes(q) ||
                    p.supplier.toLowerCase().includes(q)
            );
        }

        // Category
        if (categoryFilter !== "All") {
            list = list.filter((p) => p.category === categoryFilter);
        }

        // Sort
        const sorted = [...list].sort((a, b) => {
            const aVal = a[sortKey];
            const bVal = b[sortKey];
            if (typeof aVal === "number" && typeof bVal === "number") {
                return sortDir === "asc" ? aVal - bVal : bVal - aVal;
            }
            return sortDir === "asc"
                ? String(aVal).localeCompare(String(bVal))
                : String(bVal).localeCompare(String(aVal));
        });

        return sorted;
    }, [search, categoryFilter, sortKey, sortDir]);

    function toggleSort(key: SortKey) {
        if (sortKey === key) {
            setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        } else {
            setSortKey(key);
            setSortDir("asc");
        }
    }

    function SortIcon({ col }: { col: SortKey }) {
        if (sortKey !== col)
            return <ArrowUpDown className="ml-1 inline h-3.5 w-3.5 opacity-40" />;
        return sortDir === "asc" ? (
            <ArrowUp className="ml-1 inline h-3.5 w-3.5" />
        ) : (
            <ArrowDown className="ml-1 inline h-3.5 w-3.5" />
        );
    }

    return (
        <div>
            {/* ─── Toolbar ─────────────────────────────────────────── */}
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                {/* Search */}
                <div className="relative w-full sm:max-w-xs">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                    <input
                        id="product-search"
                        type="text"
                        placeholder="Search products…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className={clsx(
                            "w-full rounded-xl border py-2 pl-9 pr-4 text-sm outline-none transition-all",
                            "bg-white dark:bg-gray-800/50",
                            "text-gray-900 dark:text-gray-100",
                            "border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200",
                            "dark:border-gray-700 dark:focus:border-indigo-500 dark:focus:ring-indigo-900/40",
                            "placeholder:text-gray-400 dark:placeholder:text-gray-500"
                        )}
                    />
                </div>

                {/* Category filter */}
                <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                    <select
                        id="category-filter"
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className={clsx(
                            "rounded-xl border px-3 py-2 text-sm outline-none transition-all",
                            "bg-white dark:bg-gray-800/50",
                            "text-gray-700 dark:text-gray-200",
                            "border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200",
                            "dark:border-gray-700 dark:focus:border-indigo-500 dark:focus:ring-indigo-900/40"
                        )}
                    >
                        {categories.map((c) => (
                            <option key={c} value={c}>
                                {c}
                            </option>
                        ))}
                    </select>
                    <span className="ml-1 text-xs text-gray-400 dark:text-gray-500">
                        {filtered.length} result{filtered.length !== 1 ? "s" : ""}
                    </span>
                </div>
            </div>

            {/* ─── Table ───────────────────────────────────────────── */}
            <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[700px] text-left text-sm">
                        <thead>
                            <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900/60">
                                <Th>ID</Th>
                                <ThSortable col="name" label="Product" toggle={toggleSort}>
                                    <SortIcon col="name" />
                                </ThSortable>
                                <ThSortable col="category" label="Category" toggle={toggleSort}>
                                    <SortIcon col="category" />
                                </ThSortable>
                                <ThSortable col="price" label="Price" toggle={toggleSort}>
                                    <SortIcon col="price" />
                                </ThSortable>
                                <ThSortable col="stock" label="Stock" toggle={toggleSort}>
                                    <SortIcon col="stock" />
                                </ThSortable>
                                <Th>Supplier</Th>
                                <Th>Updated</Th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white dark:divide-gray-800 dark:bg-gray-900">
                            {filtered.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={7}
                                        className="px-4 py-12 text-center text-gray-400 dark:text-gray-500"
                                    >
                                        No products match your search.
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((p) => {
                                    const isLow = p.stock < LOW_STOCK_THRESHOLD;
                                    return (
                                        <tr
                                            key={p.id}
                                            className="transition-colors hover:bg-gray-50/60 dark:hover:bg-gray-800/40"
                                        >
                                            <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-gray-500 dark:text-gray-400">
                                                {p.id}
                                            </td>
                                            <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">
                                                {p.name}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span
                                                    className={clsx(
                                                        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium",
                                                        categoryBadge(p.category)
                                                    )}
                                                >
                                                    {p.category}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                                                ${p.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span
                                                    className={clsx(
                                                        "inline-flex items-center gap-1 font-medium",
                                                        isLow
                                                            ? "text-red-600 dark:text-red-400"
                                                            : "text-gray-700 dark:text-gray-300"
                                                    )}
                                                >
                                                    {isLow && (
                                                        <AlertTriangle className="h-3.5 w-3.5" />
                                                    )}
                                                    {p.stock.toLocaleString()} {p.unit}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                                                {p.supplier}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-3 text-gray-400 dark:text-gray-500">
                                                {p.lastUpdated}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

/* ─── Helpers ──────────────────────────────────────────────── */

function Th({ children }: { children: React.ReactNode }) {
    return (
        <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            {children}
        </th>
    );
}

function ThSortable({
    col,
    label,
    toggle,
    children,
}: {
    col: SortKey;
    label: string;
    toggle: (key: SortKey) => void;
    children: React.ReactNode;
}) {
    return (
        <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            <button
                type="button"
                onClick={() => toggle(col)}
                className="inline-flex items-center gap-0.5 transition-colors hover:text-gray-900 dark:hover:text-gray-200"
            >
                {label}
                {children}
            </button>
        </th>
    );
}

function categoryBadge(category: string): string {
    switch (category) {
        case "Energy":
            return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
        case "Metals":
            return "bg-slate-100 text-slate-700 dark:bg-slate-800/50 dark:text-slate-300";
        case "Agriculture":
            return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
        case "Soft Commodities":
            return "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400";
        case "Industrial":
            return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
        default:
            return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
    }
}
