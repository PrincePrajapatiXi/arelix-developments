// ═══════════════════════════════════════════════════════════════
// FILE: route.ts  (Minecraft Server Status API)
// PURPOSE: GET /api/server-status — Queries a Minecraft server
//          via mcsrvstat.us API and returns online/offline status,
//          player count, and version info.
// LOCATION: src/app/api/server-status/route.ts
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";

export const revalidate = 60; // Cache for 60 seconds

export async function GET() {
    try {
        // Try to get server IP from settings
        let serverIp = "WardenSMP.hostzy.xyz:25593"; // Default fallback

        try {
            const db = await connectToDatabase();
            const settings = await db.collection("settings").findOne({});
            if (settings?.serverIp) {
                serverIp = settings.serverIp;
            }
        } catch {
            // Use default IP if DB connection fails
        }

        // Query mcsrvstat.us API (free, no key needed)
        // 3-second timeout to avoid slow page loads
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 3000);

        const res = await fetch(`https://api.mcsrvstat.us/3/${serverIp}`, {
            next: { revalidate: 60 },
            signal: controller.signal,
        });
        clearTimeout(timeout);

        if (!res.ok) {
            return NextResponse.json({
                online: false,
                players: { online: 0, max: 0 },
                serverIp,
            });
        }

        const data = await res.json();

        return NextResponse.json({
            online: data.online || false,
            players: {
                online: data.players?.online || 0,
                max: data.players?.max || 0,
            },
            version: data.version || null,
            motd: data.motd?.clean?.[0] || null,
            serverIp,
        });
    } catch (error) {
        console.error("Server status error:", error);
        return NextResponse.json({
            online: false,
            players: { online: 0, max: 0 },
        });
    }
}
