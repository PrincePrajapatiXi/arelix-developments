// ═══════════════════════════════════════════════════════════════
// FILE: page.tsx  (Admin Dashboard — Enhanced)
// PURPOSE: Rich dashboard with stats, 7-day revenue chart,
//          recent orders, and top-selling products.
// LOCATION: src/app/admin/page.tsx
// ═══════════════════════════════════════════════════════════════


import { connectToDatabase } from "@/lib/mongodb";
import DashboardClient from "./DashboardClient";

// ─── Data Fetcher ──────────────────────────────────────────────

async function getDashboardData() {
    try {
        const db = await connectToDatabase();
        const ordersCol = db.collection("orders");
        const productsCol = db.collection("products");

        // Today boundaries (IST approximation — UTC+5:30)
        const now = new Date();
        const todayStart = new Date(now);
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date(now);
        todayEnd.setHours(23, 59, 59, 999);

        // Last 7 days boundaries
        const sevenDaysAgo = new Date(now);
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
        sevenDaysAgo.setHours(0, 0, 0, 0);

        // Run all queries in parallel
        const [
            totalOrders,
            pendingOrders,
            successOrders,
            rejectedOrders,
            totalProducts,
            revenueResult,
            todayOrdersCount,
            todayRevenueResult,
            uniqueCustomersResult,
            recentOrders,
            dailyRevenueResult,
            topProductsResult,
        ] = await Promise.all([
            ordersCol.countDocuments(),
            ordersCol.countDocuments({ status: "pending" }),
            ordersCol.countDocuments({ status: "success" }),
            ordersCol.countDocuments({ status: "rejected" }),
            productsCol.countDocuments(),
            ordersCol
                .aggregate([
                    { $match: { status: "success" } },
                    { $group: { _id: null, total: { $sum: "$total" } } },
                ])
                .toArray(),
            // Today's orders
            ordersCol.countDocuments({
                createdAt: { $gte: todayStart, $lte: todayEnd },
            }),
            // Today's revenue
            ordersCol
                .aggregate([
                    {
                        $match: {
                            status: "success",
                            createdAt: { $gte: todayStart, $lte: todayEnd },
                        },
                    },
                    { $group: { _id: null, total: { $sum: "$total" } } },
                ])
                .toArray(),
            // Unique customers
            ordersCol
                .aggregate([
                    {
                        $group: { _id: "$minecraftUsername" },
                    },
                    { $count: "total" },
                ])
                .toArray(),
            // Recent 5 orders
            ordersCol
                .find({})
                .sort({ createdAt: -1 })
                .limit(5)
                .toArray()
                .then((orders) =>
                    orders.map((o) => ({
                        _id: o._id.toString(),
                        orderId: o.orderId,
                        minecraftUsername: o.minecraftUsername,
                        total: o.total,
                        status: o.status,
                        createdAt: o.createdAt
                            ? new Date(o.createdAt).toISOString()
                            : new Date().toISOString(),
                    }))
                ),
            // Daily revenue for last 7 days
            ordersCol
                .aggregate([
                    {
                        $match: {
                            status: "success",
                            createdAt: { $gte: sevenDaysAgo },
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
                            total: { $sum: "$total" },
                            count: { $sum: 1 },
                        },
                    },
                    { $sort: { _id: 1 } },
                ])
                .toArray(),
            // Top selling products
            ordersCol
                .aggregate([
                    { $match: { status: "success" } },
                    { $unwind: "$items" },
                    {
                        $group: {
                            _id: "$items.name",
                            totalQty: { $sum: "$items.quantity" },
                            totalRevenue: { $sum: "$items.lineTotal" },
                        },
                    },
                    { $sort: { totalRevenue: -1 } },
                    { $limit: 5 },
                ])
                .toArray(),
        ]);

        const totalRevenue =
            revenueResult.length > 0 ? revenueResult[0].total : 0;
        const todayRevenue =
            todayRevenueResult.length > 0 ? todayRevenueResult[0].total : 0;
        const uniqueCustomers =
            uniqueCustomersResult.length > 0
                ? uniqueCustomersResult[0].total
                : 0;

        // Fill in missing days for the 7-day chart
        const dailyRevenueMap: Record<string, { total: number; count: number }> = {};
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        dailyRevenueResult.forEach((d: any) => {
            dailyRevenueMap[d._id] = { total: d.total, count: d.count };
        });

        const chartData: { date: string; label: string; revenue: number; orders: number }[] = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date(now);
            d.setDate(d.getDate() - i);
            const key = d.toISOString().split("T")[0];
            const dayLabel = d.toLocaleDateString("en-IN", { weekday: "short" });
            const entry = dailyRevenueMap[key];
            chartData.push({
                date: key,
                label: dayLabel,
                revenue: entry ? entry.total : 0,
                orders: entry ? entry.count : 0,
            });
        }

        return {
            totalRevenue,
            totalOrders,
            pendingOrders,
            successOrders,
            rejectedOrders,
            totalProducts,
            todayOrders: todayOrdersCount,
            todayRevenue,
            uniqueCustomers,
            recentOrders,
            chartData,
            topProducts: topProductsResult as {
                _id: string;
                totalQty: number;
                totalRevenue: number;
            }[],
        };
    } catch (error) {
        console.error("Dashboard data error:", error);
        return {
            totalRevenue: 0,
            totalOrders: 0,
            pendingOrders: 0,
            successOrders: 0,
            rejectedOrders: 0,
            totalProducts: 0,
            todayOrders: 0,
            todayRevenue: 0,
            uniqueCustomers: 0,
            recentOrders: [],
            chartData: [],
            topProducts: [],
        };
    }
}

