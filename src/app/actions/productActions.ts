// ═══════════════════════════════════════════════════════════════
// FILE: productActions.ts
// PURPOSE: Server Actions for the customer-facing store frontend
//          to securely fetch products from MongoDB without
//          needing to build a separate REST API endpoint.
// LOCATION: src/app/actions/productActions.ts
// ═══════════════════════════════════════════════════════════════

"use server";

import { connectToDatabase } from "@/lib/mongodb";
import { Product } from "@/lib/data";
import { unstable_noStore as noStore } from "next/cache";

/**
 * Fetches all live products from the MongoDB store catalog.
 * It maps the `_id` to a string so it can be safely serialized to the client.
 */
export async function getLiveStoreProducts(): Promise<Product[]> {
    noStore(); // 👈 Opt out of Next.js Data Cache for this server action
    try {
        const db = await connectToDatabase();
        const productsCollection = db.collection("products");

        // Fetch all products
        const rawProducts = await productsCollection.find({}).toArray();

        // Convert MongoDB ObjectId to string for safe Client Component serialization
        const serializedProducts = rawProducts.map((p) => {
            const { _id, ...rest } = p;
            return {
                ...rest,
                id: _id.toString(), // Map _id back to id expected by frontend
            } as Product;
        });

        // Ensure we always return an array, even if empty
        return serializedProducts || [];

    } catch (error) {
        console.error("Failed to fetch live products from MongoDB:", error);
        return []; // Fallback to empty array to prevent client crashes
    }
}
