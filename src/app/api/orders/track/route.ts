// ============================================================================
// FILE: route.ts  (Order Tracking API)
// PURPOSE: This is the backend API that powers the "/track-order" page.
//          When a customer enters their Order ID on the tracking page,
//          the frontend calls this API: GET /api/orders/track?orderId=ORD-123...
//          This file looks up the order in MongoDB and returns the order
//          details — but for SECURITY, it does NOT expose sensitive data
//          like the UTR (payment transaction) number.
//          Think of it like a receptionist who can tell you "your package
//          is being processed" but won't give out your credit card number.
// LOCATION: src/app/api/orders/track/route.ts
// ============================================================================

import { NextResponse } from "next/server";  // Next.js helper for sending JSON responses
import { connectToDatabase } from "@/lib/mongodb";  // Our MongoDB connection helper

/**
 * GET /api/orders/track?orderId=<orderId>
 *
 * Fetches a single order by its human-readable Order ID for public tracking.
 *
 * How it works (step by step):
 *   Step 1: Extract the "orderId" from the URL query string
 *   Step 2: Validate that an Order ID was provided
 *   Step 3: Connect to MongoDB and search the "orders" collection
 *   Step 4: If no order is found, return a 404 error
 *   Step 5: If found, return ONLY the safe/public fields (no UTR number!)
 *
 * SECURITY NOTE: We intentionally exclude the UTR (payment reference) number
 * from the response. This is a security best practice — the UTR is sensitive
 * payment data and should only be visible to admins in the admin panel.
 */
export async function GET(request: Request) {
    try {
        // Step 1: Get the orderId from the URL
        // Example: /api/orders/track?orderId=ORD-17385abc → orderId = "ORD-17385abc"
        const { searchParams } = new URL(request.url);
        const orderId = searchParams.get("orderId")?.trim();

        // Step 2: Validate — if no Order ID was provided, return a 400 error
        // (A "400 Bad Request" means the client sent an incomplete request)
        if (!orderId) {
            return NextResponse.json(
                { error: "Order ID is required." },
                { status: 400 }
            );
        }

        // Step 3: Connect to MongoDB and look up the order
        const db = await connectToDatabase();

        // Search by the human-readable "orderId" field (like "ORD-17385abc...")
        // NOT by MongoDB's internal "_id" — those are different!
        const order = await db.collection("orders").findOne({ orderId });

        // Step 4: If no order was found with that ID, return a 404 error
        if (!order) {
            return NextResponse.json(
                { error: "Order not found. Please check your Order ID and try again." },
                { status: 404 }
            );
        }

        // Step 5: Return the order data — but ONLY the safe, public fields
        // Notice we do NOT include: utrNumber, _id, or any internal data
        return NextResponse.json({
            success: true,
            order: {
                orderId: order.orderId,                 // The Order ID itself
                minecraftUsername: order.minecraftUsername, // Player's username
                edition: order.edition,                 // "java" or "bedrock"
                items: order.items,                     // Array of purchased items
                total: order.total,                     // Total amount paid (₹)
                status: order.status,                   // "pending", "success", or "rejected"
                couponCode: order.couponCode || null,   // Coupon code used (if any)
                discount: order.discount || 0,          // Discount amount (₹)
                createdAt: order.createdAt              // When the order was placed
                    ? new Date(order.createdAt).toISOString()
                    : null,
                updatedAt: order.updatedAt              // When the order was last updated
                    ? new Date(order.updatedAt).toISOString()
                    : null,
            },
        });

    } catch (error) {
        // If anything goes wrong (database error, network issue, etc.),
        // log it for debugging and return a generic 500 error
        console.error("Track order error:", error);
        return NextResponse.json(
            { error: "Something went wrong. Please try again." },
            { status: 500 }
        );
    }
}
