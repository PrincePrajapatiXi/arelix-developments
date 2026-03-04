// ============================================================================
// FILE: FlashSaleBadge.tsx
// PURPOSE: This component shows a "🔥 X% OFF" badge and a live countdown
//          timer on any product that is currently on sale. Think of it like
//          a flashy sticker on a product in a real store that says
//          "SALE ENDS IN 2 HOURS!". It counts down every second and
//          pulses with urgency when time is almost up.
// LOCATION: src/components/FlashSaleBadge.tsx
// ============================================================================

"use client"; // This tells Next.js to run this component in the browser (not server)

import { useState, useEffect } from "react";
import { Flame } from "lucide-react"; // 🔥 Fire icon for the sale badge

// ─── Props Interface ───────────────────────────────────────────
// These are the "settings" that a parent component passes to this badge.
// Think of props like the instructions you write on a gift tag —
// they tell the badge what discount to show and when the sale ends.

interface FlashSaleBadgeProps {
    salePercent: number;      // The discount percentage, e.g. 50 means "50% OFF"
    saleEndAt?: string;       // When the sale ends (ISO date string). Optional —
    // if not set, no countdown timer is shown (permanent sale)
    compact?: boolean;        // If true, shows a tiny badge (for product cards).
    // If false/undefined, shows the full countdown timer.
}

// ─── Time Remaining Calculation ────────────────────────────────
// This interface describes the shape of our "time left" object.
// It's like a digital clock face broken into parts.

interface TimeLeft {
    days: number;    // How many full days are remaining
    hours: number;   // How many hours after the days
    minutes: number; // How many minutes after the hours
    seconds: number; // How many seconds after the minutes
    expired: boolean; // Has the sale already ended? true/false
}

/**
 * getTimeLeft — Calculates how much time is left until the sale ends.
 * Think of this like looking at a clock and doing math:
 *   "The sale ends at 10 PM, and it's now 8 PM... so 2 hours left!"
 *
 * @param endAt — The end date/time of the sale (ISO string like "2026-03-05T22:00:00")
 * @returns An object with days, hours, minutes, seconds, and whether it's expired
 */
function getTimeLeft(endAt: string): TimeLeft {
    // Step 1: Calculate the difference in milliseconds between now and the end time
    const diff = new Date(endAt).getTime() - Date.now();

    // Step 2: If the difference is zero or negative, the sale has expired
    if (diff <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
    }

    // Step 3: Break the milliseconds into human-readable chunks
    // (1000ms = 1 second, 60 seconds = 1 minute, 60 minutes = 1 hour, 24 hours = 1 day)
    return {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
        expired: false,
    };
}

// ============================================================================
// COMPONENT: FlashSaleBadge
// This is the main visual piece. It renders either:
//   - A tiny "X% OFF" chip (compact mode, used on product cards)
//   - A full countdown panel with DD:HH:MM:SS (used in product modals)
// ============================================================================

