// ═══════════════════════════════════════════════════════════════
// FILE: ProductCard.tsx
// PURPOSE: A single product card displayed in the store grid.
//          Shows the product image area, name, price, description,
//          perks list, badge, and an "Add to Cart" button.
//          Each card has category-specific accent colors and
//          entrance/hover animations via Framer Motion.
// LOCATION: src/components/ProductCard.tsx
// ═══════════════════════════════════════════════════════════════

"use client"; // Required for Framer Motion animations + event handlers

// ─── Imports ───────────────────────────────────────────────────
import { useState } from "react";
import { motion } from "framer-motion";                        // For entrance + hover animations
import { ShoppingCart, Check, Star } from "lucide-react";      // Icons
import { type Product } from "@/lib/data";                     // Product type definition
import { useCartStore } from "@/store/useCartStore";           // Global cart state

// ─── Props Interface ───────────────────────────────────────────

/**
 * ProductCardProps
 * @prop product — The product data object to display
 * @prop index   — Position in the grid (used to stagger animation delays)
 */
interface ProductCardProps {
    product: Product;
    index: number;
    onCardClick?: () => void; // Opens the product detail modal
}

// ─── Badge Color Mapping ───────────────────────────────────────
// Maps badge labels (e.g., "Popular", "Hot") to their Tailwind color classes.
// This keeps badge styling centralized and easy to modify.

const badgeColors: Record<string, string> = {
    Starter: "bg-neon-blue/15 text-neon-blue border-neon-blue/30",
    Popular: "bg-neon-purple/15 text-neon-purple border-neon-purple/30",
    Premium: "bg-neon-amber/15 text-neon-amber border-neon-amber/30",
    Legendary: "bg-neon-pink/15 text-neon-pink border-neon-pink/30",
    "Best Seller": "bg-neon-green/15 text-neon-green border-neon-green/30",
    Value: "bg-neon-cyan/15 text-neon-cyan border-neon-cyan/30",
    Hot: "bg-red-500/15 text-red-400 border-red-500/30",
    New: "bg-neon-green/15 text-neon-green border-neon-green/30",
};

// ─── Category Accent Colors ───────────────────────────────────
// Each product category gets a unique accent color for its card:
//   - border : hover border color
//   - glow   : hover shadow glow effect
//   - price  : price text color

const categoryAccent: Record<string, { border: string; glow: string; price: string }> = {
    ranks: {
        border: "hover:border-neon-purple/40",
        glow: "group-hover:shadow-glow-purple",
        price: "text-neon-purple",
    },
    kits: {
        border: "hover:border-neon-blue/40",
        glow: "group-hover:shadow-glow-blue",
        price: "text-neon-blue",
    },
    keys: {
        border: "hover:border-neon-cyan/40",
        glow: "group-hover:shadow-glow-cyan",
        price: "text-neon-cyan",
    },
    misc: {
        border: "hover:border-neon-green/40",
        glow: "group-hover:shadow-glow-green",
        price: "text-neon-green",
    },
};

// ═══════════════════════════════════════════════════════════════
// COMPONENT: ProductCard
// ═══════════════════════════════════════════════════════════════

