// ═══════════════════════════════════════════════════════════════
// FILE: ProductGrid.tsx
// PURPOSE: Renders the store product section with:
//          1. If "All" is selected → groups products by category,
//             each with its own horizontal scroll row on mobile
//          2. If a specific category is selected → shows one row
//          3. Product Detail Modal opens on card click
//          Mobile: horizontal swipeable rows per category
//          Desktop: grid layout per category section
// LOCATION: src/components/ProductGrid.tsx
// ═══════════════════════════════════════════════════════════════

"use client";

// ─── Imports ───────────────────────────────────────────────────
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Package, Loader2 } from "lucide-react";
import { categories, type Category, type Product } from "@/lib/data";
import { getLiveStoreProducts } from "@/app/actions/productActions";
import ProductCard from "./ProductCard";
import ProductDetailModal from "./ProductDetailModal";

// ─── Props ─────────────────────────────────────────────────────

interface ProductGridProps {
    activeCategory: Category;
}

// ─── Category Display Names ────────────────────────────────────
// Prettier names for section headings

const categoryLabels: Record<string, string> = {
    ranks: "⚔️ Ranks",
    kits: "🎒 Kits",
    keys: "🔑 Keys",
    misc: "✨ Miscellaneous",
};

// ─── Horizontal scroll container classes ───────────────────────
// Mobile: flex horizontal scroll with snap
// Desktop: responsive grid

const ROW_CLASSES =
    "flex flex-row flex-nowrap overflow-x-auto gap-3 pb-4 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] md:grid md:grid-cols-3 md:gap-5 md:overflow-visible md:pb-0 xl:grid-cols-4";

// ═══════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════

export default function ProductGrid({ activeCategory }: ProductGridProps) {
    // ── Store Data State ──
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // ── Product Detail Modal state ──
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    // ── Fetch Live Products ──
    useEffect(() => {
        async function fetchProducts() {
            setIsLoading(true);
            try {
                const liveProducts = await getLiveStoreProducts();
                setProducts(liveProducts);
            } catch (error) {
                console.error("Failed to load products:", error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchProducts();
    }, []);

    // ── Group products by category ──
    // Returns an array of { category, label, products } objects.
    // When a specific category is selected, returns only that one group.
    const groupedProducts = useMemo(() => {
        // List of real categories (excluding "all")
        const realCategories = categories.filter((c) => c.key !== "all");

        if (activeCategory === "all") {
            // Group all products by their category
            return realCategories
                .map((cat) => ({
                    key: cat.key,
                    label: categoryLabels[cat.key] || cat.label,
                    items: products.filter((p) => p.category === cat.key),
                }))
                .filter((group) => group.items.length > 0); // Skip empty categories
        }

        // Single category selected
        const filtered = products.filter((p) => p.category === activeCategory);
        return [{
            key: activeCategory,
            label: categoryLabels[activeCategory] || activeCategory,
            items: filtered,
        }];
    }, [activeCategory, products]);

    // Total item count for header
    const totalItems = groupedProducts.reduce((sum, g) => sum + g.items.length, 0);

    return (
        <section id="store" className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">

            {/* ── Section Header ── */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="mb-12 text-center"
            >
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/5 bg-surface-secondary/40 px-4 py-1.5 text-xs font-medium text-white/50">
                    <Package className="h-3 w-3" />
                    {totalItems} {totalItems === 1 ? "item" : "items"} available
                </div>

                <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold tracking-wide text-white sm:text-3xl">
                    {activeCategory === "all"
                        ? "All Products"
                        : `${activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)}`}
                </h2>

                <p className="mt-2 text-sm text-white/30">
                    Click any item to learn more. All purchases are delivered instantly.
                </p>
            </motion.div>

            {/* ── Categorized Product Rows ── */}
            {isLoading ? (
                // Loading Skeleton View
                <div className="flex flex-col items-center justify-center py-32 text-center">
                    <Loader2 className="h-10 w-10 text-emerald-500 animate-spin mb-4" />
                    <p className="text-white/40 text-sm font-medium tracking-wide">Loading store catalog...</p>
                </div>
            ) : (
                <div className="space-y-10">
                    {groupedProducts.map((group) => (
                        <div key={group.key}>
                            {/* Category heading (only when showing "All") */}
                            {activeCategory === "all" && (
                                <motion.h3
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.4 }}
                                    className="mb-4 font-[family-name:var(--font-display)] text-lg md:text-xl font-bold text-white/90 tracking-wide"
                                >
                                    {group.label}
                                    <span className="ml-2 text-xs font-normal text-white/25">
                                        {group.items.length} items
                                    </span>
                                </motion.h3>
                            )}

                            {/* Horizontal scroll row (mobile) / Grid (desktop) */}
                            <div className={ROW_CLASSES}>
                                <AnimatePresence mode="popLayout">
                                    {group.items.map((product, i) => (
                                        <ProductCard
                                            key={product.id}
                                            product={product}
                                            index={i}
                                            onCardClick={() => setSelectedProduct(product)}
                                        />
                                    ))}
                                </AnimatePresence>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ── Empty State ── */}
            {!isLoading && totalItems === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <Package className="h-12 w-12 text-white/10 mb-4" />
                    <p className="text-white/30 text-sm">No items found in this category.</p>
                </div>
            )}

            {/* ── Product Detail Modal ── */}
            <ProductDetailModal
                product={selectedProduct}
                onClose={() => setSelectedProduct(null)}
            />
        </section>
    );
}
