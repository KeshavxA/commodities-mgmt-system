import { X, Building2, Package, TrendingUp } from "lucide-react";
import { type Supplier } from "@/src/data/sampleSuppliers";
import { type Product } from "@/src/data/sampleProducts";

interface SupplierDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    supplier: Supplier | null;
    products: Product[];
}

export default function SupplierDetailsModal({
    isOpen,
    onClose,
    supplier,
    products,
}: SupplierDetailsModalProps) {
    if (!isOpen || !supplier) return null;

    // Filter commodities associated with this supplier
    const suppliedCommodities = products.filter((p) => p.supplier === supplier.name);
    const totalInventoryValue = suppliedCommodities.reduce((sum, p) => sum + p.price * p.stock, 0);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity dark:bg-black/60"
                onClick={onClose}
            />

            <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-gray-200/50 transition-all dark:bg-gray-900 dark:ring-gray-800">
                <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 dark:border-gray-800">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-900/20">
                            <Building2 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                {supplier.name}
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Supplier Details & Purchase History
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-xl p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-500 dark:hover:bg-gray-800 dark:hover:text-gray-300"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="p-6">
                    <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
                        <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-800/50">
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Contact</p>
                            <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-gray-100">{supplier.contactPerson}</p>
                        </div>
                        <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-800/50">
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Email</p>
                            <p className="mt-1 truncate text-sm font-semibold text-gray-900 dark:text-gray-100" title={supplier.email}>{supplier.email}</p>
                        </div>
                        <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-800/50">
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Phone</p>
                            <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-gray-100">{supplier.phone}</p>
                        </div>
                        <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-800/50">
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Status</p>
                            <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-gray-100">{supplier.status}</p>
                        </div>
                    </div>

                    <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            <Package className="h-5 w-5 text-gray-400" />
                            Supplied Commodities
                        </h3>
                        <div className="flex items-center gap-2 rounded-xl bg-indigo-50 px-3 py-1.5 dark:bg-indigo-900/20">
                            <TrendingUp className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                            <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                                Total Value: ${totalInventoryValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </span>
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900 max-h-[300px] overflow-y-auto">
                        {suppliedCommodities.length === 0 ? (
                            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                                No commodities currently provided by this supplier.
                            </div>
                        ) : (
                            <table className="w-full text-left text-sm">
                                <thead className="sticky top-0 bg-gray-50 dark:bg-gray-800">
                                    <tr>
                                        <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">ID</th>
                                        <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Name</th>
                                        <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Category</th>
                                        <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Stock</th>
                                        <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Price</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {suppliedCommodities.map((p) => (
                                        <tr key={p.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                                            <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">{p.id}</td>
                                            <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{p.name}</td>
                                            <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{p.category}</td>
                                            <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                                                {p.stock.toLocaleString()} {p.unit}
                                            </td>
                                            <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                                                ${p.price.toFixed(2)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
