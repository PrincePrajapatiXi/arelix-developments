// ============================================================================
// FILE: SearchOverlay.tsx
// PURPOSE: This component creates a full-screen search overlay that appears
//          when the user clicks the search icon. It lets customers search for
//          products by typing — with a smart 300ms delay (debounce) so we
//          don't bombard the server with requests on every keystroke.
//          Think of it like a spotlight search on your phone — type anything
//          and matching products appear instantly below.
//          Users can click a result to add it directly to their cart.
// LOCATION: src/components/SearchOverlay.tsx
// ============================================================================

"use client"; // This component runs in the browser (uses useState, useEffect)

// ─── Imports ───────────────────────────────────────────────────
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion"; // Smooth enter/exit animations
import { Search, X, Loader2, Package } from "lucide-react"; // Icons
import Image from "next/image"; // Next.js optimized image component
import { type Product, isProductOnSale, getEffectivePrice } from "@/lib/data"; // Product type + sale helpers
import { useCartStore } from "@/store/useCartStore"; // Global cart state manager (Zustand)

// ─── Props ─────────────────────────────────────────────────────
// These are the "settings" passed by the parent component (Navbar).

interface SearchOverlayProps {
    isOpen: boolean;       // Is the overlay currently visible?
    onClose: () => void;   // Function to call when the overlay should close
}

// ─── Category Emoji Map ────────────────────────────────────────
// When a product image is missing, we show a fallback emoji based
// on its category. This maps category names to emojis.

const categoryEmoji: Record<string, string> = {
    ranks: "⚔️",
    kits: "🎒",
    keys: "🔑",
    misc: "✨",
};

// ============================================================================
// COMPONENT: SearchOverlay
// This is the main search overlay. It handles:
//   1. Debounced search input (waits 300ms after typing before searching)
//   2. Fetching results from our /api/search endpoint
//   3. Displaying results with product image, name, category, and price
//   4. Adding products to cart when clicked
//   5. Keyboard support (ESC to close)
// ============================================================================

