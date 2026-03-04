// ═══════════════════════════════════════════════════════════════
// FILE: CartSidebar.tsx
// PURPOSE: Slide-in sidebar panel with a premium multi-step checkout:
//
//   STEP 0 — CART:     Review items, subtotal, click "Checkout"
//   STEP 1 — USERNAME: Java/Bedrock edition toggle + username input
//                      + case-sensitive warning + submit arrow
//   STEP 2 — PAYMENT:  UPI QR code + UPI ID + 12-digit UTR input
//                      + "Place Order & Verify" with loading state
//   STEP 3 — RESULT:   Success (order ID) or Error screen
//
// Framer Motion slide transitions between steps.
// LOCATION: src/components/CartSidebar.tsx
// ═══════════════════════════════════════════════════════════════

"use client";

// ─── Imports ───────────────────────────────────────────────────
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import {
    X,
    ShoppingBag,
    Loader2,
    CheckCircle2,
    AlertCircle,
    ArrowLeft,
    ArrowRight,
    Monitor,
    Gamepad2,
    Ticket,
} from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import CartItemRow from "./CartItemRow";

// ─── Types ─────────────────────────────────────────────────────

/** Which screen the user sees inside the sidebar */
type CheckoutStep = "cart" | "username" | "payment" | "success" | "error";

/** Minecraft edition — affects username logic (Bedrock prepends ".") */
type Edition = "java" | "bedrock";

// ─── Constants ─────────────────────────────────────────────────

/** Your UPI ID — change this to your real UPI ID */
const UPI_ID = "princeprajapti2589-1@okaxis";

/** Payee name shown in UPI payment apps */
const PAYEE_NAME = "Arelix Developments";

// ─── Slide Animation Variants ──────────────────────────────────
// Used for smooth left/right sliding between checkout steps.
const slideVariants = {
    enter: (direction: number) => ({
        x: direction > 0 ? 300 : -300,
        opacity: 0,
    }),
    center: {
        x: 0,
        opacity: 1,
    },
    exit: (direction: number) => ({
        x: direction > 0 ? -300 : 300,
        opacity: 0,
    }),
};

// ═══════════════════════════════════════════════════════════════
// COMPONENT: CartSidebar
// ═══════════════════════════════════════════════════════════════

