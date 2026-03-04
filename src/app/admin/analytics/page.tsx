// ═══════════════════════════════════════════════════════════════
// FILE: page.tsx  (Admin Analytics)
// PURPOSE: Analytics page with 30-day revenue chart,
//          order status breakdown, top products table.
// LOCATION: src/app/admin/analytics/page.tsx
// ═══════════════════════════════════════════════════════════════

import { connectToDatabase } from "@/lib/mongodb";
import { BarChart3 } from "lucide-react";
import AnalyticsClient from "./AnalyticsClient";

// ─── Data Fetcher ──────────────────────────────────────────────

async function getAnalyticsData() {
    try {
        const db = await connectToDatabase();
        const ordersCol = db.collection("orders");

        const now = new Date();
        const thirtyDaysAgo = new Date(now);
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
        thirtyDaysAgo.setHours(0, 0, 0, 0);

        const [
            dailyRevenueResult,
            statusBreakdownResult,
            topProductsResult,
            hourlyResult,
            totalRevenueResult,
            totalOrdersCount,
        ] = await Promise.all([
            // 30-day daily revenue
            ordersCol
                .aggregate([
                    {
                        $match: {
                            status: "success",
                            createdAt: { $gte: thirtyDaysAgo },
                        },
                    },
                    {
                        $group: {
                            _id: {
                                $dateToString: {
                                    format: "%Y-%m-%d",
                                    date: { $toDate: "$createdAt" },
                                },
                            },
                            revenue: { $sum: "$total" },
                            orders: { $sum: 1 },
                        },
                    },
                    { $sort: { _id: 1 } },
                ])
                .toArray(),

            // Order status breakdown
            ordersCol
                .aggregate([
                    {
                        $group: {
                            _id: "$status",
                            count: { $sum: 1 },
                        },
                    },
                ])
                .toArray(),

            // Top 10 products by revenue
            ordersCol
                .aggregate([
                    { $match: { status: "success" } },
                    { $unwind: "$items" },
                    {
                        $group: {
                            _id: "$items.name",
                            totalQty: { $sum: "$items.quantity" },
                            totalRevenue: { $sum: "$items.lineTotal" },
                            orderCount: { $sum: 1 },
                        },
                    },
                    { $sort: { totalRevenue: -1 } },
                    { $limit: 10 },
                ])
                .toArray(),

            // Orders by hour of day
            ordersCol
                .aggregate([
                    {
                        $group: {
                            _id: {
                                $hour: { $toDate: "$createdAt" },
                            },
                            count: { $sum: 1 },
                        },
                    },
                    { $sort: { _id: 1 } },
                ])
                .toArray(),

            // Total revenue
            ordersCol
                .aggregate([
                    { $match: { status: "success" } },
                    { $group: { _id: null, total: { $sum: "$total" } } },
                ])
                .toArray(),

            // Total orders
            ordersCol.countDocuments(),
        ]);

        // Build 30-day chart data
        const dailyMap: Record<string, { revenue: number; orders: number }> = {};
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        dailyRevenueResult.forEach((d: any) => {
            dailyMap[d._id] = { revenue: d.revenue, orders: d.orders };
        });

        const chartData: {
            date: string;
            label: string;
            revenue: number;
            orders: number;
        }[] = [];
        for (let i = 29; i >= 0; i--) {
            const d = new Date(now);
            d.setDate(d.getDate() - i);
            const key = d.toISOString().split("T")[0];
            const label = d.toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
            });
            const entry = dailyMap[key];
            chartData.push({
                date: key,
                label,
                revenue: entry ? entry.revenue : 0,
                orders: entry ? entry.orders : 0,
            });
        }

        // Status breakdown
        const statusMap: Record<string, number> = {
            pending: 0,
            success: 0,
            rejected: 0,
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        statusBreakdownResult.forEach((s: any) => {
            if (s._id in statusMap) statusMap[s._id] = s.count;
        });

        // Hourly distribution (0-23)
        const hourlyData: { hour: number; label: string; count: number }[] = [];
        const hourlyMap: Record<number, number> = {};
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        hourlyResult.forEach((h: any) => {
            hourlyMap[h._id] = h.count;
        });
        for (let h = 0; h < 24; h++) {
            const ampm = h === 0 ? "12am" : h < 12 ? `${h}am` : h === 12 ? "12pm" : `${h - 12}pm`;
            hourlyData.push({
                hour: h,
                label: ampm,
                count: hourlyMap[h] || 0,
            });
        }

        return {
            chartData,
            statusBreakdown: statusMap,
            topProducts: topProductsResult as {
                _id: string;
                totalQty: number;
                totalRevenue: number;
                orderCount: number;
            }[],
            hourlyData,
            totalRevenue:
                totalRevenueResult.length > 0 ? totalRevenueResult[0].total : 0,
            totalOrders: totalOrdersCount,
            last30DaysRevenue: chartData.reduce((s, d) => s + d.revenue, 0),
            last30DaysOrders: chartData.reduce((s, d) => s + d.orders, 0),
        };
    } catch (error) {
        console.error("Analytics data error:", error);
        return {
            chartData: [],
            statusBreakdown: { pending: 0, success: 0, rejected: 0 },
            topProducts: [],
            hourlyData: [],
            totalRevenue: 0,
            totalOrders: 0,
            last30DaysRevenue: 0,
            last30DaysOrders: 0,
        };
    }
}

// ═══════════════════════════════════════════════════════════════

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
    const data = await getAnalyticsData();

    return (
        <div>
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <BarChart3 className="w-6 h-6 text-emerald-400" />
                    <h1 className="text-2xl md:text-3xl font-bold text-white">
                        Analytics
                    </h1>
                </div>
                <p className="text-zinc-500 text-sm">
                    Detailed insights about your store performance
                </p>
            </div>

            <AnalyticsClient data={data} />
        </div>
    );
}
