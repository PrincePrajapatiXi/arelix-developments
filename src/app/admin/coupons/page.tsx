// ═══════════════════════════════════════════════════════════════
// FILE: page.tsx  (Admin Coupons Page — Server Component)
// PURPOSE: Fetches all coupons from MongoDB and passes them
//          to the CouponsClient for interactive management.
// LOCATION: src/app/admin/coupons/page.tsx
// ═══════════════════════════════════════════════════════════════

import { connectToDatabase } from "@/lib/mongodb";
import CouponsClient from "@/app/admin/coupons/CouponsClient";

export const dynamic = "force-dynamic";

async function getCoupons() {
    try {
        const db = await connectToDatabase();
        const coupons = await db
            .collection("coupons")
            .find({})
            .sort({ createdAt: -1 })
            .toArray();

        return coupons.map((c) => ({
            _id: c._id.toString(),
            code: c.code,
            type: c.type,
            value: c.value,
            minOrder: c.minOrder || 0,
            maxUses: c.maxUses ?? -1,
            usedCount: c.usedCount || 0,
            expiresAt: c.expiresAt ? new Date(c.expiresAt).toISOString() : null,
            active: c.active ?? true,
            createdAt: c.createdAt
                ? new Date(c.createdAt).toISOString()
                : new Date().toISOString(),
        }));
    } catch (error) {
        console.error("Coupons fetch error:", error);
        return [];
    }
}

import { Suspense } from "react";
import { Loader2 } from "lucide-react";

async function CouponsData() {
    const coupons = await getCoupons();
    return <CouponsClient coupons={coupons} />;
}

export default function CouponsPage() {
    return (
        <Suspense fallback={
            <div className="flex flex-col items-center justify-center py-32">
                <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mb-4" />
                <p className="text-zinc-500 text-sm">Loading coupons...</p>
            </div>
        }>
            <CouponsData />
        </Suspense>
    );
}
