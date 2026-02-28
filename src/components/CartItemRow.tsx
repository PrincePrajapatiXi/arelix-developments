// ═══════════════════════════════════════════════════════════════
// FILE: CartItemRow.tsx
// PURPOSE: A single row inside the CartSidebar representing one
//          cart item. Shows the item name, category emoji, unit
//          price, quantity controls (– / +), remove button, and
//          line total (price × quantity).
// LOCATION: src/components/CartItemRow.tsx
// ═══════════════════════════════════════════════════════════════

"use client";

// ─── Imports ───────────────────────────────────────────────────
import { Minus, Plus, Trash2 } from "lucide-react";
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

    // Line total = unit price × quantity
    const lineTotal = item.price * item.quantity;

    return (
        <div className="flex items-center gap-3 rounded-xl border border-white/5 bg-surface-secondary/40 p-3 transition-all duration-200 hover:border-white/10">
            {/* ── Category Emoji Avatar ── */}
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-tertiary/60 text-xl">
                {categoryEmoji[item.category] || "📦"}
            </div>

            {/* ── Item Info ── */}
            <div className="flex-1 min-w-0">
                {/* Name + unit price */}
                <p className="text-sm font-semibold text-white truncate">{item.name}</p>
                <p className="text-xs text-white/30">₹{item.price.toFixed(2)} each</p>
            </div>

            {/* ── Quantity Controls ── */}
            <div className="flex items-center gap-1.5">
                {/* Decrease quantity (or remove if quantity = 1) */}
                <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="flex h-7 w-7 items-center justify-center rounded-md border border-white/10 text-white/50 hover:text-white hover:border-white/20 transition-colors cursor-pointer"
                >
                    <Minus className="h-3 w-3" />
                </button>

                {/* Current quantity */}
                <span className="w-6 text-center text-sm font-bold text-white">
                    {item.quantity}
                </span>

                {/* Increase quantity */}
                <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="flex h-7 w-7 items-center justify-center rounded-md border border-white/10 text-white/50 hover:text-white hover:border-white/20 transition-colors cursor-pointer"
                >
                    <Plus className="h-3 w-3" />
                </button>
            </div>

            {/* ── Line Total + Remove ── */}
            <div className="flex flex-col items-end gap-1">
                <span className="text-sm font-bold text-neon-green">
                    ₹{lineTotal.toFixed(2)}
                </span>
                <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-white/20 hover:text-red-400 transition-colors cursor-pointer"
                    title="Remove item"
                >
                    <Trash2 className="h-3.5 w-3.5" />
                </button>
            </div>
        </div>
    );
}
