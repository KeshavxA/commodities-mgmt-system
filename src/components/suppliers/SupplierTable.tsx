"use client";

import { useMemo, useState } from "react";
import {
    Search,
    Plus,
    Pencil,
    Trash2,
    Eye,
    Star,
} from "lucide-react";
import clsx from "clsx";
import { useAuth } from "@/src/context/AuthContext";
import { type Supplier } from "@/src/data/sampleSuppliers";
import { exportSuppliersToCSV } from "@/src/utils/exportUtils";
import { ArrowUp, Download } from "lucide-react";

interface SupplierTableProps {
    suppliers: Supplier[];
    onAddSupplier: () => void;
    onEditSupplier: (supplier: Supplier) => void;
    onDeleteSupplier: (id: string) => void;
    onViewSupplier: (supplier: Supplier) => void;
    onImportSuppliers?: (suppliers: Supplier[]) => void;
}

export default function SupplierTable({
    suppliers,
    onAddSupplier,
    onEditSupplier,
    onDeleteSupplier,
    onViewSupplier,
    onImportSuppliers,
}: SupplierTableProps) {
    const { user } = useAuth();
    const isManager = user?.role === "Manager";

    const [search, setSearch] = useState("");
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const filtered = useMemo(() => {
        if (!search.trim()) return suppliers;
        const q = search.toLowerCase();
        return suppliers.filter(
            (s) =>
                s.name.toLowerCase().includes(q) ||
                s.contactPerson.toLowerCase().includes(q) ||
                s.email.toLowerCase().includes(q)
        );
    }, [suppliers, search]);

    async function handleImportClick(e: React.ChangeEvent<HTMLInputElement>) {
        if (!e.target.files || e.target.files.length === 0 || !onImportSuppliers) return;
        const file = e.target.files[0];
        try {
            const { importSuppliersFromCSV } = await import("@/src/utils/importUtils");
            const parsed = await importSuppliersFromCSV(file);
            onImportSuppliers(parsed);
        } catch (err) {
            alert("Failed to parse CSV file. Please make sure it is valid.");
        }
        e.target.value = "";
    }

    return (
        <div>
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative w-full sm:max-w-xs">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search suppliers…"
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

                {isManager && (
                    <div className="flex items-center gap-3">
                        <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition-all hover:bg-gray-50 active:scale-[0.98] dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700">
                            <input type="file" accept=".csv" className="hidden" onChange={handleImportClick} />
                            <ArrowUp className="h-4 w-4" />
                            <span className="hidden sm:inline">Import CSV</span>
                        </label>
                        <button
                            type="button"
                            onClick={() => exportSuppliersToCSV(filtered)}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition-all hover:bg-gray-50 active:scale-[0.98] dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                        >
                            <Download className="h-4 w-4" />
                            <span className="hidden sm:inline">Export CSV</span>
                        </button>
                        <button
                            type="button"
                            onClick={onAddSupplier}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-indigo-500/25 transition-all hover:shadow-lg hover:shadow-indigo-500/30 active:scale-[0.98]"
                        >
                            <Plus className="h-4 w-4" />
                            <span className="hidden sm:inline">Add Supplier</span>
                            <span className="sm:hidden">Add</span>
                        </button>
                    </div>
                )}
            </div>

            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[700px] text-left text-sm">
                        <thead>
                            <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900/60">
                                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Name</th>
                                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Contact Person</th>
                                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Email</th>
                                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Status</th>
                                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Rating</th>
                                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-12 text-center text-gray-400 dark:text-gray-500">
                                        No suppliers match your search.
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((s) => {
                                    const isDeleting = deletingId === s.id;
                                    return (
                                        <tr key={s.id} className={clsx(
                                            "transition-colors",
                                            isDeleting ? "bg-red-50/60 dark:bg-red-900/10" : "hover:bg-gray-50/60 dark:hover:bg-gray-800/40"
                                        )}>
                                            <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">{s.name}</td>
                                            <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{s.contactPerson}</td>
                                            <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{s.email}</td>
                                            <td className="px-4 py-3">
                                                <span className={clsx(
                                                    "inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                                                    s.status === "Active" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                                                )}>
                                                    {s.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-0.5 text-amber-400">
                                                    {Array.from({ length: 5 }).map((_, i) => (
                                                        <Star key={i} className={clsx("h-3.5 w-3.5", i < s.rating ? "fill-current" : "text-gray-300 dark:text-gray-700")} />
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                {isDeleting ? (
                                                    <div className="flex items-center gap-1.5">
                                                        <button
                                                            onClick={() => {
                                                                onDeleteSupplier(s.id);
                                                                setDeletingId(null);
                                                            }}
                                                            className="rounded-lg bg-red-500 px-2.5 py-1 text-xs font-medium text-white transition-colors hover:bg-red-600"
                                                        >
                                                            Confirm
                                                        </button>
                                                        <button
                                                            onClick={() => setDeletingId(null)}
                                                            className="rounded-lg px-2.5 py-1 text-xs font-medium text-gray-500 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-1">
                                                        <button
                                                            type="button"
                                                            onClick={() => onViewSupplier(s)}
                                                            className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-900/20 dark:hover:text-indigo-400"
                                                            title="View Details"
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </button>

                                                        {isManager && (
                                                            <>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => onEditSupplier(s)}
                                                                    className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-900/20 dark:hover:text-indigo-400"
                                                                    title="Edit Supplier"
                                                                >
                                                                    <Pencil className="h-4 w-4" />
                                                                </button>

                                                                <button
                                                                    type="button"
                                                                    onClick={() => setDeletingId(s.id)}
                                                                    className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                                                                    title="Delete Supplier"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                )}
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
