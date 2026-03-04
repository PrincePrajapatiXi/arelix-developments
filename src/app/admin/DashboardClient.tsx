// ═══════════════════════════════════════════════════════════════
// FILE: DashboardClient.tsx
// PURPOSE: Client-side dashboard with animated stat cards,
//          7-day revenue chart, recent orders, and top products.
// LOCATION: src/app/admin/DashboardClient.tsx
// ═══════════════════════════════════════════════════════════════

"use client";

import {
    DollarSign,
    ShoppingCart,
    Clock,
    Package,
    ArrowUpRight,
    CalendarDays,
    Users,
    CheckCircle2,
    XCircle,
    BarChart3,
    Crown,
} from "lucide-react";
import AnimatedNumber from "@/components/admin/AnimatedNumber";
import { motion } from "framer-motion";

// ─── Icon Map ──────────────────────────────────────────────────

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    DollarSign,
    ShoppingCart,
    Clock,
    Package,
    CalendarDays,
    Users,
};

// ─── Types ─────────────────────────────────────────────────────

interface StatCard {
    title: string;
    value: number;
    prefix: string;
    decimals: number;
    subtitle: string;
    icon: string;
    bgGradient: string;
    borderColor: string;
    iconBg: string;
    iconColor: string;
    textColor: string;
}

interface ChartDay {
    date: string;
    label: string;
    revenue: number;
    orders: number;
}

interface RecentOrder {
    _id: string;
    orderId: string;
    minecraftUsername: string;
    total: number;
    status: string;
    createdAt: string;
}

interface TopProduct {
    _id: string;
    totalQty: number;
    totalRevenue: number;
}

interface DashboardProps {
    statCards: StatCard[];
    chartData: ChartDay[];
    recentOrders: RecentOrder[];
    topProducts: TopProduct[];
    pendingOrders: number;
}

// ═══════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════

