// ═══════════════════════════════════════════════════════════════
// FILE: CartItemRow.tsx
// PURPOSE: A single row inside the CartSidebar representing one
//          cart item. Shows a small thumbnail, product name,
//          unit price, quantity controls (– / +), and a delete
//          button. Matches the reference design.
// LOCATION: src/components/CartItemRow.tsx
// ═══════════════════════════════════════════════════════════════

"use client";

// ─── Imports ───────────────────────────────────────────────────
import { Trash2, Plus, Minus } from "lucide-react";
import Image from "next/image";
import { useCartStore, type CartItem } from "@/store/useCartStore";

// ─── Category Emoji Map ────────────────────────────────────────
// Same emojis used in ProductCard, kept here for the cart view.
const categoryEmoji: Record<string, string> = {
    ranks: "⚔️",
    kits: "🎒",
    keys: "🔑",
    misc: "✨",
};

// ═══════════════════════════════════════════════════════════════
// COMPONENT: CartItemRow
// ═══════════════════════════════════════════════════════════════

export default function CartItemRow({ item }: { item: CartItem }) {
    // Get store actions
    const updateQuantity = useCartStore((s) => s.updateQuantity);
    const removeFromCart = useCartStore((s) => s.removeFromCart);

    return (
        <div className="flex items-center gap-3 rounded-xl border border-white/5 bg-surface-secondary/40 p-3 transition-all duration-200 hover:border-white/10">
            {/* ── Thumbnail (fixed size, relative container!) ── */}
            <div className="relative w-12 h-12 shrink-0 rounded-lg bg-surface-tertiary/60 overflow-hidden">
                {item.image ? (
                    <Image
                        src={item.image}
                        alt={item.name}
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="flex items-center justify-center w-full h-full text-xl">
                        {categoryEmoji[item.category] || "📦"}
                    </div>
                )}
            </div>

            {/* ── Item Info (name + price) ── */}
            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">
                    {item.name}
                </p>
                <p className="text-xs text-neon-green font-medium">
                    ₹{item.price.toFixed(2)}
                </p>
            </div>

            {/* ── Quantity Controls ── */}
            <div className="flex items-center gap-0.5">
                {/* Decrease quantity */}
                <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="flex h-7 w-7 items-center justify-center rounded-l-lg bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                    <Minus className="h-3 w-3" />
                </button>

                {/* Current quantity */}
                <span className="flex h-7 w-8 items-center justify-center bg-white/10 border-y border-white/10 text-sm font-bold text-white">
                    {item.quantity}
                </span>

                {/* Increase quantity */}
                <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="flex h-7 w-7 items-center justify-center rounded-r-lg bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                    <Plus className="h-3 w-3" />
                </button>
            </div>

            {/* ── Delete Button ── */}
            <button
                onClick={() => removeFromCart(item.id)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-white/20 hover:text-red-400 hover:bg-red-400/10 transition-all cursor-pointer shrink-0"
                title="Remove item"
            >
                <Trash2 className="h-4 w-4" />
            </button>
        </div>
    );
}
