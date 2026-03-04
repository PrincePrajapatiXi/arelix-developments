// ═══════════════════════════════════════════════════════════════
// FILE: AnalyticsClient.tsx
// PURPOSE: Client-side interactive analytics with charts,
//          status donut, and top products table.
// LOCATION: src/app/admin/analytics/AnalyticsClient.tsx
// ═══════════════════════════════════════════════════════════════

"use client";

import { motion } from "framer-motion";
import {
    TrendingUp,
    DollarSign,
    ShoppingCart,
    Clock,
    Crown,
    CheckCircle2,
    XCircle,
    Activity,
} from "lucide-react";
import AnimatedNumber from "@/components/admin/AnimatedNumber";

// ─── Types ─────────────────────────────────────────────────────

interface ChartDay {
    date: string;
    label: string;
    revenue: number;
    orders: number;
}

interface HourlyData {
    hour: number;
    label: string;
    count: number;
}

interface TopProduct {
    _id: string;
    totalQty: number;
    totalRevenue: number;
    orderCount: number;
}

interface AnalyticsData {
    chartData: ChartDay[];
    statusBreakdown: Record<string, number>;
    topProducts: TopProduct[];
    hourlyData: HourlyData[];
    totalRevenue: number;
    totalOrders: number;
    last30DaysRevenue: number;
    last30DaysOrders: number;
}

// ═══════════════════════════════════════════════════════════════

