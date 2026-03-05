// ═══════════════════════════════════════════════════════════════
// FILE: middleware.ts
// PURPOSE: Protects all /admin/* routes (except /admin/login)
//          and /api/admin/* API routes (except /api/admin/auth).
//          Checks for a valid admin_token cookie.
//          Pages redirect to /admin/login, APIs return 401 JSON.
// LOCATION: src/middleware.ts
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Allow the login page and auth API through without checks
    if (
        pathname === "/admin/login" ||
        pathname.startsWith("/api/admin/auth")
    ) {
        return NextResponse.next();
    }

    // Check for admin_token cookie
    const adminToken = request.cookies.get("admin_token")?.value;

    if (!adminToken || adminToken !== process.env.ADMIN_SECRET_KEY) {
        // API routes → return 401 JSON
        if (pathname.startsWith("/api/admin")) {
            return NextResponse.json(
                { error: "Unauthorized. Admin login required." },
                { status: 401 }
            );
        }
        // Admin pages → redirect to login
        const loginUrl = new URL("/admin/login", request.url);
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
}

// Protect both admin pages and admin API routes
export const config = {
    matcher: ["/admin/:path*", "/api/admin/:path*"],
};
