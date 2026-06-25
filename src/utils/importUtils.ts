import Papa from "papaparse";
import { type Product } from "@/src/data/sampleProducts";
import { type Supplier } from "@/src/data/sampleSuppliers";

export function importProductsFromCSV(file: File): Promise<Product[]> {
    return new Promise((resolve, reject) => {
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                try {
                    const parsedProducts: Product[] = results.data.map((row: any) => {
                        return {
                            id: row["ID"] || `PRD-${Math.floor(Math.random() * 10000)}`,
                            name: row["Name"] || "Unknown Product",
                            category: row["Category"] || "Other",
                            price: parseFloat(row["Price"]) || 0,
                            stock: parseInt(row["Stock"]) || 0,
                            unit: row["Unit"] || "units",
                            minThreshold: parseInt(row["Min Threshold"]) || 10,
                            supplier: row["Supplier"] || "Unknown Supplier",
                            location: {
                                warehouse: row["Location"] ? row["Location"].split("(")[0].trim() : "Main",
                                aisle: "A1",
                                bin: "B1"
                            },
                            batches: [],
                            lastUpdated: new Date().toISOString().split('T')[0]
                        };
                    });
                    resolve(parsedProducts);
                } catch (err) {
                    reject(err);
                }
            },
            error: (err) => {
                reject(err);
            }
        });
    });
}

export function importSuppliersFromCSV(file: File): Promise<Supplier[]> {
    return new Promise((resolve, reject) => {
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                try {
                    const parsedSuppliers: Supplier[] = results.data.map((row: any) => {
                        return {
                            id: row["ID"] || `SUP-${Math.floor(Math.random() * 10000)}`,
                            name: row["Name"] || "Unknown Supplier",
                            contactPerson: row["Contact Person"] || "N/A",
                            email: row["Email"] || "",
                            phone: row["Phone"] || "",
                            status: (row["Status"] === "Active" || row["Status"] === "Inactive") ? row["Status"] : "Active",
                            rating: parseInt(row["Rating"]) || 3,
                        };
                    });
                    resolve(parsedSuppliers);
                } catch (err) {
                    reject(err);
                }
            },
            error: (err) => {
                reject(err);
            }
        });
    });
}
