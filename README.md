# ⚔️ Army SMP Store — Arelix Developments

> 🎮 A premium Minecraft server store built with **Next.js**, **Tailwind CSS**, and **Framer Motion**

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?style=for-the-badge&logo=tailwind-css)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-12-FF0050?style=for-the-badge&logo=framer)

---

## ✨ Features

| Feature | Description |
|---|---|
| 🛒 **Smart Cart** | Zustand-powered cart with add/remove, quantity controls, and toast notifications |
| 💳 **UPI Checkout** | Dynamic QR code (amount-locked), Minecraft username input, UTR verification |
| 🎮 **Java/Bedrock Toggle** | Auto-formats Bedrock usernames with `.` prefix and `_` for spaces |
| 📱 **Mobile-First Design** | Horizontal swipeable product rows, collapsible footer accordions |
| 🔍 **Product Detail Modal** | Click any card to see full perks, description & add to cart |
| 🏷️ **Categorized Layout** | Products grouped by Ranks, Kits, Keys, Misc — each with own scroll row |
| 🎬 **Smooth Animations** | Framer Motion powered slide transitions, hover effects, particle floats |
| 🌙 **Dark Gaming Theme** | Premium zinc-900 base with neon green/purple/cyan accent colors |

---

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/PrincePrajapatiXi/arelix-developments.git
cd arelix-developments

# Install dependencies
npm install

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📂 Project Structure

```
army-smp-store/
├── public/                  # Static assets (QR code, images)
├── src/
│   ├── app/
│   │   ├── layout.tsx       # Root layout with fonts & metadata
│   │   ├── page.tsx         # Main landing page
│   │   └── api/
│   │       └── checkout/
│   │           └── route.ts # POST endpoint for order processing
│   ├── components/
│   │   ├── Navbar.tsx       # Top navigation with category tabs
│   │   ├── HeroSection.tsx  # Hero banner with floating particles
│   │   ├── ProductGrid.tsx  # Categorized product rows + modal
│   │   ├── ProductCard.tsx  # Individual product card (mobile-optimized)
│   │   ├── ProductDetailModal.tsx  # Full product detail popup
│   │   ├── CartSidebar.tsx  # 4-step checkout flow sidebar
│   │   ├── CartItemRow.tsx  # Single cart item with quantity controls
│   │   ├── RecentPurchases.tsx  # Scrolling purchase ticker
│   │   └── Footer.tsx       # Accordion footer (mobile-friendly)
│   ├── store/
│   │   └── useCartStore.ts  # Zustand global cart state
│   └── lib/
│       └── data.ts          # Product catalog & type definitions
└── tailwind.config.ts       # Custom theme (neon colors, glows)
```

---

## 🛒 Checkout Flow

```
Cart → Username Input → UPI Payment → Order Confirmation
```

1. **Cart View** — Review items, adjust quantities, see subtotal
2. **Username** — Java/Bedrock toggle, case-sensitive warning, validation
3. **UPI Payment** — Dynamic QR with locked amount, 12-digit UTR input
4. **Result** — Success with order ID or error with retry

---

## 🎨 Tech Stack

- **Framework** — [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
- **Styling** — [Tailwind CSS 4](https://tailwindcss.com/)
- **Animations** — [Framer Motion](https://www.framer.com/motion/)
- **State** — [Zustand](https://zustand-demo.pmnd.rs/)
- **Icons** — [Lucide React](https://lucide.dev/)
- **QR Code** — [qrcode.react](https://github.com/zpao/qrcode.react)
- **Language** — TypeScript

---

## ⚙️ Configuration

| Setting | File | Description |
|---|---|---|
| UPI ID | `CartSidebar.tsx` | `UPI_ID` constant at top |
| Payee Name | `CartSidebar.tsx` | `PAYEE_NAME` constant |
| Products | `lib/data.ts` | Add/edit products catalog |
| Categories | `lib/data.ts` | Modify `categories` array |
| Community Links | `Footer.tsx` | Discord, Twitter, YouTube, Instagram URLs |

---

## 📱 Responsive Design

- **Mobile** — Horizontal swipeable product carousel, accordion footer, compact cards
- **Tablet** — 3-column product grid, expanded footer
- **Desktop** — Full 4-column grid, hover effects, glow animations

---

## 📄 License

This project is proprietary to **Arelix Developments**.

---

<p align="center">
  Made with ❤️ by <b>Arelix Developments</b>
</p>
