// ═══════════════════════════════════════════════════════════════
// FILE: ProductDetailModal.tsx
// PURPOSE: Full-screen modal overlay showing a product's complete
//          details: large image, full perks list, price, and
//          "Add to Cart" button. Animated with Framer Motion.
// LOCATION: src/components/ProductDetailModal.tsx
// ═══════════════════════════════════════════════════════════════

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingCart, Check, Star } from "lucide-react";
import { type Product } from "@/lib/data";
import { useCartStore } from "@/store/useCartStore";

// ─── Props ─────────────────────────────────────────────────────

interface ProductDetailModalProps {
    product: Product | null;
    onClose: () => void;
}

// ─── Category Emoji Map ────────────────────────────────────────

const categoryEmoji: Record<string, string> = {
    ranks: "⚔️",
    kits: "🎒",
    keys: "🔑",
    misc: "✨",
};

// ─── Category Accent Colors ────────────────────────────────────

const accentColors: Record<string, string> = {
    ranks: "text-neon-purple",
    kits: "text-neon-blue",
    keys: "text-neon-cyan",
    misc: "text-neon-green",
};

// ═══════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════

export default function ProductDetailModal({ product, onClose }: ProductDetailModalProps) {
    const addToCart = useCartStore((s) => s.addToCart);
    const [added, setAdded] = useState(false);

    const handleAdd = () => {
        if (!product) return;
        addToCart(product);
        setAdded(true);
        setTimeout(() => setAdded(false), 1500);
    };

    return (
        <AnimatePresence>
            {product && (
                <>
                    {/* ── Backdrop ── */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="fixed inset-0 z-[80] bg-black/70 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    {/* ── Modal Card ── */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 40 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 40 }}
                        transition={{ type: "spring", damping: 25, stiffness: 250 }}
                        className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 z-[85] flex flex-col max-h-[90vh] md:max-w-lg md:w-full rounded-2xl border border-white/10 bg-surface-primary shadow-2xl overflow-hidden"
                    >
                        {/* ── Image Header ── */}
                        <div className="relative h-44 md:h-56 bg-gradient-to-br from-surface-tertiary to-surface-primary flex-shrink-0">
                            {/* Close button */}
                            <button
                                onClick={onClose}
                                className="absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 border border-white/10 text-white/60 hover:text-white hover:bg-black/60 transition-all cursor-pointer"
                            >
                                <X className="h-4 w-4" />
                            </button>

                            {/* Badge */}
                            {product.badge && (
                                <div className="absolute top-3 left-3 z-10 rounded-full border border-white/20 bg-white/10 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white/80">
                                    {product.badge}
                                </div>
                            )}

                            {/* Star */}
                            {product.popular && (
                                <div className="absolute top-3 left-[calc(3rem+8px)] z-10">
                                    <Star className="h-5 w-5 text-neon-amber fill-neon-amber/30" />
                                </div>
                            )}

                            {/* Large emoji */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-7xl md:text-8xl opacity-50">
                                    {categoryEmoji[product.category] || "✨"}
                                </span>
                            </div>

                            {/* Bottom gradient */}
                            <div className="absolute bottom-0 inset-x-0 h-20 bg-gradient-to-t from-surface-primary to-transparent" />
                        </div>

                        {/* ── Content ── */}
                        <div className="flex-1 overflow-y-auto px-5 pt-4 pb-5">
                            {/* Name + Price */}
                            <div className="flex items-start justify-between gap-3 mb-3">
                                <h2 className="text-xl md:text-2xl font-bold text-white leading-tight">
                                    {product.name}
                                </h2>
                                <span className={`text-xl md:text-2xl font-black whitespace-nowrap ${accentColors[product.category] || "text-neon-green"}`}>
                                    ₹{product.price.toFixed(2)}
                                </span>
                            </div>

                            {/* Description */}
                            <p className="text-sm text-white/50 leading-relaxed mb-5">
                                {product.description}
                            </p>

                            {/* Category label */}
                            <div className="mb-3">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-white/25">
                                    What You Get
                                </span>
                            </div>

                            {/* Full perks list */}
                            <ul className="space-y-2.5 mb-5">
                                {product.perks.map((perk, i) => (
                                    <li key={i} className="flex items-start gap-2.5 text-sm text-white/60">
                                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-neon-green/70" />
                                        <span>{perk}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* ── Footer: Add to Cart ── */}
                        <div className="flex-shrink-0 border-t border-white/5 px-5 py-4">
                            <button
                                onClick={handleAdd}
                                className={`flex w-full items-center justify-center gap-2 rounded-xl border py-3.5 text-sm font-bold transition-all duration-300 active:scale-[0.98] cursor-pointer ${added
                                    ? "bg-neon-green/20 border-neon-green/40 text-neon-green shadow-glow-green"
                                    : "bg-gradient-to-r from-neon-green/20 to-neon-green/10 border-neon-green/30 text-neon-green hover:from-neon-green/30 hover:to-neon-green/20 hover:shadow-glow-green"
                                    }`}
                            >
                                {added ? (
                                    <>
                                        <Check className="h-4 w-4" />
                                        Added to Cart ✓
                                    </>
                                ) : (
                                    <>
                                        <ShoppingCart className="h-4 w-4" />
                                        Add to Cart — ₹{product.price.toFixed(2)}
                                    </>
                                )}
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
