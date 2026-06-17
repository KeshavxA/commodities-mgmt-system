"use client";

import PermissionGuard from "@/src/components/auth/PermissionGuard";
import Navbar from "@/src/components/layout/Navbar";
import Sidebar from "@/src/components/layout/Sidebar";
import { useAudit } from "@/src/context/AuditContext";
import { ClipboardCheck, Download } from "lucide-react";
import clsx from "clsx";
import { exportAuditLogsToCSV } from "@/src/utils/exportUtils";

export default function AuditLogsPage() {
    return (
        <PermissionGuard requiredPermissions={["audit:view"]}>
            <AuditLogsContent />
        </PermissionGuard>
    );
}

function AuditLogsContent() {
    const { logs } = useAudit();

    function formatTime(isoString: string) {
        const d = new Date(isoString);
        return d.toLocaleString(undefined, {
            dateStyle: "medium",
            timeStyle: "short",
        });
    }

    function ActionBadge({ action }: { action: string }) {
        switch (action) {
            case "CREATE":
                return <span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase">CREATE</span>;
            case "UPDATE":
                return <span className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase">UPDATE</span>;
            case "DELETE":
                return <span className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase">DELETE</span>;
            default:
                return <span className="bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase">{action}</span>;
        }
    }

    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
            <Sidebar />

            <div className="flex flex-1 flex-col">
                <Navbar />

                <main className="flex-1 p-6 lg:p-8">
                    <div className="mb-6">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-900/20 shadow-sm">
                                    <ClipboardCheck className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                                        Audit Logs
                                    </h1>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Track system activity and user actions
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => exportAuditLogsToCSV(logs)}
                                disabled={logs.length === 0}
                                className="inline-flex w-fit items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition-all hover:bg-gray-50 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                            >
                                <Download className="h-4 w-4" />
                                Export Logs
                            </button>
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900/60">
                                        <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Action</th>
                                        <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Details</th>
                                        <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">User</th>
                                        <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Role</th>
                                        <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Timestamp</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {logs.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-4 py-16 text-center text-gray-400 dark:text-gray-500">
                                                <ClipboardCheck className="mx-auto h-8 w-8 opacity-20 mb-3" />
                                                <p>No audit logs recorded yet.</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        logs.map((log) => (
                                            <tr key={log.id} className="transition-colors hover:bg-gray-50/60 dark:hover:bg-gray-800/40">
                                                <td className="px-4 py-3"><ActionBadge action={log.action} /></td>
                                                <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">{log.details}</td>
                                                <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{log.userEmail}</td>
                                                <td className="px-4 py-3">
                                                    <span className={clsx(
                                                        "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md",
                                                        log.role === "Manager" ? "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400" : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                                                    )}>
                                                        {log.role}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-gray-500 dark:text-gray-400 whitespace-nowrap tabular-nums">{formatTime(log.timestamp)}</td>
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
