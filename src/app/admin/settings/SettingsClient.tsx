// ═══════════════════════════════════════════════════════════════
// FILE: SettingsClient.tsx
// PURPOSE: Client-side settings form with save functionality.
// LOCATION: src/app/admin/settings/SettingsClient.tsx
// ═══════════════════════════════════════════════════════════════

"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Save,
    Loader2,
    CheckCircle2,
    Store,
    CreditCard,
    Mail,
    Globe,
    Server,
    FileText,
    XCircle,
} from "lucide-react";
import { saveSettings, type StoreSettings } from "./actions";

// ═══════════════════════════════════════════════════════════════

export default function SettingsClient({
    initialSettings,
}: {
    initialSettings: StoreSettings;
}) {
    const [form, setForm] = useState<StoreSettings>(initialSettings);
    const [isPending, startTransition] = useTransition();
    const [toast, setToast] = useState<{
        type: "success" | "error";
        message: string;
    } | null>(null);

    const handleSave = () => {
        startTransition(async () => {
            const result = await saveSettings(form);
            if (result.success) {
                setToast({
                    type: "success",
                    message: "Settings saved successfully!",
                });
            } else {
                setToast({
                    type: "error",
                    message: result.error || "Failed to save settings.",
                });
            }
            setTimeout(() => setToast(null), 3000);
        });
    };

    const fields: {
        key: keyof StoreSettings;
        label: string;
        icon: React.ComponentType<{ className?: string }>;
        placeholder: string;
        type?: "textarea";
    }[] = [
            {
                key: "storeName",
                label: "Store Name",
                icon: Store,
                placeholder: "Warden Store",
            },
            {
                key: "storeDescription",
                label: "Store Description",
                icon: FileText,
                placeholder: "Your Minecraft store description...",
                type: "textarea",
            },
            {
                key: "upiId",
                label: "UPI ID",
                icon: CreditCard,
                placeholder: "yourname@upi",
            },
            {
                key: "contactEmail",
                label: "Contact Email",
                icon: Mail,
                placeholder: "admin@example.com",
            },
            {
                key: "discordLink",
                label: "Discord Invite Link",
                icon: Globe,
                placeholder: "https://discord.gg/...",
            },
            {
                key: "serverIp",
                label: "Server IP",
                icon: Server,
                placeholder: "play.example.com",
            },
        ];

    return (
        <div className="relative">
            {/* ── Toast Notification ── */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, x: "-50%" }}
                        animate={{ opacity: 1, y: 0, x: "-50%" }}
                        exit={{ opacity: 0, y: -20, x: "-50%" }}
                        className={`fixed top-6 left-1/2 z-50 flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium shadow-2xl ${toast.type === "success"
                            ? "bg-emerald-500/90 text-white"
                            : "bg-red-500/90 text-white"
                            }`}
                    >
                        {toast.type === "success" ? (
                            <CheckCircle2 className="w-4 h-4" />
                        ) : (
                            <XCircle className="w-4 h-4" />
                        )}
                        {toast.message}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Settings Form ── */}
            <div className="max-w-2xl">
                <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-2xl p-6 space-y-6">
                    {fields.map((field, i) => (
                        <motion.div
                            key={field.key}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.06 }}
                        >
                            <label className="flex items-center gap-2 text-zinc-300 text-sm font-medium mb-2">
                                <field.icon className="w-4 h-4 text-zinc-500" />
                                {field.label}
                            </label>
                            {field.type === "textarea" ? (
                                <textarea
                                    value={form[field.key]}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            [field.key]: e.target.value,
                                        })
                                    }
                                    placeholder={field.placeholder}
                                    rows={3}
                                    className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700/50 rounded-xl text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all resize-none"
                                />
                            ) : (
                                <input
                                    type="text"
                                    value={form[field.key]}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            [field.key]: e.target.value,
                                        })
                                    }
                                    placeholder={field.placeholder}
                                    className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700/50 rounded-xl text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all"
                                />
                            )}
                        </motion.div>
                    ))}

                    {/* Save Button */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="pt-4 border-t border-zinc-800/50"
                    >
                        <button
                            onClick={handleSave}
                            disabled={isPending}
                            className="flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold rounded-xl text-sm transition-all disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                        >
                            {isPending ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Save className="w-4 h-4" />
                            )}
                            {isPending ? "Saving..." : "Save Settings"}
                        </button>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
