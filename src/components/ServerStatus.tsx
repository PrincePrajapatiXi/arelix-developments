// ═══════════════════════════════════════════════════════════════
// FILE: ServerStatus.tsx
// PURPOSE: Animated status pill showing Minecraft server status:
//          - Green dot + player count when online
//          - Red dot when offline
//          Auto-refreshes every 60 seconds.
// LOCATION: src/components/ServerStatus.tsx
// ═══════════════════════════════════════════════════════════════

"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, Wifi, WifiOff } from "lucide-react";

interface ServerData {
    online: boolean;
    players: { online: number; max: number };
    version?: string;
    serverIp?: string;
}

export default function ServerStatus() {
    const [data, setData] = useState<ServerData | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchStatus = async () => {
        try {
            const res = await fetch(`https://api.mcsrvstat.us/bedrock/3/WardenSMP.hostzy.xyz:25593`);
            const data = await res.json();
            setData({
                online: data.online ?? false,
                players: {
                    online: data.players?.online ?? 0,
                    max: data.players?.max ?? 0
                },
                serverIp: "WardenSMP.hostzy.xyz:25593"
            });
        } catch {
            setData({ online: false, players: { online: 0, max: 0 } });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStatus();
        const interval = setInterval(fetchStatus, 60000); // Refresh every 60s
        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/5 rounded-full">
                <div className="w-2 h-2 rounded-full bg-zinc-500 animate-pulse" />
                <span className="text-[11px] text-white/30 font-medium">Checking...</span>
            </div>
        );
    }

    if (!data) return null;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className={`flex items-center gap-2 px-3 py-1.5 border rounded-full backdrop-blur-sm transition-all ${data.online
                ? "bg-emerald-500/5 border-emerald-500/20"
                : "bg-red-500/5 border-red-500/20"
                }`}
            title={data.serverIp ? `Server: ${data.serverIp}` : "Minecraft Server"}
        >
            {/* Animated Status Dot */}
            <div className="relative">
                <div
                    className={`w-2 h-2 rounded-full ${data.online ? "bg-emerald-400" : "bg-red-400"
                        }`}
                />
                {data.online && (
                    <div className="absolute inset-0 w-2 h-2 rounded-full bg-emerald-400 animate-ping opacity-50" />
                )}
            </div>

            {/* Status Text */}
            {data.online ? (
                <div className="flex items-center gap-1.5">
                    <Wifi className="w-3 h-3 text-emerald-400/70" />
                    <span className="text-[11px] font-medium text-emerald-400/80">Online</span>
                    <span className="text-[10px] text-white/5">|</span>
                    <Users className="w-3 h-3 text-emerald-400/50" />
                    <span className="text-[11px] font-medium text-emerald-400/70">
                        {data.players.online}/{data.players.max}
                    </span>
                </div>
            ) : (
                <div className="flex items-center gap-1.5">
                    <WifiOff className="w-3 h-3 text-red-400/70" />
                    <span className="text-[11px] font-medium text-red-400/80">Offline</span>
                </div>
            )}
        </motion.div>
    );
}
