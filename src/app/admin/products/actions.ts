// ═══════════════════════════════════════════════════════════════
// FILE: actions.ts  (Product Server Actions)
// PURPOSE: Server actions for CRUD operations on products.
// LOCATION: src/app/admin/products/actions.ts
// ═══════════════════════════════════════════════════════════════

"use server";

import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";

// ─── Types ─────────────────────────────────────────────────────

interface ProductData {
    name: string;
    price: number;
    category: string;
    image: string;
    description: string;
    perks: string[];
    badge?: string;
    popular?: boolean;
}

// ─── Add Product ───────────────────────────────────────────────

export async function addProduct(data: ProductData) {
    try {
        const db = await connectToDatabase();

        // Generate a slug-style id from the name
        const id = data.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "");

        await db.collection("products").insertOne({
            id,
            ...data,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        revalidatePath("/admin/products");
        revalidatePath("/admin");
        revalidatePath("/");
        return { success: true };
    } catch (error) {
        console.error("Add product error:", error);
        return { success: false, error: "Failed to add product." };
    }
}

// ─── Update Product ────────────────────────────────────────────

export async function updateProduct(mongoId: string, data: ProductData) {
    try {
        const db = await connectToDatabase();

        await db.collection("products").updateOne(
            { _id: new ObjectId(mongoId) },
            {
                $set: {
                    ...data,
                    updatedAt: new Date(),
                },
            }
        );

        revalidatePath("/admin/products");
        revalidatePath("/admin");
        revalidatePath("/");
        return { success: true };
    } catch (error) {
        console.error("Update product error:", error);
        return { success: false, error: "Failed to update product." };
    }
}

// ─── Delete Product ────────────────────────────────────────────

export async function deleteProduct(mongoId: string) {
    try {
        const db = await connectToDatabase();

        await db
            .collection("products")
            .deleteOne({ _id: new ObjectId(mongoId) });

        revalidatePath("/admin/products");
        revalidatePath("/admin");
        revalidatePath("/");
        return { success: true };
    } catch (error) {
        console.error("Delete product error:", error);
        return { success: false, error: "Failed to delete product." };
    }
}
