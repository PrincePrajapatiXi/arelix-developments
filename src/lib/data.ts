// ═══════════════════════════════════════════════════════════════
// FILE: data.ts
// PURPOSE: Central data store for the entire application.
//          Contains TypeScript types, product catalog, category
//          definitions, and mock recent-purchase feed data.
// LOCATION: src/lib/data.ts
// ═══════════════════════════════════════════════════════════════

// ─── Type Definitions ──────────────────────────────────────────

/**
 * Category — Union type for all product categories.
 * "all" is a virtual category used for the "show everything" filter.
 */
export type Category = "all" | "ranks" | "kits" | "keys" | "misc";

/**
 * Product — Shape of every item sold in the store.
 * - `id`          : unique slug used as React key and for routing
 * - `name`        : display name shown on the card
 * - `price`       : price in USD (always a number, formatted at render time)
 * - `category`    : which tab/filter this product belongs to
 * - `image`       : path to the product image in /public
 * - `description` : one-liner shown under the product name
 * - `perks`       : list of bullet-point benefits displayed on the card
 * - `badge`       : optional label like "Popular", "Hot", "New" (top-right corner)
 * - `popular`     : optional flag that shows a ⭐ star indicator on the card
 */
export interface Product {
  id: string;
  name: string;
  price: number;
  category: Category;
  image: string;
  description: string;
  perks: string[];
  badge?: string;
  popular?: boolean;
}

/**
 * RecentPurchase — Shape of each item in the scrolling ticker.
 * This is mock data; in production you'd fetch from an API/webhook.
 */
export interface RecentPurchase {
  id: number;
  username: string;
  item: string;
  time: string;
  avatar: string; // Emoji used as a small avatar icon
}

// ─── Category Tabs (Navbar + Filters) ──────────────────────────

/** List of categories rendered in the Navbar and used for filtering. */
export const categories: { key: Category; label: string }[] = [
  { key: "all", label: "All Items" },
  { key: "ranks", label: "Ranks" },
  { key: "kits", label: "Kits" },
  { key: "keys", label: "Keys" },
  { key: "misc", label: "Miscellaneous" },
];

// ─── Products Catalog ──────────────────────────────────────────

