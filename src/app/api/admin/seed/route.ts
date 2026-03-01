// ═══════════════════════════════════════════════════════════════
// FILE: route.ts  (Seed Products API)
// PURPOSE: One-time seed endpoint that copies hardcoded products
//          from data.ts into MongoDB. Only runs if the products
//          collection is empty.
// LOCATION: src/app/api/admin/seed/route.ts
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { products } from "@/lib/data";

export async function POST() {
    try {
        const db = await connectToDatabase();
        const collection = db.collection("products");

        // Check if products already exist
        const existingCount = await collection.countDocuments();
        if (existingCount > 0) {
            return NextResponse.json({
                message: `Products collection already has ${existingCount} items. Seed skipped.`,
                seeded: false,
            });
        }

        // Insert all hardcoded products with timestamps
        const productsWithDates = products.map((p) => ({
            ...p,
            createdAt: new Date(),
            updatedAt: new Date(),
        }));

        await collection.insertMany(productsWithDates);

        return NextResponse.json({
            message: `Successfully seeded ${products.length} products into MongoDB.`,
            seeded: true,
            count: products.length,
        });
    } catch (error) {
        console.error("Seed error:", error);
        return NextResponse.json(
            { error: "Failed to seed products." },
            { status: 500 }
        );
    }
}
