"use client";

import { useState, type FormEvent } from "react";
import { X, ArrowRightLeft } from "lucide-react";
import clsx from "clsx";
import { type Product } from "@/src/data/sampleProducts";
import { type LedgerTransactionType } from "@/src/context/ProductContext";

interface StockAdjustmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (type: LedgerTransactionType, quantity: number, reference: string, notes: string) => void;
    product: Product;
}

export default function StockAdjustmentModal({
    isOpen,
    onClose,
    onSave,
    product,
}: StockAdjustmentModalProps) {
    const [type, setType] = useState<"STOCK_IN" | "STOCK_OUT">("STOCK_IN");
    const [quantity, setQuantity] = useState("");
    const [reference, setReference] = useState("");
    const [notes, setNotes] = useState("");

    const [error, setError] = useState("");

    if (!isOpen) return null;

    function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setError("");

        const parsedQuantity = parseInt(quantity, 10);
        if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
            setError("Quantity must be a positive number.");
            return;
        }

        if (type === "STOCK_OUT" && parsedQuantity > product.stock) {
            setError(`Cannot dispatch more than current stock (${product.stock}).`);
            return;
        }

        onSave(type, parsedQuantity, reference, notes);
        
        // Reset form
        setQuantity("");
        setReference("");
        setNotes("");
        setType("STOCK_IN");
        onClose();
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity dark:bg-gray-950/60"
                onClick={onClose}
            />

            <div className="relative w-full max-w-md scale-100 rounded-2xl bg-white shadow-2xl transition-all dark:bg-gray-900">
                <div className="flex items-center justify-between border-b border-gray-100 p-5 dark:border-gray-800">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-900/20">
                            <ArrowRightLeft className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Adjust Stock
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {product.name}
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    <div className="space-y-4">
                        
                        <div className="flex rounded-xl bg-gray-100 p-1 dark:bg-gray-800">
                            <button
                                type="button"
                                onClick={() => setType("STOCK_IN")}
                                className={clsx(
                                    "flex-1 rounded-lg py-2 text-sm font-medium transition-all",
                                    type === "STOCK_IN"
                                        ? "bg-white text-gray-900 shadow-sm dark:bg-gray-900 dark:text-white"
                                        : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                )}
                            >
                                Stock In (Receive)
                            </button>
                            <button
                                type="button"
                                onClick={() => setType("STOCK_OUT")}
                                className={clsx(
                                    "flex-1 rounded-lg py-2 text-sm font-medium transition-all",
                                    type === "STOCK_OUT"
                                        ? "bg-white text-gray-900 shadow-sm dark:bg-gray-900 dark:text-white"
                                        : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                )}
                            >
                                Stock Out (Dispatch)
                            </button>
                        </div>

                        <div>
                            <div className="flex justify-between">
                                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Current Stock
                                </label>
                                <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                                    {product.stock} {product.unit}
                                </span>
                            </div>
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Quantity to {type === "STOCK_IN" ? "Receive" : "Dispatch"} *
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    min="1"
                                    required
                                    value={quantity}
                                    onChange={(e) => setQuantity(e.target.value)}
                                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:focus:border-indigo-500 dark:focus:ring-indigo-900/40 pr-16"
                                    placeholder="Enter amount"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400 dark:text-gray-500">
                                    {product.unit}
                                </span>
                            </div>
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Reference Number (Optional)
                            </label>
                            <input
                                type="text"
                                value={reference}
                                onChange={(e) => setReference(e.target.value)}
                                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:focus:border-indigo-500 dark:focus:ring-indigo-900/40"
                                placeholder="e.g. PO-12345 or INV-009"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Notes (Optional)
                            </label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                rows={2}
                                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:focus:border-indigo-500 dark:focus:ring-indigo-900/40"
                                placeholder="Add any details about this movement..."
                            />
                        </div>

                        {error && (
                            <p className="text-sm text-red-500 dark:text-red-400">
                                {error}
                            </p>
                        )}
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-xl px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-blue-500/25 transition-all hover:shadow-lg hover:shadow-blue-500/30 active:scale-[0.98]"
                        >
                            Confirm {type === "STOCK_IN" ? "Stock In" : "Stock Out"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
