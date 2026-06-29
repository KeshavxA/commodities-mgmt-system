"use client";

import {
    createContext,
    useContext,
    useEffect,
    useState,
    useCallback,
    type ReactNode,
} from "react";
import { type Product, sampleProducts } from "@/src/data/sampleProducts";
import { useAudit } from "./AuditContext";
import { type User } from "./AuthContext";

export type LedgerTransactionType = "STOCK_IN" | "STOCK_OUT" | "ADJUSTMENT" | "INITIAL";

export interface LedgerEntry {
    id: string;
    productId: string;
    productName: string;
    type: LedgerTransactionType;
    quantity: number; 
    previousStock: number;
    newStock: number;
    reference?: string; 
    notes?: string;
    userEmail: string;
    timestamp: string;
}

interface ProductContextType {
    products: Product[];
    ledger: LedgerEntry[];
    addProduct: (product: Product, user: User) => void;
    updateProduct: (product: Product, user: User) => void;
    deleteProduct: (id: string, user: User) => void;
    recordStockMovement: (
        productId: string, 
        type: LedgerTransactionType, 
        quantity: number, 
        user: User, 
        reference?: string, 
        notes?: string
    ) => void;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);
const PRODUCTS_STORAGE_KEY = "commodities-products";
const LEDGER_STORAGE_KEY = "commodities-ledger";

export function ProductProvider({ children }: { children: ReactNode }) {
    const [products, setProducts] = useState<Product[]>([]);
    const [ledger, setLedger] = useState<LedgerEntry[]>([]);
    const [mounted, setMounted] = useState(false);
    const { logAction } = useAudit();

    useEffect(() => {
        try {
            const storedProducts = localStorage.getItem(PRODUCTS_STORAGE_KEY);
            if (storedProducts) {
                setProducts(JSON.parse(storedProducts));
            } else {
                setProducts(sampleProducts);
                localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(sampleProducts));
            }

            const storedLedger = localStorage.getItem(LEDGER_STORAGE_KEY);
            if (storedLedger) {
                setLedger(JSON.parse(storedLedger));
            }
        } catch {
            setProducts(sampleProducts);
        }
        setMounted(true);
    }, []);

    const addProduct = useCallback((product: Product, user: User) => {
        setProducts((prev) => {
            const updated = [product, ...prev];
            try {
                localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(updated));
            } catch {}
            return updated;
        });
        
        // Log the action to audit
        logAction("CREATE", `Created product "${product.name}" (${product.id})`, user);
        
        // If it has initial stock, log an initial ledger entry
        if (product.stock > 0) {
            setLedger((prevLedger) => {
                const entry: LedgerEntry = {
                    id: `ledg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                    productId: product.id,
                    productName: product.name,
                    type: "INITIAL",
                    quantity: product.stock,
                    previousStock: 0,
                    newStock: product.stock,
                    notes: "Initial inventory setup",
                    userEmail: user.email,
                    timestamp: new Date().toISOString(),
                };
                const updatedLedger = [entry, ...prevLedger];
                try { localStorage.setItem(LEDGER_STORAGE_KEY, JSON.stringify(updatedLedger)); } catch {}
                return updatedLedger;
            });
        }
    }, [logAction]);

    const updateProduct = useCallback((updatedProduct: Product, user: User) => {
        setProducts((prev) => {
            const oldProduct = prev.find(p => p.id === updatedProduct.id);
            if (oldProduct) {
                let details = `Updated product "${updatedProduct.name}" (${updatedProduct.id})`;
                if (oldProduct.price !== updatedProduct.price) {
                    details = `Updated price for ${updatedProduct.name} from $${oldProduct.price} to $${updatedProduct.price}`;
                }
                logAction("UPDATE", details, user);
            }
            const updated = prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p));
            try {
                localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(updated));
            } catch {}
            return updated;
        });
    }, [logAction]);

    const deleteProduct = useCallback((id: string, user: User) => {
        setProducts((prev) => {
            const product = prev.find((p) => p.id === id);
            if (product) {
                logAction("DELETE", `Deleted product "${product.name}" (${id})`, user);
            }
            const updated = prev.filter((p) => p.id !== id);
            try {
                localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(updated));
            } catch {}
            return updated;
        });
    }, [logAction]);

    const recordStockMovement = useCallback((
        productId: string, 
        type: LedgerTransactionType, 
        quantity: number, 
        user: User, 
        reference?: string, 
        notes?: string
    ) => {
        let productName = "";
        setProducts((prev) => {
            const product = prev.find(p => p.id === productId);
            if (!product) return prev;
            
            productName = product.name;
            const previousStock = product.stock;
            const changeAmount = (type === "STOCK_OUT" ? -Math.abs(quantity) : Math.abs(quantity));
            const newStock = Math.max(0, previousStock + changeAmount);
            
            setLedger((prevLedger) => {
                const entry: LedgerEntry = {
                    id: `ledg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                    productId,
                    productName,
                    type,
                    quantity: Math.abs(quantity),
                    previousStock,
                    newStock,
                    reference,
                    notes,
                    userEmail: user.email,
                    timestamp: new Date().toISOString(),
                };
                const updatedLedger = [entry, ...prevLedger];
                try { localStorage.setItem(LEDGER_STORAGE_KEY, JSON.stringify(updatedLedger)); } catch {}
                return updatedLedger;
            });
            
            // Audit log for traceability
            logAction("UPDATE", `Recorded ${type} of ${Math.abs(quantity)} for "${product.name}"`, user);
            
            const updated = prev.map(p => p.id === productId ? { ...p, stock: newStock } : p);
            try { localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(updated)); } catch {}
            return updated;
        });
    }, [logAction]);

    if (!mounted) {
        return <>{children}</>;
    }

    return (
        <ProductContext.Provider value={{ products, ledger, addProduct, updateProduct, deleteProduct, recordStockMovement }}>
            {children}
        </ProductContext.Provider>
    );
}

export function useProducts(): ProductContextType {
    const ctx = useContext(ProductContext);
    if (!ctx) {
        throw new Error("useProducts must be used within a <ProductProvider>");
    }
    return ctx;
}
