"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/context/AuthContext";
import { useProducts, type LedgerTransactionType } from "@/src/context/ProductContext";
import Navbar from "@/src/components/layout/Navbar";
import Sidebar from "@/src/components/layout/Sidebar";
import ProductTable from "@/src/components/products/ProductTable";
import StockAdjustmentModal from "@/src/components/products/StockAdjustmentModal";
import { type Product } from "@/src/data/sampleProducts";
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
    const { products, addProduct, updateProduct, deleteProduct, recordStockMovement } = useProducts();
    const router = useRouter();

    const [adjustingProduct, setAdjustingProduct] = useState<Product | null>(null);

    useEffect(() => {
        if (!isAuthenticated) {
            router.replace("/login");
        }
    }, [isAuthenticated, router]);

    if (!isAuthenticated || !user) return null;

    function handleAdd(product: Product) {
        addProduct(product, user!);
    }

    function handleEdit(updated: Product) {
        updateProduct(updated, user!);
    }

    function handleDelete(id: string) {
        deleteProduct(id, user!);
    }

    function handleAdjustStock(product: Product) {
        setAdjustingProduct(product);
    }

    function handleSaveStockAdjustment(type: LedgerTransactionType, quantity: number, reference: string, notes: string) {
        if (adjustingProduct) {
            recordStockMovement(adjustingProduct.id, type, quantity, user!, reference, notes);
            setAdjustingProduct(null);
        }
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
                        onAdjustStock={handleAdjustStock}
                    />
                    
                    {adjustingProduct && (
                        <StockAdjustmentModal
                            isOpen={true}
                            onClose={() => setAdjustingProduct(null)}
                            onSave={handleSaveStockAdjustment}
                            product={adjustingProduct}
                        />
                    )}
                </main>
            </div>
        </div>
    );
}
