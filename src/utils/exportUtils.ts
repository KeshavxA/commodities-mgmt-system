import { type Product } from "@/src/data/sampleProducts";
import { type AuditLog } from "@/src/context/AuditContext";

function escapeCSV(val: any): string {
    if (val === null || val === undefined) return '""';
    const str = String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
}

function triggerDownload(csvContent: string, fileName: string) {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

export function exportProductsToCSV(products: Product[]) {
    const headers = [
        "ID",
        "Name",
        "Category",
        "Price",
        "Stock",
        "Unit",
        "Min Threshold",
        "Status",
        "Total Value",
        "Supplier",
        "Location",
        "Earliest Expiry",
        "Last Updated"
    ];

    const rows = products.map((p) => {
        const isLow = p.stock <= p.minThreshold;
        const totalValue = p.price * p.stock;
        const loc = p.location;
        const locStr = loc && (loc.warehouse || loc.aisle || loc.bin)
            ? `${loc.warehouse || "Unknown"} (Aisle ${loc.aisle || "-"}, Bin ${loc.bin || "-"})`
            : "Unassigned";

        let earliestExpiry = "-";
        if (p.batches && p.batches.length > 0) {
            const sorted = [...p.batches].sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());
            if (sorted.length > 0) earliestExpiry = sorted[0].expiryDate;
        }

        return [
            p.id,
            p.name,
            p.category,
            p.price.toFixed(2),
            p.stock,
            p.unit,
            p.minThreshold,
            isLow ? "Low Stock" : "OK",
            totalValue.toFixed(2),
            p.supplier,
            locStr,
            earliestExpiry,
            p.lastUpdated
        ].map(escapeCSV).join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\n");
    triggerDownload(csvContent, `commodities_export_${new Date().toISOString().split('T')[0]}.csv`);
}

export function exportAuditLogsToCSV(logs: AuditLog[]) {
    const headers = [
        "Action",
        "Details",
        "User Email",
        "Role",
        "Timestamp"
    ];

    const rows = logs.map((log) => {
        return [
            log.action,
            log.details,
            log.userEmail,
            log.role,
            log.timestamp
        ].map(escapeCSV).join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\n");
    triggerDownload(csvContent, `audit_logs_export_${new Date().toISOString().split('T')[0]}.csv`);
}
