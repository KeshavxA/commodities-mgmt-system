"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/context/AuthContext";
import { useAudit } from "@/src/context/AuditContext";
import Navbar from "@/src/components/layout/Navbar";
import Sidebar from "@/src/components/layout/Sidebar";
import ProductTable from "@/src/components/products/ProductTable";
import { sampleProducts, type Product } from "@/src/data/sampleProducts";
import { Boxes } from "lucide-react";

import PermissionGuard from "@/src/components/auth/PermissionGuard";

export default function CommoditiesPage() {
    return (
        <PermissionGuard requiredPermissions={["products:read"]}>
            <CommoditiesContent />
        </PermissionGuard>
    );
}

function CommoditiesContent() {
    const { user, isAuthenticated } = useAuth();
    const { logAction } = useAudit();
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
        logAction("CREATE", `Created product "${product.name}" (${product.id})`, user!);
    }

    function handleEdit(updated: Product) {
        const oldProduct = products.find(p => p.id === updated.id);
        let details = `Updated product "${updated.name}" (${updated.id})`;
        
        if (oldProduct) {
            if (oldProduct.stock !== updated.stock) {
                details = `Updated stock for ${updated.name} from ${oldProduct.stock} to ${updated.stock}`;
            } else if (oldProduct.price !== updated.price) {
                details = `Updated price for ${updated.name} from $${oldProduct.price} to $${updated.price}`;
            }
        }
        
        setProducts((prev) =>
            prev.map((p) => (p.id === updated.id ? updated : p))
        );
        logAction("UPDATE", details, user!);
    }

    function handleDelete(id: string) {
        const product = products.find((p) => p.id === id);
        if (product) {
            logAction("DELETE", `Deleted product "${product.name}" (${id})`, user!);
        }
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
