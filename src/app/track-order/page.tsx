// ============================================================================
// FILE: page.tsx  (Order Tracking Page)
// PURPOSE: This is a public page at the URL "/track-order" where your
//          customers can enter their Order ID (like "ORD-17385...") and
//          instantly see the current status of their purchase. Think of
//          it like a parcel tracking page — but for in-game Minecraft items.
//          It shows a beautiful vertical timeline: Order Placed → Payment
//          Verification → Approved → Delivered.
// LOCATION: src/app/track-order/page.tsx
// ============================================================================

"use client"; // This page runs in the browser (client-side) because it uses interactive state

// ─── Imports ───────────────────────────────────────────────────
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion"; // Smooth animations
import {
    Search,        // 🔍 Magnifying glass icon (for the search input)
    Loader2,       // ⏳ Spinning loader icon (shown while fetching)
    Package,       // 📦 Box icon (Order Placed step)
    CreditCard,    // 💳 Card icon (Payment Verification step)
    CheckCircle2,  // ✅ Checkmark icon (Order Approved step)
    XCircle,       // ❌ X icon (error messages + rejection)
    Truck,         // 🚚 Truck icon (Delivered step)
    Clock,         // ⏰ Clock icon (marks the "current" step)
    ArrowLeft,     // ← Back arrow (link back to store)
    Copy,          // 📋 Copy icon (copy Order ID to clipboard)
    Check,         // ✓ Checkmark icon (shown after copying)
} from "lucide-react";
import Link from "next/link"; // Next.js component for in-app navigation

// ============================================================================
// TYPE DEFINITIONS
// These describe the "shape" of data we expect to receive from the API.
// Think of these as a blueprint — they tell TypeScript exactly what
// fields an order item or tracked order should have.
// ============================================================================

/**
 * OrderItem — One item inside an order.
 * Example: { id: "abc", name: "Warrior Rank", price: 4.99, quantity: 1, lineTotal: 4.99 }
 */
interface OrderItem {
    id: string;        // Unique product ID
    name: string;      // Product name, e.g. "Warrior Rank"
    price: number;     // Price per unit in ₹
    quantity: number;   // How many of this item were ordered
    lineTotal: number;  // = price × quantity (total for this line)
}

/**
 * TrackedOrder — The full order data returned from our tracking API.
 * Contains everything we need to show the customer their order status.
 */
interface TrackedOrder {
    orderId: string;           // The unique Order ID like "ORD-17385abc..."
    minecraftUsername: string;  // The player's Minecraft username
    edition: string;            // "java" or "bedrock"
    items: OrderItem[];         // Array of all items they purchased
    total: number;              // Final amount paid in ₹
    status: string;             // Current status: "pending", "success", or "rejected"
    couponCode: string | null;  // If a coupon was used, its code (or null)
    discount: number;           // Discount amount in ₹ (0 if no coupon)
    createdAt: string | null;   // When the order was placed (ISO date string)
    updatedAt: string | null;   // When the order was last updated
}

// ============================================================================
// TIMELINE CONFIGURATION
// These are the 4 steps that every order goes through.
// Think of it like a delivery tracker: Placed → Verifying → Approved → Delivered
// ============================================================================

/**
 * TimelineStep — Describes one step in the order progress timeline.
 */
interface TimelineStep {
    key: string;              // Unique identifier for this step
    label: string;            // Human-readable name (e.g. "Order Placed")
    description: string;      // Brief explanation shown below the label
    icon: React.ElementType;  // The Lucide icon component to display
}

/**
 * The 4 steps of order progress, in order.
 * Each step has a key, label, description, and an icon.
 */
const timelineSteps: TimelineStep[] = [
    {
        key: "placed",
        label: "Order Placed",
        description: "Your order has been received successfully",
        icon: Package, // 📦
    },
    {
        key: "payment",
        label: "Payment Verification",
        description: "We are verifying your UTR payment",
        icon: CreditCard, // 💳
    },
    {
        key: "approved",
        label: "Order Approved",
        description: "Payment verified, preparing your items",
        icon: CheckCircle2, // ✅
    },
    {
        key: "delivered",
        label: "Items Delivered",
        description: "Items have been delivered in-game!",
        icon: Truck, // 🚚
    },
];

/**
 * getStepIndex — Converts a database status string into a timeline step number.
 *
 * Think of it like a progress bar:
 *   "pending"  → Step 1 (we're at the Payment Verification stage)
 *   "success"  → Step 3 (everything is done, items delivered!)
 *   "rejected" → -1 (special case: order was rejected, show error)
 *
 * @param status — The order's status from the database
 * @returns The index of the current step in the timeline (0-3), or -1 for rejected
 */
