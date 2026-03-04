// ═══════════════════════════════════════════════════════════════
// FILE: actions.ts  (Order Server Actions)
// PURPOSE: Server actions for approving and rejecting orders.
// LOCATION: src/app/admin/orders/actions.ts
// ═══════════════════════════════════════════════════════════════

"use server";

import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";
import { logActivity } from "@/lib/logActivity";

/**
 * Approve an order — sets status to "success"
 */
export async function approveOrder(orderId: string) {
    try {
        const db = await connectToDatabase();
        await db.collection("orders").updateOne(
            { _id: new ObjectId(orderId) },
            {
                $set: {
                    status: "success",
                    updatedAt: new Date(),
                },
            }
        );
        revalidatePath("/admin/orders");
        revalidatePath("/admin");
        await logActivity({ action: "order_approved", entity: orderId, details: "Order approved" });
        return { success: true };
    } catch (error) {
        console.error("Approve order error:", error);
        return { success: false, error: "Failed to approve order." };
    }
}

/**
 * Reject an order — sets status to "rejected"
 */
export async function rejectOrder(orderId: string) {
    try {
        const db = await connectToDatabase();
        await db.collection("orders").updateOne(
            { _id: new ObjectId(orderId) },
            {
                $set: {
                    status: "rejected",
                    updatedAt: new Date(),
                },
            }
        );
        revalidatePath("/admin/orders");
        revalidatePath("/admin");
        await logActivity({ action: "order_rejected", entity: orderId, details: "Order rejected" });
        return { success: true };
    } catch (error) {
        console.error("Reject order error:", error);
        return { success: false, error: "Failed to reject order." };
    }
}
