// ═══════════════════════════════════════════════════════════════
// FILE: page.tsx  (Admin Settings)
// PURPOSE: Store settings page with editable form.
// LOCATION: src/app/admin/settings/page.tsx
// ═══════════════════════════════════════════════════════════════

import { Settings } from "lucide-react";
import { getSettings } from "./actions";
import SettingsClient from "./SettingsClient";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

export const dynamic = "force-dynamic";

async function SettingsData() {
    const settings = await getSettings();
    return <SettingsClient initialSettings={settings} />;
}

export default function SettingsPage() {
    return (
        <div>
            {/* ── Page Header (Instant) ── */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <Settings className="w-6 h-6 text-emerald-400" />
                    <h1 className="text-2xl md:text-3xl font-bold text-white">
                        Settings
                    </h1>
                </div>
                <p className="text-zinc-500 text-sm">
                    Manage your store configuration
                </p>
            </div>

            <Suspense fallback={
                <div className="flex flex-col items-center justify-center py-32">
                    <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mb-4" />
                    <p className="text-zinc-500 text-sm">Loading settings...</p>
                </div>
            }>
                <SettingsData />
            </Suspense>
        </div>
    );
}
