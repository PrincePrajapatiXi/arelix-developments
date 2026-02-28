// ═══════════════════════════════════════════════════════════════
// FILE: RecentPurchases.tsx
// PURPOSE: A horizontally scrolling "ticker" that shows recent
//          purchases as social proof (e.g., "xXDragonSlayerXx
//          bought Emperor Rank • 2 min ago"). Creates urgency
//          and trust by showing that other players are buying.
// LOCATION: src/components/RecentPurchases.tsx
// ═══════════════════════════════════════════════════════════════

"use client"; // Required for Framer Motion

// ─── Imports ───────────────────────────────────────────────────
import { motion } from "framer-motion";
import { ShoppingBag } from "lucide-react";           // Icon for section label
import { recentPurchases } from "@/lib/data";          // Mock purchase data array

// ═══════════════════════════════════════════════════════════════
// COMPONENT: RecentPurchases
// ═══════════════════════════════════════════════════════════════

export default function RecentPurchases() {
    // ── Duplicate the data array for seamless infinite scrolling ──
    // The CSS animation shifts the strip left by 50%. Since we have
    // TWO copies side by side, when the first copy scrolls off-screen,
    // the second copy is already in the exact same position — creating
    // a seamless loop without any visible "jump".
    const duplicated = [...recentPurchases, ...recentPurchases];

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
                {/* Left fade edge: makes items appear to "emerge" from the left */}
                <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-20 bg-gradient-to-r from-background/80 to-transparent" />
                {/* Right fade edge: makes items appear to "disappear" on the right */}
                <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-20 bg-gradient-to-l from-background/80 to-transparent" />

                {/* Ticker strip: auto-scrolls via the `ticker` CSS animation (30s loop).
            Pauses on hover thanks to `.ticker-container:hover` rule in globals.css. */}
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
