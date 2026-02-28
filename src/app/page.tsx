// ═══════════════════════════════════════════════════════════════
// FILE: page.tsx  (Home Page)
// PURPOSE: The main landing page of the store. It composes all
//          the major sections (Navbar → Hero → Ticker → Products
//          → Footer) into one scrollable page layout.
//          It also manages the shared `activeCategory` state,
//          which syncs the Navbar tabs with the ProductGrid filter.
// LOCATION: src/app/page.tsx
// ═══════════════════════════════════════════════════════════════

"use client"; // Required because we use the `useState` hook

import { useState } from "react";

// ─── Component Imports ─────────────────────────────────────────
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import RecentPurchases from "@/components/RecentPurchases";
import ProductGrid from "@/components/ProductGrid";
import Footer from "@/components/Footer";
import CartSidebar from "@/components/CartSidebar"; // Slide-in cart panel
import ToastContainer from "@/components/Toast";    // "Added to cart!" notifications

// ─── Type Imports ──────────────────────────────────────────────
import { type Category } from "@/lib/data";

/**
 * Home — The root page rendered at URL "/".
 *
 * State:
 *   activeCategory — tracks which store tab is selected ("all", "ranks", etc.)
 *                     Passed DOWN to Navbar (display) and ProductGrid (filtering).
 *                     Updated UP via Navbar's onCategoryChange callback.
 */
export default function Home() {
  // Shared state: which product category is currently selected
  const [activeCategory, setActiveCategory] = useState<Category>("all");

  return (
    <>
      {/* ── Fixed Navbar at top ── */}
      <Navbar
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
      />

      <main>
        {/* ── Hero Banner — full-screen intro with animated background ── */}
        <HeroSection />

        {/* ── Recent Purchases Ticker — social-proof scrolling strip ── */}
        <RecentPurchases />

        {/* ── Product Grid — filterable catalog of store items ── */}
        <ProductGrid activeCategory={activeCategory} />
      </main>

      {/* ── Footer — brand info, links, legal ── */}
      <Footer />

      {/* ── Cart Sidebar — slides in from the right when opened ── */}
      <CartSidebar />

      {/* ── Toast Notifications — appears top-right on add-to-cart ── */}
      <ToastContainer />
    </>
  );
}
