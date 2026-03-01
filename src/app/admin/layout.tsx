// ═══════════════════════════════════════════════════════════════
// FILE: layout.tsx  (Admin Layout)
// PURPOSE: Dark-themed responsive sidebar layout for all /admin
//          pages. Contains navigation links and logout button.
// LOCATION: src/app/admin/layout.tsx
// ═══════════════════════════════════════════════════════════════

"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
    LayoutDashboard,
    ShoppingCart,
    Package,
    LogOut,
    Menu,
    X,
    Sword,
    ChevronRight,
} from "lucide-react";

// ─── Sidebar Navigation Items ──────────────────────────────────

const navItems = [
    {
        label: "Dashboard",
        href: "/admin",
        icon: LayoutDashboard,
    },
    {
        label: "Orders",
        href: "/admin/orders",
        icon: ShoppingCart,
    },
    {
        label: "Products",
        href: "/admin/products",
        icon: Package,
    },
];

// ═══════════════════════════════════════════════════════════════
// COMPONENT: AdminLayout
// ═══════════════════════════════════════════════════════════════

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Don't wrap the login page with the sidebar layout
    if (pathname === "/admin/login") {
        return <>{children}</>;
    }

    // ── Logout Handler ─────────────────────────────────────────
    const handleLogout = async () => {
        await fetch("/api/admin/auth", { method: "DELETE" });
        router.push("/admin/login");
        router.refresh();
    };

    // ── Active Link Check ──────────────────────────────────────
    const isActive = (href: string) => {
        if (href === "/admin") return pathname === "/admin";
        return pathname.startsWith(href);
    };

    return (
        <div className="min-h-screen bg-zinc-950 flex">
            {/* ── Mobile Overlay ── */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* ══════════════════════════════════════════════════
                SIDEBAR
               ══════════════════════════════════════════════════ */}
            <aside
                className={`
                    fixed lg:sticky top-0 left-0 z-50 h-screen w-72
                    bg-zinc-900/95 backdrop-blur-xl border-r border-zinc-800/50
                    flex flex-col transition-transform duration-300 ease-in-out
                    ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
                `}
            >
                {/* ── Brand Header ── */}
                <div className="px-6 py-6 border-b border-zinc-800/50">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                                <Sword className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h2 className="text-white font-bold text-sm tracking-tight">
                                    Arelix Admin
                                </h2>
                                <p className="text-zinc-500 text-xs">
                                    Store Management
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="lg:hidden text-zinc-400 hover:text-white transition-colors cursor-pointer"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* ── Navigation Links ── */}
                <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
                    <p className="text-zinc-600 text-[10px] uppercase tracking-[0.15em] font-semibold px-3 mb-3">
                        Menu
                    </p>
                    {navItems.map((item) => {
                        const active = isActive(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setSidebarOpen(false)}
                                className={`
                                    flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium
                                    transition-all duration-200 group
                                    ${active
                                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                        : "text-zinc-400 hover:text-white hover:bg-zinc-800/50 border border-transparent"
                                    }
                                `}
                            >
                                <item.icon
                                    className={`w-[18px] h-[18px] ${active
                                            ? "text-emerald-400"
                                            : "text-zinc-500 group-hover:text-zinc-300"
                                        }`}
                                />
                                {item.label}
                                {active && (
                                    <ChevronRight className="w-4 h-4 ml-auto text-emerald-500/50" />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* ── Logout Button ── */}
                <div className="px-4 py-4 border-t border-zinc-800/50">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-200 cursor-pointer"
                    >
                        <LogOut className="w-[18px] h-[18px]" />
                        Logout
                    </button>
                </div>
            </aside>

            {/* ══════════════════════════════════════════════════
                MAIN CONTENT
               ══════════════════════════════════════════════════ */}
            <div className="flex-1 flex flex-col min-h-screen">
                {/* ── Top Bar (Mobile) ── */}
                <header className="lg:hidden sticky top-0 z-30 bg-zinc-900/80 backdrop-blur-xl border-b border-zinc-800/50 px-4 py-3 flex items-center justify-between">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="text-zinc-400 hover:text-white transition-colors cursor-pointer"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                    <div className="flex items-center gap-2">
                        <Sword className="w-5 h-5 text-emerald-400" />
                        <span className="text-white font-bold text-sm">
                            Arelix Admin
                        </span>
                    </div>
                    <div className="w-6" /> {/* Spacer for centering */}
                </header>

                {/* ── Page Content ── */}
                <main className="flex-1 p-4 md:p-8">{children}</main>
            </div>
        </div>
    );
}
