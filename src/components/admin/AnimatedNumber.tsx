// ═══════════════════════════════════════════════════════════════
// FILE: AnimatedNumber.tsx
// PURPOSE: Animated counter that counts up from 0 to the target
//          value using framer-motion for premium dashboard feel.
// LOCATION: src/components/admin/AnimatedNumber.tsx
// ═══════════════════════════════════════════════════════════════

"use client";

import { useEffect, useRef } from "react";
import { animate, useInView, useMotionValue, useTransform, motion } from "framer-motion";

interface AnimatedNumberProps {
    value: number;
    prefix?: string;
    suffix?: string;
    decimals?: number;
    duration?: number;
    className?: string;
}

export default function AnimatedNumber({
    value,
    prefix = "",
    suffix = "",
    decimals = 0,
    duration = 1.5,
    className = "",
}: AnimatedNumberProps) {
    const ref = useRef<HTMLSpanElement>(null);
    const isInView = useInView(ref, { once: true });
    const motionVal = useMotionValue(0);
    const rounded = useTransform(motionVal, (v) => {
        return `${prefix}${v.toFixed(decimals)}${suffix}`;
    });

    useEffect(() => {
        if (isInView) {
            const controls = animate(motionVal, value, {
                duration,
                ease: "easeOut",
            });
            return () => controls.stop();
        }
    }, [isInView, value, duration, motionVal]);

    return (
        <motion.span ref={ref} className={className}>
            {rounded}
        </motion.span>
    );
}
