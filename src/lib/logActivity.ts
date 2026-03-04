// ═══════════════════════════════════════════════════════════════
// FILE: logActivity.ts
// PURPOSE: Shared helper to log admin actions to the
//          `activityLogs` MongoDB collection.
// LOCATION: src/lib/logActivity.ts
// ═══════════════════════════════════════════════════════════════

import { connectToDatabase } from "@/lib/mongodb";

export type ActivityAction =
    | "order_approved"
    | "order_rejected"
    | "product_created"
    | "product_updated"
    | "product_deleted"
    | "coupon_created"
    | "coupon_updated"
    | "coupon_deleted"
    | "settings_updated"
    | "stock_updated";

interface LogActivityParams {
    action: ActivityAction;
    entity: string;      // e.g. "ORD-123", "King Rank", "SAVE10"
    details?: string;    // e.g. "Set stock to 50", "10% off"
}

export async function logActivity({ action, entity, details }: LogActivityParams) {
    try {
        const db = await connectToDatabase();
        await db.collection("activityLogs").insertOne({
            action,
            entity,
            details: details || "",
            timestamp: new Date(),
        });
    } catch (error) {
        // Don't block the main action if logging fails
        console.error("Activity log error:", error);
    }
}
