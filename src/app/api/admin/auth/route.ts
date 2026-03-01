// ═══════════════════════════════════════════════════════════════
// FILE: route.ts  (Admin Auth API)
// PURPOSE: POST — verify admin password, set HttpOnly cookie
//          DELETE — logout, clear cookie
// LOCATION: src/app/api/admin/auth/route.ts
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from "next/server";

// ─── POST: Login ───────────────────────────────────────────────

export async function POST(request: Request) {
    try {
        const { password } = await request.json();

        const secretKey = process.env.ADMIN_SECRET_KEY;
        if (!secretKey) {
            return NextResponse.json(
                { error: "Server misconfigured: ADMIN_SECRET_KEY not set." },
                { status: 500 }
            );
        }

        if (password !== secretKey) {
            return NextResponse.json(
                { error: "Invalid password." },
                { status: 401 }
            );
        }

        // Set HttpOnly cookie that lasts 7 days
        const response = NextResponse.json({ success: true });
        response.cookies.set("admin_token", secretKey, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 24 * 7, // 7 days
        });

        return response;
    } catch {
        return NextResponse.json(
            { error: "Invalid request." },
            { status: 400 }
        );
    }
}

// ─── DELETE: Logout ────────────────────────────────────────────

export async function DELETE() {
    const response = NextResponse.json({ success: true });
    response.cookies.set("admin_token", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 0, // Expire immediately
    });
    return response;
}
