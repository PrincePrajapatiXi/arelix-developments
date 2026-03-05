// ═══════════════════════════════════════════════════════════════
// FILE: route.ts  (Recent Orders - Public)
// PURPOSE: GET /api/orders/recent — Returns recent order data
//          for the social proof ticker on the homepage.
//          Only exposes username + item name (no sensitive data).
// LOCATION: src/app/api/orders/recent/route.ts
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";

const avatars = ["⚔️", "🛡️", "🎮", "👑", "🏹", "🔮", "💎", "🗡️"];

function timeAgo(date: Date): string {
    const diff = Date.now() - date.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins} min ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} hr ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
}

export async function GET() {
    try {
        const db = await connectToDatabase();
        const orders = await db
            .collection("orders")
            .find({})
            .sort({ createdAt: -1 })
            .limit(15)
            .toArray();

        const purchases = orders.map((order, i) => {
            // Get the first item name from the order
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const firstItem = (order.items as any[])?.[0];
            const itemName = firstItem?.name || "a product";

            return {
                id: order.orderId || order._id.toString(),
                username: order.minecraftUsername || "Player",
                item: itemName,
                time: order.createdAt ? timeAgo(new Date(order.createdAt)) : "recently",
                avatar: avatars[i % avatars.length],
            };
        });

        return NextResponse.json({ purchases });
    } catch (error) {
        console.error("Recent orders error:", error);
        return NextResponse.json({ purchases: [] });
    }
}
