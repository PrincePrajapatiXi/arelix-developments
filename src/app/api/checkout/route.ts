// ═══════════════════════════════════════════════════════════════
// FILE: route.ts  (Checkout API)
// PURPOSE: POST /api/checkout — Backend endpoint that:
//          1. Receives cart items + Minecraft username + edition + UTR
//          2. Validates all fields
//          3. Validates items against server-side catalog
//          4. Recalculates total using server prices
//          5. Logs the UTR for manual verification
//          6. Returns order confirmation
//
// LOCATION: src/app/api/checkout/route.ts
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from "next/server";
import { products } from "@/lib/data";
import { sendOrderEmail } from "@/lib/sendOrderEmail";

// ─── Request Body Types ────────────────────────────────────────

interface CheckoutRequestItem {
    id: string;
    quantity: number;
}

interface CheckoutRequest {
    minecraftUsername: string;      // Player's in-game name (with "." prefix for Bedrock)
    edition: "java" | "bedrock";   // Which Minecraft edition the player uses
    utrNumber: string;             // 12-digit UPI Transaction Reference number
    items: CheckoutRequestItem[];  // Cart items with quantities
}

// ─── POST Handler ──────────────────────────────────────────────

export async function POST(request: Request) {
    try {
        // ──────────────────────────────────────────────────────
        // 1. Parse the request body
        // ──────────────────────────────────────────────────────
        const body: CheckoutRequest = await request.json();

        // ──────────────────────────────────────────────────────
        // 2. Validate: Minecraft username
        // ──────────────────────────────────────────────────────
        const username = body.minecraftUsername?.trim();

        if (!username) {
            return NextResponse.json(
                { error: "Minecraft username is required." },
                { status: 400 }
            );
        }

        // Allow "." prefix for Bedrock, followed by 3-16 alphanumeric/underscores
        if (!/^\.?[a-zA-Z0-9_]{3,16}$/.test(username)) {
            return NextResponse.json(
                { error: "Invalid username format." },
                { status: 400 }
            );
        }

        // ──────────────────────────────────────────────────────
        // 3. Validate: Edition (must be "java" or "bedrock")
        // ──────────────────────────────────────────────────────
        const edition = body.edition;
        if (edition !== "java" && edition !== "bedrock") {
            return NextResponse.json(
                { error: "Invalid edition. Must be 'java' or 'bedrock'." },
                { status: 400 }
            );
        }

        // ──────────────────────────────────────────────────────
        // 4. Validate: UTR Number (must be exactly 12 digits)
        // ──────────────────────────────────────────────────────
        const utrNumber = body.utrNumber?.trim();

        if (!utrNumber) {
            return NextResponse.json(
                { error: "UTR / Transaction ID is required." },
                { status: 400 }
            );
        }

        if (!/^\d{12}$/.test(utrNumber)) {
            return NextResponse.json(
                { error: "UTR must be exactly 12 digits." },
                { status: 400 }
            );
        }

        // ──────────────────────────────────────────────────────
        // 5. Validate: Items array
        // ──────────────────────────────────────────────────────
        if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
            return NextResponse.json(
                { error: "Cart is empty." },
                { status: 400 }
            );
        }

        // ──────────────────────────────────────────────────────
        // 6. Validate each item + recalculate total server-side
        // ──────────────────────────────────────────────────────
        const validatedItems = [];
        let serverTotal = 0;

        for (const cartItem of body.items) {
            if (!cartItem.quantity || cartItem.quantity < 1) {
                return NextResponse.json(
                    { error: `Invalid quantity for item: ${cartItem.id}` },
                    { status: 400 }
                );
            }

            const serverProduct = products.find((p) => p.id === cartItem.id);
            if (!serverProduct) {
                return NextResponse.json(
                    { error: `Product not found: ${cartItem.id}` },
                    { status: 400 }
                );
            }

            const lineTotal = serverProduct.price * cartItem.quantity;
            serverTotal += lineTotal;

            validatedItems.push({
                id: serverProduct.id,
                name: serverProduct.name,
                price: serverProduct.price,
                quantity: cartItem.quantity,
                lineTotal: parseFloat(lineTotal.toFixed(2)),
            });
        }

        // ──────────────────────────────────────────────────────
        // 7. Generate order ID
        // ──────────────────────────────────────────────────────
        const orderId = `ORD-${Date.now()}-${Math.random()
            .toString(36)
            .substring(2, 7)
            .toUpperCase()}`;

        const totalAmount = parseFloat(serverTotal.toFixed(2));

        // ──────────────────────────────────────────────────────
        // 8. Log the order for manual verification
        //    TODO: In production, save to MongoDB / database
        // ──────────────────────────────────────────────────────
        console.log("═══════════════════════════════════════");
        console.log("📦 NEW ORDER RECEIVED");
        console.log("═══════════════════════════════════════");
        console.log(`  Order ID:  ${orderId}`);
        console.log(`  Player:    ${username} (${edition})`);
        console.log(`  UTR:       ${utrNumber}`);
        console.log(`  Total:     ₹${totalAmount}`);
        console.log(`  Items:     ${validatedItems.map((i) => `${i.name} x${i.quantity}`).join(", ")}`);
        console.log("═══════════════════════════════════════");

        // ──────────────────────────────────────────────────────
        // 8b. Send email notification
        // ──────────────────────────────────────────────────────
        try {
            await sendOrderEmail({
                orderId,
                username,
                edition,
                utrNumber,
                items: validatedItems,
                total: totalAmount,
            });
            console.log("✅ Email notification sent successfully!");
        } catch (emailErr) {
            console.error("❌ Email send failed:", emailErr);
        }

        // ──────────────────────────────────────────────────────
        // 🔌 DATABASE HOOK — Save order to your database here
        // ──────────────────────────────────────────────────────
        //
        // MONGODB EXAMPLE:
        //   await db.collection('orders').insertOne({
        //     orderId,
        //     minecraftUsername: username,
        //     edition,
        //     utrNumber,
        //     items: validatedItems,
        //     total: totalAmount,
        //     status: 'pending_verification',
        //     createdAt: new Date(),
        //   });
        //
        // ──────────────────────────────────────────────────────

        // ──────────────────────────────────────────────────────
        // 9. Return order confirmation
        // ──────────────────────────────────────────────────────
        return NextResponse.json({
            success: true,
            orderId,
            minecraftUsername: username,
            edition,
            total: totalAmount,
            itemCount: validatedItems.length,
            items: validatedItems,
            message: `Order placed for ${username}! We'll verify your payment (UTR: ${utrNumber}) and deliver your items in-game.`,
        });
    } catch (error) {
        console.error("Checkout error:", error);
        return NextResponse.json(
            { error: "Something went wrong processing your order. Please try again." },
            { status: 500 }
        );
    }
}