// ═══════════════════════════════════════════════════════════════
// PAGE COMPONENT
// ═══════════════════════════════════════════════════════════════

export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { Loader2, TrendingUp } from "lucide-react";

async function DashboardData() {
    const data = await getDashboardData();

    const statCards = [
        {
            title: "Total Revenue",
            value: data.totalRevenue,
            prefix: "₹",
            decimals: 2,
            subtitle: "From approved orders",
            icon: "DollarSign",
            bgGradient: "from-emerald-500/10 to-emerald-600/5",
            borderColor: "border-emerald-500/20",
            iconBg: "bg-emerald-500/15",
            iconColor: "text-emerald-400",
            textColor: "text-emerald-400",
        },
        {
            title: "Today's Revenue",
            value: data.todayRevenue,
            prefix: "₹",
            decimals: 2,
            subtitle: "Earned today",
            icon: "CalendarDays",
            bgGradient: "from-cyan-500/10 to-cyan-600/5",
            borderColor: "border-cyan-500/20",
            iconBg: "bg-cyan-500/15",
            iconColor: "text-cyan-400",
            textColor: "text-cyan-400",
        },
        {
            title: "Total Orders",
            value: data.totalOrders,
            prefix: "",
            decimals: 0,
            subtitle: `${data.successOrders} completed`,
            icon: "ShoppingCart",
            bgGradient: "from-blue-500/10 to-blue-600/5",
            borderColor: "border-blue-500/20",
            iconBg: "bg-blue-500/15",
            iconColor: "text-blue-400",
            textColor: "text-blue-400",
        },
        {
            title: "Pending Orders",
            value: data.pendingOrders,
            prefix: "",
            decimals: 0,
            subtitle: "Awaiting verification",
            icon: "Clock",
            bgGradient: "from-amber-500/10 to-amber-600/5",
            borderColor: "border-amber-500/20",
            iconBg: "bg-amber-500/15",
            iconColor: "text-amber-400",
            textColor: "text-amber-400",
        },
        {
            title: "Total Products",
            value: data.totalProducts,
            prefix: "",
            decimals: 0,
            subtitle: "In the store catalog",
            icon: "Package",
            bgGradient: "from-purple-500/10 to-purple-600/5",
            borderColor: "border-purple-500/20",
            iconBg: "bg-purple-500/15",
            iconColor: "text-purple-400",
            textColor: "text-purple-400",
        },
        {
            title: "Unique Customers",
            value: data.uniqueCustomers,
            prefix: "",
            decimals: 0,
            subtitle: "Players who ordered",
            icon: "Users",
            bgGradient: "from-pink-500/10 to-pink-600/5",
            borderColor: "border-pink-500/20",
            iconBg: "bg-pink-500/15",
            iconColor: "text-pink-400",
            textColor: "text-pink-400",
        },
    ];

    return (
        <DashboardClient
            statCards={statCards}
            chartData={data.chartData}
            recentOrders={data.recentOrders}
            topProducts={data.topProducts}
            pendingOrders={data.pendingOrders}
        />
    );
}

export default function AdminDashboardPage() {
    // Determine greeting based on hour
    const hour = new Date().getHours();
    let greeting = "Good Evening";
    if (hour < 12) greeting = "Good Morning";
    else if (hour < 17) greeting = "Good Afternoon";

    return (
        <div>
            {/* ── Page Header (Instant Load) ── */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <TrendingUp className="w-6 h-6 text-emerald-400" />
                    <h1 className="text-2xl md:text-3xl font-bold text-white">
                        {greeting}, Admin ☀️
                    </h1>
                </div>
                <p className="text-zinc-500 text-sm">
                    Here&apos;s what&apos;s happening with your store today
                </p>
            </div>

            <Suspense fallback={
                <div className="flex flex-col items-center justify-center py-32">
                    <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mb-4" />
                    <p className="text-zinc-500 text-sm">Loading dashboard data...</p>
                </div>
            }>
                <DashboardData />
            </Suspense>
        </div>
    );
}
