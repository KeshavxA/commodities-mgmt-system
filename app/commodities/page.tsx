"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/context/AuthContext";
import Navbar from "@/src/components/layout/Navbar";
import Sidebar from "@/src/components/layout/Sidebar";
import ProductTable from "@/src/components/products/ProductTable";
import { Boxes } from "lucide-react";

export default function CommoditiesPage() {
    const { user, isAuthenticated } = useAuth();
    const router = useRouter();

    // Redirect to login if not authenticated
    useEffect(() => {
        if (!isAuthenticated) {
            router.replace("/login");
        }
    }, [isAuthenticated, router]);

    if (!isAuthenticated || !user) return null;

    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
            <Sidebar />

            <div className="flex flex-1 flex-col">
                <Navbar />

                <main className="flex-1 p-6 lg:p-8">
                    {/* Page header */}
                    <div className="mb-6">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-900/20">
                                <Boxes className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                                    Commodities
                                </h1>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Browse and search all commodity products
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Product Table */}
                    <ProductTable />
                </main>
            </div>
        </div>
    );
}
