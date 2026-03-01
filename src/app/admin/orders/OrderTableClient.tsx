// ═══════════════════════════════════════════════════════════════
// FILE: OrderTableClient.tsx
// PURPOSE: Client-side interactive table for orders with
//          filter tabs, approve/reject buttons, and loading states.
// LOCATION: src/app/admin/orders/OrderTableClient.tsx
// ═══════════════════════════════════════════════════════════════

"use client";

import { useState, useTransition } from "react";
import {
    CheckCircle2,
    XCircle,
    Clock,
    Loader2,
    Filter,
    User,
    CreditCard,
    Calendar,
} from "lucide-react";
import { approveOrder, rejectOrder } from "./actions";
import type { Order } from "./page";

// ─── Filter Tabs ───────────────────────────────────────────────

type FilterTab = "all" | "pending" | "success" | "rejected";

const filterTabs: { key: FilterTab; label: string }[] = [
    { key: "all", label: "All" },
    { key: "pending", label: "Pending" },
    { key: "success", label: "Approved" },
    { key: "rejected", label: "Rejected" },
];

// ═══════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════

export default function OrderTableClient({ orders }: { orders: Order[] }) {
    const [filter, setFilter] = useState<FilterTab>("all");
    const [loadingId, setLoadingId] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    const filteredOrders =
        filter === "all"
            ? orders
            : orders.filter((o) => o.status === filter);

    // ── Handle Approve ─────────────────────────────────────────
    const handleApprove = (id: string) => {
        setLoadingId(id);
        startTransition(async () => {
            await approveOrder(id);
            setLoadingId(null);
        });
    };

    // ── Handle Reject ──────────────────────────────────────────
    const handleReject = (id: string) => {
        setLoadingId(id);
        startTransition(async () => {
            await rejectOrder(id);
            setLoadingId(null);
        });
    };

    // ── Status Badge ───────────────────────────────────────────
    const getStatusBadge = (status: string) => {
        switch (status) {
            case "success":
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full text-xs font-medium">
                        <CheckCircle2 className="w-3 h-3" />
                        Approved
                    </span>
                );
            case "rejected":
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-400 rounded-full text-xs font-medium">
                        <XCircle className="w-3 h-3" />
                        Rejected
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-full text-xs font-medium">
                        <Clock className="w-3 h-3" />
                        Pending
                    </span>
                );
        }
    };

    return (
        <div>
            {/* ── Filter Tabs ── */}
            <div className="flex items-center gap-2 mb-6 flex-wrap">
                <Filter className="w-4 h-4 text-zinc-500" />
                {filterTabs.map((tab) => {
                    const count =
                        tab.key === "all"
                            ? orders.length
                            : orders.filter((o) => o.status === tab.key).length;
                    return (
                        <button
                            key={tab.key}
                            onClick={() => setFilter(tab.key)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${filter === tab.key
                                    ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                                    : "bg-zinc-800/50 text-zinc-400 border border-zinc-700/50 hover:text-white hover:bg-zinc-800"
                                }`}
                        >
                            {tab.label}
                            <span className="ml-1.5 text-xs opacity-60">
                                ({count})
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* ── Orders Table / Cards ── */}
            {filteredOrders.length === 0 ? (
                <div className="text-center py-16 bg-zinc-900/50 border border-zinc-800/50 rounded-2xl">
                    <ShoppingCartEmpty />
                    <p className="text-zinc-500 text-sm mt-2">
                        No orders found for this filter.
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredOrders.map((order) => (
                        <div
                            key={order._id}
                            className={`bg-zinc-900/70 border rounded-2xl p-4 md:p-5 transition-all duration-200 hover:bg-zinc-900 ${order.status === "pending"
                                    ? "border-amber-500/20"
                                    : "border-zinc-800/50"
                                }`}
                        >
                            {/* Top Row: Order ID + Status + Date */}
                            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                                <div className="flex items-center gap-3">
                                    <code className="text-xs text-zinc-500 bg-zinc-800/50 px-2.5 py-1 rounded-lg font-mono">
                                        {order.orderId}
                                    </code>
                                    {getStatusBadge(order.status)}
                                </div>
                                <div className="flex items-center gap-1.5 text-zinc-600 text-xs">
                                    <Calendar className="w-3 h-3" />
                                    {new Date(order.createdAt).toLocaleDateString(
                                        "en-IN",
                                        {
                                            day: "2-digit",
                                            month: "short",
                                            year: "numeric",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        }
                                    )}
                                </div>
                            </div>

                            {/* Middle Row: Player + Items + UTR + Amount */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                                {/* Player */}
                                <div className="flex items-center gap-2">
                                    <User className="w-4 h-4 text-zinc-600 shrink-0" />
                                    <div>
                                        <p className="text-[10px] text-zinc-600 uppercase tracking-wider">
                                            Player
                                        </p>
                                        <p className="text-white text-sm font-mono font-medium">
                                            {order.minecraftUsername}
                                        </p>
                                    </div>
                                </div>

                                {/* Items */}
                                <div>
                                    <p className="text-[10px] text-zinc-600 uppercase tracking-wider mb-0.5">
                                        Items
                                    </p>
                                    <p className="text-zinc-300 text-sm">
                                        {order.items
                                            .map(
                                                (i) =>
                                                    `${i.name}${i.quantity > 1 ? ` ×${i.quantity}` : ""}`
                                            )
                                            .join(", ")}
                                    </p>
                                </div>

                                {/* UTR */}
                                <div className="flex items-center gap-2">
                                    <CreditCard className="w-4 h-4 text-zinc-600 shrink-0" />
                                    <div>
                                        <p className="text-[10px] text-zinc-600 uppercase tracking-wider">
                                            UTR
                                        </p>
                                        <p className="text-amber-400 text-sm font-mono font-medium tracking-wider">
                                            {order.utrNumber}
                                        </p>
                                    </div>
                                </div>

                                {/* Amount */}
                                <div>
                                    <p className="text-[10px] text-zinc-600 uppercase tracking-wider">
                                        Amount
                                    </p>
                                    <p className="text-emerald-400 text-lg font-bold">
                                        ₹{order.total.toFixed(2)}
                                    </p>
                                </div>
                            </div>

                            {/* Bottom Row: Action Buttons (only for pending) */}
                            {order.status === "pending" && (
                                <div className="flex items-center gap-2 pt-3 border-t border-zinc-800/50">
                                    <button
                                        onClick={() => handleApprove(order._id)}
                                        disabled={
                                            isPending && loadingId === order._id
                                        }
                                        className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-sm font-medium hover:bg-emerald-500/20 transition-all disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                                    >
                                        {isPending &&
                                            loadingId === order._id ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <CheckCircle2 className="w-4 h-4" />
                                        )}
                                        Approve
                                    </button>
                                    <button
                                        onClick={() => handleReject(order._id)}
                                        disabled={
                                            isPending && loadingId === order._id
                                        }
                                        className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm font-medium hover:bg-red-500/20 transition-all disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                                    >
                                        {isPending &&
                                            loadingId === order._id ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <XCircle className="w-4 h-4" />
                                        )}
                                        Reject
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// ── Empty State Icon ───────────────────────────────────────────

function ShoppingCartEmpty() {
    return (
        <div className="inline-flex items-center justify-center w-16 h-16 bg-zinc-800/50 rounded-2xl mb-3">
            <Clock className="w-8 h-8 text-zinc-600" />
        </div>
    );
}