/** Full list of products displayed in the store grid. */
export const products: Product[] = [
  // ══════════════════════
  //   RANKS  (4 tiers)
  // ══════════════════════
  {
    id: "rank-warrior",
    name: "Warrior Rank",
    price: 4.99,
    category: "ranks",
    image: "/images/warrior-rank.png",
    description: "Begin your journey with essential perks and a warrior title.",
    perks: [
      "Custom [Warrior] chat prefix",
      "Access to /fly in lobby",
      "3 home set locations",
      "Colored chat messages",
      "Priority queue access",
    ],
    badge: "Starter",
  },
  {
    id: "rank-knight",
    name: "Knight Rank",
    price: 9.99,
    category: "ranks",
    image: "/images/knight-rank.png",
    description: "Level up with powerful perks and exclusive cosmetics.",
    perks: [
      "Custom [Knight] chat prefix",
      "Access to /fly everywhere",
      "5 home set locations",
      "Particle trail effects",
      "Monthly kit access",
      "Exclusive Knight armor skin",
    ],
    popular: true,
    badge: "Popular",
  },
  {
    id: "rank-king",
    name: "King Rank",
    price: 19.99,
    category: "ranks",
    image: "/images/king-rank.png",
    description: "Rule the server with maximum privileges and royal perks.",
    perks: [
      "Custom [King] chat prefix",
      "All /fly permissions",
      "10 home set locations",
      "All particle effects",
      "Weekly premium kits",
      "Custom join message",
      "Pet companion system",
      "Priority support access",
    ],
    badge: "Premium",
  },
  {
    id: "rank-emperor",
    name: "Emperor Rank",
    price: 34.99,
    category: "ranks",
    image: "/images/emperor-rank.png",
    description: "The ultimate rank. Unlock everything the server has to offer.",
    perks: [
      "Custom [Emperor] chat prefix",
      "All permissions unlocked",
      "Unlimited home locations",
      "All cosmetics & trails",
      "Daily premium kits",
      "Custom nickname colors",
      "Exclusive Emperor mount",
      "VIP Discord channel access",
      "Beta feature testing",
    ],
    badge: "Legendary",
    popular: true,
  },

  // ══════════════════════
  //   KITS  (3 types)
  // ══════════════════════
  {
    id: "kit-starter",
    name: "Starter Kit",
    price: 2.99,
    category: "kits",
    image: "/images/starter-kit.png",
    description: "Essential tools and armor to kickstart your adventure.",
    perks: [
      "Iron armor set",
      "Iron sword & tools",
      "64x steak",
      "32x torches",
      "16x golden apples",
    ],
  },
  {
    id: "kit-pvp",
    name: "PvP Master Kit",
    price: 7.99,
    category: "kits",
    image: "/images/pvp-kit.png",
    description: "Top-tier combat gear for dominating in PvP battles.",
    perks: [
      "Diamond armor (Prot IV)",
      "Sharpness V diamond sword",
      "Power V bow + 64 arrows",
      "32x enchanted golden apples",
      "8x splash potions (Strength II)",
      "Ender pearls x16",
    ],
    popular: true,
    badge: "Best Seller",
  },
  {
    id: "kit-builder",
    name: "Builder's Kit",
    price: 4.99,
    category: "kits",
    image: "/images/builder-kit.png",
    description: "Everything you need to create stunning builds.",
    perks: [
      "World Edit access (limited)",
      "Stack of every wood type",
      "Stack of every stone type",
      "Colored wool & concrete",
      "Glass panes & blocks",
      "Scaffolding x128",
    ],
  },

  // ══════════════════════
  //   KEYS  (3 rarities)
  // ══════════════════════
  {
    id: "key-common",
    name: "Common Crate Key",
    price: 1.49,
    category: "keys",
    image: "/images/common-key.png",
    description: "Unlock a common crate with basic but useful rewards.",
    perks: [
      "Random iron gear piece",
      "16-64x food items",
      "Small money reward",
      "Common cosmetic chance",
    ],
  },
  {
    id: "key-rare",
    name: "Rare Crate Key",
    price: 3.49,
    category: "keys",
    image: "/images/rare-key.png",
    description: "Better odds for diamond-tier loot and exclusive items.",
    perks: [
      "Random diamond gear piece",
      "Enchanted books (Lvl 1-3)",
      "Medium money reward",
      "Rare cosmetic chance",
      "Experience bottle x32",
    ],
    badge: "Value",
  },
  {
    id: "key-legendary",
    name: "Legendary Crate Key",
    price: 7.99,
    category: "keys",
    image: "/images/legendary-key.png",
    description: "Guaranteed top-tier rewards and exclusive legendary items.",
    perks: [
      "Netherite gear chance",
      "Enchanted books (Lvl 4-5)",
      "Large money reward",
      "Legendary cosmetic guaranteed",
      "Custom weapon skin chance",
      "Exclusive particle effect",
    ],
    popular: true,
    badge: "Hot",
  },

  // ══════════════════════
  //   MISCELLANEOUS
  // ══════════════════════
  {
    id: "misc-coins",
    name: "5000 Server Coins",
    price: 4.99,
    category: "misc",
    image: "/images/coins.png",
    description: "In-game currency for the server shop and auctions.",
    perks: [
      "5000 coin balance",
      "Use in server shop",
      "Bid in auctions",
      "Trade with players",
    ],
  },
  {
    id: "misc-pet",
    name: "Custom Pet",
    price: 6.99,
    category: "misc",
    image: "/images/pet.png",
    description: "A loyal companion that follows you everywhere.",
    perks: [
      "Choose from 15+ pet types",
      "Custom pet name & color",
      "Pet level-up system",
      "Pet particle trail",
      "Show off in /pet menu",
    ],
    badge: "New",
  },
  {
    id: "misc-nickname",
    name: "Custom Nickname",
    price: 2.49,
    category: "misc",
    image: "/images/nickname.png",
    description: "Stand out with a fully customizable colored nickname.",
    perks: [
      "Full RGB color support",
      "Gradient nickname option",
      "Bold & italic formatting",
      "Change anytime with /nick",
    ],
  },
];

// ─── Recent Purchases (Mock Ticker Data) ───────────────────────

/**
 * Mock data for the scrolling "Recent Purchases" ticker.
 * In production, replace this with a real-time API/WebSocket feed.
 */
export const recentPurchases: RecentPurchase[] = [
  { id: 1, username: "xXDragonSlayerXx", item: "Emperor Rank", time: "2 min ago", avatar: "🗡️" },
  { id: 2, username: "BlockMaster_42", item: "PvP Master Kit", time: "5 min ago", avatar: "⚔️" },
  { id: 3, username: "CreeperHunter", item: "Legendary Key", time: "8 min ago", avatar: "🔑" },
  { id: 4, username: "DiamondQueen", item: "King Rank", time: "12 min ago", avatar: "👑" },
  { id: 5, username: "NotchFan2024", item: "Custom Pet", time: "15 min ago", avatar: "🐾" },
  { id: 6, username: "RedstoneWizard", item: "Builder's Kit", time: "18 min ago", avatar: "🔧" },
  { id: 7, username: "PixelWarrior", item: "Knight Rank", time: "22 min ago", avatar: "🛡️" },
  { id: 8, username: "EnderExplorer", item: "5000 Coins", time: "25 min ago", avatar: "💰" },
  { id: 9, username: "SkyblockKing", item: "Rare Key x3", time: "30 min ago", avatar: "🗝️" },
  { id: 10, username: "TNT_Maniac", item: "Warrior Rank", time: "35 min ago", avatar: "💥" },
];
