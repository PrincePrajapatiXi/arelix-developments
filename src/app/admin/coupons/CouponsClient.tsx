// ═══════════════════════════════════════════════════════════════
// FILE: CouponsClient.tsx
// PURPOSE: Client-side admin page for creating, viewing, and
//          deleting discount coupon codes.
// LOCATION: src/app/admin/coupons/CouponsClient.tsx
// ═══════════════════════════════════════════════════════════════

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Ticket,
    Plus,
    Trash2,
    Percent,
    DollarSign,
    Copy,
    Check,
    X,
    AlertCircle,
    Infinity,
    Edit2,
} from "lucide-react";

// ─── Types ─────────────────────────────────────────────────────

interface Coupon {
    _id: string;
    code: string;
    type: "percentage" | "flat";
    value: number;
    minOrder: number;
    maxUses: number;
    usedCount: number;
    expiresAt: string | null;
    active: boolean;
    createdAt: string;
}

// ═══════════════════════════════════════════════════════════════

export default function CouponsClient({ coupons: initial }: { coupons: Coupon[] }) {
    const [coupons, setCoupons] = useState<Coupon[]>(initial);
    const [showForm, setShowForm] = useState(false);
    const [deleting, setDeleting] = useState<string | null>(null);
    const [copiedCode, setCopiedCode] = useState<string | null>(null);
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);

    // Form state
    const [editMode, setEditMode] = useState<string | null>(null);
    const [formCode, setFormCode] = useState("");
    const [formType, setFormType] = useState<"percentage" | "flat">("percentage");
    const [formValue, setFormValue] = useState("");
    const [formMinOrder, setFormMinOrder] = useState("");
    const [formMaxUses, setFormMaxUses] = useState("");
    const [formExpiry, setFormExpiry] = useState("");

    const resetForm = () => {
        setFormCode("");
        setFormType("percentage");
        setFormValue("");
        setFormMinOrder("");
        setFormMaxUses("");
        setFormExpiry("");
        setError("");
        setEditMode(null);
    };

    const handleEdit = (c: Coupon) => {
        setEditMode(c.code);
        setFormCode(c.code);
        setFormType(c.type);
        setFormValue(c.value.toString());
        setFormMinOrder(c.minOrder ? c.minOrder.toString() : "");
        setFormMaxUses(c.maxUses === -1 ? "" : c.maxUses.toString());
        setFormExpiry(c.expiresAt ? new Date(c.expiresAt).toISOString().slice(0, 16) : "");
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    // ── Create or Update Coupon ────────────────────────────────
    const handleSubmit = async () => {
        if (!formCode.trim() || !formValue.trim()) {
            setError("Code and value are required.");
            return;
        }

        setSaving(true);
        setError("");

        try {
            const method = editMode ? "PUT" : "POST";
            const bodyData = {
                originalCode: editMode || undefined,
                code: formCode.trim(),
                type: formType,
                value: parseFloat(formValue),
                minOrder: formMinOrder ? parseFloat(formMinOrder) : 0,
                maxUses: formMaxUses ? parseInt(formMaxUses) : -1,
                expiresAt: formExpiry ? new Date(formExpiry).toISOString() : null,
            };

            const res = await fetch("/api/admin/coupons", {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(bodyData),
            });

            const data = await res.json();
            if (!res.ok) {
                setError(data.error || `Failed to ${editMode ? "update" : "create"} coupon.`);
                return;
            }

            // Refresh the page to get updated data
            window.location.reload();
        } catch {
            setError("Network error. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    // ── Delete Coupon ──────────────────────────────────────────
    const handleDelete = async (code: string) => {
        setDeleting(code);
        try {
            const res = await fetch(
                `/api/admin/coupons?code=${encodeURIComponent(code)}`,
                { method: "DELETE" }
            );

            if (res.ok) {
                setCoupons((prev) => prev.filter((c) => c.code !== code));
            }
        } catch {
            console.error("Delete failed");
        } finally {
            setDeleting(null);
        }
    };

    // ── Copy Code ──────────────────────────────────────────────
    const copyCode = (code: string) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(null), 1500);
    };

    return (
        <div>
            {/* ── Header ── */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <Ticket className="w-6 h-6 text-emerald-400" />
                        <h1 className="text-2xl md:text-3xl font-bold text-white">
                            Coupons
                        </h1>
                    </div>
                    <p className="text-zinc-500 text-sm">
                        Create and manage discount codes for your store
                    </p>
                </div>
                <button
                    onClick={() => {
                        resetForm();
                        setShowForm(!showForm);
                    }}
                    className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 rounded-xl text-sm font-medium hover:bg-emerald-500/25 transition-all cursor-pointer"
                >
                    {showForm ? (
                        <>
                            <X className="w-4 h-4" /> Cancel
                        </>
                    ) : (
                        <>
                            <Plus className="w-4 h-4" /> New Coupon
                        </>
                    )}
                </button>
            </div>

            {/* ── Create Form ── */}
            <AnimatePresence>
                {showForm && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden mb-6"
                    >
                        <div className="bg-zinc-900/70 border border-zinc-800/50 rounded-2xl p-6">
                            <h3 className="text-white font-semibold mb-4">
                                {editMode ? "Edit Coupon" : "Create New Coupon"}
                            </h3>

                            {error && (
                                <div className="flex items-center gap-2 px-4 py-2.5 mb-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                                    <AlertCircle className="w-4 h-4 shrink-0" />
                                    {error}
                                </div>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                                {/* Code */}
                                <div>
                                    <label className="block text-zinc-500 text-xs uppercase tracking-wider mb-1.5">
                                        Code *
                                    </label>
                                    <input
                                        type="text"
                                        value={formCode}
                                        onChange={(e) =>
                                            setFormCode(
                                                e.target.value.toUpperCase()
                                            )
                                        }
                                        placeholder="e.g. SAVE20"
                                        className="w-full px-3 py-2.5 bg-zinc-800/50 border border-zinc-700/50 rounded-xl text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50 font-mono"
                                    />
                                </div>

                                {/* Type */}
                                <div>
                                    <label className="block text-zinc-500 text-xs uppercase tracking-wider mb-1.5">
                                        Discount Type
                                    </label>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() =>
                                                setFormType("percentage")
                                            }
                                            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${formType === "percentage"
                                                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                                                : "bg-zinc-800/50 text-zinc-400 border border-zinc-700/50"
                                                }`}
                                        >
                                            <Percent className="w-3.5 h-3.5" />
                                            Percentage
                                        </button>
                                        <button
                                            onClick={() =>
                                                setFormType("flat")
                                            }
                                            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${formType === "flat"
                                                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                                                : "bg-zinc-800/50 text-zinc-400 border border-zinc-700/50"
                                                }`}
                                        >
                                            <DollarSign className="w-3.5 h-3.5" />
                                            Flat ₹
                                        </button>
                                    </div>
                                </div>

                                {/* Value */}
                                <div>
                                    <label className="block text-zinc-500 text-xs uppercase tracking-wider mb-1.5">
                                        {formType === "percentage"
                                            ? "Discount %"
                                            : "Discount ₹"}{" "}
                                        *
                                    </label>
                                    <input
                                        type="number"
                                        value={formValue}
                                        onChange={(e) =>
                                            setFormValue(e.target.value)
                                        }
                                        placeholder={
                                            formType === "percentage"
                                                ? "e.g. 20"
                                                : "e.g. 50"
                                        }
                                        min="0"
                                        max={
                                            formType === "percentage"
                                                ? "100"
                                                : undefined
                                        }
                                        className="w-full px-3 py-2.5 bg-zinc-800/50 border border-zinc-700/50 rounded-xl text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50"
                                    />
                                </div>

                                {/* Min Order */}
                                <div>
                                    <label className="block text-zinc-500 text-xs uppercase tracking-wider mb-1.5">
                                        Min Order (₹)
                                    </label>
                                    <input
                                        type="number"
                                        value={formMinOrder}
                                        onChange={(e) =>
                                            setFormMinOrder(e.target.value)
                                        }
                                        placeholder="0 (no limit)"
                                        min="0"
                                        className="w-full px-3 py-2.5 bg-zinc-800/50 border border-zinc-700/50 rounded-xl text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50"
                                    />
                                </div>

                                {/* Max Uses */}
                                <div>
                                    <label className="block text-zinc-500 text-xs uppercase tracking-wider mb-1.5">
                                        Max Uses
                                    </label>
                                    <input
                                        type="number"
                                        value={formMaxUses}
                                        onChange={(e) =>
                                            setFormMaxUses(e.target.value)
                                        }
                                        placeholder="Unlimited"
                                        min="1"
                                        className="w-full px-3 py-2.5 bg-zinc-800/50 border border-zinc-700/50 rounded-xl text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50"
                                    />
                                </div>

                                {/* Expiry */}
                                <div>
                                    <label className="block text-zinc-500 text-xs uppercase tracking-wider mb-1.5">
                                        Expires At
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={formExpiry}
                                        onChange={(e) =>
                                            setFormExpiry(e.target.value)
                                        }
                                        className="w-full px-3 py-2.5 bg-zinc-800/50 border border-zinc-700/50 rounded-xl text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50"
                                    />
                                </div>
                            </div>

                            <button
                                onClick={handleSubmit}
                                disabled={saving}
                                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-sm font-medium hover:bg-emerald-500/30 transition-all disabled:opacity-50 cursor-pointer"
                            >
                                {saving ? (editMode ? "Updating..." : "Creating...") : (editMode ? "Update Coupon" : "Create Coupon")}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Coupons List ── */}
            {coupons.length === 0 ? (
                <div className="text-center py-16 bg-zinc-900/50 border border-zinc-800/50 rounded-2xl">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-zinc-800/50 rounded-2xl mb-3">
                        <Ticket className="w-8 h-8 text-zinc-600" />
                    </div>
                    <p className="text-zinc-500 text-sm">
                        No coupons yet. Create your first one!
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {coupons.map((coupon, idx) => {
                        const isExpired =
                            coupon.expiresAt &&
                            new Date(coupon.expiresAt) < new Date();
                        const isMaxed =
                            coupon.maxUses !== -1 &&
                            coupon.usedCount >= coupon.maxUses;
                        const isInactive = isExpired || isMaxed;

                        return (
                            <motion.div
                                key={coupon._id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className={`bg-zinc-900/70 border rounded-2xl p-5 transition-all ${isInactive
                                    ? "border-zinc-800/30 opacity-60"
                                    : "border-zinc-800/50 hover:border-zinc-700/50"
                                    }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        {/* Icon */}
                                        <div
                                            className={`w-10 h-10 rounded-xl flex items-center justify-center ${coupon.type === "percentage"
                                                ? "bg-purple-500/15"
                                                : "bg-cyan-500/15"
                                                }`}
                                        >
                                            {coupon.type === "percentage" ? (
                                                <Percent className="w-5 h-5 text-purple-400" />
                                            ) : (
                                                <DollarSign className="w-5 h-5 text-cyan-400" />
                                            )}
                                        </div>

                                        {/* Info */}
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <code className="text-white font-bold font-mono text-sm">
                                                    {coupon.code}
                                                </code>
                                                <button
                                                    onClick={() =>
                                                        copyCode(coupon.code)
                                                    }
                                                    className="text-zinc-500 hover:text-white transition-colors cursor-pointer"
                                                >
                                                    {copiedCode ===
                                                        coupon.code ? (
                                                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                                                    ) : (
                                                        <Copy className="w-3.5 h-3.5" />
                                                    )}
                                                </button>
                                                {isExpired && (
                                                    <span className="px-2 py-0.5 bg-red-500/10 text-red-400 rounded-full text-[10px] font-medium">
                                                        Expired
                                                    </span>
                                                )}
                                                {isMaxed && (
                                                    <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 rounded-full text-[10px] font-medium">
                                                        Maxed Out
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-zinc-500 text-xs">
                                                {coupon.type === "percentage"
                                                    ? `${coupon.value}% off`
                                                    : `₹${coupon.value} off`}
                                                {coupon.minOrder > 0 &&
                                                    ` • Min ₹${coupon.minOrder}`}
                                                {" • "}
                                                {coupon.usedCount} /{" "}
                                                {coupon.maxUses === -1 ? (
                                                    <Infinity className="w-3 h-3 inline" />
                                                ) : (
                                                    coupon.maxUses
                                                )}{" "}
                                                uses
                                                {coupon.expiresAt &&
                                                    ` • Expires ${new Date(
                                                        coupon.expiresAt
                                                    ).toLocaleDateString(
                                                        "en-IN",
                                                        {
                                                            day: "2-digit",
                                                            month: "short",
                                                            year: "numeric",
                                                        }
                                                    )}`}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex bg-zinc-800/50 rounded-xl overflow-hidden border border-zinc-700/50">
                                        <button
                                            onClick={() => handleEdit(coupon)}
                                            className="flex items-center gap-1.5 px-3 py-2 text-zinc-400 hover:text-white hover:bg-zinc-700/50 text-xs font-medium transition-all cursor-pointer border-r border-zinc-700/50"
                                        >
                                            <Edit2 className="w-3.5 h-3.5" />
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(coupon.code)}
                                            disabled={deleting === coupon.code}
                                            className="flex items-center gap-1.5 px-3 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 text-xs font-medium transition-all cursor-pointer disabled:opacity-50"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                            {deleting === coupon.code ? "..." : "Delete"}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
