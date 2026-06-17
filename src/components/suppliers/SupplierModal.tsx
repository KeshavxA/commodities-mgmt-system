import { useState, useEffect } from "react";
import { X, Building2 } from "lucide-react";
import clsx from "clsx";
import { type Supplier } from "@/src/data/sampleSuppliers";

interface SupplierModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (supplier: Supplier) => void;
    supplier?: Supplier | null;
}

export default function SupplierModal({
    isOpen,
    onClose,
    onSave,
    supplier,
}: SupplierModalProps) {
    const isEdit = !!supplier;

    const [name, setName] = useState("");
    const [contactPerson, setContactPerson] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [status, setStatus] = useState<"Active" | "Inactive">("Active");
    const [rating, setRating] = useState(5);

    useEffect(() => {
        if (isOpen) {
            setName(supplier?.name || "");
            setContactPerson(supplier?.contactPerson || "");
            setEmail(supplier?.email || "");
            setPhone(supplier?.phone || "");
            setStatus(supplier?.status || "Active");
            setRating(supplier?.rating || 5);
        }
    }, [isOpen, supplier]);

    if (!isOpen) return null;

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        onSave({
            id: supplier?.id || `SUP-${Date.now()}`,
            name,
            contactPerson,
            email,
            phone,
            status,
            rating,
        });
        onClose();
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity dark:bg-black/60"
                onClick={onClose}
            />

            <div className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-gray-200/50 transition-all dark:bg-gray-900 dark:ring-gray-800">
                <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 dark:border-gray-800">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-900/20">
                            <Building2 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                            {isEdit ? "Edit Supplier" : "Add Supplier"}
                        </h2>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-xl p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-500 dark:hover:bg-gray-800 dark:hover:text-gray-300"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    <div className="space-y-4">
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Company Name
                            </label>
                            <input
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className={clsx(
                                    "w-full rounded-xl border px-3 py-2 text-sm transition-all outline-none",
                                    "bg-white dark:bg-gray-950",
                                    "text-gray-900 dark:text-white",
                                    "border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200",
                                    "dark:border-gray-800 dark:focus:border-indigo-400 dark:focus:ring-indigo-900/40"
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Contact Person
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={contactPerson}
                                    onChange={(e) => setContactPerson(e.target.value)}
                                    className={clsx(
                                        "w-full rounded-xl border px-3 py-2 text-sm transition-all outline-none",
                                        "bg-white dark:bg-gray-950",
                                        "text-gray-900 dark:text-white",
                                        "border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200",
                                        "dark:border-gray-800 dark:focus:border-indigo-400 dark:focus:ring-indigo-900/40"
                                    )}
                                />
                            </div>
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Rating (1-5)
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    max="5"
                                    required
                                    value={rating}
                                    onChange={(e) => setRating(Number(e.target.value))}
                                    className={clsx(
                                        "w-full rounded-xl border px-3 py-2 text-sm transition-all outline-none",
                                        "bg-white dark:bg-gray-950",
                                        "text-gray-900 dark:text-white",
                                        "border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200",
                                        "dark:border-gray-800 dark:focus:border-indigo-400 dark:focus:ring-indigo-900/40"
                                    )}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className={clsx(
                                        "w-full rounded-xl border px-3 py-2 text-sm transition-all outline-none",
                                        "bg-white dark:bg-gray-950",
                                        "text-gray-900 dark:text-white",
                                        "border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200",
                                        "dark:border-gray-800 dark:focus:border-indigo-400 dark:focus:ring-indigo-900/40"
                                    )}
                                />
                            </div>
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Phone
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className={clsx(
                                        "w-full rounded-xl border px-3 py-2 text-sm transition-all outline-none",
                                        "bg-white dark:bg-gray-950",
                                        "text-gray-900 dark:text-white",
                                        "border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200",
                                        "dark:border-gray-800 dark:focus:border-indigo-400 dark:focus:ring-indigo-900/40"
                                    )}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Status
                            </label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value as "Active" | "Inactive")}
                                className={clsx(
                                    "w-full rounded-xl border px-3 py-2 text-sm transition-all outline-none",
                                    "bg-white dark:bg-gray-950",
                                    "text-gray-900 dark:text-white",
                                    "border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200",
                                    "dark:border-gray-800 dark:focus:border-indigo-400 dark:focus:ring-indigo-900/40"
                                )}
                            >
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                            </select>
                        </div>
                    </div>

                    <div className="mt-8 flex items-center justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-xl px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-6 py-2 text-sm font-semibold text-white shadow-md shadow-indigo-500/25 transition-all hover:shadow-lg hover:shadow-indigo-500/30 active:scale-[0.98]"
                        >
                            {isEdit ? "Save Changes" : "Add Supplier"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
