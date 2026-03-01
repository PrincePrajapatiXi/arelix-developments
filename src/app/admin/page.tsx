// ═══════════════════════════════════════════════════════════════
// FILE: page.tsx  (Admin Dashboard)
// PURPOSE: Main dashboard page showing key stats:
//          Total Revenue, Total Orders, Pending Orders, Products
// LOCATION: src/app/admin/page.tsx
// ═══════════════════════════════════════════════════════════════

import {
    DollarSign,
    ShoppingCart,
    Clock,
    Package,
    TrendingUp,
    ArrowUpRight,
} from "lucide-react";
import { connectToDatabase } from "@/lib/mongodb";

// ─── Data Fetcher ──────────────────────────────────────────────

async function getDashboardStats() {
    try {
        const db = await connectToDatabase();

        const ordersCollection = db.collection("orders");
        const productsCollection = db.collection("products");

        // Run all queries in parallel
        const [
            totalOrders,
            pendingOrders,
            successOrders,
            totalProducts,
            revenueResult,
        ] = await Promise.all([
            ordersCollection.countDocuments(),
            ordersCollection.countDocuments({ status: "pending" }),
            ordersCollection.countDocuments({ status: "success" }),
            productsCollection.countDocuments(),
            ordersCollection
                .aggregate([
                    { $match: { status: "success" } },
                    { $group: { _id: null, total: { $sum: "$total" } } },
                ])
                .toArray(),
        ]);

        const totalRevenue =
            revenueResult.length > 0 ? revenueResult[0].total : 0;

        return {
            totalRevenue,
            totalOrders,
            pendingOrders,
            successOrders,
            totalProducts,
        };
    } catch (error) {
        console.error("Dashboard stats error:", error);
        return {
            totalRevenue: 0,
            totalOrders: 0,
            pendingOrders: 0,
            successOrders: 0,
            totalProducts: 0,
        };
    }
}

// ═══════════════════════════════════════════════════════════════
// PAGE COMPONENT
// ═══════════════════════════════════════════════════════════════

export default async function AdminDashboardPage() {
    const stats = await getDashboardStats();

    const cards = [
        {
            title: "Total Revenue",
            value: `₹${stats.totalRevenue.toFixed(2)}`,
            subtitle: "From approved orders",
            icon: DollarSign,
            color: "emerald",
            bgGradient: "from-emerald-500/10 to-emerald-600/5",
            borderColor: "border-emerald-500/20",
            iconBg: "bg-emerald-500/15",
            iconColor: "text-emerald-400",
            textColor: "text-emerald-400",
        },
        {
            title: "Total Orders",
            value: stats.totalOrders.toString(),
            subtitle: `${stats.successOrders} completed`,
            icon: ShoppingCart,
            color: "blue",
            bgGradient: "from-blue-500/10 to-blue-600/5",
            borderColor: "border-blue-500/20",
            iconBg: "bg-blue-500/15",
            iconColor: "text-blue-400",
            textColor: "text-blue-400",
        },
        {
            title: "Pending Orders",
            value: stats.pendingOrders.toString(),
            subtitle: "Awaiting verification",
            icon: Clock,
            color: "amber",
            bgGradient: "from-amber-500/10 to-amber-600/5",
            borderColor: "border-amber-500/20",
            iconBg: "bg-amber-500/15",
            iconColor: "text-amber-400",
            textColor: "text-amber-400",
        },
        {
            title: "Total Products",
            value: stats.totalProducts.toString(),
            subtitle: "In the store catalog",
            icon: Package,
            color: "purple",
            bgGradient: "from-purple-500/10 to-purple-600/5",
            borderColor: "border-purple-500/20",
            iconBg: "bg-purple-500/15",
            iconColor: "text-purple-400",
            textColor: "text-purple-400",
        },
    ];

    return (
        <div>
            {/* ── Page Header ── */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <TrendingUp className="w-6 h-6 text-emerald-400" />
                    <h1 className="text-2xl md:text-3xl font-bold text-white">
                        Dashboard
                    </h1>
                </div>
                <p className="text-zinc-500 text-sm">
                    Overview of your store performance
                </p>
            </div>

            {/* ── Stats Grid ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
                {cards.map((card) => (
                    <div
                        key={card.title}
                        className={`
                            relative overflow-hidden rounded-2xl
                            bg-gradient-to-br ${card.bgGradient}
                            border ${card.borderColor}
                            p-6 transition-all duration-300
                            hover:scale-[1.02] hover:shadow-xl
                        `}
                    >
                        {/* Card Header */}
                        <div className="flex items-start justify-between mb-4">
                            <div
                                className={`w-11 h-11 rounded-xl ${card.iconBg} flex items-center justify-center`}
                            >
                                <card.icon
                                    className={`w-5 h-5 ${card.iconColor}`}
                                />
                            </div>
                            <ArrowUpRight className="w-4 h-4 text-zinc-600" />
                        </div>

                        {/* Card Value */}
                        <p className={`text-3xl font-bold ${card.textColor} mb-1`}>
                            {card.value}
                        </p>

                        {/* Card Title & Subtitle */}
                        <p className="text-zinc-300 text-sm font-medium">
                            {card.title}
                        </p>
                        <p className="text-zinc-600 text-xs mt-0.5">
                            {card.subtitle}
                        </p>

                        {/* Background Decoration */}
                        <div
                            className={`absolute -bottom-4 -right-4 w-24 h-24 ${card.iconBg} rounded-full blur-2xl opacity-40`}
                        />
                    </div>
                ))}
            </div>

            {/* ── Quick Info ── */}
            <div className="mt-8 bg-zinc-900/50 border border-zinc-800/50 rounded-2xl p-6">
                <h2 className="text-white font-semibold text-lg mb-2">
                    Quick Actions
                </h2>
                <p className="text-zinc-500 text-sm mb-4">
                    Manage your store from the sidebar navigation.
                </p>
                <div className="flex flex-wrap gap-3">
                    <a
                        href="/admin/orders"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl text-sm font-medium hover:bg-amber-500/20 transition-all"
                    >
                        <Clock className="w-4 h-4" />
                        Review Pending Orders
                        {stats.pendingOrders > 0 && (
                            <span className="bg-amber-500 text-black text-xs font-bold px-2 py-0.5 rounded-full">
                                {stats.pendingOrders}
                            </span>
                        )}
                    </a>
                    <a
                        href="/admin/products"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-xl text-sm font-medium hover:bg-purple-500/20 transition-all"
                    >
                        <Package className="w-4 h-4" />
                        Manage Products
                    </a>
                </div>
            </div>
        </div>
    );
}
