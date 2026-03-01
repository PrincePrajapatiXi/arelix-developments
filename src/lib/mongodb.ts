// ═══════════════════════════════════════════════════════════════
// FILE: mongodb.ts
// PURPOSE: MongoDB connection singleton using native driver.
//          Caches the client in development to prevent multiple
//          connections during hot reloads.
// LOCATION: src/lib/mongodb.ts
// ═══════════════════════════════════════════════════════════════

import { MongoClient, Db } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
    throw new Error("Please define MONGODB_URI in your .env.local file");
}

// ─── Global Cache (Dev Hot Reload Safe) ────────────────────────

interface MongoCache {
    client: MongoClient | null;
    promise: Promise<MongoClient> | null;
}

declare global {
    // eslint-disable-next-line no-var
    var _mongoCache: MongoCache | undefined;
}

const cached: MongoCache = global._mongoCache ?? { client: null, promise: null };
if (!global._mongoCache) {
    global._mongoCache = cached;
}

// ─── Connect Function ──────────────────────────────────────────

export async function connectToDatabase(): Promise<Db> {
    if (cached.client) {
        return cached.client.db();
    }

    if (!cached.promise) {
        cached.promise = MongoClient.connect(MONGODB_URI);
    }

    cached.client = await cached.promise;
    return cached.client.db();
}
