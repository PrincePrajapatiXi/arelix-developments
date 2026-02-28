// ═══════════════════════════════════════════════════════════════
// FILE: Toast.tsx
// PURPOSE: Renders toast notifications (e.g., "Emperor Rank
//          added to cart!") in the top-right corner of the screen.
//          Each toast auto-dismisses after 2.5 seconds.
//          Animated with Framer Motion (slide in from right + fade out).
// LOCATION: src/components/Toast.tsx
// ═══════════════════════════════════════════════════════════════

"use client";

// ─── Imports ───────────────────────────────────────────────────
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";

// ═══════════════════════════════════════════════════════════════
// COMPONENT: ToastContainer
// Renders all active toasts stacked vertically.
// ═══════════════════════════════════════════════════════════════

export default function ToastContainer() {
    // Read the array of active toasts from the cart store
    const toasts = useCartStore((s) => s.toasts);

    return (
        <div className="fixed top-20 right-4 z-[100] flex flex-col gap-2">
            <AnimatePresence>
                {toasts.map((toast) => (
                    <motion.div
                        key={toast.id}
                        initial={{ opacity: 0, x: 80, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 80, scale: 0.9 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="flex items-center gap-2 rounded-xl border border-neon-green/20 bg-surface-primary/95 px-4 py-3 shadow-lg backdrop-blur-xl"
                    >
                        {/* Green check icon */}
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-neon-green/15">
                            <Check className="h-3.5 w-3.5 text-neon-green" />
                        </div>
                        {/* Toast message */}
                        <span className="text-sm font-medium text-white/80">
                            {toast.message}
                        </span>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}
