// ═══════════════════════════════════════════════════════════════
// FILE: HeroSection.tsx
// PURPOSE: Full-screen hero banner — the first thing users see.
//          Includes animated background effects, brand title,
//          tagline, CTA buttons (Copy IP + Browse Store), and
//          a live-updating simulated player count indicator.
// LOCATION: src/components/HeroSection.tsx
// ═══════════════════════════════════════════════════════════════

"use client"; // Needed because we use useState, useEffect, and event handlers

// ─── Imports ───────────────────────────────────────────────────
import { useState, useEffect } from "react";
import { motion } from "framer-motion";          // For entrance animations
import { Copy, Check, Users, ChevronDown, Zap } from "lucide-react"; // Icons

// ─── Constants ─────────────────────────────────────────────────
// Extracted as constants so values are easy to find and tweak.
const SERVER_IP = "play.armysmp.fun";       // The IP copied to clipboard
const BASE_PLAYER_COUNT = 127;              // Minimum simulated player count
const PLAYER_COUNT_VARIANCE = 40;           // Random range added on top
const PLAYER_COUNT_INTERVAL_MS = 8000;      // Refresh interval (8 seconds)
const COPY_FEEDBACK_DURATION_MS = 2000;     // "Copied!" message duration

// ═══════════════════════════════════════════════════════════════
// COMPONENT: HeroSection
// ═══════════════════════════════════════════════════════════════

