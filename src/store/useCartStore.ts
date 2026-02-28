// ═══════════════════════════════════════════════════════════════
// FILE: useCartStore.ts
// PURPOSE: Global cart state management using Zustand.
//          Provides actions to add/remove/update cart items,
//          toggle the cart sidebar, and compute totals.
//          Any component can import `useCartStore` to read or
//          modify the cart without prop drilling.
// LOCATION: src/store/useCartStore.ts
// ═══════════════════════════════════════════════════════════════

import { create } from "zustand";
import { type Product } from "@/lib/data";

// ─── Types ─────────────────────────────────────────────────────

/** CartItem = a Product + the quantity the user wants to buy. */
export interface CartItem extends Product {
    quantity: number;
}

/** Toast = a small notification shown after adding an item. */
export interface Toast {
    id: number;
    message: string;
}

/** Shape of the entire cart store (state + actions). */
interface CartState {
    // ── State ──
    items: CartItem[];       // All items currently in the cart
    isCartOpen: boolean;     // Whether the sidebar is visible
    toasts: Toast[];         // Active toast notifications

    // ── Actions ──
    addToCart: (product: Product) => void;
    removeFromCart: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    clearCart: () => void;
    toggleCart: () => void;
    openCart: () => void;
    closeCart: () => void;
    addToast: (message: string) => void;
    removeToast: (id: number) => void;

    // ── Computed Helpers ──
    getTotal: () => number;
    getItemCount: () => number;
}

// ─── Store Implementation ──────────────────────────────────────

let toastIdCounter = 0; // Simple auto-incrementing ID for toasts

export const useCartStore = create<CartState>((set, get) => ({
    // ── Initial State ──
    items: [],
    isCartOpen: false,
    toasts: [],

    // ── addToCart ──
    // If the product is already in the cart, increment its quantity.
    // Otherwise, add it as a new item with quantity = 1.
    addToCart: (product: Product) => {
        set((state) => {
            const existingItem = state.items.find((item) => item.id === product.id);

            if (existingItem) {
                // Product already in cart → bump quantity by 1
                return {
                    items: state.items.map((item) =>
                        item.id === product.id
                            ? { ...item, quantity: item.quantity + 1 }
                            : item
                    ),
                };
            }

            // New product → add to cart with quantity 1
            return { items: [...state.items, { ...product, quantity: 1 }] };
        });

        // Show a toast notification
        get().addToast(`${product.name} added to cart!`);
    },

    // ── removeFromCart ──
    // Removes an item completely from the cart (regardless of quantity).
    removeFromCart: (productId: string) => {
        set((state) => ({
            items: state.items.filter((item) => item.id !== productId),
        }));
    },

    // ── updateQuantity ──
    // Sets the quantity of a specific item. If quantity becomes 0 or less,
    // the item is removed entirely.
    updateQuantity: (productId: string, quantity: number) => {
        set((state) => {
            if (quantity <= 0) {
                return { items: state.items.filter((item) => item.id !== productId) };
            }
            return {
                items: state.items.map((item) =>
                    item.id === productId ? { ...item, quantity } : item
                ),
            };
        });
    },

    // ── clearCart ──
    // Empties the entire cart (used after successful checkout).
    clearCart: () => set({ items: [] }),

    // ── Sidebar Controls ──
    toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),
    openCart: () => set({ isCartOpen: true }),
    closeCart: () => set({ isCartOpen: false }),

    // ── Toast Notifications ──
    addToast: (message: string) => {
        const id = ++toastIdCounter;
        set((state) => ({
            toasts: [...state.toasts, { id, message }],
        }));
        // Auto-remove after 2.5 seconds
        setTimeout(() => get().removeToast(id), 2500);
    },

    removeToast: (id: number) => {
        set((state) => ({
            toasts: state.toasts.filter((t) => t.id !== id),
        }));
    },

    // ── Computed: Total Price ──
    // Sums up (price × quantity) for every item in the cart.
    getTotal: () => {
        return get().items.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
        );
    },

    // ── Computed: Total Item Count ──
    // Sums up all quantities (used for the Navbar badge).
    getItemCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
    },
}));