export default function FlashSaleBadge({ salePercent, saleEndAt, compact = false }: FlashSaleBadgeProps) {
    // ── State: How much time is left ──
    // We calculate the initial time left right away. If there's no end date,
    // we just use a default "not expired" state (since it's a permanent sale).
    const [timeLeft, setTimeLeft] = useState<TimeLeft>(
        saleEndAt
            ? getTimeLeft(saleEndAt)
            : { days: 0, hours: 0, minutes: 0, seconds: 0, expired: false }
    );

    // ── Countdown Timer (ticks every 1 second) ──
    // This is like a real clock — every second, we recalculate the time left.
    // We only start the clock if there's actually an end date to count down to.
    useEffect(() => {
        // No end date? No countdown needed — it's a permanent sale
        if (!saleEndAt) return;

        // Save to a local variable so TypeScript is happy
        // (TypeScript can't guarantee `saleEndAt` stays defined inside callbacks)
        const endAt = saleEndAt;

        // Start a timer that fires every 1000ms (1 second)
        const timer = setInterval(() => {
            const tl = getTimeLeft(endAt);
            setTimeLeft(tl);

            // If the sale has expired, stop the clock — no need to keep ticking
            if (tl.expired) {
                clearInterval(timer);
            }
        }, 1000);

        // Cleanup: When this component is removed from the page, stop the timer
        // (prevents memory leaks — like turning off a faucet when you leave)
        return () => clearInterval(timer);
    }, [saleEndAt]);

    // ── Don't render anything if the sale has expired ──
    // Once the countdown hits zero, the badge disappears completely
    if (saleEndAt && timeLeft.expired) return null;

    // ── Urgency Check ──
    // If there's less than 1 hour remaining, we add a pulsing animation
    // to create a sense of urgency — "HURRY! Sale ending soon!"
    const isUrgent = saleEndAt &&
        timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes < 60;

    // ── Helper: Pad single digits with a leading zero ──
    // Turns "5" into "05" so the timer looks clean (like 02:05:09)
    const pad = (n: number) => n.toString().padStart(2, "0");

    // ════════════════════════════════════════════════════════════
    // COMPACT MODE — Tiny badge for product cards
    // Just shows "🔥 50% OFF" as a small chip
    // ════════════════════════════════════════════════════════════
    if (compact) {
        return (
            <div className={`
                inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md
                text-[8px] md:text-[10px] font-bold uppercase tracking-wider
                bg-red-500/20 text-red-400 border border-red-500/30
                ${isUrgent ? "animate-pulse" : ""}
            `}>
                <Flame className="h-2.5 w-2.5 md:h-3 md:w-3" />
                {salePercent}% OFF
            </div>
        );
    }

    // ════════════════════════════════════════════════════════════
    // FULL MODE — Complete countdown panel (used in product modals)
    // Shows "🔥 50% OFF — Flash Sale!" header + DD:HH:MM:SS timer
    // ════════════════════════════════════════════════════════════
    return (
        <div className={`
            rounded-xl border p-3
            bg-gradient-to-r from-red-500/10 via-orange-500/10 to-red-500/10
            border-red-500/20
            ${isUrgent ? "animate-pulse" : ""}
        `}>
            {/* ── Sale Text Header ── */}
            <div className="flex items-center gap-2 mb-2">
                <Flame className="h-4 w-4 text-red-400" />
                <span className="text-red-400 text-sm font-black tracking-wider uppercase">
                    🔥 {salePercent}% OFF — Flash Sale!
                </span>
            </div>

            {/* ── Countdown Timer Boxes ──
                Only rendered when there's an end date and the sale hasn't expired.
                Each box shows a number (days/hours/minutes/seconds) with a label below.
            */}
            {saleEndAt && !timeLeft.expired && (
                <div className="flex items-center gap-2">
                    {/* Days — only shown when there are days remaining */}
                    {timeLeft.days > 0 && (
                        <div className="flex flex-col items-center bg-red-500/10 rounded-lg px-2.5 py-1.5 border border-red-500/20 min-w-[44px]">
                            <span className="text-white text-sm font-black tabular-nums">{pad(timeLeft.days)}</span>
                            <span className="text-red-400/60 text-[8px] uppercase tracking-wider">Days</span>
                        </div>
                    )}
                    {timeLeft.days > 0 && <span className="text-red-400/40 text-lg font-bold">:</span>}

                    {/* Hours */}
                    <div className="flex flex-col items-center bg-red-500/10 rounded-lg px-2.5 py-1.5 border border-red-500/20 min-w-[44px]">
                        <span className="text-white text-sm font-black tabular-nums">{pad(timeLeft.hours)}</span>
                        <span className="text-red-400/60 text-[8px] uppercase tracking-wider">Hrs</span>
                    </div>
                    <span className="text-red-400/40 text-lg font-bold">:</span>

                    {/* Minutes */}
                    <div className="flex flex-col items-center bg-red-500/10 rounded-lg px-2.5 py-1.5 border border-red-500/20 min-w-[44px]">
                        <span className="text-white text-sm font-black tabular-nums">{pad(timeLeft.minutes)}</span>
                        <span className="text-red-400/60 text-[8px] uppercase tracking-wider">Min</span>
                    </div>
                    <span className="text-red-400/40 text-lg font-bold">:</span>

                    {/* Seconds */}
                    <div className="flex flex-col items-center bg-red-500/10 rounded-lg px-2.5 py-1.5 border border-red-500/20 min-w-[44px]">
                        <span className="text-white text-sm font-black tabular-nums">{pad(timeLeft.seconds)}</span>
                        <span className="text-red-400/60 text-[8px] uppercase tracking-wider">Sec</span>
                    </div>
                </div>
            )}

            {/* ── Urgency Warning ──
                This text only appears when < 1 hour is left.
                It adds pressure so users buy before the sale ends. */}
            {isUrgent && (
                <p className="mt-2 text-red-400/70 text-[10px] font-semibold tracking-wider uppercase">
                    ⚡ Hurry! Sale ending soon!
                </p>
            )}
        </div>
    );
}
