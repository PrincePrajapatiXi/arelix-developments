// ═══════════════════════════════════════════════════════════════
// FILE: page.tsx  (Admin Orders)
// PURPOSE: Displays all orders from MongoDB in a filterable table
//          with Approve / Reject actions for pending orders.
// LOCATION: src/app/admin/orders/page.tsx
// ═══════════════════════════════════════════════════════════════

import { connectToDatabase } from "@/lib/mongodb";
import { ShoppingCart } from "lucide-react";
import OrderTableClient from "./OrderTableClient";

// ─── Types ─────────────────────────────────────────────────────

export interface OrderItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
    lineTotal: number;
}

export interface Order {
    _id: string;
    orderId: string;
    minecraftUsername: string;
    edition: string;
    utrNumber: string;
    items: OrderItem[];
    total: number;
    status: string;
    createdAt: string;
}

// ─── Data Fetcher ──────────────────────────────────────────────

async function getOrders(): Promise<Order[]> {
    try {
        const db = await connectToDatabase();
        const orders = await db
            .collection("orders")
            .find({})
            .sort({ createdAt: -1 })
            .toArray();

        return orders.map((order) => ({
            ...order,
            _id: order._id.toString(),
            createdAt: order.createdAt
                ? new Date(order.createdAt).toISOString()
                : new Date().toISOString(),
        })) as Order[];
    } catch (error) {
        console.error("Fetch orders error:", error);
        return [];
    }
}

// ═══════════════════════════════════════════════════════════════
// PAGE COMPONENT (Server)
// ═══════════════════════════════════════════════════════════════

export default async function AdminOrdersPage() {
    const orders = await getOrders();

    return (
        <div>
            {/* ── Page Header ── */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <ShoppingCart className="w-6 h-6 text-emerald-400" />
                    <h1 className="text-2xl md:text-3xl font-bold text-white">
                        Orders
                    </h1>
                </div>
                <p className="text-zinc-500 text-sm">
                    Manage and verify customer orders • {orders.length} total
                </p>
            </div>

            {/* ── Orders Table (Client Component for interactivity) ── */}
            <OrderTableClient orders={orders} />
        </div>
    );
}
