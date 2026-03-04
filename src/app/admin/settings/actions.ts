// ═══════════════════════════════════════════════════════════════
// FILE: actions.ts  (Settings Server Actions)
// PURPOSE: Server actions for reading/writing store settings.
// LOCATION: src/app/admin/settings/actions.ts
// ═══════════════════════════════════════════════════════════════

"use server";

import { connectToDatabase } from "@/lib/mongodb";
import { revalidatePath } from "next/cache";

// ─── Types ─────────────────────────────────────────────────────

export interface StoreSettings {
    storeName: string;
    storeDescription: string;
    upiId: string;
    contactEmail: string;
    discordLink: string;
    serverIp: string;
}

// ─── Get Settings ──────────────────────────────────────────────

export async function getSettings(): Promise<StoreSettings> {
    try {
        const db = await connectToDatabase();
        const settings = await db
            .collection("settings")
            .findOne({ _id: "store_settings" as unknown as import("mongodb").ObjectId });

        if (settings) {
            return {
                storeName: settings.storeName || "",
                storeDescription: settings.storeDescription || "",
                upiId: settings.upiId || "",
                contactEmail: settings.contactEmail || "",
                discordLink: settings.discordLink || "",
                serverIp: settings.serverIp || "",
            };
        }

        return {
            storeName: "Arelix Store",
            storeDescription: "",
            upiId: "",
            contactEmail: "",
            discordLink: "",
            serverIp: "",
        };
    } catch (error) {
        console.error("Get settings error:", error);
        return {
            storeName: "Arelix Store",
            storeDescription: "",
            upiId: "",
            contactEmail: "",
            discordLink: "",
            serverIp: "",
        };
    }
}

// ─── Save Settings ─────────────────────────────────────────────

export async function saveSettings(data: StoreSettings) {
    try {
        const db = await connectToDatabase();

        await db.collection("settings").updateOne(
            { _id: "store_settings" as unknown as import("mongodb").ObjectId },
            {
                $set: {
                    ...data,
                    updatedAt: new Date(),
                },
            },
            { upsert: true }
        );

        revalidatePath("/admin/settings");
        return { success: true };
    } catch (error) {
        console.error("Save settings error:", error);
        return { success: false, error: "Failed to save settings." };
    }
}
