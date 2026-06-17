"use client";

import Navbar from "@/src/components/layout/Navbar";
import Sidebar from "@/src/components/layout/Sidebar";
import OrderTable from "@/src/components/orders/OrderTable";
import { useOrders } from "@/src/context/OrderContext";
import { ClipboardList } from "lucide-react";
import PermissionGuard from "@/src/components/auth/PermissionGuard";

export default function OrdersPage() {
    return (
        // Allow both Managers and Store Keepers.
        // Store Keepers see their own requests, Managers see all and can approve.
        <PermissionGuard requiredPermissions={["orders:read"]}>
            <OrdersContent />
        </PermissionGuard>
    );
}

function OrdersContent() {
    const { orders } = useOrders();

    return (
        <div className="flex min-h-screen bg-gray-50/50 dark:bg-black">
            <Sidebar />

            <div className="flex flex-1 flex-col transition-all duration-300 lg:pl-[280px]">
                <Navbar />

                <main className="flex-1 p-6 lg:p-8">
                    <div className="mb-6 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 shadow-sm dark:bg-indigo-900/20">
                                <ClipboardList className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                                    Purchase Orders
                                </h1>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Manage and review commodity restock requests
                                </p>
                            </div>
                        </div>
                    </div>

                    <OrderTable orders={orders} />
                </main>
            </div>
        </div>
    );
}