export default function AnalyticsClient({ data }: { data: AnalyticsData }) {
    const maxDailyRevenue = Math.max(
        ...data.chartData.map((d) => d.revenue),
        1
    );
    const maxHourlyCount = Math.max(
        ...data.hourlyData.map((h) => h.count),
        1
    );
    const totalStatusOrders =
        data.statusBreakdown.pending +
        data.statusBreakdown.success +
        data.statusBreakdown.rejected;

    // ── Donut chart segments ────────────────────────────────────
    const statusColors = {
        success: { color: "#34d399", label: "Approved" },
        pending: { color: "#fbbf24", label: "Pending" },
        rejected: { color: "#f87171", label: "Rejected" },
    };

    const statusEntries = Object.entries(statusColors).map(([key, val]) => ({
        key,
        count: data.statusBreakdown[key] || 0,
        percentage:
            totalStatusOrders > 0
                ? ((data.statusBreakdown[key] || 0) / totalStatusOrders) * 100
                : 0,
        ...val,
    }));

    // Calculate stroke offsets for donut
    const circumference = 2 * Math.PI * 45;
    let cumulativeOffset = 0;
    const donutSegments = statusEntries.map((entry) => {
        const dashLength = (entry.percentage / 100) * circumference;
        const dashGap = circumference - dashLength;
        const offset = cumulativeOffset;
        cumulativeOffset += dashLength;
        return { ...entry, dashLength, dashGap, offset };
    });

    return (
        <div>
            {/* ── Summary Cards ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
                {[
                    {
                        title: "All-Time Revenue",
                        value: data.totalRevenue,
                        prefix: "₹",
                        decimals: 2,
                        icon: DollarSign,
                        color: "emerald",
                    },
                    {
                        title: "Last 30 Days Revenue",
                        value: data.last30DaysRevenue,
                        prefix: "₹",
                        decimals: 2,
                        icon: TrendingUp,
                        color: "cyan",
                    },
                    {
                        title: "Total Orders",
                        value: data.totalOrders,
                        prefix: "",
                        decimals: 0,
                        icon: ShoppingCart,
                        color: "blue",
                    },
                    {
                        title: "Last 30 Days Orders",
                        value: data.last30DaysOrders,
                        prefix: "",
                        decimals: 0,
                        icon: Activity,
                        color: "purple",
                    },
                ].map((card, i) => (
                    <motion.div
                        key={card.title}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className={`p-5 rounded-2xl bg-${card.color}-500/5 border border-${card.color}-500/20`}
                    >
                        <div
                            className={`w-9 h-9 rounded-lg bg-${card.color}-500/15 flex items-center justify-center mb-3`}
                        >
                            <card.icon
                                className={`w-4 h-4 text-${card.color}-400`}
                            />
                        </div>
                        <AnimatedNumber
                            value={card.value}
                            prefix={card.prefix}
                            decimals={card.decimals}
                            className={`text-xl font-bold text-${card.color}-400 block mb-1`}
                        />
                        <p className="text-zinc-400 text-xs">{card.title}</p>
                    </motion.div>
                ))}
            </div>

            {/* ── 30-Day Revenue Chart ── */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-zinc-900/50 border border-zinc-800/50 rounded-2xl p-6 mb-6"
            >
                <div className="flex items-center gap-2 mb-6">
                    <TrendingUp className="w-5 h-5 text-emerald-400" />
                    <h2 className="text-white font-semibold text-lg">
                        Revenue — Last 30 Days
                    </h2>
                </div>
                <div className="flex items-end gap-[3px] h-48 overflow-x-auto pb-2">
                    {data.chartData.map((day, i) => {
                        const barH =
                            maxDailyRevenue > 0
                                ? (day.revenue / maxDailyRevenue) * 100
                                : 0;
                        return (
                            <div
                                key={day.date}
                                className="flex-1 min-w-[12px] flex flex-col items-center gap-1.5 group relative"
                            >
                                {/* Tooltip */}
                                <div className="absolute -top-14 left-1/2 -translate-x-1/2 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap pointer-events-none">
                                    <p className="font-semibold">
                                        ₹{day.revenue.toFixed(0)}
                                    </p>
                                    <p className="text-zinc-400">
                                        {day.orders} order
                                        {day.orders !== 1 ? "s" : ""}
                                    </p>
                                </div>

                                {/* Bar */}
                                <motion.div
                                    initial={{ height: 0 }}
                                    animate={{
                                        height: `${Math.max(barH, 1)}%`,
                                    }}
                                    transition={{
                                        delay: 0.5 + i * 0.02,
                                        duration: 0.5,
                                    }}
                                    className={`w-full rounded-sm ${day.revenue > 0
                                            ? "bg-emerald-500/70 group-hover:bg-emerald-400 transition-colors"
                                            : "bg-zinc-800/50"
                                        }`}
                                    style={{ minHeight: "2px" }}
                                />
                                {/* Label — every 5th day */}
                                {i % 5 === 0 && (
                                    <span className="text-[9px] text-zinc-600">
                                        {day.label}
                                    </span>
                                )}
                            </div>
                        );
                    })}
                </div>
            </motion.div>

            {/* ── Row: Status Breakdown + Busiest Hours ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Donut Chart — Order Status */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-zinc-900/50 border border-zinc-800/50 rounded-2xl p-6"
                >
                    <div className="flex items-center gap-2 mb-6">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        <h2 className="text-white font-semibold">
                            Order Status Breakdown
                        </h2>
                    </div>

                    <div className="flex items-center justify-center gap-8">
                        {/* SVG Donut */}
                        <div className="relative w-32 h-32">
                            <svg
                                viewBox="0 0 100 100"
                                className="w-full h-full -rotate-90"
                            >
                                {/* Background circle */}
                                <circle
                                    cx="50"
                                    cy="50"
                                    r="45"
                                    fill="none"
                                    stroke="#27272a"
                                    strokeWidth="10"
                                />
                                {/* Segments */}
                                {donutSegments.map((seg) => (
                                    <circle
                                        key={seg.key}
                                        cx="50"
                                        cy="50"
                                        r="45"
                                        fill="none"
                                        stroke={seg.color}
                                        strokeWidth="10"
                                        strokeDasharray={`${seg.dashLength} ${seg.dashGap}`}
                                        strokeDashoffset={-seg.offset}
                                        strokeLinecap="round"
                                        className="transition-all duration-700"
                                    />
                                ))}
                            </svg>
                            {/* Center text */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-white font-bold text-lg">
                                    {totalStatusOrders}
                                </span>
                                <span className="text-zinc-500 text-[10px]">
                                    Total
                                </span>
                            </div>
                        </div>

                        {/* Legend */}
                        <div className="space-y-3">
                            {statusEntries.map((entry) => (
                                <div
                                    key={entry.key}
                                    className="flex items-center gap-3"
                                >
                                    <div
                                        className="w-3 h-3 rounded-full"
                                        style={{
                                            backgroundColor: entry.color,
                                        }}
                                    />
                                    <div>
                                        <p className="text-zinc-300 text-sm font-medium">
                                            {entry.label}
                                        </p>
                                        <p className="text-zinc-500 text-xs">
                                            {entry.count} (
                                            {entry.percentage.toFixed(0)}%)
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* Busiest Hours */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="bg-zinc-900/50 border border-zinc-800/50 rounded-2xl p-6"
                >
                    <div className="flex items-center gap-2 mb-6">
                        <Clock className="w-5 h-5 text-amber-400" />
                        <h2 className="text-white font-semibold">
                            Orders by Hour
                        </h2>
                    </div>
                    <div className="flex items-end gap-[2px] h-32">
                        {data.hourlyData.map((h, i) => {
                            const barH =
                                maxHourlyCount > 0
                                    ? (h.count / maxHourlyCount) * 100
                                    : 0;
                            return (
                                <div
                                    key={h.hour}
                                    className="flex-1 flex flex-col items-center gap-1 group relative"
                                >
                                    {/* Tooltip */}
                                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1 text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap pointer-events-none">
                                        {h.count} orders
                                    </div>
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{
                                            height: `${Math.max(barH, 2)}%`,
                                        }}
                                        transition={{
                                            delay: 0.7 + i * 0.03,
                                            duration: 0.4,
                                        }}
                                        className={`w-full rounded-sm ${h.count > 0
                                                ? "bg-amber-500/60 group-hover:bg-amber-400 transition-colors"
                                                : "bg-zinc-800/40"
                                            }`}
                                        style={{ minHeight: "2px" }}
                                    />
                                    {i % 4 === 0 && (
                                        <span className="text-[8px] text-zinc-600">
                                            {h.label}
                                        </span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </motion.div>
            </div>

            {/* ── Top Products Table ── */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="bg-zinc-900/50 border border-zinc-800/50 rounded-2xl p-6"
            >
                <div className="flex items-center gap-2 mb-6">
                    <Crown className="w-5 h-5 text-amber-400" />
                    <h2 className="text-white font-semibold">
                        Top Products by Revenue
                    </h2>
                </div>

                {data.topProducts.length === 0 ? (
                    <p className="text-zinc-600 text-sm text-center py-8">
                        No sales data yet
                    </p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-zinc-800/50">
                                    <th className="text-left text-[10px] text-zinc-600 uppercase tracking-wider px-3 py-2">
                                        #
                                    </th>
                                    <th className="text-left text-[10px] text-zinc-600 uppercase tracking-wider px-3 py-2">
                                        Product
                                    </th>
                                    <th className="text-right text-[10px] text-zinc-600 uppercase tracking-wider px-3 py-2">
                                        Qty Sold
                                    </th>
                                    <th className="text-right text-[10px] text-zinc-600 uppercase tracking-wider px-3 py-2">
                                        Orders
                                    </th>
                                    <th className="text-right text-[10px] text-zinc-600 uppercase tracking-wider px-3 py-2">
                                        Revenue
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.topProducts.map((p, idx) => (
                                    <tr
                                        key={p._id}
                                        className="border-b border-zinc-800/30 hover:bg-zinc-800/20 transition-colors"
                                    >
                                        <td className="px-3 py-3">
                                            <span
                                                className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold ${idx === 0
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
                                        </td>
                                        <td className="px-3 py-3 text-white text-sm font-medium">
                                            {p._id}
                                        </td>
                                        <td className="px-3 py-3 text-right text-zinc-400 text-sm">
                                            {p.totalQty}
                                        </td>
                                        <td className="px-3 py-3 text-right text-zinc-400 text-sm">
                                            {p.orderCount}
                                        </td>
                                        <td className="px-3 py-3 text-right text-emerald-400 text-sm font-semibold">
                                            ₹{p.totalRevenue.toFixed(2)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </motion.div>
        </div>
    );
}
