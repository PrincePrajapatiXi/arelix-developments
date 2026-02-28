// ═══════════════════════════════════════════════════════════════
// FILE: Footer.tsx
// PURPOSE: Site-wide footer with:
//          - Brand logo + tagline
//          - Quick Links, Community, Legal columns
//          - Mobile: Collapsible accordions for link sections
//          - Desktop: Standard multi-column grid layout
//          - Bottom bar with copyright
// LOCATION: src/components/Footer.tsx
// ═══════════════════════════════════════════════════════════════

"use client"; // Needed for accordion state

// ─── Imports ───────────────────────────────────────────────────
import { useState } from "react";
import { Sword, Heart, ChevronDown } from "lucide-react";

// ─── Link Data ─────────────────────────────────────────────────

const quickLinks = ["Home", "Store", "Rules", "Support"];

const communityLinks = [
    { label: "Discord", url: "https://discord.gg/hyt5ZQ9QSR" },
    { label: "Twitter / X", url: "https://x.com/YOUR_HANDLE" },
    { label: "YouTube", url: "https://youtube.com/@YOUR_CHANNEL" },
    { label: "Instagram", url: "https://instagram.com/YOUR_HANDLE" },
];


// ─── Link Type ─────────────────────────────────────────────────
type FooterLink = string | { label: string; url: string };

// ═══════════════════════════════════════════════════════════════
// COMPONENT: Footer
// ═══════════════════════════════════════════════════════════════

export default function Footer() {
    // Track which accordion section is open on mobile (null = all closed)
    const [openSection, setOpenSection] = useState<string | null>(null);

    const toggleSection = (section: string) => {
        setOpenSection(openSection === section ? null : section);
    };

    return (
        <footer className="relative border-t border-white/5 bg-surface-primary/60">
            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">

                {/* ── Grid: 1 col mobile → 4 col desktop ── */}
                <div className="grid grid-cols-1 gap-2 md:gap-8 md:grid-cols-3">

                    {/* ── Column 1: Brand ── */}
                    <div className="text-center md:text-left mb-6 md:mb-0">
                        {/* Logo */}
                        <div className="flex items-center gap-2 mb-4 justify-center md:justify-start">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-neon-green/10 border border-neon-green/20 cursor-pointer">
                                <Sword className="h-4 w-4 text-neon-green" />
                            </div>
                            <span className="font-[family-name:var(--font-display)] text-base font-bold tracking-wider text-white cursor-pointer">
                                Arelix<span className="text-neon-green cursor-pointer">Developments</span>
                            </span>
                        </div>
                        <p className="text-xs text-white/30 leading-relaxed max-w-xs mx-auto md:mx-0">
                            The premier Minecraft SMP experience. Join thousands of players and
                            build your legacy.
                        </p>
                    </div>

                    {/* ── Column 2: Quick Links (accordion on mobile) ── */}
                    <FooterAccordionColumn
                        id="quick-links"
                        title="Quick Links"
                        links={quickLinks}
                        isOpen={openSection === "quick-links"}
                        onToggle={() => toggleSection("quick-links")}
                    />

                    {/* ── Column 3: Community ── */}
                    <FooterAccordionColumn
                        id="community"
                        title="Community"
                        links={communityLinks}
                        isOpen={openSection === "community"}
                        onToggle={() => toggleSection("community")}
                    />
                </div>

                {/* ── Bottom Bar ── */}
                <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-white/5 pt-6 sm:flex-row">
                    <p className="text-xs text-white/20">
                        © 2026 Arelix Developments. Not affiliated with Mojang Studios.
                    </p>
                    <p className="flex items-center gap-1 text-xs text-white/20">
                        Made with <Heart className="h-3 w-3 text-neon-pink/50" /> by Arelix Developments team
                    </p>
                </div>
            </div>
        </footer>
    );
}

// ═══════════════════════════════════════════════════════════════
// SUB-COMPONENT: FooterAccordionColumn
// PURPOSE: Renders a footer column that acts as a collapsible
//          accordion on mobile and a standard visible column
//          on desktop (md+).
// ═══════════════════════════════════════════════════════════════

interface FooterAccordionColumnProps {
    id: string;
    title: string;
    links: FooterLink[];
    isOpen: boolean;
    onToggle: () => void;
}

function FooterAccordionColumn({ title, links, isOpen, onToggle }: FooterAccordionColumnProps) {
    return (
        <div className="border-b border-white/5 md:border-b-0">
            {/* ── Heading: clickable on mobile, static on desktop ── */}
            <button
                onClick={onToggle}
                className="flex w-full items-center justify-between py-3 md:py-0 md:mb-3 md:cursor-default cursor-pointer"
            >
                <h4 className="text-xs font-semibold uppercase tracking-wider text-white/50">
                    {title}
                </h4>
                {/* Chevron arrow: visible only on mobile, rotates when open */}
                <ChevronDown
                    className={`h-4 w-4 text-white/30 transition-transform duration-300 md:hidden ${isOpen ? "rotate-180" : ""
                        }`}
                />
            </button>

            {/* ── Link list: hidden on mobile unless open, always visible on desktop ── */}
            <ul
                className={`space-y-2 overflow-hidden transition-all duration-300 ease-in-out md:!max-h-none md:!opacity-100 md:!pb-0 ${isOpen
                    ? "max-h-60 opacity-100 pb-4"
                    : "max-h-0 opacity-0"
                    }`}
            >
                {links.map((link) => {
                    const label = typeof link === "string" ? link : link.label;
                    const href = typeof link === "string" ? "#" : link.url;
                    const isExternal = href !== "#";

                    return (
                        <li key={label}>
                            <a
                                href={href}
                                {...(isExternal && { target: "_blank", rel: "noopener noreferrer" })}
                                className="text-sm text-white/30 hover:text-neon-green transition-colors duration-200"
                            >
                                {label}
                            </a>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}
