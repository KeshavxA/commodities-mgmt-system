"use client";

import { Fragment, useMemo, useState } from "react";
import {
    Search,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    AlertTriangle,
    Filter,
    Plus,
    Pencil,
    Trash2,
    ChevronDown,
    ChevronRight,
    Download,
    ScanLine,
    MapPin,
    Clock,
    RefreshCcw,
} from "lucide-react";
import clsx from "clsx";
import { useAuth } from "@/src/context/AuthContext";
import { useLanguage } from "@/src/context/LanguageContext";
import { useRBAC } from "@/src/context/RBACContext";
import { getCategories, type Product } from "@/src/data/sampleProducts";
import { exportProductsToCSV } from "@/src/utils/exportUtils";
import ProductModal from "./ProductModal";
import ScannerModal from "../scanner/ScannerModal";
import RestockModal from "./RestockModal";
import PrintLabelModal from "./PrintLabelModal";
import { Printer, ArrowRightLeft } from "lucide-react";

type SortKey = keyof Pick<Product, "name" | "category" | "price" | "stock">;
type SortDir = "asc" | "desc";

interface ProductTableProps {
    products: Product[];
    onAddProduct: (product: Product) => void;
    onEditProduct: (product: Product) => void;
    onDeleteProduct: (id: string) => void;
    onImportProducts?: (products: Product[]) => void;
    onAdjustStock?: (product: Product) => void;
}

