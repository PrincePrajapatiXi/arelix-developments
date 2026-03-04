// ═══════════════════════════════════════════════════════════════
// FILE: ActivityClient.tsx
// PURPOSE: Timeline-style view of admin actions showing who did
//          what and when (coupon CRUD, order actions, etc.)
// LOCATION: src/app/admin/activity/ActivityClient.tsx
// ═══════════════════════════════════════════════════════════════

"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
    ScrollText,
    CheckCircle2,
    XCircle,
    Package,
    Ticket,
    Trash2,
    Settings,
    Edit,
    PlusCircle,
    BarChart3,
} from "lucide-react";

// ─── Types ─────────────────────────────────────────────────────

interface ActivityLog {
    _id: string;
    action: string;
    entity: string;
    details: string;
    timestamp: string;
}

// ─── Action Metadata (icons + colors + labels) ─────────────────

const actionMeta: Record<
    string,
    { icon: React.ElementType; color: string; label: string }
> = {
    order_approved: {
        icon: CheckCircle2,
        color: "text-emerald-400 bg-emerald-500/10",
        label: "Order Approved",
    },
    order_rejected: {
        icon: XCircle,
        color: "text-red-400 bg-red-500/10",
        label: "Order Rejected",
    },
    product_created: {
        icon: PlusCircle,
        color: "text-blue-400 bg-blue-500/10",
        label: "Product Created",
    },
    product_updated: {
        icon: Edit,
        color: "text-amber-400 bg-amber-500/10",
        label: "Product Updated",
    },
    product_deleted: {
        icon: Trash2,
        color: "text-red-400 bg-red-500/10",
        label: "Product Deleted",
    },
    coupon_created: {
        icon: Ticket,
        color: "text-purple-400 bg-purple-500/10",
        label: "Coupon Created",
    },
    coupon_deleted: {
        icon: Trash2,
        color: "text-red-400 bg-red-500/10",
        label: "Coupon Deleted",
    },
    settings_updated: {
        icon: Settings,
        color: "text-zinc-400 bg-zinc-500/10",
        label: "Settings Updated",
    },
    stock_updated: {
        icon: Package,
        color: "text-cyan-400 bg-cyan-500/10",
        label: "Stock Updated",
    },
};

const defaultMeta = {
    icon: BarChart3,
    color: "text-zinc-400 bg-zinc-500/10",
    label: "Action",
};

// ═══════════════════════════════════════════════════════════════

export default function ActivityClient({ logs }: { logs: ActivityLog[] }) {
    const [visibleCount, setVisibleCount] = useState(30);
    const visible = logs.slice(0, visibleCount);

    return (
        <div>
            {/* ── Header ── */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <ScrollText className="w-6 h-6 text-emerald-400" />
                    <h1 className="text-2xl md:text-3xl font-bold text-white">
                        Activity Log
                    </h1>
                </div>
                <p className="text-zinc-500 text-sm">
                    Recent admin actions and changes • {logs.length} total
                </p>
            </div>

            {/* ── Timeline ── */}
            {logs.length === 0 ? (
                <div className="text-center py-16 bg-zinc-900/50 border border-zinc-800/50 rounded-2xl">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-zinc-800/50 rounded-2xl mb-3">
                        <ScrollText className="w-8 h-8 text-zinc-600" />
                    </div>
                    <p className="text-zinc-500 text-sm">
                        No activity yet. Actions will appear here.
                    </p>
                </div>
            ) : (
                <div className="space-y-2">
                    {visible.map((log, idx) => {
                        const meta = actionMeta[log.action] || defaultMeta;
                        const Icon = meta.icon;
                        const date = new Date(log.timestamp);

                        return (
                            <motion.div
                                key={log._id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.02 }}
                                className="flex items-start gap-4 p-4 bg-zinc-900/70 border border-zinc-800/50 rounded-2xl hover:border-zinc-700/50 transition-all"
                            >
                                {/* Icon */}
                                <div
                                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${meta.color}`}
                                >
                                    <Icon className="w-4 h-4" />
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <span className="text-white text-sm font-medium">
                                            {meta.label}
                                        </span>
                                        <code className="text-xs text-zinc-400 bg-zinc-800/50 px-1.5 py-0.5 rounded font-mono truncate max-w-[200px]">
                                            {log.entity}
                                        </code>
                                    </div>
                                    {log.details && (
                                        <p className="text-zinc-500 text-xs">
                                            {log.details}
                                        </p>
                                    )}
                                </div>

                                {/* Time */}
                                <div className="text-zinc-600 text-xs shrink-0 text-right">
                                    <div>
                                        {date.toLocaleDateString("en-IN", {
                                            day: "2-digit",
                                            month: "short",
                                        })}
                                    </div>
                                    <div>
                                        {date.toLocaleTimeString("en-IN", {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}

                    {/* Load More */}
                    {visibleCount < logs.length && (
                        <button
                            onClick={() =>
                                setVisibleCount((c) => c + 30)
                            }
                            className="w-full py-3 text-center text-xs text-zinc-500 hover:text-white bg-zinc-900/50 border border-zinc-800/50 rounded-2xl transition-all cursor-pointer"
                        >
                            Load more ({logs.length - visibleCount} remaining)
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
