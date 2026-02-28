// ═══════════════════════════════════════════════════════════════
// FILE: Navbar.tsx
// PURPOSE: Fixed top navigation bar with:
//          - Brand logo (Sword icon + "Arelix Developments")
//          - Desktop category tabs with animated active indicator
//          - Cart button
//          - Responsive mobile menu (hamburger → slide-down)
// LOCATION: src/components/Navbar.tsx
// ═══════════════════════════════════════════════════════════════

"use client"; // Required for useState and event handlers

// ─── Imports ───────────────────────────────────────────────────
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion"; // For tab indicator + mobile menu animations
import { Menu, X, ShoppingCart, Sword } from "lucide-react"; // Icons
import { categories, type Category } from "@/lib/data";       // Category list + type
import { useCartStore } from "@/store/useCartStore";           // Global cart state

// ─── Props Interface ───────────────────────────────────────────

/**
 * NavbarProps
 * @prop activeCategory   — Currently selected category (controlled by parent page)
 * @prop onCategoryChange — Callback to update the active category in parent state
 */
interface NavbarProps {
    activeCategory: Category;
    onCategoryChange: (category: Category) => void;
}

// ═══════════════════════════════════════════════════════════════
// COMPONENT: Navbar
// ═══════════════════════════════════════════════════════════════

export default function Navbar({ activeCategory, onCategoryChange }: NavbarProps) {
    // Controls whether the mobile dropdown menu is open or closed
    const [mobileOpen, setMobileOpen] = useState(false);

    // ── Cart Store Integration ──
    const toggleCart = useCartStore((s) => s.toggleCart); // Open/close sidebar
    const itemCount = useCartStore((s) => s.getItemCount()); // Live badge count

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-surface-primary/80 backdrop-blur-xl">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">

                {/* ── Brand Logo ── */}
                <a href="#" className="flex items-center gap-2 group">
                    {/* Icon container with hover glow effect */}
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neon-green/10 border border-neon-green/20 group-hover:shadow-glow-green transition-all duration-300">
                        <Sword className="h-5 w-5 text-neon-green" />
                    </div>
                    {/* Brand name */}
                    <span className="font-[family-name:var(--font-display)] text-lg font-bold tracking-wider text-white">
                        Arelix <span className="text-neon-green">Developments</span>
                    </span>
                </a>

                {/* ── Desktop Category Tabs (hidden on mobile) ──
            Renders a pill-shaped tab bar. The active tab has an animated
            green background that slides between tabs using Framer Motion's
            `layoutId` — which creates a shared layout animation. */}
                <div className="hidden md:flex items-center gap-1 rounded-xl bg-surface-secondary/60 p-1 border border-white/5">
                    {categories.map((cat) => (
                        <button
                            key={cat.key}
                            onClick={() => onCategoryChange(cat.key)}
                            className={`relative rounded-lg px-4 py-2 text-sm font-medium transition-all duration-300 cursor-pointer ${activeCategory === cat.key
                                ? "text-white"                          // Active tab: bright text
                                : "text-white/50 hover:text-white/80"   // Inactive tab: dimmed
                                }`}
                        >
                            {/* Animated active indicator — slides to whichever tab is selected */}
                            {activeCategory === cat.key && (
                                <motion.div
                                    layoutId="active-category"
                                    className="absolute inset-0 rounded-lg bg-neon-green/15 border border-neon-green/30"
                                    transition={{ type: "spring", duration: 0.5, bounce: 0.15 }}
                                />
                            )}
                            {/* Tab label text (must be above the animated background) */}
                            <span className="relative z-10">{cat.label}</span>
                        </button>
                    ))}
                </div>

                {/* ── Right Side: Cart Button + Mobile Toggle ── */}
                <div className="flex items-center gap-3">
                    {/* Cart button — shows item count badge + toggles sidebar */}
                    <button
                        onClick={toggleCart}
                        className="relative flex items-center gap-2 rounded-lg bg-neon-green/10 border border-neon-green/30 px-4 py-2 text-sm font-medium text-neon-green hover:bg-neon-green/20 hover:shadow-glow-green transition-all duration-300 cursor-pointer"
                    >
                        <ShoppingCart className="h-4 w-4" />
                        <span className="hidden sm:inline">Cart</span>
                        {/* Item count badge — only visible when cart has items */}
                        {itemCount > 0 && (
                            <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-neon-green text-[10px] font-black text-black">
                                {itemCount > 99 ? "99+" : itemCount}
                            </span>
                        )}
                    </button>

                    {/* Mobile hamburger / close button (visible only on small screens) */}
                    <button
                        onClick={() => setMobileOpen(!mobileOpen)}
                        className="flex md:hidden h-10 w-10 items-center justify-center rounded-lg border border-white/10 text-white/70 hover:text-white cursor-pointer"
                    >
                        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </button>
                </div>
            </div>

            {/* ── Mobile Dropdown Menu ──
          AnimatePresence enables enter/exit animations.
          The menu slides down (height: 0 → auto) when opened,
          and collapses back up when closed. */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden border-t border-white/5 md:hidden bg-surface-primary/95 backdrop-blur-xl"
                    >
                        <div className="flex flex-col gap-1 p-4">
                            {categories.map((cat) => (
                                <button
                                    key={cat.key}
                                    onClick={() => {
                                        onCategoryChange(cat.key);  // Update filter
                                        setMobileOpen(false);        // Close menu after selection
                                    }}
                                    className={`rounded-lg px-4 py-3 text-left text-sm font-medium transition-all duration-200 cursor-pointer ${activeCategory === cat.key
                                        ? "bg-neon-green/15 text-neon-green border border-neon-green/30"  // Active
                                        : "text-white/60 hover:text-white hover:bg-white/5"               // Inactive
                                        }`}
                                >
                                    {cat.label}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
