// ═══════════════════════════════════════════════════════════════
// FILE: loading.tsx
// PURPOSE: Global loading skeleton for all admin pages. This
//          appears instantly while server components fetch data.
// LOCATION: src/app/admin/loading.tsx
// ═══════════════════════════════════════════════════════════════

import { Loader2 } from "lucide-react";

export default function AdminLoading() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <Loader2 className="w-10 h-10 text-emerald-500 animate-spin mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Loading</h2>
            <p className="text-zinc-500 text-sm">
                Fetching data from database...
            </p>
        </div>
    );
}