export default function ProductTable({
    products,
    onAddProduct,
    onEditProduct,
    onDeleteProduct,
    onImportProducts,
    onAdjustStock,
}: ProductTableProps) {
    const { user } = useAuth();
    const { hasPermission } = useRBAC();
    const { t, translateCategory, translateProductName } = useLanguage();
    
    const canCreate = user ? hasPermission(user.role, "products:create") : false;
    const canEdit = user ? hasPermission(user.role, "products:edit") : false;
    const canDelete = user ? hasPermission(user.role, "products:delete") : false;
    const canRequestRestock = user ? hasPermission(user.role, "orders:create") : false;

    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("All");
    const [groupByCategory, setGroupByCategory] = useState(false);
    const [sortKey, setSortKey] = useState<SortKey>("name");
    const [sortDir, setSortDir] = useState<SortDir>("asc");
    const [modalOpen, setModalOpen] = useState(false);
    const [scannerOpen, setScannerOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [restockingProduct, setRestockingProduct] = useState<Product | null>(null);
    const [printingProduct, setPrintingProduct] = useState<Product | null>(null);

    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
    const categories = useMemo(() => ["All", ...getCategories()], []);
    const filtered = useMemo(() => {
        let list = products;

        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter(
                (p) =>
                    p.name.toLowerCase().includes(q) ||
                    p.id.toLowerCase().includes(q) ||
                    p.category.toLowerCase().includes(q) ||
                    p.supplier.toLowerCase().includes(q) ||
                    (p.location?.warehouse || "").toLowerCase().includes(q) ||
                    (p.location?.aisle || "").toLowerCase().includes(q) ||
                    (p.location?.bin || "").toLowerCase().includes(q)
            );
        }

        if (categoryFilter !== "All") {
            list = list.filter((p) => p.category === categoryFilter);
        }

        const sorted = [...list].sort((a, b) => {
            const aVal = a[sortKey];
            const bVal = b[sortKey];
            if (typeof aVal === "number" && typeof bVal === "number") {
                return sortDir === "asc" ? aVal - bVal : bVal - aVal;
            }
            return sortDir === "asc"
                ? String(aVal).localeCompare(String(bVal))
                : String(bVal).localeCompare(String(aVal));
        });

        return sorted;
    }, [products, search, categoryFilter, sortKey, sortDir]);

    const groupedByCategory = useMemo<Record<string, Product[]> | null>(() => {
        if (!groupByCategory) return null;

        const groups: Record<string, Product[]> = {};
        for (const p of filtered) {
            if (!groups[p.category]) groups[p.category] = [];
            groups[p.category].push(p);
        }

        return groups;
    }, [filtered, groupByCategory]);

    const groupedEntries = groupedByCategory ? Object.entries(groupedByCategory) : [];

    function toggleSort(key: SortKey) {
        if (sortKey === key) {
            setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        } else {
            setSortKey(key);
            setSortDir("asc");
        }
    }

    function toggleGroup(category: string) {
        setOpenGroups((prev) => ({
            ...prev,
            [category]: !(prev[category] ?? true),
        }));
    }

    function handleAdd() {
        setEditingProduct(null);
        setModalOpen(true);
    }

    function handleEdit(product: Product) {
        setEditingProduct(product);
        setModalOpen(true);
    }

    function handleSave(product: Product) {
        if (editingProduct) {
            onEditProduct(product);
        } else {
            onAddProduct(product);
        }
    }

    function handleDeleteConfirm(id: string) {
        onDeleteProduct(id);
        setDeletingId(null);
    }

    function handleScan(decodedText: string) {
        const product = products.find((p) => p.id === decodedText);
        if (product) {
            handleEdit(product);
        } else {
            alert(`Product with ID "${decodedText}" not found in inventory.`);
        }
    }

    async function handleImportClick(e: React.ChangeEvent<HTMLInputElement>) {
        if (!e.target.files || e.target.files.length === 0 || !onImportProducts) return;
        const file = e.target.files[0];
        try {
            const { importProductsFromCSV } = await import("@/src/utils/importUtils");
            const parsed = await importProductsFromCSV(file);
            onImportProducts(parsed);
        } catch (err) {
            alert("Failed to parse CSV file. Please make sure it is valid.");
        }
        e.target.value = ""; // Reset input so the same file can be uploaded again if needed
    }

    function formatLocation(loc?: { warehouse: string; aisle: string; bin: string }) {
        if (!loc || (!loc.warehouse && !loc.aisle && !loc.bin)) return "Unassigned";
        const parts = [];
        if (loc.aisle) parts.push(`Aisle ${loc.aisle}`);
        if (loc.bin) parts.push(`Bin ${loc.bin}`);
        const secondary = parts.length > 0 ? ` (${parts.join(", ")})` : "";
        return `${loc.warehouse || "Unknown"}${secondary}`;
    }

    function getExpiringBatch(p: Product) {
        if (!p.batches || p.batches.length === 0) return null;
        const now = new Date();
        const thirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        
        const sorted = [...p.batches].sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());
        const expiring = sorted.find(b => new Date(b.expiryDate) <= thirtyDays);
        return expiring || null;
    }

    function SortIcon({ col }: { col: SortKey }) {
        if (sortKey !== col)
            return <ArrowUpDown className="ml-1 inline h-3.5 w-3.5 opacity-40" />;
        return sortDir === "asc" ? (
            <ArrowUp className="ml-1 inline h-3.5 w-3.5" />
        ) : (
            <ArrowDown className="ml-1 inline h-3.5 w-3.5" />
        );
    }

    return (
        <div>
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative w-full sm:max-w-xs">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                    <input
                        id="product-search"
                        type="text"
                        placeholder="Search products…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className={clsx(
                            "w-full rounded-xl border py-2 pl-9 pr-4 text-sm outline-none transition-all",
                            "bg-white dark:bg-gray-800/50",
                            "text-gray-900 dark:text-gray-100",
                            "border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200",
                            "dark:border-gray-700 dark:focus:border-indigo-500 dark:focus:ring-indigo-900/40",
                            "placeholder:text-gray-400 dark:placeholder:text-gray-500"
                        )}
                    />
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                        <select
                            id="category-filter"
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className={clsx(
                                "flex-1 rounded-xl border px-3 py-2 text-sm outline-none transition-all sm:flex-none",
                                "bg-white dark:bg-gray-800/50",
                                "text-gray-700 dark:text-gray-200",
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
                        <span className="whitespace-nowrap text-xs text-gray-400 dark:text-gray-500">
                            {filtered.length} {t("results")}
                        </span>
                    </div>

                    <div className="flex items-center justify-between gap-3 sm:justify-start">
                        <button
                            type="button"
                            id="groupby-toggle"
                            onClick={() => setGroupByCategory((v) => !v)}
                            className="inline-flex items-center gap-2 text-xs font-medium text-gray-500 transition-colors hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-100"
                            role="switch"
                            aria-checked={groupByCategory}
                        >
                            <span>{t("groupByCategory")}</span>
                            <span
                                className={clsx(
                                    "inline-flex h-5 w-9 items-center rounded-full border border-transparent p-0.5 transition-colors",
                                    groupByCategory
                                        ? "bg-indigo-500"
                                        : "bg-gray-300 dark:bg-gray-700"
                                )}
                            >
                                <span
                                    className={clsx(
                                        "h-4 w-4 rounded-full bg-white shadow transition-transform",
                                        groupByCategory ? "translate-x-4" : "translate-x-0"
                                    )}
                                />
                            </span>
                        </button>

                        {canCreate && (
                            <div className="flex items-center gap-2 sm:hidden">
                                <button
                                    type="button"
                                    onClick={() => setScannerOpen(true)}
                                    className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white p-2 text-gray-700 shadow-sm transition-all hover:bg-gray-50 active:scale-[0.98] dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                                    title="Scan Barcode"
                                >
                                    <ScanLine className="h-4 w-4" />
                                </button>
                                <label
                                    className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-gray-200 bg-white p-2 text-gray-700 shadow-sm transition-all hover:bg-gray-50 active:scale-[0.98] dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                                    title="Import CSV"
                                >
                                    <input type="file" accept=".csv" className="hidden" onChange={handleImportClick} />
                                    <ArrowUp className="h-4 w-4" />
                                </label>
                                <button
                                    type="button"
                                    onClick={() => exportProductsToCSV(filtered)}
                                    className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white p-2 text-gray-700 shadow-sm transition-all hover:bg-gray-50 active:scale-[0.98] dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                                    title="Export to CSV"
                                >
                                    <Download className="h-4 w-4" />
                                </button>
                                <button
                                    type="button"
                                    id="add-product-btn-mobile"
                                    onClick={handleAdd}
                                    className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-indigo-500/25 transition-all hover:shadow-lg hover:shadow-indigo-500/30 active:scale-[0.98]"
                                >
                                    <Plus className="h-4 w-4" />
                                    Add
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {canCreate && (
                    <div className="hidden sm:flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setScannerOpen(true)}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition-all hover:bg-gray-50 active:scale-[0.98] dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                        >
                            <ScanLine className="h-4 w-4" />
                            Scan Barcode
                        </button>
                        <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition-all hover:bg-gray-50 active:scale-[0.98] dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700">
                            <input type="file" accept=".csv" className="hidden" onChange={handleImportClick} />
                            <ArrowUp className="h-4 w-4" />
                            Import CSV
                        </label>
                        <button
                            type="button"
                            onClick={() => exportProductsToCSV(filtered)}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition-all hover:bg-gray-50 active:scale-[0.98] dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                        >
                            <Download className="h-4 w-4" />
                            Export CSV
                        </button>
                        <button
                            type="button"
                            id="add-product-btn"
                            onClick={handleAdd}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-indigo-500/25 transition-all hover:shadow-lg hover:shadow-indigo-500/30 active:scale-[0.98]"
                        >
                            <Plus className="h-4 w-4" />
                            Add Product
                        </button>
                    </div>
                )}
            </div>

            <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[500px] text-left text-sm sm:min-w-[700px] md:min-w-[800px]">
                        <thead>
                            <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900/60">
                                <Th className="hidden sm:table-cell">ID</Th>
                                <ThSortable col="name" label="Product" toggle={toggleSort}>
                                    <SortIcon col="name" />
                                </ThSortable>
                                <ThSortable col="category" label="Category" toggle={toggleSort} className="hidden md:table-cell">
                                    <SortIcon col="category" />
                                </ThSortable>
                                <ThSortable col="price" label="Price" toggle={toggleSort}>
                                    <SortIcon col="price" />
                                </ThSortable>
                                <ThSortable col="stock" label="Stock" toggle={toggleSort}>
                                    <SortIcon col="stock" />
                                </ThSortable>
                                <Th className="hidden lg:table-cell">Supplier</Th>
                                <Th className="hidden lg:table-cell">Location</Th>
                                <Th className="hidden xl:table-cell">Updated</Th>
                                <Th>Actions</Th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white dark:divide-gray-800 dark:bg-gray-900">
                            {filtered.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={8}
                                        className="px-4 py-12 text-center text-gray-400 dark:text-gray-500"
                                    >
                                        No products match your search.
                                    </td>
                                </tr>
                            ) : groupByCategory && groupedEntries.length > 0 ? (
                                groupedEntries.map(([category, items]) => {
                                    const isOpen = openGroups[category] ?? true;
                                    const totalProducts = items.length;

                                    return (
                                        <Fragment key={category}>
                                            <tr className="border-b border-gray-100 bg-gray-50/80 dark:border-gray-800 dark:bg-gray-900/60">
                                                <td colSpan={8} className="px-4 py-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => toggleGroup(category)}
                                                        className="flex w-full items-center justify-between text-left text-sm font-semibold text-gray-700 transition-colors hover:text-gray-900 dark:text-gray-200 dark:hover:text-gray-50"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                                                                {isOpen ? (
                                                                    <ChevronDown className="h-4 w-4" />
                                                                ) : (
                                                                    <ChevronRight className="h-4 w-4" />
                                                                )}
                                                            </span>
                                                            <span
                                                                className={clsx(
                                                                    "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium",
                                                                    categoryBadge(category)
                                                                )}
                                                            >
                                                                {category}
                                                            </span>
                                                        </div>
                                                        <span className="text-xs font-normal text-gray-500 dark:text-gray-400">
                                                            {totalProducts} product
                                                            {totalProducts !== 1 ? "s" : ""}
                                                        </span>
                                                    </button>
                                                </td>
                                            </tr>

                                            {isOpen &&
                                                items.map((p) => {
                                                    const isLow = p.stock <= p.minThreshold;
                                                    const isDeleting = deletingId === p.id;
                                                    const expiringBatch = getExpiringBatch(p);

                                                    return (
                                                        <tr
                                                            key={p.id}
                                                            className={clsx(
                                                                "transition-colors",
                                                                isDeleting
                                                                    ? "bg-red-50/60 dark:bg-red-900/10"
                                                                    : "hover:bg-gray-50/60 dark:hover:bg-gray-800/40"
                                                            )}
                                                        >
                                                            <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-gray-500 dark:text-gray-400 hidden sm:table-cell">
                                                                {p.id}
                                                            </td>
                                                            <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100 max-w-[140px] sm:max-w-none break-words">
                                                                {translateProductName(p.id, p.name)}
                                                            </td>
                                                            <td className="px-4 py-3 hidden md:table-cell">
                                                                <span
                                                                    className={clsx(
                                                                        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium",
                                                                        categoryBadge(p.category)
                                                                    )}
                                                                >
                                                                    {translateCategory(p.category)}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                                                                $
                                                                {p.price.toLocaleString(undefined, {
                                                                    minimumFractionDigits: 2,
                                                                    maximumFractionDigits: 2,
                                                                })}
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <div className="flex items-center gap-2">
                                                                    <span
                                                                        className={clsx(
                                                                            "inline-flex items-center gap-1 font-medium",
                                                                            isLow
                                                                                ? "text-red-600 dark:text-red-400"
                                                                                : "text-gray-700 dark:text-gray-300"
                                                                        )}
                                                                    >
                                                                        {isLow && (
                                                                            <span title="Low Stock"><AlertTriangle className="h-3.5 w-3.5" /></span>
                                                                        )}
                                                                        {p.stock.toLocaleString()} {p.unit}
                                                                    </span>
                                                                    {expiringBatch && (
                                                                        <div className="group relative flex items-center">
                                                                            <Clock className="h-4 w-4 text-orange-500" />
                                                                            <div className="absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-gray-900 px-3 py-1.5 text-xs text-white shadow-lg group-hover:block dark:bg-gray-800">
                                                                                Batch {expiringBatch.batchNumber} expires on {expiringBatch.expiryDate}
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-3 text-gray-500 dark:text-gray-400 hidden lg:table-cell">
                                                                {p.supplier}
                                                            </td>
                                                            <td className="px-4 py-3 text-gray-500 dark:text-gray-400 hidden lg:table-cell">
                                                                <div className="flex items-center gap-1.5">
                                                                    <MapPin className="h-3.5 w-3.5 opacity-60" />
                                                                    {formatLocation(p.location)}
                                                                </div>
                                                            </td>
                                                            <td className="whitespace-nowrap px-4 py-3 text-gray-400 dark:text-gray-500 hidden xl:table-cell">
                                                                {p.lastUpdated}
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                {isDeleting ? (
                                                                    <div className="flex items-center gap-1.5">
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => handleDeleteConfirm(p.id)}
                                                                            className="rounded-lg bg-red-500 px-2.5 py-1 text-xs font-medium text-white transition-colors hover:bg-red-600"
                                                                        >
                                                                            Confirm
                                                                        </button>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => setDeletingId(null)}
                                                                            className="rounded-lg px-2.5 py-1 text-xs font-medium text-gray-500 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                                                                        >
                                                                            Cancel
                                                                        </button>
                                                                    </div>
                                                                ) : (
                                                                    <div className="flex items-center gap-1">
                                                                        {canEdit && (
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => handleEdit(p)}
                                                                                className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-900/20 dark:hover:text-indigo-400"
                                                                                title="Edit product"
                                                                            >
                                                                                <Pencil className="h-4 w-4" />
                                                                            </button>
                                                                        )}

                                                                        {onAdjustStock && canEdit && (
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => onAdjustStock(p)}
                                                                                className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20 dark:hover:text-blue-400"
                                                                                title="Adjust Stock"
                                                                            >
                                                                                <ArrowRightLeft className="h-4 w-4" />
                                                                            </button>
                                                                        )}

                                                                        {canDelete && (
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => setDeletingId(p.id)}
                                                                                className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                                                                                title="Delete product"
                                                                            >
                                                                                <Trash2 className="h-4 w-4" />
                                                                            </button>
                                                                        )}

                                                                        <button
                                                                            type="button"
                                                                            onClick={() => setPrintingProduct(p)}
                                                                            className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-900/20 dark:hover:text-emerald-400"
                                                                            title="Print QR Label"
                                                                        >
                                                                            <Printer className="h-4 w-4" />
                                                                        </button>

                                                                        {canRequestRestock && (
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => setRestockingProduct(p)}
                                                                                className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-amber-50 hover:text-amber-500 dark:hover:bg-amber-900/20 dark:hover:text-amber-400"
                                                                                title="Request Restock"
                                                                            >
                                                                                <RefreshCcw className="h-4 w-4" />
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                        </Fragment>
                                    );
                                })
                            ) : (
                                filtered.map((p) => {
                                    const isLow = p.stock <= p.minThreshold;
                                    const isDeleting = deletingId === p.id;
                                    const expiringBatch = getExpiringBatch(p);

                                    return (
                                        <tr
                                            key={p.id}
                                            className={clsx(
                                                "transition-colors",
                                                isDeleting
                                                    ? "bg-red-50/60 dark:bg-red-900/10"
                                                    : "hover:bg-gray-50/60 dark:hover:bg-gray-800/40"
                                            )}
                                        >
                                            <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-gray-500 dark:text-gray-400 hidden sm:table-cell">
                                                {p.id}
                                            </td>
                                            <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100 max-w-[140px] sm:max-w-none break-words">
                                                {translateProductName(p.id, p.name)}
                                            </td>
                                            <td className="px-4 py-3 hidden md:table-cell">
                                                <span
                                                    className={clsx(
                                                        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium",
                                                        categoryBadge(p.category)
                                                    )}
                                                >
                                                    {translateCategory(p.category)}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                                                $
                                                {p.price.toLocaleString(undefined, {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2,
                                                })}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <span
                                                        className={clsx(
                                                            "inline-flex items-center gap-1 font-medium",
                                                            isLow
                                                                ? "text-red-600 dark:text-red-400"
                                                                : "text-gray-700 dark:text-gray-300"
                                                        )}
                                                    >
                                                        {isLow && <span title="Low Stock"><AlertTriangle className="h-3.5 w-3.5" /></span>}
                                                        {p.stock.toLocaleString()} {p.unit}
                                                    </span>
                                                    {expiringBatch && (
                                                        <div className="group relative flex items-center">
                                                            <Clock className="h-4 w-4 text-orange-500" />
                                                            <div className="absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-gray-900 px-3 py-1.5 text-xs text-white shadow-lg group-hover:block dark:bg-gray-800">
                                                                Batch {expiringBatch.batchNumber} expires on {expiringBatch.expiryDate}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-gray-500 dark:text-gray-400 hidden lg:table-cell">
                                                {p.supplier}
                                            </td>
                                            <td className="px-4 py-3 text-gray-500 dark:text-gray-400 hidden lg:table-cell">
                                                <div className="flex items-center gap-1.5">
                                                    <MapPin className="h-3.5 w-3.5 opacity-60" />
                                                    {formatLocation(p.location)}
                                                </div>
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-3 text-gray-400 dark:text-gray-500 hidden xl:table-cell">
                                                {p.lastUpdated}
                                            </td>
                                            <td className="px-4 py-3">
                                                {isDeleting ? (
                                                    <div className="flex items-center gap-1.5">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDeleteConfirm(p.id)}
                                                            className="rounded-lg bg-red-500 px-2.5 py-1 text-xs font-medium text-white transition-colors hover:bg-red-600"
                                                        >
                                                            Confirm
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setDeletingId(null)}
                                                            className="rounded-lg px-2.5 py-1 text-xs font-medium text-gray-500 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-1">
                                                        {canEdit && (
                                                            <button
                                                                type="button"
                                                                onClick={() => handleEdit(p)}
                                                                className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-900/20 dark:hover:text-indigo-400"
                                                                title="Edit product"
                                                            >
                                                                <Pencil className="h-4 w-4" />
                                                            </button>
                                                        )}

                                                        {onAdjustStock && canEdit && (
                                                            <button
                                                                type="button"
                                                                onClick={() => onAdjustStock(p)}
                                                                className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20 dark:hover:text-blue-400"
                                                                title="Adjust Stock"
                                                            >
                                                                <ArrowRightLeft className="h-4 w-4" />
                                                            </button>
                                                        )}

                                                        {canDelete && (
                                                            <button
                                                                type="button"
                                                                onClick={() => setDeletingId(p.id)}
                                                                className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                                                                title="Delete product"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>
                                                        )}
                                                        
                                                        <button
                                                            type="button"
                                                            onClick={() => setPrintingProduct(p)}
                                                            className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-900/20 dark:hover:text-emerald-400"
                                                            title="Print QR Label"
                                                        >
                                                            <Printer className="h-4 w-4" />
                                                        </button>
                                                        
                                                        {canRequestRestock && (
                                                            <button
                                                                type="button"
                                                                onClick={() => setRestockingProduct(p)}
                                                                className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-amber-50 hover:text-amber-500 dark:hover:bg-amber-900/20 dark:hover:text-amber-400"
                                                                title="Request Restock"
                                                            >
                                                                <RefreshCcw className="h-4 w-4" />
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <ProductModal
                isOpen={modalOpen}
                onClose={() => {
                    setModalOpen(false);
                    setEditingProduct(null);
                }}
                onSave={handleSave}
                product={editingProduct}
            />

            <ScannerModal
                isOpen={scannerOpen}
                onClose={() => setScannerOpen(false)}
                onScan={handleScan}
            />

            <RestockModal
                isOpen={!!restockingProduct}
                onClose={() => setRestockingProduct(null)}
                product={restockingProduct}
            />

            <PrintLabelModal
                isOpen={!!printingProduct}
                onClose={() => setPrintingProduct(null)}
                product={printingProduct}
            />
        </div>
    );
}


function Th({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <th className={clsx("px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400", className)}>
            {children}
        </th>
    );
}

function ThSortable({
    col,
    label,
    toggle,
    children,
    className,
}: {
    col: SortKey;
    label: string;
    toggle: (key: SortKey) => void;
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <th className={clsx("px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400", className)}>
            <button
                type="button"
                onClick={() => toggle(col)}
                className="inline-flex items-center gap-0.5 transition-colors hover:text-gray-900 dark:hover:text-gray-200"
            >
                {label}
                {children}
            </button>
        </th>
    );
}

function categoryBadge(category: string): string {
    switch (category) {
        case "Energy":
            return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
        case "Metals":
            return "bg-slate-100 text-slate-700 dark:bg-slate-800/50 dark:text-slate-300";
        case "Agriculture":
            return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
        case "Soft Commodities":
            return "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400";
        case "Industrial":
            return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
        default:
            return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
    }
}