export default function DashboardClient({
    statCards,
    chartData,
    recentOrders,
    topProducts,
    pendingOrders,
}: DashboardProps) {
    const maxRevenue = Math.max(...chartData.map((d) => d.revenue), 1);

    // Status badge helper
    const getStatusBadge = (status: string) => {
        switch (status) {
            case "success":
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full text-[10px] font-medium">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        Approved
                    </span>
                );
            case "rejected":
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-full text-[10px] font-medium">
                        <XCircle className="w-2.5 h-2.5" />
                        Rejected
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-full text-[10px] font-medium">
                        <Clock className="w-2.5 h-2.5" />
                        Pending
                    </span>
                );
        }
    };

    return (
        <div>
            {/* ── Stats Grid (6 cards) ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5">
                {statCards.map((card, i) => {
                    const Icon = iconMap[card.icon] || Package;
                    return (
                        <motion.div
                            key={card.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                                duration: 0.4,
                                delay: i * 0.08,
                            }}
                            className={`
                                relative overflow-hidden rounded-2xl
                                bg-gradient-to-br ${card.bgGradient}
                                border ${card.borderColor}
                                p-5 transition-all duration-300
                                hover:scale-[1.02] hover:shadow-xl
                            `}
                        >
                            {/* Card Header */}
                            <div className="flex items-start justify-between mb-3">
                                <div
                                    className={`w-10 h-10 rounded-xl ${card.iconBg} flex items-center justify-center`}
                                >
                                    <Icon
                                        className={`w-5 h-5 ${card.iconColor}`}
                                    />
                                </div>
                                <ArrowUpRight className="w-4 h-4 text-zinc-600" />
                            </div>

                            {/* Card Value — Animated */}
                            <AnimatedNumber
                                value={card.value}
                                prefix={card.prefix}
                                decimals={card.decimals}
                                className={`text-2xl font-bold ${card.textColor} block mb-1`}
                            />

                            {/* Card Meta */}
                            <p className="text-zinc-300 text-sm font-medium">
                                {card.title}
                            </p>
                            <p className="text-zinc-600 text-xs mt-0.5">
                                {card.subtitle}
                            </p>

                            {/* Decoration */}
                            <div
                                className={`absolute -bottom-4 -right-4 w-24 h-24 ${card.iconBg} rounded-full blur-2xl opacity-40`}
                            />
                        </motion.div>
                    );
                })}
            </div>

            {/* ── 7-Day Revenue Chart ── */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="mt-8 bg-zinc-900/50 border border-zinc-800/50 rounded-2xl p-6"
            >
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-emerald-400" />
                        <h2 className="text-white font-semibold text-lg">
                            Revenue — Last 7 Days
                        </h2>
                    </div>
                    <p className="text-zinc-500 text-xs">
                        ₹
                        {chartData
                            .reduce((sum, d) => sum + d.revenue, 0)
                            .toFixed(2)}{" "}
                        total
                    </p>
                </div>

                {/* Chart Bars */}
                <div className="flex items-end gap-2 sm:gap-3 h-44">
                    {chartData.map((day, i) => {
                        const barHeight =
                            maxRevenue > 0
                                ? (day.revenue / maxRevenue) * 100
                                : 0;
                        return (
                            <div
                                key={day.date}
                                className="flex-1 flex flex-col items-center gap-2"
                            >
                                {/* Revenue Label */}
                                <span className="text-[10px] text-zinc-500 font-mono">
                                    {day.revenue > 0
                                        ? `₹${day.revenue.toFixed(0)}`
                                        : "—"}
                                </span>

                                {/* Bar */}
                                <motion.div
                                    initial={{ height: 0 }}
                                    animate={{
                                        height: `${Math.max(barHeight, 2)}%`,
                                    }}
                                    transition={{
                                        delay: 0.7 + i * 0.08,
                                        duration: 0.6,
                                        ease: "easeOut",
                                    }}
                                    className={`w-full rounded-lg ${day.revenue > 0
                                        ? "bg-gradient-to-t from-emerald-600 to-emerald-400"
                                        : "bg-zinc-800"
                                        }`}
                                    style={{ minHeight: "4px" }}
                                />

                                {/* Day Label */}
                                <span className="text-[11px] text-zinc-500 font-medium">
                                    {day.label}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </motion.div>

            {/* ── Bottom Widgets: Recent Orders + Top Products ── */}
            <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* ── Recent Orders ── */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7, duration: 0.4 }}
                    className="bg-zinc-900/50 border border-zinc-800/50 rounded-2xl p-6"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <ShoppingCart className="w-5 h-5 text-blue-400" />
                            <h2 className="text-white font-semibold">
                                Recent Orders
                            </h2>
                        </div>
                        <a
                            href="/admin/orders"
                            className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
                        >
                            View All →
                        </a>
                    </div>

                    {recentOrders.length === 0 ? (
                        <p className="text-zinc-600 text-sm text-center py-8">
                            No orders yet
                        </p>
                    ) : (
                        <div className="space-y-3">
                            {recentOrders.map((order) => (
                                <div
                                    key={order._id}
                                    className="flex items-center justify-between py-2.5 px-3 bg-zinc-800/30 rounded-xl border border-zinc-800/30 hover:border-zinc-700/50 transition-colors"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center shrink-0">
                                            <Users className="w-4 h-4 text-zinc-400" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-white text-sm font-medium truncate">
                                                {order.minecraftUsername}
                                            </p>
                                            <p className="text-zinc-600 text-[10px] font-mono">
                                                {order.orderId}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 shrink-0">
                                        {getStatusBadge(order.status)}
                                        <span className="text-emerald-400 font-semibold text-sm">
                                            ₹{order.total.toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </motion.div>

                {/* ── Top Selling Products ── */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8, duration: 0.4 }}
                    className="bg-zinc-900/50 border border-zinc-800/50 rounded-2xl p-6"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Crown className="w-5 h-5 text-amber-400" />
                            <h2 className="text-white font-semibold">
                                Top Products
                            </h2>
                        </div>
                        <a
                            href="/admin/products"
                            className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
                        >
                            Manage →
                        </a>
                    </div>

                    {topProducts.length === 0 ? (
                        <p className="text-zinc-600 text-sm text-center py-8">
                            No sales data yet
                        </p>
                    ) : (
                        <div className="space-y-3">
                            {topProducts.map((product, idx) => {
                                const topRevenue = topProducts[0]?.totalRevenue || 1;
                                const barWidth =
                                    (product.totalRevenue / topRevenue) * 100;
                                return (
                                    <div key={product._id} className="group">
                                        <div className="flex items-center justify-between mb-1.5">
                                            <div className="flex items-center gap-2.5">
                                                <span
                                                    className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold ${idx === 0
                                                        ? "bg-amber-500/20 text-amber-400"
                                                        : idx === 1
                                                            ? "bg-zinc-500/20 text-zinc-300"
                                                            : idx === 2
                                                                ? "bg-orange-500/20 text-orange-400"
                                                                : "bg-zinc-800 text-zinc-500"
                                                        }`}
                                                >
                                                    {idx + 1}
                                                </span>
                                                <span className="text-white text-sm font-medium">
                                                    {product._id}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3 text-xs">
                                                <span className="text-zinc-500">
                                                    {product.totalQty} sold
                                                </span>
                                                <span className="text-emerald-400 font-semibold">
                                                    ₹
                                                    {product.totalRevenue.toFixed(
                                                        0
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                        {/* Revenue bar */}
                                        <div className="h-1.5 bg-zinc-800/50 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{
                                                    width: `${barWidth}%`,
                                                }}
                                                transition={{
                                                    delay: 1 + idx * 0.1,
                                                    duration: 0.6,
                                                    ease: "easeOut",
                                                }}
                                                className={`h-full rounded-full ${idx === 0
                                                    ? "bg-gradient-to-r from-amber-500 to-amber-400"
                                                    : "bg-gradient-to-r from-emerald-600 to-emerald-400"
                                                    }`}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </motion.div>
            </div>

            {/* ── Quick Actions ── */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9, duration: 0.4 }}
                className="mt-6 bg-zinc-900/50 border border-zinc-800/50 rounded-2xl p-6"
            >
                <h2 className="text-white font-semibold text-lg mb-2">
                    Quick Actions
                </h2>
                <p className="text-zinc-500 text-sm mb-4">
                    Jump to common tasks
                </p>
                <div className="flex flex-wrap gap-3">
                    <a
                        href="/admin/orders"
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl text-sm font-medium hover:bg-amber-500/20 transition-all"
                    >
                        <Clock className="w-4 h-4" />
                        Review Pending Orders
                        {pendingOrders > 0 && (
                            <span className="bg-amber-500 text-black text-xs font-bold px-2 py-0.5 rounded-full">
                                {pendingOrders}
                            </span>
                        )}
                    </a>
                    <a
                        href="/admin/products"
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-xl text-sm font-medium hover:bg-purple-500/20 transition-all"
                    >
                        <Package className="w-4 h-4" />
                        Manage Products
                    </a>
                    <a
                        href="/admin/analytics"
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl text-sm font-medium hover:bg-blue-500/20 transition-all"
                    >
                        <BarChart3 className="w-4 h-4" />
                        View Analytics
                    </a>
                    <a
                        href="/admin/customers"
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-pink-500/10 border border-pink-500/20 text-pink-400 rounded-xl text-sm font-medium hover:bg-pink-500/20 transition-all"
                    >
                        <Users className="w-4 h-4" />
                        View Customers
                    </a>
                </div>
            </motion.div>
        </div>
    );
}
