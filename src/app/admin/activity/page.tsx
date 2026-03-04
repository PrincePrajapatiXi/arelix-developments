// ═══════════════════════════════════════════════════════════════
// FILE: page.tsx  (Admin Activity Log Page — Server Component)
// PURPOSE: Fetches recent activity logs and passes to client.
// LOCATION: src/app/admin/activity/page.tsx
// ═══════════════════════════════════════════════════════════════

import { connectToDatabase } from "@/lib/mongodb";
import ActivityClient from "./ActivityClient";

export const dynamic = "force-dynamic";

interface ActivityLog {
    _id: string;
    action: string;
    entity: string;
    details: string;
    timestamp: string;
}

async function getActivityLogs(): Promise<ActivityLog[]> {
    try {
        const db = await connectToDatabase();
        const logs = await db
            .collection("activityLogs")
            .find({})
            .sort({ timestamp: -1 })
            .limit(100)
            .toArray();

        return logs.map((l) => ({
            _id: l._id.toString(),
            action: l.action || "",
            entity: l.entity || "",
            details: l.details || "",
            timestamp: l.timestamp
                ? new Date(l.timestamp).toISOString()
                : new Date().toISOString(),
        }));
    } catch (error) {
        console.error("Activity logs fetch error:", error);
        return [];
    }
}

import { Suspense } from "react";
import { Loader2 } from "lucide-react";

async function ActivityData() {
    const logs = await getActivityLogs();
    return <ActivityClient logs={logs} />;
}

export default function ActivityPage() {
    return (
        <Suspense fallback={
            <div className="flex flex-col items-center justify-center py-32">
                <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mb-4" />
                <p className="text-zinc-500 text-sm">Loading activity logs...</p>
            </div>
        }>
            <ActivityData />
        </Suspense>
    );
}
