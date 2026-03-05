// ═══════════════════════════════════════════════════════════════
// FILE: route.ts  (Admin Activity Log API)
// PURPOSE: GET /api/admin/activity — Fetches recent admin
//          activity logs with pagination support.
// LOCATION: src/app/api/admin/activity/route.ts
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectToDatabase } from "@/lib/mongodb";

export async function GET(request: Request) {
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

        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get("limit") || "50");

        const db = await connectToDatabase();
        const logs = await db
            .collection("activityLogs")
            .find({})
            .sort({ timestamp: -1 })
            .limit(limit)
            .toArray();

        const serialized = logs.map((l) => ({
            ...l,
            _id: l._id.toString(),
            timestamp: l.timestamp
                ? new Date(l.timestamp).toISOString()
                : new Date().toISOString(),
        }));

        return NextResponse.json({ logs: serialized });
    } catch (error) {
        console.error("Activity logs GET error:", error);
        return NextResponse.json(
            { error: "Failed to fetch activity logs." },
            { status: 500 }
        );
    }
}