export default function ProductCard({ product, index, onCardClick }: ProductCardProps) {
    // Look up the accent colors for this product's category (fallback to misc)
    const accent = categoryAccent[product.category] || categoryAccent.misc;

    // ── Cart Integration ──
    const addToCart = useCartStore((s) => s.addToCart);
    const [added, setAdded] = useState(false); // Brief "Added ✓" feedback state

    // Handles the "Add to Cart" button click
    // Uses stopPropagation so clicking the button doesn't also open the modal
    const handleAddToCart = (e: React.MouseEvent) => {
        e.stopPropagation();    // Prevent card click (modal) from firing
        addToCart(product);     // Add product to Zustand store
        setAdded(true);         // Show "Added ✓" feedback
        setTimeout(() => setAdded(false), 1500); // Revert after 1.5s
    };

    return (
        <motion.div
            /* ── Entrance Animation ──
               Cards fade in + slide up, with staggered delays based on grid position.
               Exit animation shrinks them out when filtered away. */
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.4, delay: index * 0.08, ease: "easeOut" }}
            whileHover={{ y: -6 }}
            onClick={onCardClick}   // Opens product detail modal
            className={`group relative flex flex-col overflow-hidden rounded-xl md:rounded-2xl border border-white/5 bg-surface-secondary/60 backdrop-blur-sm transition-all duration-500 cursor-pointer w-36 min-h-[180px] flex-shrink-0 snap-start md:w-auto md:flex-shrink md:min-h-0 ${accent.border} ${accent.glow}`}
        >
            {/* ── Badge (top-right corner) ──
          Shows labels like "Popular", "Hot", "New", etc. */}
            {product.badge && (
                <div className={`absolute top-1.5 right-1.5 md:top-3 md:right-3 z-20 rounded-full border px-1.5 md:px-2.5 py-0.5 text-[7px] md:text-[10px] font-bold uppercase tracking-wider ${badgeColors[product.badge] || "bg-white/10 text-white/60 border-white/20"}`}>
                    {product.badge}
                </div>
            )}

            {/* ── Image Area ──
          Displays a gradient background with a decorative grid and
          a large emoji as a placeholder icon for the category. */}
            <div className="relative h-24 md:h-44 overflow-hidden bg-gradient-to-br from-surface-tertiary to-surface-primary">
                {/* Decorative grid overlay */}
                <div
                    className="absolute inset-0 opacity-5"
                    style={{
                        backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
                        backgroundSize: "20px 20px",
                    }}
                />

                {/* Category emoji: visual placeholder for product images */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-3xl md:text-6xl opacity-40 group-hover:opacity-60 group-hover:scale-110 transition-all duration-500">
                        {product.category === "ranks" && "⚔️"}
                        {product.category === "kits" && "🎒"}
                        {product.category === "keys" && "🔑"}
                        {product.category === "misc" && "✨"}
                    </div>
                </div>

                {/* Star indicator for popular products (top-left) */}
                {product.popular && (
                    <div className="absolute top-1.5 left-1.5 md:top-3 md:left-3 z-20">
                        <Star className="h-3 w-3 md:h-5 md:w-5 text-neon-amber fill-neon-amber/30" />
                    </div>
                )}

                {/* Bottom gradient: blends image area into content below */}
                <div className="absolute bottom-0 inset-x-0 h-8 md:h-16 bg-gradient-to-t from-surface-secondary/60 to-transparent" />
            </div>

            {/* ── Content Area ── */}
            <div className="flex flex-1 flex-col p-3 md:p-5">
                {/* Product Name & Price (side by side) */}
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-0.5 md:gap-2">
                    <h3 className="text-xs md:text-base font-bold text-white group-hover:text-white/90 transition-colors line-clamp-2 leading-tight break-words">
                        {product.name}
                    </h3>
                    <span className={`text-xs md:text-lg font-black whitespace-nowrap ${accent.price}`}>
                        ₹{product.price.toFixed(2)}
                    </span>
                </div>

                {/* Short description */}
                <p className="mt-1 md:mt-2 text-[10px] md:text-xs text-white/40 leading-relaxed line-clamp-2 hidden md:block">
                    {product.description}
                </p>

                {/* Perks list: shows first 5, with "+N more" if there are extras */}
                {/* Perks list: hidden on mobile, visible on desktop */}
                <ul className="hidden md:block mt-4 flex-1 space-y-1.5">
                    {product.perks.slice(0, 5).map((perk, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-white/55">
                            <Check className="mt-0.5 h-3 w-3 shrink-0 text-neon-green/70" />
                            <span className="line-clamp-1">{perk}</span>
                        </li>
                    ))}
                    {product.perks.length > 5 && (
                        <li className="text-xs text-white/30 pl-5">
                            +{product.perks.length - 5} more
                        </li>
                    )}
                </ul>

                {/* Add to Cart button — shows "Added ✓" feedback after clicking */}
                <button
                    onClick={handleAddToCart}
                    className={`mt-auto pt-2 md:pt-0 md:mt-5 flex w-full items-center justify-center gap-1 md:gap-2 rounded-lg md:rounded-xl border py-1.5 px-2 md:py-3 md:px-4 text-[10px] md:text-sm font-semibold transition-all duration-300 active:scale-[0.98] cursor-pointer ${added
                        ? "bg-neon-green/20 border-neon-green/40 text-neon-green shadow-glow-green"
                        : "bg-gradient-to-r from-neon-green/15 to-neon-green/5 border-neon-green/20 text-neon-green hover:from-neon-green/25 hover:to-neon-green/15 hover:border-neon-green/40 hover:shadow-glow-green"
                        }`}
                >
                    {added ? (
                        <>
                            <Check className="h-3 w-3 md:h-4 md:w-4" />
                            <span className="hidden md:inline">Added</span> ✓
                        </>
                    ) : (
                        <>
                            <ShoppingCart className="h-3 w-3 md:h-4 md:w-4" />
                            <span className="hidden sm:inline">Add to</span> Cart
                        </>
                    )}
                </button>
            </div>
        </motion.div>
    );
}
