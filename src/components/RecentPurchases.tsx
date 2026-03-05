// ═══════════════════════════════════════════════════════════════
// FILE: RecentPurchases.tsx
// PURPOSE: A horizontally scrolling "ticker" that shows recent
//          purchases as social proof. Fetches real orders from
//          MongoDB, with mock data fallback if no orders exist.
// LOCATION: src/components/RecentPurchases.tsx
// ═══════════════════════════════════════════════════════════════

"use client";

// ─── Imports ───────────────────────────────────────────────────
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ShoppingBag } from "lucide-react";
import { recentPurchases as mockPurchases } from "@/lib/data";

interface PurchaseItem {
    id: string;
    username: string;
    item: string;
    time: string;
    avatar: string;
}

// ═══════════════════════════════════════════════════════════════
// COMPONENT: RecentPurchases
// ═══════════════════════════════════════════════════════════════

export default function RecentPurchases() {
    const [purchases, setPurchases] = useState<PurchaseItem[]>([]);

    useEffect(() => {
        async function fetchRecentOrders() {
            try {
                const res = await fetch("/api/orders/recent");
                const data = await res.json();
                if (data.purchases && data.purchases.length > 0) {
                    setPurchases(data.purchases);
                } else {
                    // Fallback to mock data if no real orders
                    setPurchases(mockPurchases.map(p => ({ ...p, id: String(p.id) })));
                }
            } catch {
                // Fallback to mock data on error
                setPurchases(mockPurchases.map(p => ({ ...p, id: String(p.id) })));
            }
        }
        fetchRecentOrders();
    }, []);

    // ── Duplicate the data array for seamless infinite scrolling ──
    const duplicated = [...purchases, ...purchases];

    if (purchases.length === 0) return null;

    return (
        <section className="relative overflow-hidden border-y border-white/5 bg-surface-primary/40 py-6">

            {/* ── Section Label ── */}
            <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="mb-4 text-center"
            >
                <div className="inline-flex items-center gap-2 text-xs font-medium text-white/30 uppercase tracking-widest">
                    <ShoppingBag className="h-3 w-3" />
                    Recent Purchases
                </div>
            </motion.div>

            {/* ── Scrolling Ticker ── */}
            <div className="ticker-container relative">
                {/* Left fade edge */}
                <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-20 bg-gradient-to-r from-background/80 to-transparent" />
                {/* Right fade edge */}
                <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-20 bg-gradient-to-l from-background/80 to-transparent" />

                {/* Ticker strip */}
                <div className="ticker-content flex w-max gap-4 animate-[ticker_30s_linear_infinite]">
                    {duplicated.map((purchase, i) => (
                        <div
                            key={`${purchase.id}-${i}`}
                            className="flex items-center gap-3 rounded-xl border border-white/5 bg-surface-secondary/30 px-4 py-2.5 backdrop-blur-sm"
                        >
                            {/* Emoji avatar */}
                            <span className="text-lg">{purchase.avatar}</span>

                            {/* Username + purchase details */}
                            <div className="flex flex-col">
                                <span className="text-xs font-semibold text-white/80">
                                    {purchase.username}
                                </span>
                                <span className="text-[10px] text-white/30">
                                    bought <span className="text-neon-green/70">{purchase.item}</span> • {purchase.time}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
