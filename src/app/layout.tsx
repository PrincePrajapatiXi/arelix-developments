// ═══════════════════════════════════════════════════════════════
// FILE: layout.tsx  (Root Layout)
// PURPOSE: The top-level layout that wraps EVERY page in the app.
//          It loads fonts, sets metadata (SEO), and renders the
//          <html> + <body> shell with global CSS applied.
// LOCATION: src/app/layout.tsx
// ═══════════════════════════════════════════════════════════════

import type { Metadata } from "next";
import { Inter, Orbitron } from "next/font/google";
import "./globals.css";

// ─── Font Configuration ────────────────────────────────────────
// Next.js automatically generates CSS @font-face declarations and
// assigns each font to a CSS variable for use in Tailwind/CSS.

/** Inter — Clean sans-serif used for all body text and UI labels. */
const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap", // Prevents invisible text while font loads
});

/** Orbitron — Futuristic monospace display font for headings. */
const orbitron = Orbitron({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

// ─── SEO Metadata ──────────────────────────────────────────────
// This metadata object generates <title>, <meta>, and Open Graph
// tags in the <head> of every page automatically.

export const metadata: Metadata = {
  title: "Army SMP Store — Ranks, Kits, Keys & More",
  description:
    "Upgrade your Minecraft experience on Army SMP. Buy exclusive ranks, powerful kits, rare crate keys, and unique cosmetics. Instant delivery.",
  keywords: [
    "Minecraft",
    "Army SMP",
    "Minecraft store",
    "ranks",
    "kits",
    "crate keys",
    "Minecraft server",
  ],
  openGraph: {
    title: "Army SMP Store",
    description: "Premium Minecraft server store — Ranks, Kits, Keys & Cosmetics",
    url: "https://store.armysmp.fun",
    siteName: "Army SMP",
    type: "website",
  },
};

// ─── Root Layout Component ─────────────────────────────────────
// This component wraps EVERY page. It:
//   1. Sets `lang="en"` and `class="dark"` on <html>
//   2. Attaches font CSS variables to <body>
//   3. Enables `antialiased` text rendering
//   4. Applies global `bg-background` and `text-foreground`

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${orbitron.variable} antialiased bg-background text-foreground`}
      >
        {children}
      </body>
    </html>
  );
}
