// ═══════════════════════════════════════════════════════════════
// FILE: route.ts  (Admin Coupons API)
// PURPOSE: CRUD API for managing discount coupons.
//          GET  — List all coupons
//          POST — Create a new coupon
//          DELETE — Delete a coupon by code
// LOCATION: src/app/api/admin/coupons/route.ts
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectToDatabase } from "@/lib/mongodb";
import { logActivity } from "@/lib/logActivity";

// ── Auth Helper: Verify admin cookie ────────────────────────────
async function verifyAdmin() {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token")?.value;
    return token && token === process.env.ADMIN_SECRET_KEY;
}

// ─── GET: List All Coupons ─────────────────────────────────────

export async function GET() {
    try {
        if (!(await verifyAdmin())) {
            return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
        }

        const db = await connectToDatabase();
        const coupons = await db
            .collection("coupons")
            .find({})
            .sort({ createdAt: -1 })
            .toArray();

        const serialized = coupons.map((c) => ({
            ...c,
            _id: c._id.toString(),
        }));

        return NextResponse.json({ coupons: serialized });
    } catch (error) {
        console.error("Coupons GET error:", error);
        return NextResponse.json(
            { error: "Failed to fetch coupons." },
            { status: 500 }
        );
    }
}

// ─── POST: Create a Coupon ─────────────────────────────────────

export async function POST(request: Request) {
    try {
        if (!(await verifyAdmin())) {
            return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
        }

        const body = await request.json();
        const {
            code,
            type,
            value,
            minOrder = 0,
            maxUses = -1,
            expiresAt,
        } = body;

        // Validate
        if (!code || !type || value == null) {
            return NextResponse.json(
                { error: "Code, type, and value are required." },
                { status: 400 }
            );
        }

        if (!["percentage", "flat"].includes(type)) {
            return NextResponse.json(
                { error: "Type must be 'percentage' or 'flat'." },
                { status: 400 }
            );
        }

        if (typeof value !== "number" || value <= 0) {
            return NextResponse.json(
                { error: "Value must be a positive number." },
                { status: 400 }
            );
        }

        if (type === "percentage" && value > 100) {
            return NextResponse.json(
                { error: "Percentage discount cannot exceed 100%." },
                { status: 400 }
            );
        }

        const db = await connectToDatabase();
        const normalizedCode = code.toUpperCase().trim();

        // Check for duplicate
        const existing = await db
            .collection("coupons")
            .findOne({ code: normalizedCode });
        if (existing) {
            return NextResponse.json(
                { error: "A coupon with this code already exists." },
                { status: 409 }
            );
        }

        const coupon = {
            code: normalizedCode,
            type,
            value,
            minOrder: minOrder || 0,
            maxUses: maxUses || -1, // -1 = unlimited
            usedCount: 0,
            expiresAt: expiresAt ? new Date(expiresAt) : null,
            active: true,
            createdAt: new Date(),
        };

        await db.collection("coupons").insertOne(coupon);

        await logActivity({
            action: "coupon_created",
            entity: normalizedCode,
            details: `${type === "percentage" ? value + "%" : "₹" + value} off${minOrder ? ", min ₹" + minOrder : ""}`,
        });

        return NextResponse.json({ success: true, coupon });
    } catch (error) {
        console.error("Coupon POST error:", error);
        return NextResponse.json(
            { error: "Failed to create coupon." },
            { status: 500 }
        );
    }
}

// ─── PUT: Update a Coupon ──────────────────────────────────────

export async function PUT(request: Request) {
    try {
        if (!(await verifyAdmin())) {
            return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
        }

        const body = await request.json();
        const {
            originalCode,
            code,
            type,
            value,
            minOrder = 0,
            maxUses = -1,
            expiresAt,
        } = body;

        // Validate
        if (!originalCode || !code || !type || value == null) {
            return NextResponse.json(
                { error: "Original code, new code, type, and value are required." },
                { status: 400 }
            );
        }

        if (!["percentage", "flat"].includes(type)) {
            return NextResponse.json(
                { error: "Type must be 'percentage' or 'flat'." },
                { status: 400 }
            );
        }

        if (typeof value !== "number" || value <= 0) {
            return NextResponse.json(
                { error: "Value must be a positive number." },
                { status: 400 }
            );
        }

        if (type === "percentage" && value > 100) {
            return NextResponse.json(
                { error: "Percentage discount cannot exceed 100%." },
                { status: 400 }
            );
        }

        const db = await connectToDatabase();
        const normalizedOriginalCode = originalCode.toUpperCase().trim();
        const normalizedNewCode = code.toUpperCase().trim();

        // Check for duplicate if code is being changed
        if (normalizedOriginalCode !== normalizedNewCode) {
            const existing = await db
                .collection("coupons")
                .findOne({ code: normalizedNewCode });
            if (existing) {
                return NextResponse.json(
                    { error: "A coupon with this new code already exists." },
                    { status: 409 }
                );
            }
        }

        const updatedFields = {
            code: normalizedNewCode,
            type,
            value,
            minOrder: minOrder || 0,
            maxUses: maxUses || -1,
            expiresAt: expiresAt ? new Date(expiresAt) : null,
            updatedAt: new Date(),
        };

        const result = await db.collection("coupons").updateOne(
            { code: normalizedOriginalCode },
            { $set: updatedFields }
        );

        if (result.matchedCount === 0) {
            return NextResponse.json(
                { error: "Coupon not found." },
                { status: 404 }
            );
        }

        await logActivity({
            action: "coupon_updated",
            entity: normalizedNewCode,
            details: `Updated ${type === "percentage" ? value + "%" : "₹" + value} off`,
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Coupon PUT error:", error);
        return NextResponse.json(
            { error: "Failed to update coupon." },
            { status: 500 }
        );
    }
}

// ─── DELETE: Remove a Coupon ───────────────────────────────────

export async function DELETE(request: Request) {
    try {
        if (!(await verifyAdmin())) {
            return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const code = searchParams.get("code");

        if (!code) {
            return NextResponse.json(
                { error: "Coupon code is required." },
                { status: 400 }
            );
        }

        const db = await connectToDatabase();
        const result = await db
            .collection("coupons")
            .deleteOne({ code: code.toUpperCase().trim() });

        if (result.deletedCount === 0) {
            return NextResponse.json(
                { error: "Coupon not found." },
                { status: 404 }
            );
        }

        await logActivity({
            action: "coupon_deleted",
            entity: code.toUpperCase().trim(),
            details: "Coupon deleted",
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Coupon DELETE error:", error);
        return NextResponse.json(
            { error: "Failed to delete coupon." },
            { status: 500 }
        );
    }
}
