"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/context/AuthContext";
import Navbar from "@/src/components/layout/Navbar";
import Sidebar from "@/src/components/layout/Sidebar";
import ProductTable from "@/src/components/products/ProductTable";
import { sampleProducts, type Product } from "@/src/data/sampleProducts";
import { Boxes } from "lucide-react";

export default function CommoditiesPage() {
    const { user, isAuthenticated } = useAuth();
    const router = useRouter();

    const [products, setProducts] = useState<Product[]>(sampleProducts);

    useEffect(() => {
        if (!isAuthenticated) {
            router.replace("/login");
        }
    }, [isAuthenticated, router]);

    if (!isAuthenticated || !user) return null;

    function handleAdd(product: Product) {
        setProducts((prev) => [...prev, product]);
    }

    function handleEdit(updated: Product) {
        setProducts((prev) =>
            prev.map((p) => (p.id === updated.id ? updated : p))
        );
    }

    function handleDelete(id: string) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
    }

    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
            <Sidebar />

            <div className="flex flex-1 flex-col">
                <Navbar />

                <main className="flex-1 p-6 lg:p-8">
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
                                    Browse, search, and manage commodity products
                                </p>
                            </div>
                        </div>
                    </div>

                    <ProductTable
                        products={products}
                        onAddProduct={handleAdd}
                        onEditProduct={handleEdit}
                        onDeleteProduct={handleDelete}
                    />
                </main>
            </div>
        </div>
    );
}
