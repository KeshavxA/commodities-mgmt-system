"use client";

import {
    createContext,
    useContext,
    useEffect,
    useState,
    useCallback,
    type ReactNode,
} from "react";
import { type User } from "./AuthContext";
import { useAudit } from "./AuditContext";

export type OrderStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface PurchaseOrder {
    id: string;
    productId: string;
    productName: string;
    quantity: number;
    requestedBy: string; // user email
    status: OrderStatus;
    createdAt: string;
}

interface OrderContextType {
    orders: PurchaseOrder[];
    requestRestock: (productId: string, productName: string, quantity: number, user: User) => void;
    updateOrderStatus: (orderId: string, status: OrderStatus, user: User) => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);
const STORAGE_KEY = "commodities-purchase-orders";

// Mock data to seed initially if empty
const initialOrders: PurchaseOrder[] = [
    {
        id: "PO-1001",
        productId: "p1",
        productName: "Soybeans",
        quantity: 5000,
        requestedBy: "store@example.com",
        status: "PENDING",
        createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
        id: "PO-1002",
        productId: "p3",
        productName: "Crude Oil",
        quantity: 1000,
        requestedBy: "store@example.com",
        status: "APPROVED",
        createdAt: new Date(Date.now() - 172800000).toISOString(),
    }
];

export function OrderProvider({ children }: { children: ReactNode }) {
    const [orders, setOrders] = useState<PurchaseOrder[]>([]);
    const [mounted, setMounted] = useState(false);
    const { logAction } = useAudit();

    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                setOrders(JSON.parse(stored));
            } else {
                setOrders(initialOrders);
                localStorage.setItem(STORAGE_KEY, JSON.stringify(initialOrders));
            }
        } catch {
            setOrders(initialOrders);
        }
        setMounted(true);
    }, []);

    const requestRestock = useCallback((productId: string, productName: string, quantity: number, user: User) => {
        setOrders((prev) => {
            const newOrder: PurchaseOrder = {
                id: `PO-${Math.floor(1000 + Math.random() * 9000)}`,
                productId,
                productName,
                quantity,
                requestedBy: user.email,
                status: "PENDING",
                createdAt: new Date().toISOString(),
            };
            const updated = [newOrder, ...prev];
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
            } catch {}
            
            // Log to audit
            logAction("CREATE", `Requested restock of ${quantity} for ${productName} (Order ${newOrder.id})`, user);
            
            return updated;
        });
    }, [logAction]);

    const updateOrderStatus = useCallback((orderId: string, status: OrderStatus, user: User) => {
        setOrders((prev) => {
            const order = prev.find(o => o.id === orderId);
            const oldStatus = order?.status;
            
            const updated = prev.map(o => o.id === orderId ? { ...o, status } : o);
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
            } catch {}
            
            if (order && oldStatus !== status) {
                logAction("UPDATE", `Changed order ${orderId} status for ${order.productName} from ${oldStatus} to ${status}`, user);
            }
            
            return updated;
        });
    }, [logAction]);

    if (!mounted) {
        return <>{children}</>;
    }

    return (
        <OrderContext.Provider value={{ orders, requestRestock, updateOrderStatus }}>
            {children}
        </OrderContext.Provider>
    );
}

export function useOrders(): OrderContextType {
    const ctx = useContext(OrderContext);
    if (!ctx) {
        throw new Error("useOrders must be used within an <OrderProvider>");
    }
    return ctx;
}
