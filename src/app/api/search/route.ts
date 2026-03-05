// ============================================================================
// FILE: route.ts  (Search API)
// PURPOSE: This is the backend API endpoint for the product search feature.
//          When a user types something in the search bar, the frontend sends
//          a request here like: GET /api/search?q=warrior
//          This file then searches the MongoDB "products" collection for any
//          product whose name, description, or category matches the search
//          query, and returns up to 10 matching products.
//          Think of it like a store employee looking through shelves to find
//          items that match what you asked for.
// LOCATION: src/app/api/search/route.ts
// ============================================================================

import { NextResponse } from "next/server"; // Next.js helper for sending JSON responses
import { connectToDatabase } from "@/lib/mongodb"; // Our MongoDB connection helper

// ─── Simple In-Memory Rate Limiter ─────────────────────────────
// Limits each IP to 30 search requests per minute to prevent abuse.
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 30;       // Max requests per window
const RATE_WINDOW = 60000;   // 1 minute window

function isRateLimited(ip: string): boolean {
    const now = Date.now();
    const entry = rateLimitMap.get(ip);
    if (!entry || now > entry.resetAt) {
        rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW });
        return false;
    }
    entry.count++;
    return entry.count > RATE_LIMIT;
}

/**
 * GET /api/search?q=<query>
 *
 * Searches for products matching the given query string.
 */
export async function GET(request: Request) {
    try {
        // Rate limiting check
        const ip = request.headers.get("x-forwarded-for") || "unknown";
        if (isRateLimited(ip)) {
            return NextResponse.json(
                { error: "Too many requests. Please wait a moment." },
                { status: 429 }
            );
        }

        // Step 1: Extract the search query from the URL
        // Example URL: /api/search?q=warrior → query = "warrior"
        const { searchParams } = new URL(request.url);
        const query = searchParams.get("q")?.trim();

        // Step 2: If no query or it's empty, return empty results immediately
        // (No point searching the database for nothing!)
        if (!query || query.length < 1) {
            return NextResponse.json({ products: [] });
        }

        // Step 3: Connect to the MongoDB database
        const db = await connectToDatabase();

        // Step 4: Search for matching products
        // We use a "regex" (regular expression) with the "i" flag for
        // case-insensitive matching. This means searching "war" will
        // match "Warrior Rank", "warrior", "WARRIOR", etc.
        //
        // The $or operator means: match ANY of these conditions
        //   - Product name contains the query
        //   - Product description contains the query
        //   - Product category contains the query
        const regex = { $regex: query, $options: "i" };

        const products = await db
            .collection("products")
            .find({
                $or: [
                    { name: regex },        // Search in product name
                    { description: regex }, // Search in product description
                    { category: regex },   // Search in product category
                ],
            })
            .limit(10) // Only return the first 10 matches (for speed)
            .toArray(); // Convert the cursor to an array

        // Step 5: Serialize the results for the frontend
        // MongoDB uses "_id" (ObjectId) but our frontend expects "id" (string)
        // We also convert sale dates to ISO strings for proper JSON serialization
        const serialized = products.map((p) => {
            const { _id, ...rest } = p; // Separate _id from everything else
            return {
                ...rest,                   // Spread all other fields as-is
                id: _id.toString(),       // Convert ObjectId to string
                saleStartAt: p.saleStartAt  // Convert sale start date (if it exists)
                    ? new Date(p.saleStartAt).toISOString()
                    : undefined,
                saleEndAt: p.saleEndAt      // Convert sale end date (if it exists)
                    ? new Date(p.saleEndAt).toISOString()
                    : undefined,
            };
        });

        // Step 6: Send the results back to the frontend
        return NextResponse.json({ products: serialized });

    } catch (error) {
        // If anything goes wrong (e.g. database connection fails),
        // log the error and return a 500 (Internal Server Error) response
        console.error("Search error:", error);
        return NextResponse.json(
            { error: "Search failed." },
            { status: 500 }
        );
    }
}