export default function HeroSection() {
    // ── State ──
    const [copied, setCopied] = useState(false);      // True while "IP Copied!" is showing
    const [playerCount, setPlayerCount] = useState(0); // Simulated online player count

    // ── Simulated Player Count (runs once on mount) ──
    // Generates a random number near BASE_PLAYER_COUNT and refreshes every 8s.
    // TODO: Replace with real Minecraft server status API for production.
    useEffect(() => {
        const randomize = () => BASE_PLAYER_COUNT + Math.floor(Math.random() * PLAYER_COUNT_VARIANCE);

        setPlayerCount(randomize()); // Set initial value immediately
        const interval = setInterval(() => setPlayerCount(randomize()), PLAYER_COUNT_INTERVAL_MS);

        return () => clearInterval(interval); // Cleanup: prevent memory leaks on unmount
    }, []);

    // ── Copy Server IP to Clipboard ──
    // Tries modern Clipboard API first; falls back to deprecated textarea method
    // for older browsers or non-HTTPS environments.
    const copyIP = async () => {
        try {
            await navigator.clipboard.writeText(SERVER_IP);
        } catch {
            // Fallback: create invisible textarea → select → copy → remove
            const el = document.createElement("textarea");
            el.value = SERVER_IP;
            document.body.appendChild(el);
            el.select();
            document.execCommand("copy");
            document.body.removeChild(el);
        }
        // Show "Copied!" feedback briefly
        setCopied(true);
        setTimeout(() => setCopied(false), COPY_FEEDBACK_DURATION_MS);
    };

    // ── Render ──
    return (
        <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-16">

            {/* ═══════════════════════════════════════
          LAYER 1 — Animated Background
          Positioned absolutely behind all content.
          Contains: gradient, grid, glow orbs, particles.
      ═══════════════════════════════════════ */}
            <div className="absolute inset-0">
                {/* Base gradient: dark surface fading into page background */}
                <div className="absolute inset-0 bg-gradient-to-b from-surface-primary via-background to-background" />

                {/* Grid pattern: faint green wireframe lines for a techy look */}
                <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: `
              linear-gradient(rgba(0, 255, 136, 0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0, 255, 136, 0.3) 1px, transparent 1px)
            `,
                        backgroundSize: "60px 60px",
                    }}
                />

                {/* Radial glow orbs: soft, blurred circles for ambient lighting */}
                <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-neon-green/5 blur-[120px] animate-[float_8s_ease-in-out_infinite]" />
                <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-neon-purple/5 blur-[120px] animate-[float_10s_ease-in-out_infinite_2s]" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-neon-blue/3 blur-[150px]" />

                {/* Floating particles: 20 tiny green dots rising upward continuously
                    Uses fixed positions (seeded by index) to avoid hydration mismatch
                    between server and client renders. */}
                {[...Array(20)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute h-1 w-1 rounded-full bg-neon-green/40"
                        style={{
                            left: `${(((i * 37 + 13) % 97) / 97) * 100}%`,
                            top: `${(((i * 53 + 7) % 89) / 89) * 100}%`,
                            animation: `particle-float ${8 + (i % 5) * 2.4}s linear infinite`,
                            animationDelay: `${(i * 0.4) % 8}s`,
                        }}
                    />
                ))}
            </div>

            {/* ═══════════════════════════════════════
          LAYER 2 — Hero Content (foreground)
          Everything the user actually reads/clicks.
      ═══════════════════════════════════════ */}
            <div className="relative z-10 mx-auto max-w-5xl px-4 text-center sm:px-6">

                {/* Badge: small pill announcing current season/status */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="mb-6 inline-flex items-center gap-2 rounded-full border border-neon-green/20 bg-neon-green/5 px-4 py-1.5 text-xs font-medium text-neon-green backdrop-blur-sm"
                >
                    <Zap className="h-3 w-3" />
                    <span>Demo</span>
                </motion.div>

                {/* Main Title: two-line heading with animated gradient on second line */}
                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.2 }}
                    className="font-[family-name:var(--font-display)] text-4xl font-black tracking-tight sm:text-6xl lg:text-7xl"
                >
                    <span className="block text-white">Arelix</span>
                    <span
                        className="block bg-gradient-to-r from-neon-green via-neon-cyan to-neon-blue bg-clip-text text-transparent"
                        style={{ backgroundSize: "200% 200%", animation: "gradient-shift 6s ease infinite" }}
                    >
                        Developments
                    </span>
                </motion.h1>

                {/* Subtitle: short description of what the store offers */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="mx-auto mt-6 max-w-2xl text-base text-white/50 sm:text-lg leading-relaxed"
                >
                    Upgrade your gameplay with exclusive ranks, powerful kits, rare crate keys,
                    and unique cosmetics. Dominate the battlefield in style.
                </motion.p>

                {/* ── Call-to-Action Buttons ── */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                    className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
                >
                    {/* Copy IP Button — switches between "play.armysmp.fun" and "IP Copied!" */}
                    <button
                        onClick={copyIP}
                        className="group relative flex items-center gap-3 rounded-xl border border-neon-green/30 bg-neon-green/10 px-8 py-4 text-sm font-bold text-neon-green transition-all duration-300 hover:bg-neon-green/20 hover:shadow-glow-green hover:scale-105 active:scale-95 cursor-pointer"
                    >
                        {copied ? (
                            <>
                                <Check className="h-5 w-5" />
                                <span>IP Copied!</span>
                            </>
                        ) : (
                            <>
                                <Copy className="h-5 w-5" />
                                <span>Arelix Developments</span>
                            </>
                        )}
                        {/* Hover glow overlay */}
                        <div className="absolute inset-0 rounded-xl bg-neon-green/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </button>

                    {/* Browse Store Button — scrolls down to the #store section */}
                    <a
                        href="#store"
                        className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-neon-purple to-neon-blue px-8 py-4 text-sm font-bold text-white transition-all duration-300 hover:shadow-glow-purple hover:scale-105 active:scale-95"
                    >
                        Browse Store
                        <ChevronDown className="h-4 w-4 animate-bounce" />
                    </a>
                </motion.div>

                {/* ── Live Player Count Indicator ── */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="mt-12 inline-flex items-center gap-3 rounded-full border border-white/5 bg-surface-secondary/40 px-5 py-2.5 backdrop-blur-sm"
                >
                    {/* Pulsing green dot: signals "server is online" */}
                    <span className="relative flex h-3 w-3">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-neon-green opacity-75" />
                        <span className="relative inline-flex h-3 w-3 rounded-full bg-neon-green" />
                    </span>
                    <Users className="h-4 w-4 text-white/40" />
                    <span className="text-sm text-white/60">
                        <span className="font-semibold text-neon-green">{playerCount}</span> players online
                    </span>
                </motion.div>
            </div>

            {/* Bottom fade: smooth visual transition into the next section */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
        </section>
    );
}
