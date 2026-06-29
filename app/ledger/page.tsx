"use client";

import { useState, useMemo } from "react";
import { useAuth } from "@/src/context/AuthContext";
import { useProducts, type LedgerTransactionType } from "@/src/context/ProductContext";
import Navbar from "@/src/components/layout/Navbar";
import Sidebar from "@/src/components/layout/Sidebar";
import PermissionGuard from "@/src/components/auth/PermissionGuard";
import { Activity, ArrowDownRight, ArrowUpRight, Search, FileText } from "lucide-react";
import clsx from "clsx";

export default function LedgerPage() {
    return (
        <PermissionGuard requiredPermissions={["dashboard:view"]}>
            <LedgerContent />
        </PermissionGuard>
    );
}

function LedgerContent() {
    const { isAuthenticated } = useAuth();
    const { ledger } = useProducts();
    const [search, setSearch] = useState("");
    const [typeFilter, setTypeFilter] = useState<LedgerTransactionType | "ALL">("ALL");

    const filteredLedger = useMemo(() => {
        return ledger.filter(entry => {
            const matchesSearch = 
                entry.productName.toLowerCase().includes(search.toLowerCase()) ||
                (entry.reference && entry.reference.toLowerCase().includes(search.toLowerCase())) ||
                (entry.notes && entry.notes.toLowerCase().includes(search.toLowerCase()));
            const matchesType = typeFilter === "ALL" || entry.type === typeFilter;
            
            return matchesSearch && matchesType;
        }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }, [ledger, search, typeFilter]);

    if (!isAuthenticated) return null;

    function formatType(type: LedgerTransactionType) {
        switch (type) {
            case "STOCK_IN": return "Stock In";
            case "STOCK_OUT": return "Stock Out";
            case "INITIAL": return "Initial Stock";
            case "ADJUSTMENT": return "Adjustment";
            default: return type;
        }
    }

    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
            <Sidebar />

            <div className="flex flex-1 flex-col">
                <Navbar />

                <main className="flex-1 p-6 lg:p-8">
                    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-900/20">
                                <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                                    Stock Ledger
                                </h1>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Track all inventory movements over time
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                        <div className="relative w-full sm:max-w-xs">
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by product, ref, notes..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className={clsx(
                                    "w-full rounded-xl border py-2 pl-9 pr-4 text-sm outline-none transition-all",
                                    "bg-white dark:bg-gray-800/50",
                                    "text-gray-900 dark:text-gray-100",
                                    "border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200",
                                    "dark:border-gray-700 dark:focus:border-indigo-500 dark:focus:ring-indigo-900/40"
                                )}
                            />
                        </div>
                        
                        <div className="flex gap-2">
                            {(["ALL", "STOCK_IN", "STOCK_OUT", "INITIAL"] as const).map(type => (
                                <button
                                    key={type}
                                    onClick={() => setTypeFilter(type)}
                                    className={clsx(
                                        "rounded-xl border px-4 py-2 text-sm font-medium transition-colors",
                                        typeFilter === type
                                            ? "border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-900/30 dark:text-blue-300"
                                            : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
                                    )}
                                >
                                    {type === "ALL" ? "All" : formatType(type)}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900/60">
                                        <th className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">Date & Time</th>
                                        <th className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">Product</th>
                                        <th className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">Type</th>
                                        <th className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">Quantity</th>
                                        <th className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">Balance</th>
                                        <th className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">User</th>
                                        <th className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">Details</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 bg-white dark:divide-gray-800 dark:bg-gray-900">
                                    {filteredLedger.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                                                No ledger entries found.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredLedger.map((entry) => (
                                            <tr key={entry.id} className="transition-colors hover:bg-gray-50/60 dark:hover:bg-gray-800/40">
                                                <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                                                    {new Date(entry.timestamp).toLocaleString()}
                                                </td>
                                                <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">
                                                    {entry.productName}
                                                    <div className="text-xs font-mono text-gray-400">{entry.productId}</div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={clsx(
                                                        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
                                                        entry.type === "STOCK_IN" || entry.type === "INITIAL" 
                                                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                                            : entry.type === "STOCK_OUT"
                                                            ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                                                            : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                                                    )}>
                                                        {entry.type === "STOCK_IN" || entry.type === "INITIAL" ? (
                                                            <ArrowDownRight className="h-3 w-3" />
                                                        ) : entry.type === "STOCK_OUT" ? (
                                                            <ArrowUpRight className="h-3 w-3" />
                                                        ) : <Activity className="h-3 w-3" />}
                                                        {formatType(entry.type)}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                                                    {entry.type === "STOCK_OUT" ? "-" : "+"}{entry.quantity}
                                                </td>
                                                <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                                                    <div className="flex items-center gap-1 text-xs">
                                                        <span className="opacity-50">{entry.previousStock}</span>
                                                        <span>→</span>
                                                        <span className="font-semibold opacity-100">{entry.newStock}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                                                    {entry.userEmail}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {entry.reference && (
                                                        <div className="flex items-center gap-1 text-xs font-medium text-gray-600 dark:text-gray-300">
                                                            <FileText className="h-3 w-3" />
                                                            {entry.reference}
                                                        </div>
                                                    )}
                                                    {entry.notes && (
                                                        <div className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                                                            {entry.notes}
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
