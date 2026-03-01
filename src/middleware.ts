// ═══════════════════════════════════════════════════════════════
// FILE: middleware.ts
// PURPOSE: Protects all /admin/* routes (except /admin/login).
//          Checks for a valid admin_token cookie.
//          Redirects to /admin/login if not authenticated.
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
        // Not authenticated → redirect to login
        const loginUrl = new URL("/admin/login", request.url);
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
}

// Only run middleware on /admin/* routes
export const config = {
    matcher: ["/admin/:path*"],
};
