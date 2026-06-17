"use client";

import { useState, useEffect, type FormEvent } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import clsx from "clsx";
import { getCategories, type Product, type Batch } from "@/src/data/sampleProducts";
import { useLanguage } from "@/src/context/LanguageContext";

interface ProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (product: Product) => void;
    product?: Product | null;
}

const categories = getCategories();

export default function ProductModal({
    isOpen,
    onClose,
    onSave,
    product,
}: ProductModalProps) {
    const isEdit = !!product;
    const { translateCategory } = useLanguage();

    const [form, setForm] = useState({
        name: "",
        category: categories[0],
        price: "",
        stock: "",
        minThreshold: "50",
        unit: "",
        supplier: "",
        warehouse: "",
        aisle: "",
        bin: "",
        batches: [] as Batch[],
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (form.batches.length > 0) {
            const totalStock = form.batches.reduce((sum, b) => sum + (Number(b.quantity) || 0), 0);
            setForm((prev) => ({ ...prev, stock: String(totalStock) }));
        }
    }, [form.batches]);

    useEffect(() => {
        if (product) {
            setForm({
                name: product.name,
                category: product.category,
                price: String(product.price),
                stock: String(product.stock),
                minThreshold: String(product.minThreshold),
                unit: product.unit,
                supplier: product.supplier,
                warehouse: product.location?.warehouse || "",
                aisle: product.location?.aisle || "",
                bin: product.location?.bin || "",
                batches: product.batches ? [...product.batches] : [],
            });
        } else {
            setForm({
                name: "",
                category: categories[0],
                price: "",
                stock: "",
                minThreshold: "50",
                unit: "",
                supplier: "",
                warehouse: "",
                aisle: "",
                bin: "",
                batches: [],
            });
        }
        setErrors({});
    }, [product, isOpen]);

    function validate(): boolean {
        const errs: Record<string, string> = {};
        if (!form.name.trim()) errs.name = "Product name is required";
        if (!form.category) errs.category = "Category is required";
        if (!form.price || isNaN(Number(form.price)) || Number(form.price) <= 0)
            errs.price = "Enter a valid price";
        if (
            !form.stock ||
            isNaN(Number(form.stock)) ||
            Number(form.stock) < 0 ||
            !Number.isInteger(Number(form.stock))
        )
            errs.stock = "Enter a valid whole number";
        if (
            !form.minThreshold ||
            isNaN(Number(form.minThreshold)) ||
            Number(form.minThreshold) < 0 ||
            !Number.isInteger(Number(form.minThreshold))
        )
            errs.minThreshold = "Enter a valid threshold";
        if (!form.unit.trim()) errs.unit = "Unit is required";
        if (!form.supplier.trim()) errs.supplier = "Supplier is required";
        
        form.batches.forEach((b, i) => {
            if (!b.batchNumber.trim()) errs[`batch_${i}_num`] = "Required";
            if (!b.expiryDate) errs[`batch_${i}_exp`] = "Required";
            if (Number(b.quantity) <= 0) errs[`batch_${i}_qty`] = "Invalid";
        });

        setErrors(errs);
        return Object.keys(errs).length === 0;
    }

    function handleSubmit(e: FormEvent) {
        e.preventDefault();
        if (!validate()) return;

        const today = new Date().toISOString().slice(0, 10);

        const saved: Product = {
            id: product?.id ?? `COM-${String(Date.now()).slice(-3).padStart(3, "0")}`,
            name: form.name.trim(),
            category: form.category,
            price: parseFloat(Number(form.price).toFixed(2)),
            stock: parseInt(form.stock, 10),
            minThreshold: parseInt(form.minThreshold, 10),
            unit: form.unit.trim(),
            supplier: form.supplier.trim(),
            location:
                form.warehouse.trim() || form.aisle.trim() || form.bin.trim()
                    ? {
                          warehouse: form.warehouse.trim(),
                          aisle: form.aisle.trim(),
                          bin: form.bin.trim(),
                      }
                    : undefined,
            batches: form.batches.length > 0 ? form.batches : undefined,
            lastUpdated: today,
        };

        onSave(saved);
        onClose();
    }

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={onClose}
            />

            <div className="relative mx-4 w-full max-w-lg animate-in fade-in zoom-in-95 rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-gray-700 dark:bg-gray-900">
                <div className="mb-5 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                        {isEdit ? "Edit Product" : "Add New Product"}
                    </h2>
                    <button
                        type="button"
                        id="modal-close"
                        onClick={onClose}
                        className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                    <Field
                        id="product-name"
                        label="Product Name"
                        value={form.name}
                        error={errors.name}
                        onChange={(v) => setForm((f) => ({ ...f, name: v }))}
                        placeholder="e.g. Gold (24K)"
                    />

                    <div>
                        <label
                            htmlFor="product-category"
                            className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                            Category
                        </label>
                        <select
                            id="product-category"
                            value={form.category}
                            onChange={(e) =>
                                setForm((f) => ({ ...f, category: e.target.value }))
                            }
                            className={clsx(
                                "w-full rounded-xl border px-3 py-2 text-sm outline-none transition-all",
                                "bg-white dark:bg-gray-800/50",
                                "text-gray-900 dark:text-gray-100",
                                "border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200",
                                "dark:border-gray-700 dark:focus:border-indigo-500 dark:focus:ring-indigo-900/40"
                            )}
                        >
                            {categories.map((c) => (
                                <option key={c} value={c}>
                                    {translateCategory(c)}
                                </option>
                            ))}
                        </select>
                        {errors.category && (
                            <p className="mt-1 text-xs text-red-500">{errors.category}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Field
                            id="product-price"
                            label="Price ($)"
                            value={form.price}
                            error={errors.price}
                            onChange={(v) => setForm((f) => ({ ...f, price: v }))}
                            placeholder="82.45"
                            type="number"
                            step="0.01"
                        />
                        <Field
                            id="product-stock"
                            label={form.batches.length > 0 ? "Stock (Auto-computed)" : "Stock"}
                            value={form.stock}
                            error={errors.stock}
                            onChange={(v) => setForm((f) => ({ ...f, stock: v }))}
                            placeholder="12000"
                            type="number"
                            step="1"
                            disabled={form.batches.length > 0}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Field
                            id="product-min-threshold"
                            label="Min Threshold"
                            value={form.minThreshold}
                            error={errors.minThreshold}
                            onChange={(v) => setForm((f) => ({ ...f, minThreshold: v }))}
                            placeholder="50"
                            type="number"
                            step="1"
                        />
                        <Field
                            id="product-unit"
                            label="Unit"
                            value={form.unit}
                            error={errors.unit}
                            onChange={(v) => setForm((f) => ({ ...f, unit: v }))}
                            placeholder="barrels"
                        />
                    </div>
                    <div>
                        <Field
                            id="product-supplier"
                            label="Supplier"
                            value={form.supplier}
                            error={errors.supplier}
                            onChange={(v) => setForm((f) => ({ ...f, supplier: v }))}
                            placeholder="PetroGlobal Inc."
                        />
                    </div>

                    <div className="pt-2">
                        <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">
                            Location (Optional)
                        </h3>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                            <Field
                                id="product-warehouse"
                                label="Warehouse"
                                value={form.warehouse}
                                onChange={(v) => setForm((f) => ({ ...f, warehouse: v }))}
                                placeholder="Main Depot"
                            />
                            <Field
                                id="product-aisle"
                                label="Aisle"
                                value={form.aisle}
                                onChange={(v) => setForm((f) => ({ ...f, aisle: v }))}
                                placeholder="A-4"
                            />
                            <Field
                                id="product-bin"
                                label="Bin"
                                value={form.bin}
                                onChange={(v) => setForm((f) => ({ ...f, bin: v }))}
                                placeholder="B-12"
                            />
                        </div>
                    </div>

                    <div className="pt-2">
                        <div className="mb-3 flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                                Batches & FIFO (Optional)
                            </h3>
                            <button
                                type="button"
                                onClick={() =>
                                    setForm((f) => ({
                                        ...f,
                                        batches: [
                                            ...f.batches,
                                            { batchNumber: "", quantity: 0, expiryDate: "" },
                                        ],
                                    }))
                                }
                                className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                            >
                                <Plus className="h-3.5 w-3.5" />
                                Add Batch
                            </button>
                        </div>
                        
                        {form.batches.length > 0 && (
                            <div className="space-y-3 rounded-xl border border-gray-100 bg-gray-50/50 p-3 dark:border-gray-800 dark:bg-gray-800/30">
                                {form.batches.map((batch, index) => (
                                    <div key={index} className="flex items-start gap-2">
                                        <div className="flex-1 space-y-1">
                                            <input
                                                type="text"
                                                placeholder="Batch #"
                                                value={batch.batchNumber}
                                                onChange={(e) => {
                                                    const newBatches = [...form.batches];
                                                    newBatches[index].batchNumber = e.target.value;
                                                    setForm({ ...form, batches: newBatches });
                                                }}
                                                className={clsx(
                                                    "w-full rounded-lg border px-2.5 py-1.5 text-xs outline-none transition-all dark:bg-gray-900 dark:text-white",
                                                    errors[`batch_${index}_num`] ? "border-red-300 focus:border-red-400" : "border-gray-200 focus:border-indigo-400 dark:border-gray-700"
                                                )}
                                            />
                                            {errors[`batch_${index}_num`] && <p className="text-[10px] text-red-500">{errors[`batch_${index}_num`]}</p>}
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <input
                                                type="number"
                                                placeholder="Qty"
                                                value={batch.quantity || ""}
                                                onChange={(e) => {
                                                    const newBatches = [...form.batches];
                                                    newBatches[index].quantity = parseInt(e.target.value, 10) || 0;
                                                    setForm({ ...form, batches: newBatches });
                                                }}
                                                className={clsx(
                                                    "w-full rounded-lg border px-2.5 py-1.5 text-xs outline-none transition-all dark:bg-gray-900 dark:text-white",
                                                    errors[`batch_${index}_qty`] ? "border-red-300 focus:border-red-400" : "border-gray-200 focus:border-indigo-400 dark:border-gray-700"
                                                )}
                                            />
                                            {errors[`batch_${index}_qty`] && <p className="text-[10px] text-red-500">{errors[`batch_${index}_qty`]}</p>}
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <input
                                                type="date"
                                                value={batch.expiryDate}
                                                onChange={(e) => {
                                                    const newBatches = [...form.batches];
                                                    newBatches[index].expiryDate = e.target.value;
                                                    setForm({ ...form, batches: newBatches });
                                                }}
                                                className={clsx(
                                                    "w-full rounded-lg border px-2.5 py-1.5 text-xs outline-none transition-all dark:bg-gray-900 dark:text-white",
                                                    errors[`batch_${index}_exp`] ? "border-red-300 focus:border-red-400" : "border-gray-200 focus:border-indigo-400 dark:border-gray-700"
                                                )}
                                            />
                                            {errors[`batch_${index}_exp`] && <p className="text-[10px] text-red-500">{errors[`batch_${index}_exp`]}</p>}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const newBatches = form.batches.filter((_, i) => i !== index);
                                                setForm({ ...form, batches: newBatches });
                                            }}
                                            className="mt-1 rounded-md p-1 text-gray-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-2">
                        <button
                            type="button"
                            id="modal-cancel"
                            onClick={onClose}
                            className="rounded-xl px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            id="modal-save"
                            className="rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-5 py-2 text-sm font-semibold text-white shadow-md shadow-indigo-500/25 transition-all hover:shadow-lg hover:shadow-indigo-500/30 active:scale-[0.98]"
                        >
                            {isEdit ? "Save Changes" : "Add Product"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function Field({
    id,
    label,
    value,
    error,
    onChange,
    placeholder,
    type = "text",
    step,
}: {
    id: string;
    label: string;
    value: string;
    error?: string;
    onChange: (v: string) => void;
    placeholder?: string;
    type?: string;
    step?: string;
    disabled?: boolean;
}) {
    return (
        <div>
            <label
                htmlFor={id}
                className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
                {label}
            </label>
            <input
                id={id}
                type={type}
                step={step}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                disabled={disabled}
                className={clsx(
                    "w-full rounded-xl border px-3 py-2 text-sm outline-none transition-all",
                    "bg-white dark:bg-gray-800/50",
                    "text-gray-900 dark:text-gray-100",
                    disabled && "opacity-60 cursor-not-allowed bg-gray-50 dark:bg-gray-800",
                    error
                        ? "border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-200 dark:border-red-700"
                        : "border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 dark:border-gray-700 dark:focus:border-indigo-500 dark:focus:ring-indigo-900/40",
                    "placeholder:text-gray-400 dark:placeholder:text-gray-500"
                )}
            />
            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>
    );
}
