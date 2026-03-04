// ═══════════════════════════════════════════════════════════════
// FILE: ProductGrid.tsx
// PURPOSE: Renders the store product section with:
//          1. Search bar + sort dropdown for filtering
//          2. If "All" is selected → groups products by category
//          3. If a specific category is selected → shows one row
//          4. Product Detail Modal opens on card click
//          Mobile: horizontal swipeable rows per category
//          Desktop: grid layout per category section
// LOCATION: src/components/ProductGrid.tsx
// ═══════════════════════════════════════════════════════════════

"use client";

// ─── Imports ───────────────────────────────────────────────────
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Package, Loader2, Search, ChevronDown, X } from "lucide-react";
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

// ─── Sort Options ──────────────────────────────────────────────

type SortOption = "default" | "price_asc" | "price_desc" | "popular";

const sortOptions: { value: SortOption; label: string }[] = [
    { value: "default", label: "Default" },
    { value: "price_asc", label: "Price: Low → High" },
    { value: "price_desc", label: "Price: High → Low" },
    { value: "popular", label: "Popular First" },
];

// ─── Horizontal scroll container classes ───────────────────────

const ROW_CLASSES =
    "flex flex-row flex-nowrap overflow-x-auto gap-3 pb-4 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] md:grid md:grid-cols-3 md:gap-5 md:overflow-visible md:pb-0 xl:grid-cols-4";

// ═══════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════

export default function ProductGrid({ activeCategory }: ProductGridProps) {
    // ── Store Data State ──
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // ── Search & Sort State ──
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState<SortOption>("default");

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

    // ── Filter + Sort products ──
    const processedProducts = useMemo(() => {
        let result = [...products];

        // Search filter
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase().trim();
            result = result.filter(
                (p) =>
                    p.name.toLowerCase().includes(q) ||
                    p.description?.toLowerCase().includes(q) ||
                    p.category.toLowerCase().includes(q)
            );
        }

        // Sort
        switch (sortBy) {
            case "price_asc":
                result.sort((a, b) => a.price - b.price);
                break;
            case "price_desc":
                result.sort((a, b) => b.price - a.price);
                break;
            case "popular":
                result.sort((a, b) => (b.popular ? 1 : 0) - (a.popular ? 1 : 0));
                break;
        }

        return result;
    }, [products, searchQuery, sortBy]);

    // ── Group products by category ──
    const groupedProducts = useMemo(() => {
        const realCategories = categories.filter((c) => c.key !== "all");

        if (activeCategory === "all") {
            return realCategories
                .map((cat) => ({
                    key: cat.key,
                    label: categoryLabels[cat.key] || cat.label,
                    items: processedProducts.filter((p) => p.category === cat.key),
                }))
                .filter((group) => group.items.length > 0);
        }

        const filtered = processedProducts.filter((p) => p.category === activeCategory);
        return [{
            key: activeCategory,
            label: categoryLabels[activeCategory] || activeCategory,
            items: filtered,
        }];
    }, [activeCategory, processedProducts]);

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

            {/* ── Search & Sort Bar ── */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="flex flex-col sm:flex-row gap-3 mb-8 max-w-2xl mx-auto"
            >
                {/* Search Input */}
                <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/25" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search products..."
                        className="w-full pl-10 pr-8 py-2.5 bg-surface-secondary/40 border border-white/5 rounded-xl text-sm text-white placeholder-white/25 outline-none focus:border-neon-green/30 focus:ring-1 focus:ring-neon-green/20 transition-all"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors cursor-pointer"
                        >
                            <X className="h-3.5 w-3.5" />
                        </button>
                    )}
                </div>

                {/* Sort Dropdown */}
                <div className="relative">
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as SortOption)}
                        className="appearance-none pl-3 pr-8 py-2.5 bg-surface-secondary/40 border border-white/5 rounded-xl text-sm text-white/70 outline-none focus:border-neon-green/30 transition-all cursor-pointer w-full sm:w-auto"
                    >
                        {sortOptions.map((opt) => (
                            <option key={opt.value} value={opt.value} className="bg-zinc-900">
                                {opt.label}
                            </option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/25 pointer-events-none" />
                </div>
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
                    <p className="text-white/30 text-sm">
                        {searchQuery
                            ? `No products found for "${searchQuery}"`
                            : "No items found in this category."}
                    </p>
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery("")}
                            className="mt-3 px-4 py-2 text-xs text-neon-green border border-neon-green/20 rounded-xl hover:bg-neon-green/10 transition-all cursor-pointer"
                        >
                            Clear Search
                        </button>
                    )}
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

