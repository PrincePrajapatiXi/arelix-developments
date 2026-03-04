// ═══════════════════════════════════════════════════════════════
// FILE: CustomersClient.tsx
// PURPOSE: Client-side customer list with search, sort, and
//          expandable order history.
// LOCATION: src/app/admin/customers/CustomersClient.tsx
// ═══════════════════════════════════════════════════════════════

"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Search,
    ArrowUpDown,
    ChevronDown,
    ChevronUp,
    User,
    ShoppingCart,
    DollarSign,
    Calendar,
    CheckCircle2,
    XCircle,
    Clock,
    Crown,
    XCircle as XIcon,
} from "lucide-react";

// ─── Types ─────────────────────────────────────────────────────

interface OrderItem {
    name: string;
    quantity: number;
    lineTotal: number;
}

interface CustomerOrder {
    orderId: string;
    total: number;
    status: string;
    createdAt: string;
    items: OrderItem[];
}

interface Customer {
    username: string;
    totalOrders: number;
    totalSpend: number;
    lastOrderDate: string;
    editions: string[];
    orders: CustomerOrder[];
}

type SortKey = "spend" | "orders" | "recent";

// ═══════════════════════════════════════════════════════════════

export default function CustomersClient({
    customers,
}: {
    customers: Customer[];
}) {
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState<SortKey>("spend");
    const [expandedUser, setExpandedUser] = useState<string | null>(null);

    const sortedCustomers = useMemo(() => {
        let result = [...customers];

        // Search
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase().trim();
            result = result.filter((c) =>
                c.username.toLowerCase().includes(q)
            );
        }

        // Sort
        switch (sortBy) {
            case "spend":
                result.sort((a, b) => b.totalSpend - a.totalSpend);
                break;
            case "orders":
                result.sort((a, b) => b.totalOrders - a.totalOrders);
                break;
            case "recent":
                result.sort(
                    (a, b) =>
                        new Date(b.lastOrderDate).getTime() -
                        new Date(a.lastOrderDate).getTime()
                );
                break;
        }

        return result;
    }, [customers, searchQuery, sortBy]);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "success":
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-full text-[10px] font-medium">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        Approved
                    </span>
                );
            case "rejected":
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-500/10 text-red-400 rounded-full text-[10px] font-medium">
                        <XCircle className="w-2.5 h-2.5" />
                        Rejected
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-500/10 text-amber-400 rounded-full text-[10px] font-medium">
                        <Clock className="w-2.5 h-2.5" />
                        Pending
                    </span>
                );
        }
    };

    return (
        <div>
            {/* ── Search + Sort ── */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input
                        type="text"
                        placeholder="Search by username..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-zinc-800/50 border border-zinc-700/50 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors cursor-pointer"
                        >
                            <XIcon className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {/* Sort */}
                <div className="flex items-center gap-2">
                    <ArrowUpDown className="w-4 h-4 text-zinc-500" />
                    {(
                        [
                            { key: "spend", label: "Top Spenders" },
                            { key: "orders", label: "Most Orders" },
                            { key: "recent", label: "Most Recent" },
                        ] as { key: SortKey; label: string }[]
                    ).map((sort) => (
                        <button
                            key={sort.key}
                            onClick={() => setSortBy(sort.key)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${sortBy === sort.key
                                    ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                                    : "bg-zinc-800/50 text-zinc-400 border border-zinc-700/50 hover:text-white"
                                }`}
                        >
                            {sort.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Results */}
            {searchQuery && (
                <p className="text-zinc-500 text-xs mb-4">
                    Found {sortedCustomers.length} customer
                    {sortedCustomers.length !== 1 ? "s" : ""}
                </p>
            )}

            {/* ── Customer List ── */}
            {sortedCustomers.length === 0 ? (
                <div className="text-center py-16 bg-zinc-900/50 border border-zinc-800/50 rounded-2xl">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-zinc-800/50 rounded-2xl mb-3">
                        <User className="w-8 h-8 text-zinc-600" />
                    </div>
                    <p className="text-zinc-500 text-sm">
                        No customers found
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {sortedCustomers.map((customer, idx) => (
                        <motion.div
                            key={customer.username}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.03 }}
                            className="bg-zinc-900/70 border border-zinc-800/50 rounded-2xl overflow-hidden hover:border-zinc-700/50 transition-all"
                        >
                            {/* Customer Row */}
                            <button
                                onClick={() =>
                                    setExpandedUser(
                                        expandedUser === customer.username
                                            ? null
                                            : customer.username
                                    )
                                }
                                className="w-full flex items-center justify-between p-4 md:p-5 cursor-pointer text-left"
                            >
                                <div className="flex items-center gap-4">
                                    {/* Rank Badge */}
                                    <div
                                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${idx === 0
                                                ? "bg-amber-500/15"
                                                : idx === 1
                                                    ? "bg-zinc-500/15"
                                                    : idx === 2
                                                        ? "bg-orange-500/15"
                                                        : "bg-zinc-800/50"
                                            }`}
                                    >
                                        {idx < 3 ? (
                                            <Crown
                                                className={`w-5 h-5 ${idx === 0
                                                        ? "text-amber-400"
                                                        : idx === 1
                                                            ? "text-zinc-300"
                                                            : "text-orange-400"
                                                    }`}
                                            />
                                        ) : (
                                            <User className="w-5 h-5 text-zinc-500" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-white font-medium font-mono text-sm">
                                            {customer.username}
                                        </p>
                                        <p className="text-zinc-600 text-xs">
                                            {customer.editions.join(", ")} •
                                            Last order{" "}
                                            {new Date(
                                                customer.lastOrderDate
                                            ).toLocaleDateString("en-IN", {
                                                day: "2-digit",
                                                month: "short",
                                            })}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6">
                                    {/* Stats */}
                                    <div className="hidden sm:flex items-center gap-5">
                                        <div className="text-right">
                                            <p className="text-zinc-500 text-[10px] uppercase tracking-wider">
                                                Orders
                                            </p>
                                            <p className="text-blue-400 font-semibold text-sm">
                                                {customer.totalOrders}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-zinc-500 text-[10px] uppercase tracking-wider">
                                                Total Spent
                                            </p>
                                            <p className="text-emerald-400 font-semibold text-sm">
                                                ₹{customer.totalSpend.toFixed(2)}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Expand Icon */}
                                    {expandedUser === customer.username ? (
                                        <ChevronUp className="w-5 h-5 text-zinc-500" />
                                    ) : (
                                        <ChevronDown className="w-5 h-5 text-zinc-500" />
                                    )}
                                </div>
                            </button>

                            {/* Expanded Order History */}
                            <AnimatePresence>
                                {expandedUser === customer.username && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{
                                            height: "auto",
                                            opacity: 1,
                                        }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="px-4 pb-4 md:px-5 md:pb-5 border-t border-zinc-800/50 pt-4">
                                            {/* Mobile stats */}
                                            <div className="flex sm:hidden items-center gap-4 mb-4">
                                                <div className="flex items-center gap-1.5 text-xs">
                                                    <ShoppingCart className="w-3.5 h-3.5 text-blue-400" />
                                                    <span className="text-zinc-400">
                                                        {customer.totalOrders}{" "}
                                                        orders
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1.5 text-xs">
                                                    <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                                                    <span className="text-zinc-400">
                                                        ₹
                                                        {customer.totalSpend.toFixed(
                                                            2
                                                        )}{" "}
                                                        total
                                                    </span>
                                                </div>
                                            </div>

                                            <p className="text-zinc-500 text-xs font-semibold uppercase tracking-wider mb-3">
                                                Order History
                                            </p>
                                            <div className="space-y-2">
                                                {customer.orders
                                                    .sort(
                                                        (a, b) =>
                                                            new Date(
                                                                b.createdAt
                                                            ).getTime() -
                                                            new Date(
                                                                a.createdAt
                                                            ).getTime()
                                                    )
                                                    .map((order) => (
                                                        <div
                                                            key={order.orderId}
                                                            className="flex items-center justify-between py-2.5 px-3 bg-zinc-800/30 rounded-xl"
                                                        >
                                                            <div className="flex items-center gap-3 min-w-0">
                                                                <code className="text-[10px] text-zinc-600 font-mono">
                                                                    {
                                                                        order.orderId
                                                                    }
                                                                </code>
                                                                {getStatusBadge(
                                                                    order.status
                                                                )}
                                                            </div>
                                                            <div className="flex items-center gap-3 shrink-0">
                                                                <span className="text-zinc-500 text-xs hidden md:block">
                                                                    {order.items
                                                                        .map(
                                                                            (
                                                                                i
                                                                            ) =>
                                                                                i.name
                                                                        )
                                                                        .join(
                                                                            ", "
                                                                        )}
                                                                </span>
                                                                <span className="text-emerald-400 font-semibold text-sm">
                                                                    ₹
                                                                    {order.total.toFixed(
                                                                        2
                                                                    )}
                                                                </span>
                                                                <span className="text-zinc-600 text-[10px]">
                                                                    {new Date(
                                                                        order.createdAt
                                                                    ).toLocaleDateString(
                                                                        "en-IN",
                                                                        {
                                                                            day: "2-digit",
                                                                            month: "short",
                                                                        }
                                                                    )}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ))}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
