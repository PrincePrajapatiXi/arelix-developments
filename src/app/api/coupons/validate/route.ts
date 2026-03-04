// ═══════════════════════════════════════════════════════════════
// FILE: route.ts  (Public Coupon Validation)
// PURPOSE: POST /api/coupons/validate — Validates a coupon code
//          and returns discount info for the frontend cart.
// LOCATION: src/app/api/coupons/validate/route.ts
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";

export async function POST(request: Request) {
    try {
        const { code, cartTotal } = await request.json();

        if (!code) {
            return NextResponse.json(
                { error: "Coupon code is required." },
                { status: 400 }
            );
        }

        const db = await connectToDatabase();
        const coupon = await db
            .collection("coupons")
            .findOne({ code: code.toUpperCase().trim(), active: true });

        if (!coupon) {
            return NextResponse.json(
                { valid: false, error: "Invalid coupon code." },
                { status: 200 }
            );
        }

        // Check expiry
        if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
            return NextResponse.json(
                { valid: false, error: "This coupon has expired." },
                { status: 200 }
            );
        }

        // Check usage limit
        if (coupon.maxUses !== -1 && coupon.usedCount >= coupon.maxUses) {
            return NextResponse.json(
                { valid: false, error: "This coupon has reached its usage limit." },
                { status: 200 }
            );
        }

        // Check minimum order
        if (cartTotal && cartTotal < coupon.minOrder) {
            return NextResponse.json(
                {
                    valid: false,
                    error: `Minimum order of ₹${coupon.minOrder.toFixed(2)} required.`,
                },
                { status: 200 }
            );
        }

        // Calculate discount
        let discount = 0;
        if (coupon.type === "percentage") {
            discount = (cartTotal || 0) * (coupon.value / 100);
        } else {
            discount = coupon.value;
        }

        return NextResponse.json({
            valid: true,
            coupon: {
                code: coupon.code,
                type: coupon.type,
                value: coupon.value,
                minOrder: coupon.minOrder,
            },
            discount: parseFloat(discount.toFixed(2)),
        });
    } catch (error) {
        console.error("Coupon validation error:", error);
        return NextResponse.json(
            { error: "Failed to validate coupon." },
            { status: 500 }
        );
    }
}
