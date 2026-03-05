// ═══════════════════════════════════════════════════════════════
// FILE: route.ts  (Order Export CSV)
// PURPOSE: GET /api/admin/orders/export — Downloads all orders
//          as a CSV file for spreadsheet analysis.
// LOCATION: src/app/api/admin/orders/export/route.ts
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectToDatabase } from "@/lib/mongodb";

export async function GET() {
    try {
        // ── Auth Check: Only allow authenticated admins ──
        const cookieStore = await cookies();
        const token = cookieStore.get("admin_token")?.value;
        if (!token || token !== process.env.ADMIN_SECRET_KEY) {
            return NextResponse.json(
                { error: "Unauthorized. Admin login required." },
                { status: 401 }
            );
        }

        const db = await connectToDatabase();
        const orders = await db
            .collection("orders")
            .find({})
            .sort({ createdAt: -1 })
            .toArray();

        // CSV header
        const headers = [
            "Order ID",
            "Username",
            "Edition",
            "Items",
            "Total (₹)",
            "Discount (₹)",
            "Coupon",
            "UTR",
            "Status",
            "Date",
        ];

        // CSV rows
        const rows = orders.map((o) => {
            const items = (o.items || [])
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                .map((i: any) => `${i.name} x${i.quantity}`)
                .join("; ");
            const date = o.createdAt
                ? new Date(o.createdAt).toISOString().split("T")[0]
                : "N/A";

            return [
                o.orderId || "",
                o.minecraftUsername || "",
                o.edition || "",
                `"${items}"`,
                o.total?.toFixed(2) || "0.00",
                o.discount?.toFixed(2) || "0.00",
                o.couponCode || "",
                o.utrNumber || "",
                o.status || "",
                date,
            ].join(",");
        });

        const csv = [headers.join(","), ...rows].join("\n");

        return new NextResponse(csv, {
            status: 200,
            headers: {
                "Content-Type": "text/csv",
                "Content-Disposition": `attachment; filename="warden-orders-${new Date().toISOString().split("T")[0]}.csv"`,
            },
        });
    } catch (error) {
        console.error("OrderExport error:", error);
        return NextResponse.json(
            { error: "Failed to export orders." },
            { status: 500 }
        );
    }
}
