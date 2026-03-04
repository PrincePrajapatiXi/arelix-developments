// ═══════════════════════════════════════════════════════════════
// FILE: route.ts  (Admin Activity Log API)
// PURPOSE: GET /api/admin/activity — Fetches recent admin
//          activity logs with pagination support.
// LOCATION: src/app/api/admin/activity/route.ts
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";

export async function GET(request: Request) {
    try {
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