export default function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
    // ── State Variables ──
    const [query, setQuery] = useState("");                          // What the user typed
    const [results, setResults] = useState<Product[]>([]);           // Search results from API
    const [isLoading, setIsLoading] = useState(false);               // Is a search in progress?
    const [hasSearched, setHasSearched] = useState(false);           // Has the user searched at least once?
    const inputRef = useRef<HTMLInputElement>(null);                  // Reference to the input element (for focusing)
    const debounceRef = useRef<NodeJS.Timeout | null>(null);         // Timer ID for the debounce delay
    const addToCart = useCartStore((s) => s.addToCart);               // Function to add items to cart

    // ── Auto-focus input when overlay opens ──
    // When the overlay becomes visible, we wait 100ms (for the animation)
    // then focus the search input so the user can start typing immediately.
    // When it closes, we reset everything back to a clean state.
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100);
        } else {
            // Reset all state when closing
            setQuery("");
            setResults([]);
            setHasSearched(false);
        }
    }, [isOpen]);

    // ── Close overlay on Escape key ──
    // This adds a keyboard shortcut: pressing ESC closes the search overlay.
    // Think of it like pressing ESC to close a popup window.
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        if (isOpen) {
            window.addEventListener("keydown", handleKeyDown);
        }
        // Cleanup: remove the listener when the overlay closes or component unmounts
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, onClose]);

    // ── searchProducts — Fetches search results from the API ──
    // This is the function that actually talks to our backend.
    // It sends the query to GET /api/search?q=warrior and stores the results.
    //
    // useCallback ensures this function doesn't get recreated on every render
    // (it's a performance optimization).
    const searchProducts = useCallback(async (searchQuery: string) => {
        // If the input is empty/whitespace, clear results and stop
        if (!searchQuery.trim()) {
            setResults([]);
            setHasSearched(false);
            return;
        }

        setIsLoading(true);   // Show the loading spinner
        setHasSearched(true); // Mark that a search has been performed
        try {
            // Call our search API with the encoded query
            const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
            const data = await res.json();
            setResults(data.products || []); // Store the results (or empty array)
        } catch (error) {
            console.error("Search failed:", error);
            setResults([]); // On error, show no results
        } finally {
            setIsLoading(false); // Stop the spinning loader
        }
    }, []);

    // ── handleInputChange — Debounced search trigger ──
    // Instead of searching on EVERY keystroke (which would flood the server),
    // we wait 300ms after the user STOPS typing before searching.
    // This is called "debouncing" — like waiting for someone to finish
    // their sentence before replying.
    //
    // How it works:
    //   Step 1: User types "w" → set a 300ms timer
    //   Step 2: User types "a" (100ms later) → cancel old timer, set new 300ms timer
    //   Step 3: User types "r" (50ms later) → cancel old timer, set new 300ms timer
    //   Step 4: User stops typing → 300ms passes → search for "war"!
    const handleInputChange = (value: string) => {
        setQuery(value); // Update the displayed text immediately

        // Cancel any previous timer (so we don't search for partial text)
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        // Set a new 300ms timer — when it fires, perform the actual search
        debounceRef.current = setTimeout(() => {
            searchProducts(value);
        }, 300);
    };

    // ── handleAddToCart — Adds a product to the cart from search results ──
    // Uses the "effective price" which accounts for any active flash sales.
    // For example, if a ₹100 product is 30% OFF, it adds it at ₹70.
    const handleAddToCart = (product: Product) => {
        const effectivePrice = getEffectivePrice(product);
        addToCart({ ...product, price: effectivePrice });
    };

    // ════════════════════════════════════════════════════════════
    // RENDER — The visual layout
    // The overlay consists of:
    //   1. A dark backdrop (clicking it closes the overlay)
    //   2. A search input at the top
    //   3. A results dropdown below the input
    // ════════════════════════════════════════════════════════════

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* ── Dark Backdrop ──
                        A semi-transparent black overlay that covers the entire screen.
                        Clicking anywhere on it closes the search overlay. */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-[90] bg-black/80 backdrop-blur-md"
                        onClick={onClose}
                    />

                    {/* ── Search Panel ──
                        Positioned at the top of the screen, centered horizontally.
                        Contains the search input and the results dropdown. */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="fixed top-0 left-0 right-0 z-[95] mx-auto max-w-2xl px-4 pt-20 md:pt-28"
                    >
                        {/* ── Search Input Box ── */}
                        <div className="relative">
                            {/* Magnifying glass icon on the left side of the input */}
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/30" />

                            {/* The actual text input */}
                            <input
                                ref={inputRef}
                                type="text"
                                value={query}
                                onChange={(e) => handleInputChange(e.target.value)}
                                placeholder="Search products by name, category..."
                                className="w-full pl-12 pr-12 py-4 bg-surface-secondary/90 border border-white/10 rounded-2xl text-white text-base placeholder-white/25 outline-none focus:border-neon-green/40 focus:ring-2 focus:ring-neon-green/15 transition-all backdrop-blur-xl shadow-2xl"
                            />

                            {/* "X" clear button — only visible when there's text in the input */}
                            {query && (
                                <button
                                    onClick={() => {
                                        setQuery("");
                                        setResults([]);
                                        setHasSearched(false);
                                        inputRef.current?.focus(); // Re-focus the input after clearing
                                    }}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors cursor-pointer"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                        </div>

                        {/* ── Results Dropdown ──
                            This appears below the search input and shows one of 3 states:
                              1. Loading spinner (while fetching from API)
                              2. List of matching products (if results found)
                              3. "No products found" message (if search returned empty) */}
                        <AnimatePresence mode="wait">
                            {(isLoading || results.length > 0 || hasSearched) && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    transition={{ duration: 0.2 }}
                                    className="mt-3 max-h-[50vh] overflow-y-auto rounded-2xl border border-white/5 bg-surface-primary/95 backdrop-blur-xl shadow-2xl"
                                >
                                    {isLoading ? (
                                        /* State 1: Loading spinner */
                                        <div className="flex items-center justify-center py-10">
                                            <Loader2 className="h-6 w-6 text-neon-green animate-spin" />
                                        </div>
                                    ) : results.length > 0 ? (
                                        /* State 2: Products found — show them! */
                                        <div className="divide-y divide-white/5">
                                            {results.map((product) => (
                                                <button
                                                    key={product.id}
                                                    onClick={() => handleAddToCart(product)}
                                                    className="flex items-center gap-4 w-full px-5 py-4 hover:bg-white/5 transition-all text-left cursor-pointer group"
                                                >
                                                    {/* Product Thumbnail Image */}
                                                    <div className="relative h-12 w-12 md:h-14 md:w-14 rounded-xl overflow-hidden bg-surface-secondary/50 flex-shrink-0">
                                                        {product.image ? (
                                                            <Image
                                                                src={product.image}
                                                                alt={product.name}
                                                                fill
                                                                sizes="56px"
                                                                className="object-cover"
                                                            />
                                                        ) : (
                                                            /* Fallback: show category emoji if no image */
                                                            <div className="absolute inset-0 flex items-center justify-center text-2xl opacity-50">
                                                                {categoryEmoji[product.category] || "✨"}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Product Name + Category */}
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-semibold text-white group-hover:text-neon-green transition-colors truncate">
                                                            {product.name}
                                                        </p>
                                                        <p className="text-xs text-white/30 capitalize">
                                                            {product.category}
                                                        </p>
                                                    </div>

                                                    {/* Price — shows discounted price if on sale */}
                                                    <div className="flex flex-col items-end flex-shrink-0">
                                                        {isProductOnSale(product) ? (
                                                            <>
                                                                {/* Sale price in red */}
                                                                <span className="text-sm font-black text-red-400">
                                                                    ₹{getEffectivePrice(product).toFixed(2)}
                                                                </span>
                                                                {/* Original price crossed out */}
                                                                <span className="text-[10px] text-white/25 line-through">
                                                                    ₹{product.price.toFixed(2)}
                                                                </span>
                                                            </>
                                                        ) : (
                                                            /* Regular price in green */
                                                            <span className="text-sm font-black text-neon-green">
                                                                ₹{product.price.toFixed(2)}
                                                            </span>
                                                        )}
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    ) : hasSearched ? (
                                        /* State 3: No results found */
                                        <div className="flex flex-col items-center py-10">
                                            <Package className="h-8 w-8 text-white/10 mb-2" />
                                            <p className="text-white/30 text-sm">
                                                No products found for &quot;{query}&quot;
                                            </p>
                                        </div>
                                    ) : null}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Keyboard shortcut hint */}
                        <p className="mt-3 text-center text-white/15 text-xs">
                            Press <kbd className="px-1.5 py-0.5 bg-white/5 border border-white/10 rounded text-[10px] font-mono">ESC</kbd> to close
                        </p>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
