// ═══════════════════════════════════════════════════════════════
// FILE: page.tsx  (Admin Customers)
// PURPOSE: Display unique customers with stats from orders.
// LOCATION: src/app/admin/customers/page.tsx
// ═══════════════════════════════════════════════════════════════

import { connectToDatabase } from "@/lib/mongodb";
import { Users } from "lucide-react";
import CustomersClient from "./CustomersClient";

// ─── Data Fetcher ──────────────────────────────────────────────

async function getCustomersData() {
    try {
        const db = await connectToDatabase();
        const ordersCol = db.collection("orders");

        const customersResult = await ordersCol
            .aggregate([
                {
                    $group: {
                        _id: "$minecraftUsername",
                        totalOrders: { $sum: 1 },
                        totalSpend: { $sum: "$total" },
                        lastOrderDate: { $max: "$createdAt" },
                        editions: { $addToSet: "$edition" },
                        orders: {
                            $push: {
                                orderId: "$orderId",
                                total: "$total",
                                status: "$status",
                                createdAt: "$createdAt",
                                items: "$items",
                            },
                        },
                    },
                },
                { $sort: { totalSpend: -1 } },
            ])
            .toArray();

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return customersResult.map((c: any) => ({
            username: c._id as string,
            totalOrders: c.totalOrders as number,
            totalSpend: c.totalSpend as number,
            lastOrderDate: c.lastOrderDate
                ? new Date(c.lastOrderDate).toISOString()
                : new Date().toISOString(),
            editions: c.editions as string[],
            orders: (c.orders || []).map(
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (o: any) => ({
                    orderId: o.orderId || "",
                    total: o.total || 0,
                    status: o.status || "pending",
                    createdAt: o.createdAt
                        ? new Date(o.createdAt).toISOString()
                        : new Date().toISOString(),
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    items: (o.items || []).map((i: any) => ({
                        name: i.name || "",
                        quantity: i.quantity || 1,
                        lineTotal: i.lineTotal || 0,
                    })),
                })
            ),
        }));
    } catch (error) {
        console.error("Customers data error:", error);
        return [];
    }
}

// ═══════════════════════════════════════════════════════════════

export const dynamic = "force-dynamic";

export default async function CustomersPage() {
    const customers = await getCustomersData();

    return (
        <div>
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <Users className="w-6 h-6 text-emerald-400" />
                    <h1 className="text-2xl md:text-3xl font-bold text-white">
                        Customers
                    </h1>
                </div>
                <p className="text-zinc-500 text-sm">
                    {customers.length} unique players have placed orders
                </p>
            </div>

            <CustomersClient customers={customers} />
        </div>
    );
}
