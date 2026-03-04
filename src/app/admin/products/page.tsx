// ═══════════════════════════════════════════════════════════════
// FILE: page.tsx  (Admin Products)
// PURPOSE: Display all products with Add / Edit / Delete
//          functionality using modals and server actions.
// LOCATION: src/app/admin/products/page.tsx
// ═══════════════════════════════════════════════════════════════

import { connectToDatabase } from "@/lib/mongodb";
import { Package } from "lucide-react";
import ProductsClient from "./ProductsClient";

// ─── Types ─────────────────────────────────────────────────────

export interface ProductDoc {
    _id: string;
    id: string;
    name: string;
    price: number;
    category: string;
    image: string;
    description: string;
    perks: string[];
    badge?: string;
    popular?: boolean;
}

// ─── Data Fetcher ──────────────────────────────────────────────

async function getProducts(): Promise<ProductDoc[]> {
    try {
        const db = await connectToDatabase();
        const products = await db
            .collection("products")
            .find({})
            .sort({ createdAt: -1 })
            .toArray();

        return products.map((p) => ({
            ...p,
            _id: p._id.toString(),
        })) as ProductDoc[];
    } catch (error) {
        console.error("Fetch products error:", error);
        return [];
    }
}

// ═══════════════════════════════════════════════════════════════
// PAGE COMPONENT (Server)
// ═══════════════════════════════════════════════════════════════

export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { Loader2 } from "lucide-react";

async function ProductsData() {
    const products = await getProducts();
    return (
        <>
            <p className="text-zinc-500 text-sm mb-8 -mt-6">
                Manage your store catalog • {products.length} products
            </p>
            <ProductsClient products={products} />
        </>
    );
}

export default function AdminProductsPage() {
    return (
        <div>
            {/* ── Page Header (Instant) ── */}
            <div className="mb-2">
                <div className="flex items-center gap-3 mb-2">
                    <Package className="w-6 h-6 text-emerald-400" />
                    <h1 className="text-2xl md:text-3xl font-bold text-white">
                        Products
                    </h1>
                </div>
            </div>

            <Suspense fallback={
                <div className="flex flex-col items-center justify-center py-32">
                    <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mb-4" />
                    <p className="text-zinc-500 text-sm">Loading products...</p>
                </div>
            }>
                <ProductsData />
            </Suspense>
        </div>
    );
}
