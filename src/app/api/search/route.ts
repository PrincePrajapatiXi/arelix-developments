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

/**
 * GET /api/search?q=<query>
 *
 * Searches for products matching the given query string.
 *
 * How it works (step by step):
 *   Step 1: Extract the search query from the URL (the "q" parameter)
 *   Step 2: If the query is empty, return an empty results array
 *   Step 3: Connect to MongoDB
 *   Step 4: Search the "products" collection using a case-insensitive regex
 *           across three fields: name, description, and category
 *   Step 5: Limit results to 10 products (to keep it fast)
 *   Step 6: Serialize the results (convert MongoDB _id to string, format dates)
 *   Step 7: Return the results as JSON
 */
export async function GET(request: Request) {
    try {
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
