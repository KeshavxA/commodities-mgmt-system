import { useState, useEffect } from "react";
import { X, RefreshCcw } from "lucide-react";
import clsx from "clsx";
import type { Product } from "@/src/data/sampleProducts";
import { useAuth } from "@/src/context/AuthContext";
import { useOrders } from "@/src/context/OrderContext";

interface RestockModalProps {
    isOpen: boolean;
    onClose: () => void;
    product: Product | null;
}

export default function RestockModal({ isOpen, onClose, product }: RestockModalProps) {
    const [quantity, setQuantity] = useState("");
    const [error, setError] = useState("");
    const { user } = useAuth();
    const { requestRestock } = useOrders();

    // Reset when product changes
    useEffect(() => {
        setQuantity("");
        setError("");
    }, [product]);

    if (!isOpen || !product) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const q = parseInt(quantity, 10);
        if (isNaN(q) || q <= 0) {
            setError("Quantity must be greater than 0");
            return;
        }

        if (user) {
            requestRestock(product.id, product.name, q, user);
            onClose();
        } else {
            setError("You must be logged in to request a restock.");
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity dark:bg-black/60"
                onClick={onClose}
            />
            
            <div className="relative w-full max-w-md scale-100 transform rounded-3xl bg-white p-6 opacity-100 shadow-2xl transition-all dark:bg-gray-900 dark:shadow-indigo-900/20">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-900/30">
                            <RefreshCcw className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                                Request Restock
                            </h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                {product.name} ({product.category})
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-800/50">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500 dark:text-gray-400">Current Stock</span>
                            <span className="font-medium text-gray-900 dark:text-gray-100">
                                {product.stock.toLocaleString()} {product.unit}
                            </span>
                        </div>
                        <div className="mt-2 flex justify-between text-sm">
                            <span className="text-gray-500 dark:text-gray-400">Min Threshold</span>
                            <span className="font-medium text-gray-900 dark:text-gray-100">
                                {product.minThreshold.toLocaleString()} {product.unit}
                            </span>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="quantity" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Order Quantity
                        </label>
                        <div className="relative">
                            <input
                                id="quantity"
                                type="number"
                                min="1"
                                step="1"
                                value={quantity}
                                onChange={(e) => {
                                    setQuantity(e.target.value);
                                    if (error) setError("");
                                }}
                                className={clsx(
                                    "w-full rounded-xl border px-3 py-2 text-sm outline-none transition-all",
                                    "bg-white dark:bg-gray-800/50",
                                    "text-gray-900 dark:text-gray-100",
                                    error
                                        ? "border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-200 dark:border-red-700"
                                        : "border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 dark:border-gray-700 dark:focus:border-indigo-500 dark:focus:ring-indigo-900/40"
                                )}
                                placeholder={`Enter quantity in ${product.unit}`}
                            />
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                <span className="text-sm text-gray-400">{product.unit}</span>
                            </div>
                        </div>
                        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-xl px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="rounded-xl bg-amber-500 px-5 py-2 text-sm font-semibold text-white shadow-md shadow-amber-500/25 transition-all hover:bg-amber-600 hover:shadow-lg hover:shadow-amber-500/30 active:scale-[0.98]"
                        >
                            Submit Request
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
