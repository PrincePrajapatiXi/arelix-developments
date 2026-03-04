// ═══════════════════════════════════════════════════════════════
// FILE: page.tsx  (Admin Settings)
// PURPOSE: Store settings page with editable form.
// LOCATION: src/app/admin/settings/page.tsx
// ═══════════════════════════════════════════════════════════════

import { Settings } from "lucide-react";
import { getSettings } from "./actions";
import SettingsClient from "./SettingsClient";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
    const settings = await getSettings();

    return (
        <div>
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

            <SettingsClient initialSettings={settings} />
        </div>
    );
}