function getStepIndex(status: string): number {
    switch (status) {
        case "pending":
            return 1; // Currently at "Payment Verification" (step index 1)
        case "success":
            return 3; // Fully completed — all 4 steps done (last step index is 3)
        case "rejected":
            return -1; // Special: shows a rejection card instead of timeline
        default:
            return 0; // Fallback: just "Order Placed"
    }
}

// ============================================================================
// PAGE COMPONENT: TrackOrderPage
// This is the main React component that renders the entire "/track-order" page.
// It handles:
//   1. Accepting the Order ID from user input
//   2. Fetching order data from our API
//   3. Displaying the results as a beautiful timeline + order summary
// ============================================================================

export default function TrackOrderPage() {
    // ── State Variables ──
    // These are like "memory slots" that the page uses to remember things
    // between re-renders. Each one tracks a different piece of information.

    const [orderId, setOrderId] = useState("");                      // What the user typed in the search box
    const [order, setOrder] = useState<TrackedOrder | null>(null);   // The fetched order data (null = no order loaded yet)
    const [error, setError] = useState("");                          // Error message to show (empty = no error)
    const [isLoading, setIsLoading] = useState(false);               // Is the fetch currently in progress?
    const [copied, setCopied] = useState(false);                     // Did the user just copy the Order ID?

    // ── handleTrack — Fetches the order from our API ──
    // This function runs when the user clicks "Track" or presses Enter.
    // Think of it like asking a store employee: "Where's my order?"
    //
    // Step 1: Validate the input (make sure they actually typed something)
    // Step 2: Call our API endpoint: GET /api/orders/track?orderId=XYZ
    // Step 3: If successful, store the order data → show timeline
    // Step 4: If not found, show an error message
    const handleTrack = async (e: React.FormEvent) => {
        e.preventDefault(); // Prevent the form from refreshing the page

        // Step 1: Remove whitespace and check if the input is empty
        const trimmed = orderId.trim();
        if (!trimmed) {
            setError("Please enter an Order ID.");
            return;
        }

        // Step 2: Reset state and start loading
        setIsLoading(true);
        setError("");
        setOrder(null);

        try {
            // Step 3: Call our tracking API with the Order ID
            // encodeURIComponent makes the ID safe for URLs (escapes special characters)
            const res = await fetch(`/api/orders/track?orderId=${encodeURIComponent(trimmed)}`);
            const data = await res.json();

            // Step 4: Check if the API returned an error
            if (!res.ok) {
                setError(data.error || "Order not found.");
            } else {
                // Success! Store the order data so we can display it
                setOrder(data.order);
            }
        } catch {
            // If the network request itself failed (e.g. server is down)
            setError("Something went wrong. Please try again.");
        } finally {
            // Always stop the loading spinner, whether it succeeded or failed
            setIsLoading(false);
        }
    };

    // ── copyOrderId — Copies the Order ID to the user's clipboard ──
    // When clicked, it copies the ID and briefly shows a checkmark icon
    const copyOrderId = () => {
        if (order) {
            navigator.clipboard.writeText(order.orderId);
            setCopied(true);
            // After 2 seconds, reset the icon back to the copy icon
            setTimeout(() => setCopied(false), 2000);
        }
    };

    // ── Derived Values ──
    // These are calculated from the current state, like formulas in a spreadsheet

    // Which timeline step are we on? (0-3, or -1 for rejected)
    const currentStep = order ? getStepIndex(order.status) : 0;

    // Is this order rejected? (used to show the rejection card instead of timeline)
    const isRejected = order?.status === "rejected";

    // ════════════════════════════════════════════════════════════
    // RENDER — The visual layout of the page
    // ════════════════════════════════════════════════════════════

    return (
        <div className="min-h-screen bg-surface-primary">
            {/* ── Background Decoration ──
                These are large, blurred circles that create a subtle glow effect
                in the background. "pointer-events-none" means they don't interfere
                with clicking on anything. */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-neon-green/3 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-neon-purple/3 rounded-full blur-[100px]" />
            </div>

            {/* ── Page Content Container ── */}
            <div className="relative mx-auto max-w-2xl px-4 py-16 md:py-24">

                {/* ── "Back to Store" Link ── */}
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-sm text-white/30 hover:text-white/60 transition-colors mb-8"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Store
                </Link>

                {/* ── Page Header ──
                    Shows the 📦 icon, title, and subtitle.
                    Uses Framer Motion to fade in and slide up on load. */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-10"
                >
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-neon-green/10 border border-neon-green/20 mb-4">
                        <Package className="h-8 w-8 text-neon-green" />
                    </div>
                    <h1 className="font-[family-name:var(--font-display)] text-3xl md:text-4xl font-bold text-white tracking-wide mb-2">
                        Track Your Order
                    </h1>
                    <p className="text-white/30 text-sm">
                        Enter your Order ID to check the current status of your purchase
                    </p>
                </motion.div>

                {/* ── Order ID Input Form ──
                    The user types their Order ID here and clicks "Track".
                    The form calls handleTrack() when submitted. */}
                <motion.form
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                    onSubmit={handleTrack}
                    className="flex gap-3 mb-8"
                >
                    {/* Search Input */}
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/25" />
                        <input
                            type="text"
                            value={orderId}
                            onChange={(e) => setOrderId(e.target.value)}
                            placeholder="Enter Order ID (e.g. ORD-1738...)"
                            className="w-full pl-11 pr-4 py-3.5 bg-surface-secondary/60 border border-white/5 rounded-xl text-white text-sm placeholder-white/25 outline-none focus:border-neon-green/30 focus:ring-2 focus:ring-neon-green/10 transition-all"
                        />
                    </div>

                    {/* Track Button — shows a spinner while loading */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="px-6 py-3.5 bg-gradient-to-r from-neon-green/20 to-neon-green/10 border border-neon-green/30 text-neon-green text-sm font-semibold rounded-xl hover:from-neon-green/30 hover:to-neon-green/20 hover:shadow-glow-green transition-all disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Search className="h-4 w-4" />
                        )}
                        Track
                    </button>
                </motion.form>

                {/* ── Error Message ──
                    Only shown when there's an error (e.g. "Order not found").
                    AnimatePresence makes it fade in/out smoothly. */}
                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-center gap-3"
                        >
                            <XCircle className="h-5 w-5 flex-shrink-0" />
                            {error}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ════════════════════════════════════════════════════════
                    ORDER RESULTS SECTION
                    This entire block only appears AFTER a successful API fetch.
                    It contains 3 parts:
                      1. Order Summary Card (ID, player, edition, date)
                      2. Timeline (the vertical progress tracker)
                      3. Items List (what was purchased + total)
                ════════════════════════════════════════════════════════ */}
                <AnimatePresence mode="wait">
                    {order && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.5 }}
                        >
                            {/* ────── PART 1: Order Summary Card ────── */}
                            <div className="mb-8 p-5 bg-surface-secondary/40 border border-white/5 rounded-2xl">
                                {/* Top row: Order ID + Status Badge */}
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <p className="text-[10px] uppercase tracking-widest text-white/25 mb-1">Order ID</p>
                                        <div className="flex items-center gap-2">
                                            <p className="text-white font-bold text-sm font-mono">{order.orderId}</p>
                                            {/* Copy button — copies Order ID to clipboard */}
                                            <button
                                                onClick={copyOrderId}
                                                className="text-white/20 hover:text-white/50 transition-colors cursor-pointer"
                                            >
                                                {copied ? <Check className="h-3.5 w-3.5 text-neon-green" /> : <Copy className="h-3.5 w-3.5" />}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Status Badge — color changes based on status:
                                        Red = Rejected, Green = Delivered, Amber = Processing */}
                                    <div className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider ${isRejected
                                            ? "bg-red-500/15 text-red-400 border border-red-500/20"
                                            : order.status === "success"
                                                ? "bg-neon-green/15 text-neon-green border border-neon-green/20"
                                                : "bg-amber-500/15 text-amber-400 border border-amber-500/20"
                                        }`}>
                                        {isRejected ? "Rejected" : order.status === "success" ? "Delivered" : "Processing"}
                                    </div>
                                </div>

                                {/* Info Grid: Player Name, Edition, Date */}
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                                    <div>
                                        <p className="text-white/25 text-[10px] uppercase tracking-wider mb-0.5">Player</p>
                                        <p className="text-white font-medium">{order.minecraftUsername}</p>
                                    </div>
                                    <div>
                                        <p className="text-white/25 text-[10px] uppercase tracking-wider mb-0.5">Edition</p>
                                        <p className="text-white font-medium capitalize">{order.edition}</p>
                                    </div>
                                    <div>
                                        <p className="text-white/25 text-[10px] uppercase tracking-wider mb-0.5">Date</p>
                                        <p className="text-white font-medium">
                                            {order.createdAt
                                                ? new Date(order.createdAt).toLocaleDateString("en-IN", {
                                                    day: "numeric",
                                                    month: "short",
                                                    year: "numeric",
                                                })
                                                : "N/A"}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* ────── PART 2: Order Progress Timeline ──────
                                This is the vertical progress tracker.
                                If the order is rejected, we show a rejection card instead. */}
                            <div className="mb-8">
                                <h3 className="text-white/25 text-[10px] uppercase tracking-widest font-semibold mb-5">
                                    Order Progress
                                </h3>

                                {isRejected ? (
                                    /* ── REJECTED STATE ──
                                       If payment verification failed, show this error card
                                       instead of the timeline */
                                    <div className="p-6 bg-red-500/5 border border-red-500/15 rounded-2xl text-center">
                                        <XCircle className="h-12 w-12 text-red-400 mx-auto mb-3" />
                                        <h3 className="text-red-400 font-bold text-lg mb-1">Order Rejected</h3>
                                        <p className="text-white/30 text-sm">
                                            Your payment could not be verified. Please contact support if you believe this is an error.
                                        </p>
                                    </div>
                                ) : (
                                    /* ── TIMELINE STEPS ──
                                       A vertical line with 4 circles (steps).
                                       Completed steps glow green, future steps are dimmed. */
                                    <div className="relative pl-8">
                                        {/* The vertical connecting line (thin gray bar) */}
                                        <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-white/5" />

                                        {timelineSteps.map((step, index) => {
                                            // Is this step completed? (index <= currentStep)
                                            const isCompleted = index <= currentStep;
                                            // Is this the step we're currently on?
                                            const isCurrent = index === currentStep;

                                            return (
                                                <div key={step.key} className="relative mb-8 last:mb-0">
                                                    {/* Step Circle — the round icon on the left
                                                        Green glow = completed, Gray = not yet reached */}
                                                    <div className={`
                                                        absolute -left-8 top-0.5 flex h-8 w-8 items-center justify-center
                                                        rounded-full border-2 transition-all duration-500
                                                        ${isCompleted
                                                            ? "bg-neon-green/20 border-neon-green/50 text-neon-green shadow-glow-green"
                                                            : "bg-surface-secondary/40 border-white/10 text-white/20"
                                                        }
                                                        ${isCurrent ? "ring-4 ring-neon-green/10" : ""}
                                                    `}>
                                                        <step.icon className="h-3.5 w-3.5" />
                                                    </div>

                                                    {/* Step Text — label + description
                                                        Current step also gets a pulsing "Current" badge */}
                                                    <div className={`pt-0.5 transition-all duration-500 ${isCompleted ? "opacity-100" : "opacity-30"}`}>
                                                        <h4 className={`text-sm font-bold ${isCompleted ? "text-white" : "text-white/40"}`}>
                                                            {step.label}
                                                            {isCurrent && (
                                                                <span className="ml-2 inline-flex items-center gap-1 text-[10px] font-medium text-neon-green">
                                                                    <Clock className="h-3 w-3 animate-pulse" />
                                                                    Current
                                                                </span>
                                                            )}
                                                        </h4>
                                                        <p className="text-xs text-white/30 mt-0.5">{step.description}</p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* ────── PART 3: Items Ordered List ──────
                                Shows each item the customer purchased,
                                plus any coupon discount and the final total. */}
                            <div className="p-5 bg-surface-secondary/40 border border-white/5 rounded-2xl">
                                <h3 className="text-white/25 text-[10px] uppercase tracking-widest font-semibold mb-4">
                                    Items Ordered
                                </h3>

                                {/* List of items */}
                                <div className="space-y-3">
                                    {order.items.map((item, i) => (
                                        <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                                            <div>
                                                <p className="text-white text-sm font-medium">{item.name}</p>
                                                <p className="text-white/25 text-xs">Qty: {item.quantity}</p>
                                            </div>
                                            <p className="text-neon-green font-bold text-sm">₹{item.lineTotal.toFixed(2)}</p>
                                        </div>
                                    ))}
                                </div>

                                {/* Coupon Discount — only shown if a coupon was applied */}
                                {order.discount > 0 && (
                                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
                                        <p className="text-white/40 text-sm">
                                            Coupon: <span className="text-neon-green font-medium">{order.couponCode}</span>
                                        </p>
                                        <p className="text-red-400 text-sm font-medium">-₹{order.discount.toFixed(2)}</p>
                                    </div>
                                )}

                                {/* Final Total */}
                                <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
                                    <p className="text-white font-bold text-sm">Total</p>
                                    <p className="text-neon-green font-black text-lg">₹{order.total.toFixed(2)}</p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
