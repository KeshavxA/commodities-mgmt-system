"use client";

import { useState, useEffect } from "react";
import Navbar from "@/src/components/layout/Navbar";
import Sidebar from "@/src/components/layout/Sidebar";
import SupplierTable from "@/src/components/suppliers/SupplierTable";
import SupplierModal from "@/src/components/suppliers/SupplierModal";
import SupplierDetailsModal from "@/src/components/suppliers/SupplierDetailsModal";
import { useAudit } from "@/src/context/AuditContext";
import { type Supplier, sampleSuppliers } from "@/src/data/sampleSuppliers";
import { sampleProducts } from "@/src/data/sampleProducts";
import { Building2 } from "lucide-react";
import { useAuth } from "@/src/context/AuthContext";

export default function SuppliersPage() {
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
    const [viewingSupplier, setViewingSupplier] = useState<Supplier | null>(null);

    const { logAction } = useAudit();
    const { user } = useAuth();

    // Load mock data on mount
    useEffect(() => {
        setSuppliers(sampleSuppliers);
    }, []);

    function handleSave(supplier: Supplier) {
        const isEditing = suppliers.some((s) => s.id === supplier.id);

        if (isEditing) {
            setSuppliers((prev) => prev.map((s) => (s.id === supplier.id ? supplier : s)));
            if (user) logAction("UPDATE", `Updated supplier: ${supplier.name} (${supplier.id})`, user);
        } else {
            setSuppliers((prev) => [supplier, ...prev]);
            if (user) logAction("CREATE", `Added new supplier: ${supplier.name} (${supplier.id})`, user);
        }
    }

    function handleDelete(id: string) {
        const toDelete = suppliers.find((s) => s.id === id);
        if (toDelete) {
            setSuppliers((prev) => prev.filter((s) => s.id !== id));
            if (user) logAction("DELETE", `Deleted supplier: ${toDelete.name} (${toDelete.id})`, user);
        }
    }

    return (
        <div className="flex min-h-screen bg-gray-50/50 dark:bg-black">
            <Sidebar />

            <div className="flex flex-1 flex-col transition-all duration-300 lg:pl-[280px]">
                <Navbar />

                <main className="flex-1 p-6 lg:p-8">
                    <div className="mb-6 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 shadow-sm dark:bg-indigo-900/20">
                                <Building2 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                                    Suppliers
                                </h1>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Manage vendors and view purchase history
                                </p>
                            </div>
                        </div>
                    </div>

                    <SupplierTable
                        suppliers={suppliers}
                        onAddSupplier={() => setIsAddModalOpen(true)}
                        onEditSupplier={setEditingSupplier}
                        onDeleteSupplier={handleDelete}
                        onViewSupplier={setViewingSupplier}
                    />
                </main>
            </div>

            <SupplierModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSave={handleSave}
            />

            <SupplierModal
                isOpen={!!editingSupplier}
                onClose={() => setEditingSupplier(null)}
                onSave={handleSave}
                supplier={editingSupplier}
            />

            <SupplierDetailsModal
                isOpen={!!viewingSupplier}
                onClose={() => setViewingSupplier(null)}
                supplier={viewingSupplier}
                products={sampleProducts}
            />
        </div>
    );
}
