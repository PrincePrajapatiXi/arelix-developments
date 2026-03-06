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

import { useState, useEffect } from "react";

// ─── Component Imports ─────────────────────────────────────────
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import RecentPurchases from "@/components/RecentPurchases";
import ProductGrid from "@/components/ProductGrid";
import Footer from "@/components/Footer";
import CartSidebar from "@/components/CartSidebar"; // Slide-in cart panel
import ToastContainer from "@/components/Toast";    // "Added to cart!" notifications
import ServerStatus from "@/components/ServerStatus"; // MC server status widget

// ─── Type Imports ──────────────────────────────────────────────
import { type Category, type Product } from "@/lib/data";
import { getLiveStoreProducts } from "@/app/actions/productActions";

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
  const [initialProducts, setInitialProducts] = useState<Product[]>([]);

  // Because the layout has 'use client' all over it, doing a quick mount fetch 
  // is one way, but we can just fetch on mount immediately rather than deep 
  // in the grid to at least make it parallel with the Hero loading
  useEffect(() => {
    getLiveStoreProducts().then(setInitialProducts).catch(console.error);
  }, []);

  return (
    <>
      {/* ── Fixed Navbar at top ── */}
      <Navbar
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
      />

      <main>
        {/* ── Server Status Widget — shows online/offline + player count ── */}
        <div className="fixed bottom-4 left-4 z-50">
          <ServerStatus />
        </div>

        {/* ── Hero Banner — full-screen intro with animated background ── */}
        <HeroSection />

        {/* ── Recent Purchases Ticker — social-proof scrolling strip ── */}
        <RecentPurchases />

        {/* ── Product Grid — filterable catalog of store items ── */}
        <ProductGrid activeCategory={activeCategory} initialProducts={initialProducts} />
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
