import { Check, X, Clock, FileText } from "lucide-react";
import clsx from "clsx";
import { useAuth } from "@/src/context/AuthContext";
import { useOrders, type PurchaseOrder } from "@/src/context/OrderContext";
import { useRBAC } from "@/src/context/RBACContext";
import { formatDistanceToNow } from "@/src/utils/dateUtils";

interface OrderTableProps {
    orders: PurchaseOrder[];
}

export default function OrderTable({ orders }: OrderTableProps) {
    const { user } = useAuth();
    const { updateOrderStatus } = useOrders();
    const { hasPermission } = useRBAC();
    const canApprove = user ? hasPermission(user.role, "orders:approve") : false;

    const visibleOrders = canApprove ? orders : orders.filter((o) => o.requestedBy === user?.email);

    if (visibleOrders.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white py-16 dark:border-gray-800 dark:bg-gray-900/50">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-50 dark:bg-gray-800">
                    <FileText className="h-6 w-6 text-gray-400" />
                </div>
                <h3 className="mt-4 text-sm font-semibold text-gray-900 dark:text-white">
                    No purchase orders found
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {canApprove
                        ? "There are no pending restock requests to review."
                        : "You haven't submitted any restock requests yet."}
                </p>
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="border-b border-gray-200 bg-gray-50/50 dark:border-gray-800 dark:bg-gray-900/60">
                            <th className="px-6 py-4 font-semibold text-gray-900 dark:text-gray-100">Order ID</th>
                            <th className="px-6 py-4 font-semibold text-gray-900 dark:text-gray-100">Commodity</th>
                            <th className="px-6 py-4 font-semibold text-gray-900 dark:text-gray-100">Quantity</th>
                            <th className="px-6 py-4 font-semibold text-gray-900 dark:text-gray-100">Requested By</th>
                            <th className="px-6 py-4 font-semibold text-gray-900 dark:text-gray-100">Date</th>
                            <th className="px-6 py-4 font-semibold text-gray-900 dark:text-gray-100">Status</th>
                            {canApprove && (
                                <th className="px-6 py-4 font-semibold text-gray-900 dark:text-gray-100 text-right">Actions</th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {visibleOrders.map((order) => (
                            <tr key={order.id} className="transition-colors hover:bg-gray-50/60 dark:hover:bg-gray-800/40">
                                <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">
                                    {order.id}
                                </td>
                                <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                                    {order.productName}
                                </td>
                                <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                                    {order.quantity.toLocaleString()}
                                </td>
                                <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                                    {order.requestedBy}
                                </td>
                                <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                                    {formatDistanceToNow(new Date(order.createdAt))} ago
                                </td>
                                <td className="px-6 py-4">
                                    <span
                                        className={clsx(
                                            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
                                            order.status === "APPROVED" && "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
                                            order.status === "PENDING" && "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
                                            order.status === "REJECTED" && "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                        )}
                                    >
                                        {order.status === "PENDING" && <Clock className="h-3.5 w-3.5" />}
                                        {order.status === "APPROVED" && <Check className="h-3.5 w-3.5" />}
                                        {order.status === "REJECTED" && <X className="h-3.5 w-3.5" />}
                                        {order.status}
                                    </span>
                                </td>
                                {canApprove && (
                                    <td className="px-6 py-4 text-right">
                                        {order.status === "PENDING" ? (
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => updateOrderStatus(order.id, "APPROVED", user!)}
                                                    className="rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-600 transition-colors hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:hover:bg-emerald-900/40"
                                                >
                                                    Approve
                                                </button>
                                                <button
                                                    onClick={() => updateOrderStatus(order.id, "REJECTED", user!)}
                                                    className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40"
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                        ) : (
                                            <span className="text-xs text-gray-400 italic">Actioned</span>
                                        )}
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
