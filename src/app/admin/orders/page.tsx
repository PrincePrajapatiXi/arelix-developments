// ═══════════════════════════════════════════════════════════════
// FILE: page.tsx  (Admin Orders)
// PURPOSE: Displays all orders from MongoDB in a filterable table
//          with Approve / Reject actions for pending orders.
// LOCATION: src/app/admin/orders/page.tsx
// ═══════════════════════════════════════════════════════════════

import { connectToDatabase } from "@/lib/mongodb";
import { ShoppingCart, Download } from "lucide-react";
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

export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { Loader2 } from "lucide-react";

async function OrdersData() {
    const orders = await getOrders();
    return (
        <>
            {/* ── Page Header Data Update ── */}
            <p className="text-zinc-500 text-sm mb-8 -mt-6">
                Manage and verify customer orders • {orders.length} total
            </p>
            <OrderTableClient orders={orders} />
        </>
    );
}

export default function AdminOrdersPage() {
    return (
        <div>
            {/* ── Page Header (Instant Load) ── */}
            <div className="flex items-center justify-between mb-2">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <ShoppingCart className="w-6 h-6 text-emerald-400" />
                        <h1 className="text-2xl md:text-3xl font-bold text-white">
                            Orders
                        </h1>
                    </div>
                </div>
                <a
                    href="/api/admin/orders/export"
                    download
                    className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 rounded-xl text-sm font-medium hover:bg-emerald-500/25 transition-all"
                >
                    <Download className="w-4 h-4" />
                    Export CSV
                </a>
            </div>

            {/* ── Orders Table (Suspended) ── */}
            <Suspense fallback={
                <div className="flex flex-col items-center justify-center py-32">
                    <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mb-4" />
                    <p className="text-zinc-500 text-sm">Loading orders...</p>
                </div>
            }>
                <OrdersData />
            </Suspense>
        </div>
    );
}