export default function CartSidebar() {
    // ── Cart Store ──
    const items = useCartStore((s) => s.items);
    const isCartOpen = useCartStore((s) => s.isCartOpen);
    const closeCart = useCartStore((s) => s.closeCart);
    const clearCart = useCartStore((s) => s.clearCart);
    const getTotal = useCartStore((s) => s.getTotal);
    const getItemCount = useCartStore((s) => s.getItemCount);

    // ── Local State ──
    const [step, setStep] = useState<CheckoutStep>("cart");     // Current checkout step
    const [direction, setDirection] = useState(1);               // Slide direction (1=forward, -1=back)
    const [edition, setEdition] = useState<Edition>("java");     // Java or Bedrock toggle
    const [username, setUsername] = useState("");                 // Raw username input
    const [usernameError, setUsernameError] = useState("");      // Validation error text
    const [utrNumber, setUtrNumber] = useState("");              // 12-digit UTR / Transaction ID
    const [utrError, setUtrError] = useState("");                // UTR validation error
    const [isProcessing, setIsProcessing] = useState(false);     // Loading spinner state
    const [orderResult, setOrderResult] = useState<{
        orderId?: string;
        total?: number;
        username?: string;
        error?: string;
    } | null>(null);

    // ── Coupon State ──
    const [couponCode, setCouponCode] = useState("");
    const [couponError, setCouponError] = useState("");
    const [couponDiscount, setCouponDiscount] = useState(0);
    const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
    const [validatingCoupon, setValidatingCoupon] = useState(false);

    // ── Computed Values ──
    const subtotal = getTotal();
    const total = Math.max(0, subtotal - couponDiscount);
    const itemCount = getItemCount();

    // ── Computed: Final username with Bedrock "." prefix ──
    // Bedrock Edition users get a "." prepended to their username
    const finalUsername =
        edition === "bedrock" && !username.startsWith(".")
            ? `.${username.trim().replace(/\s/g, "_")}`
            : username.trim();

    // ═══════════════════════════════════════════════════════════
    // NAVIGATION HANDLERS
    // ═══════════════════════════════════════════════════════════

    /** Apply coupon code */
    const applyCoupon = async () => {
        if (!couponCode.trim()) return;
        setValidatingCoupon(true);
        setCouponError("");
        try {
            const res = await fetch("/api/coupons/validate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code: couponCode.trim(), cartTotal: subtotal }),
            });
            const data = await res.json();
            if (data.valid) {
                setCouponDiscount(data.discount);
                setAppliedCoupon(data.coupon.code);
                setCouponError("");
            } else {
                setCouponError(data.error || "Invalid coupon.");
                setCouponDiscount(0);
                setAppliedCoupon(null);
            }
        } catch {
            setCouponError("Failed to validate coupon.");
        } finally {
            setValidatingCoupon(false);
        }
    };

    /** Remove applied coupon */
    const removeCoupon = () => {
        setCouponCode("");
        setCouponDiscount(0);
        setAppliedCoupon(null);
        setCouponError("");
    };

    /** Cart → Username step */
    const goToUsername = () => {
        setDirection(1);
        setStep("username");
        setUsernameError("");
    };

    /** Username → back to Cart */
    const backToCart = () => {
        setDirection(-1);
        setStep("cart");
        setUsernameError("");
    };

    /** Username → Payment step (validates username first) */
    const goToPayment = () => {
        const trimmed = username.trim();

        if (!trimmed) {
            setUsernameError("Please enter your Minecraft username.");
            return;
        }
        if (trimmed.length < 3 || trimmed.length > 16) {
            setUsernameError("Username must be 3–16 characters.");
            return;
        }
        if (!/^[a-zA-Z0-9_ ]+$/.test(trimmed)) {
            setUsernameError("Only letters, numbers, underscores, and spaces allowed.");
            return;
        }

        setUsernameError("");
        setDirection(1);
        setStep("payment");
    };

    /** Payment → back to Username */
    const backToUsername = () => {
        setDirection(-1);
        setStep("username");
        setUtrError("");
    };

    /** Payment → Place Order (validates UTR, then POSTs to API) */
    const handlePlaceOrder = async () => {
        // Validate UTR: must be exactly 12 digits
        const trimmedUtr = utrNumber.trim();
        if (!trimmedUtr) {
            setUtrError("Please enter your UTR / Transaction ID.");
            return;
        }
        if (!/^\d{12}$/.test(trimmedUtr)) {
            setUtrError("UTR must be exactly 12 digits.");
            return;
        }

        setUtrError("");
        setIsProcessing(true);
        setOrderResult(null);

        try {
            const response = await fetch("/api/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    minecraftUsername: finalUsername,
                    edition,
                    utrNumber: trimmedUtr,
                    couponCode: appliedCoupon || undefined,
                    items: items.map((item) => ({
                        id: item.id,
                        quantity: item.quantity,
                    })),
                }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setDirection(1);
                setStep("success");
                setOrderResult({
                    orderId: data.orderId,
                    total: data.total,
                    username: finalUsername,
                });
                clearCart();
            } else {
                setDirection(1);
                setStep("error");
                setOrderResult({ error: data.error || "Checkout failed." });
            }
        } catch {
            setDirection(1);
            setStep("error");
            setOrderResult({ error: "Network error. Please try again." });
        } finally {
            setIsProcessing(false);
        }
    };

    /** Reset everything and close sidebar */
    const resetAndClose = () => {
        setStep("cart");
        setDirection(1);
        setEdition("java");
        setUsername("");
        setUsernameError("");
        setUtrNumber("");
        setUtrError("");
        setOrderResult(null);
        removeCoupon();
        closeCart();
    };

    /** Error → back to payment to retry */
    const retryPayment = () => {
        setDirection(-1);
        setStep("payment");
        setOrderResult(null);
    };

    // ═══════════════════════════════════════════════════════════
    // HEADER TITLE — changes based on current step
    // ═══════════════════════════════════════════════════════════
    const headerTitle = {
        cart: "Your Cart",
        username: "Enter Username",
        payment: "Complete Payment",
        success: "Order Confirmed",
        error: "Order Failed",
    }[step];

    // Show back arrow on username and payment steps
    const showBackArrow = step === "username" || step === "payment";
    const handleBack =
        step === "payment" ? backToUsername : step === "username" ? backToCart : undefined;

    return (
        <AnimatePresence>
            {isCartOpen && (
                <>
                    {/* ── Backdrop Overlay ── */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
                        onClick={resetAndClose}
                    />

                    {/* ── Sidebar Panel ── */}
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed top-0 right-0 z-[70] flex h-full w-full max-w-md flex-col border-l border-white/5 bg-surface-primary/98 backdrop-blur-xl shadow-2xl"
                    >
                        {/* ═══ HEADER ═══ */}
                        <div className="flex items-center justify-between border-b border-white/5 px-6 py-4">
                            <div className="flex items-center gap-3">
                                {showBackArrow && (
                                    <button
                                        onClick={handleBack}
                                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-white/50 hover:text-white hover:border-white/20 transition-colors cursor-pointer mr-1"
                                    >
                                        <ArrowLeft className="h-4 w-4" />
                                    </button>
                                )}
                                <ShoppingBag className="h-5 w-5 text-neon-green" />
                                <h2 className="font-[family-name:var(--font-display)] text-lg font-bold text-white">
                                    {headerTitle}
                                </h2>
                                {step === "cart" && itemCount > 0 && (
                                    <span className="rounded-full bg-neon-green/15 px-2 py-0.5 text-xs font-bold text-neon-green">
                                        {itemCount}
                                    </span>
                                )}
                            </div>
                            <button
                                onClick={resetAndClose}
                                className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-white/50 hover:text-white hover:border-white/20 transition-colors cursor-pointer"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        {/* ═══ BODY — animated slide transitions ═══ */}
                        <div className="relative flex-1 overflow-hidden">
                            <AnimatePresence mode="wait" custom={direction}>
                                <motion.div
                                    key={step}
                                    custom={direction}
                                    variants={slideVariants}
                                    initial="enter"
                                    animate="center"
                                    exit="exit"
                                    transition={{ duration: 0.3, ease: "easeInOut" }}
                                    className="absolute inset-0 overflow-y-auto px-6 py-4"
                                >

                                    {/* ─────────────────────────────────────────────
                      STEP 0: CART — Review items
                      ───────────────────────────────────────────── */}
                                    {step === "cart" && (
                                        <>
                                            {items.length === 0 ? (
                                                <div className="flex flex-col items-center justify-center h-full text-center gap-3">
                                                    <ShoppingBag className="h-12 w-12 text-white/10" />
                                                    <p className="text-sm text-white/30">Your cart is empty</p>
                                                    <p className="text-xs text-white/20">
                                                        Add some items to get started!
                                                    </p>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col gap-3">
                                                    {items.map((item) => (
                                                        <CartItemRow key={item.id} item={item} />
                                                    ))}
                                                </div>
                                            )}
                                        </>
                                    )}

                                    {/* ─────────────────────────────────────────────
                      STEP 1: USERNAME — Edition toggle + username
                      ───────────────────────────────────────────── */}
                                    {step === "username" && (
                                        <div className="flex flex-col items-center gap-5 pt-2">
                                            {/* Title */}
                                            <h3 className="text-lg font-bold text-neon-green text-center">
                                                Enter your username to continue
                                            </h3>

                                            {/* Java / Bedrock Toggle Buttons */}
                                            <div className="flex gap-2 w-full">
                                                <button
                                                    onClick={() => setEdition("java")}
                                                    className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all duration-200 cursor-pointer border ${edition === "java"
                                                        ? "bg-neon-green/15 border-neon-green/40 text-neon-green shadow-glow-green"
                                                        : "bg-surface-secondary/40 border-white/10 text-white/40 hover:text-white/60 hover:border-white/20"
                                                        }`}
                                                >
                                                    <Monitor className="h-4 w-4" />
                                                    Java Edition
                                                </button>
                                                <button
                                                    onClick={() => setEdition("bedrock")}
                                                    className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all duration-200 cursor-pointer border ${edition === "bedrock"
                                                        ? "bg-neon-green/15 border-neon-green/40 text-neon-green shadow-glow-green"
                                                        : "bg-surface-secondary/40 border-white/10 text-white/40 hover:text-white/60 hover:border-white/20"
                                                        }`}
                                                >
                                                    <Gamepad2 className="h-4 w-4" />
                                                    Bedrock Edition
                                                </button>
                                            </div>

                                            {/* Warning text */}
                                            <div className="rounded-xl border border-amber-500/15 bg-amber-500/5 px-4 py-3 text-center">
                                                <p className="text-xs text-amber-400/80 leading-relaxed">
                                                    Usernames are case sensitive, no spaces.
                                                </p>
                                                <p className="text-xs text-amber-400/60 leading-relaxed mt-1">
                                                    <span className="font-bold text-amber-400/80">Warning:</span>{" "}
                                                    Enter your username exactly as in-game. We do not transfer
                                                    ranks to other accounts and there are no refunds for wrong
                                                    usernames.
                                                </p>
                                            </div>

                                            {/* Username input with arrow button */}
                                            <div className="w-full relative">
                                                <input
                                                    type="text"
                                                    value={username}
                                                    onChange={(e) => {
                                                        setUsername(e.target.value);
                                                        if (usernameError) setUsernameError("");
                                                    }}
                                                    onKeyDown={(e) => {
                                                        if (e.key === "Enter") goToPayment();
                                                    }}
                                                    placeholder={
                                                        edition === "bedrock"
                                                            ? "e.g. Steve 123"
                                                            : "e.g. Steve_123"
                                                    }
                                                    maxLength={16}
                                                    autoFocus
                                                    className={`w-full rounded-xl border bg-surface-secondary/60 pl-4 pr-12 py-3.5 text-sm text-white placeholder-white/20 outline-none transition-all duration-200 focus:ring-2 ${usernameError
                                                        ? "border-red-500/40 focus:ring-red-500/30"
                                                        : "border-white/10 focus:border-neon-green/30 focus:ring-neon-green/20"
                                                        }`}
                                                />
                                                {/* Submit arrow button inside input */}
                                                <button
                                                    onClick={goToPayment}
                                                    className="absolute right-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-lg bg-neon-green text-black hover:bg-neon-green/90 transition-colors cursor-pointer"
                                                >
                                                    <ArrowRight className="h-4 w-4" />
                                                </button>
                                            </div>

                                            {/* Username validation error */}
                                            {usernameError && (
                                                <p className="flex items-center gap-1.5 text-xs text-red-400 -mt-3 w-full">
                                                    <AlertCircle className="h-3 w-3 shrink-0" />
                                                    {usernameError}
                                                </p>
                                            )}

                                            {/* Bedrock auto-period preview */}
                                            {edition === "bedrock" && username.trim() && (
                                                <div className="w-full rounded-xl border border-neon-green/10 bg-neon-green/5 px-4 py-2">
                                                    <p className="text-xs text-white/30">
                                                        Your username will be sent as:{" "}
                                                        <span className="text-neon-green font-bold font-mono">
                                                            {finalUsername}
                                                        </span>
                                                    </p>
                                                </div>
                                            )}

                                            {/* Footer disclaimer */}
                                            <p className="text-[10px] text-white/20 text-center leading-relaxed px-2">
                                                Minecraft Bedrock Edition users will automatically have a
                                                period added to the front of their name upon login and
                                                replace any spaces with underscore (_).
                                            </p>
                                        </div>
                                    )}

                                    {/* ─────────────────────────────────────────────
                      STEP 2: PAYMENT — UPI QR + UTR input
                      ───────────────────────────────────────────── */}
                                    {step === "payment" && (
                                        <div className="flex flex-col items-center gap-5 pt-2">
                                            {/* Amount to pay */}
                                            <div className="w-full rounded-xl border border-white/5 bg-surface-secondary/40 p-4 text-center">
                                                <p className="text-xs font-medium uppercase tracking-wider text-white/30 mb-1">
                                                    Amount to Pay
                                                </p>
                                                <p className="text-3xl font-black text-neon-green">
                                                    ₹{total.toFixed(2)}
                                                </p>
                                                <p className="text-xs text-white/30 mt-1">
                                                    {itemCount} item{itemCount > 1 ? "s" : ""} · Player:{" "}
                                                    <span className="text-white/50 font-mono">
                                                        {finalUsername}
                                                    </span>
                                                </p>
                                            </div>

                                            {/* Dynamic UPI QR Code —
                                               Encodes a UPI deep link with locked amount.
                                               Format: upi://pay?pa=UPI_ID&pn=NAME&am=AMOUNT&cu=INR
                                               The amount is locked so users cannot change it while scanning. */}
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="rounded-2xl border border-white/10 bg-white p-4 shadow-lg">
                                                    <QRCodeSVG
                                                        value={`upi://pay?pa=${UPI_ID}&pn=${PAYEE_NAME}&am=${total.toFixed(2)}&cu=INR`}
                                                        size={200}
                                                        bgColor="#ffffff"
                                                        fgColor="#000000"
                                                        level="H"
                                                        includeMargin={false}
                                                    />
                                                </div>
                                                <p className="text-[11px] text-white/25">
                                                    Scan to pay with any UPI app
                                                </p>
                                                {/* Payment method badges */}
                                                <div className="flex flex-wrap items-center justify-center gap-1.5 mt-1">
                                                    <span className="rounded border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-bold text-white/40">
                                                        UPI
                                                    </span>
                                                    <span className="rounded border border-[#168AFF]/30 bg-[#168AFF]/10 px-2 py-0.5 text-[10px] font-bold text-[#168AFF]/70">
                                                        GPay
                                                    </span>
                                                    <span className="rounded border border-[#5F259F]/30 bg-[#5F259F]/10 px-2 py-0.5 text-[10px] font-bold text-[#5F259F]/70">
                                                        PhonePe
                                                    </span>
                                                    <span className="rounded border border-[#00BAF2]/30 bg-[#00BAF2]/10 px-2 py-0.5 text-[10px] font-bold text-[#00BAF2]/70">
                                                        Paytm
                                                    </span>
                                                </div>
                                                <p className="text-xs text-white/30">Scan QR or pay to:</p>
                                                {/* UPI ID display — click to copy */}
                                                <button
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(UPI_ID);
                                                    }}
                                                    className="rounded-lg border border-neon-green/20 bg-neon-green/5 px-4 py-1.5 font-mono text-sm text-neon-green hover:bg-neon-green/10 transition-colors cursor-pointer"
                                                    title="Click to copy UPI ID"
                                                >
                                                    {UPI_ID}
                                                </button>
                                            </div>

                                            {/* UTR / Transaction ID Input */}
                                            <div className="w-full">
                                                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/40">
                                                    Enter 12-digit UTR / Transaction ID
                                                </label>
                                                <input
                                                    type="text"
                                                    value={utrNumber}
                                                    onChange={(e) => {
                                                        // Only allow digits, max 12
                                                        const val = e.target.value.replace(/\D/g, "").slice(0, 12);
                                                        setUtrNumber(val);
                                                        if (utrError) setUtrError("");
                                                    }}
                                                    onKeyDown={(e) => {
                                                        if (e.key === "Enter" && !isProcessing) handlePlaceOrder();
                                                    }}
                                                    placeholder="e.g. 412345678901"
                                                    maxLength={12}
                                                    inputMode="numeric"
                                                    className={`w-full rounded-xl border bg-surface-secondary/60 px-4 py-3.5 text-sm text-white placeholder-white/20 outline-none transition-all duration-200 focus:ring-2 font-mono tracking-widest ${utrError
                                                        ? "border-red-500/40 focus:ring-red-500/30"
                                                        : "border-white/10 focus:border-neon-green/30 focus:ring-neon-green/20"
                                                        }`}
                                                />
                                                {/* UTR character count */}
                                                <div className="flex items-center justify-between mt-1.5">
                                                    {utrError ? (
                                                        <p className="flex items-center gap-1 text-xs text-red-400">
                                                            <AlertCircle className="h-3 w-3" />
                                                            {utrError}
                                                        </p>
                                                    ) : (
                                                        <span />
                                                    )}
                                                    <span
                                                        className={`text-[10px] ${utrNumber.length === 12
                                                            ? "text-neon-green"
                                                            : "text-white/20"
                                                            }`}
                                                    >
                                                        {utrNumber.length}/12
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Info note */}
                                            <div className="w-full rounded-xl border border-neon-green/10 bg-neon-green/5 px-4 py-3">
                                                <p className="text-[11px] text-neon-green/60 leading-relaxed">
                                                    💡 After paying via UPI, check your payment app for the
                                                    12-digit UTR number and enter it above. We&apos;ll verify
                                                    your payment and deliver items in-game.
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* ─────────────────────────────────────────────
                      STEP 3A: SUCCESS
                      ───────────────────────────────────────────── */}
                                    {step === "success" && (
                                        <div className="flex flex-col items-center justify-center h-full text-center gap-4">
                                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-neon-green/15">
                                                <CheckCircle2 className="h-8 w-8 text-neon-green" />
                                            </div>
                                            <h3 className="text-xl font-bold text-white">
                                                Order Placed!
                                            </h3>
                                            <p className="text-sm text-white/40">
                                                Your items will be delivered to{" "}
                                                <span className="text-neon-green font-semibold font-mono">
                                                    {orderResult?.username}
                                                </span>{" "}
                                                after payment verification.
                                            </p>
                                            {orderResult?.orderId && (
                                                <p className="text-xs text-white/30 font-mono bg-surface-secondary/40 rounded-lg px-3 py-1.5">
                                                    Order ID: {orderResult.orderId}
                                                </p>
                                            )}
                                            {orderResult?.total !== undefined && orderResult.total > 0 && (
                                                <p className="text-sm text-white/40">
                                                    Total:{" "}
                                                    <span className="text-neon-green font-bold">
                                                        ₹{orderResult.total.toFixed(2)}
                                                    </span>
                                                </p>
                                            )}
                                            <button
                                                onClick={resetAndClose}
                                                className="mt-4 rounded-xl bg-neon-green/10 border border-neon-green/30 px-6 py-2.5 text-sm font-semibold text-neon-green hover:bg-neon-green/20 transition-all cursor-pointer"
                                            >
                                                Continue Shopping
                                            </button>
                                        </div>
                                    )}

                                    {/* ─────────────────────────────────────────────
                      STEP 3B: ERROR
                      ───────────────────────────────────────────── */}
                                    {step === "error" && (
                                        <div className="flex flex-col items-center justify-center h-full text-center gap-4">
                                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/15">
                                                <AlertCircle className="h-8 w-8 text-red-400" />
                                            </div>
                                            <h3 className="text-xl font-bold text-white">
                                                Verification Failed
                                            </h3>
                                            <p className="text-sm text-white/40">
                                                {orderResult?.error || "Something went wrong."}
                                            </p>
                                            <button
                                                onClick={retryPayment}
                                                className="mt-4 rounded-xl bg-white/5 border border-white/10 px-6 py-2.5 text-sm font-semibold text-white/70 hover:bg-white/10 transition-all cursor-pointer"
                                            >
                                                Try Again
                                            </button>
                                        </div>
                                    )}
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        {/* ═══ FOOTER — step-specific action buttons ═══ */}

                        {/* Cart footer */}
                        {step === "cart" && items.length > 0 && (
                            <div className="border-t border-white/5 px-6 py-4 space-y-3">
                                {/* Coupon Code Input */}
                                <div>
                                    {appliedCoupon ? (
                                        <div className="flex items-center justify-between px-3 py-2.5 bg-neon-green/5 border border-neon-green/20 rounded-xl">
                                            <div className="flex items-center gap-2">
                                                <Ticket className="h-3.5 w-3.5 text-neon-green" />
                                                <span className="text-xs font-bold font-mono text-neon-green">{appliedCoupon}</span>
                                                <span className="text-xs text-neon-green/60">−₹{couponDiscount.toFixed(2)}</span>
                                            </div>
                                            <button onClick={removeCoupon} className="text-white/40 hover:text-red-400 transition-colors cursor-pointer">
                                                <X className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={couponCode}
                                                onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); setCouponError(""); }}
                                                onKeyDown={(e) => { if (e.key === "Enter") applyCoupon(); }}
                                                placeholder="Coupon code"
                                                className="flex-1 px-3 py-2 bg-surface-secondary/60 border border-white/10 rounded-xl text-xs text-white placeholder-white/20 outline-none focus:border-neon-green/30 font-mono"
                                            />
                                            <button
                                                onClick={applyCoupon}
                                                disabled={validatingCoupon || !couponCode.trim()}
                                                className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-medium text-white/60 hover:text-neon-green hover:border-neon-green/30 transition-all cursor-pointer disabled:opacity-40"
                                            >
                                                {validatingCoupon ? "..." : "Apply"}
                                            </button>
                                        </div>
                                    )}
                                    {couponError && (
                                        <p className="text-[10px] text-red-400 mt-1 flex items-center gap-1">
                                            <AlertCircle className="h-3 w-3" />
                                            {couponError}
                                        </p>
                                    )}
                                </div>

                                {/* Total */}
                                {couponDiscount > 0 && (
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-white/40">Subtotal:</span>
                                        <span className="text-white/40">₹{subtotal.toFixed(2)}</span>
                                    </div>
                                )}
                                {couponDiscount > 0 && (
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-neon-green/60">Discount:</span>
                                        <span className="text-neon-green/60">−₹{couponDiscount.toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="flex items-center justify-between">
                                    <span className="text-base font-semibold text-white">Total:</span>
                                    <span className="text-xl font-black text-neon-green">
                                        ₹{total.toFixed(2)}
                                    </span>
                                </div>

                                {/* Proceed to Checkout */}
                                <button
                                    onClick={goToUsername}
                                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-neon-green/20 to-neon-green/10 border border-neon-green/30 py-3.5 text-sm font-bold text-neon-green transition-all duration-300 hover:from-neon-green/30 hover:to-neon-green/20 hover:shadow-glow-green active:scale-[0.98] cursor-pointer"
                                >
                                    Proceed to Checkout
                                </button>

                                {/* Clear Cart */}
                                <button
                                    onClick={clearCart}
                                    className="w-full rounded-xl border border-white/10 py-2.5 text-center text-xs font-medium text-white/40 hover:text-red-400 hover:border-red-400/30 transition-all cursor-pointer"
                                >
                                    Clear Cart
                                </button>
                            </div>
                        )}

                        {/* Payment footer — "Place Order & Verify" */}
                        {step === "payment" && (
                            <div className="border-t border-white/5 px-6 py-4 space-y-3">
                                <button
                                    onClick={handlePlaceOrder}
                                    disabled={isProcessing}
                                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-neon-green/20 to-neon-green/10 border border-neon-green/30 py-3.5 text-sm font-bold text-neon-green transition-all duration-300 hover:from-neon-green/30 hover:to-neon-green/20 hover:shadow-glow-green active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isProcessing ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Verifying Payment...
                                        </>
                                    ) : (
                                        <>Place Order &amp; Verify</>
                                    )}
                                </button>
                                <p className="text-center text-[10px] text-white/15">
                                    By placing this order, you agree to our Terms of Service.
                                </p>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
