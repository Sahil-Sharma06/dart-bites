// seed-menu.js — run with: node seed-menu.js
// from apps/customer/ directory

const fs = require("fs");
const path = require("path");

// ── Load .env.local without dotenv ───────────────────
const envPath = path.join(__dirname, ".env.local");
const envContent = fs.readFileSync(envPath, "utf-8");
envContent.split(/\r?\n/).forEach((line) => {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) return;
  const eqIdx = trimmed.indexOf("=");
  if (eqIdx < 0) return;
  const key = trimmed.slice(0, eqIdx).trim();
  const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, "");
  process.env[key] = val;
});

const admin = require("firebase-admin");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n")
    })
  });
}

const db = admin.firestore();

// ── Menu data from physical menu board ───────────────
const MENU = [
  // ── Mains: Burgers ──────────────────────────────────
  {
    name: "Veg Burger",
    description: "Classic veg patty with fresh veggies & special sauce",
    price: 49,
    category: "Mains",
    imageUrl: "",
    isAvailable: true,
    addons: [
      { name: "Add Cheese", price: 10 },
      { name: "Extra Sauce", price: 5 }
    ]
  },
  {
    name: "Cheese Veg Burger",
    description: "Veg patty topped with melted cheese and house sauce",
    price: 59,
    category: "Mains",
    imageUrl: "",
    isAvailable: true,
    addons: [
      { name: "Add Cheese", price: 10 },
      { name: "Extra Sauce", price: 5 }
    ]
  },
  {
    name: "2 Veg Burgers",
    description: "Double burger combo (2 veg burgers)",
    price: 95,
    category: "Mains",
    imageUrl: "",
    isAvailable: true,
    addons: []
  },
  {
    name: "Chicken Burger",
    description: "Juicy chicken patty with lettuce, mayo & spices",
    price: 59,
    category: "Mains",
    imageUrl: "",
    isAvailable: true,
    addons: [
      { name: "Add Cheese", price: 10 },
      { name: "Extra Sauce", price: 5 }
    ]
  },
  // ── Snacks: Momos ───────────────────────────────────
  {
    name: "Fried Veg Momos (Half)",
    description: "5 pcs",
    price: 69,
    category: "Snacks",
    imageUrl: "",
    isAvailable: true,
    addons: []
  },
  {
    name: "Fried Veg Momos (Full)",
    description: "10 pcs",
    price: 129,
    category: "Snacks",
    imageUrl: "",
    isAvailable: true,
    addons: []
  },
  {
    name: "Kurkure Veg Momos (Half)",
    description: "5 pcs",
    price: 89,
    category: "Snacks",
    imageUrl: "",
    isAvailable: true,
    addons: []
  },
  {
    name: "Kurkure Veg Momos (Full)",
    description: "10 pcs",
    price: 159,
    category: "Snacks",
    imageUrl: "",
    isAvailable: true,
    addons: []
  },
  {
    name: "Fried Paneer Momos (Half)",
    description: "5 pcs",
    price: 89,
    category: "Snacks",
    imageUrl: "",
    isAvailable: true,
    addons: []
  },
  {
    name: "Fried Paneer Momos (Full)",
    description: "10 pcs",
    price: 159,
    category: "Snacks",
    imageUrl: "",
    isAvailable: true,
    addons: []
  },
  {
    name: "Kurkure Paneer Momos (Half)",
    description: "5 pcs",
    price: 99,
    category: "Snacks",
    imageUrl: "",
    isAvailable: true,
    addons: []
  },
  {
    name: "Kurkure Paneer Momos (Full)",
    description: "10 pcs",
    price: 179,
    category: "Snacks",
    imageUrl: "",
    isAvailable: true,
    addons: []
  },
  // ── Snacks: Cheese Shots ────────────────────────────
  {
    name: "Potato Cheese Shots",
    description: "4 pcs",
    price: 109,
    category: "Snacks",
    imageUrl: "",
    isAvailable: true,
    addons: []
  },
  {
    name: "Peri Peri Cheese Shots",
    description: "4 pcs",
    price: 119,
    category: "Snacks",
    imageUrl: "",
    isAvailable: true,
    addons: []
  },
  {
    name: "Loaded Cheese Shots",
    description: "6 pcs",
    price: 169,
    category: "Snacks",
    imageUrl: "",
    isAvailable: true,
    addons: []
  },
  // ── Snacks: Fries ───────────────────────────────────
  {
    name: "Regular Fries",
    description: "Golden, crispy fries with perfect seasoning",
    price: 49,
    category: "Snacks",
    imageUrl: "",
    isAvailable: true,
    addons: []
  },
  {
    name: "Peri Peri Fries",
    description: "Crispy fries tossed in our signature peri peri spice dust",
    price: 59,
    category: "Snacks",
    imageUrl: "",
    isAvailable: true,
    addons: []
  },
  // ── Extras: Best Combos ─────────────────────────────
  {
    name: "2x Chicken Burgers Combo",
    description: "Best value — two juicy chicken burgers at a special price",
    price: 109,
    category: "Extras",
    imageUrl: "",
    isAvailable: true,
    addons: [
      { name: "Add Cheese (each)", price: 10 },
      { name: "Extra Sauce (each)", price: 5 }
    ]
  },
  // ── Extras: Dessert Bowls ───────────────────────────
  {
    name: "Vanilla Brownie Bowl",
    description: "Classic vanilla brownie bowl",
    price: 79,
    category: "Extras",
    imageUrl: "",
    isAvailable: true,
    addons: []
  },
  {
    name: "Mango Brownie Bowl",
    description: "Mango brownie bowl",
    price: 79,
    category: "Extras",
    imageUrl: "",
    isAvailable: true,
    addons: []
  },
  // ── Extras: Value Combos ────────────────────────────
  {
    name: "Veg Burger + Rasna",
    description: "Combo deal",
    price: 69,
    category: "Extras",
    imageUrl: "",
    isAvailable: true,
    addons: []
  },
  {
    name: "Veg Burger + Lemon Soda",
    description: "Combo deal",
    price: 69,
    category: "Extras",
    imageUrl: "",
    isAvailable: true,
    addons: []
  },
  {
    name: "Cheese Burger + Rasna",
    description: "Combo deal",
    price: 79,
    category: "Extras",
    imageUrl: "",
    isAvailable: true,
    addons: []
  },
  {
    name: "Cheese Burger + Lemon Soda",
    description: "Combo deal",
    price: 79,
    category: "Extras",
    imageUrl: "",
    isAvailable: true,
    addons: []
  },
  {
    name: "Fried Veg Momos + Rasna",
    description: "Combo deal",
    price: 89,
    category: "Extras",
    imageUrl: "",
    isAvailable: true,
    addons: []
  },
  {
    name: "Fried Veg Momos + Lemon Soda",
    description: "Combo deal",
    price: 89,
    category: "Extras",
    imageUrl: "",
    isAvailable: true,
    addons: []
  },
  {
    name: "Kurkure Veg Momos + Rasna",
    description: "Combo deal",
    price: 109,
    category: "Extras",
    imageUrl: "",
    isAvailable: true,
    addons: []
  },
  {
    name: "Kurkure Veg Momos + Lemon Soda",
    description: "Combo deal",
    price: 109,
    category: "Extras",
    imageUrl: "",
    isAvailable: true,
    addons: []
  },
  {
    name: "Fried Paneer Momos + Rasna",
    description: "Combo deal",
    price: 109,
    category: "Extras",
    imageUrl: "",
    isAvailable: true,
    addons: []
  },
  {
    name: "Fried Paneer Momos + Lemon Soda",
    description: "Combo deal",
    price: 109,
    category: "Extras",
    imageUrl: "",
    isAvailable: true,
    addons: []
  },
  {
    name: "Kurkure Paneer Momos + Rasna",
    description: "Combo deal",
    price: 119,
    category: "Extras",
    imageUrl: "",
    isAvailable: true,
    addons: []
  },
  {
    name: "Kurkure Paneer Momos + Lemon Soda",
    description: "Combo deal",
    price: 119,
    category: "Extras",
    imageUrl: "",
    isAvailable: true,
    addons: []
  },
  {
    name: "Kurkure Veg Momos + Aam Panna",
    description: "Combo deal",
    price: 119,
    category: "Extras",
    imageUrl: "",
    isAvailable: true,
    addons: []
  },
  {
    name: "Kurkure Veg Momos + Sweet Lassi",
    description: "Combo deal",
    price: 129,
    category: "Extras",
    imageUrl: "",
    isAvailable: true,
    addons: []
  },
  {
    name: "Kurkure Veg Momos + Green Apple Mojito",
    description: "Combo deal",
    price: 139,
    category: "Extras",
    imageUrl: "",
    isAvailable: true,
    addons: []
  },
  {
    name: "Kurkure Veg Momos + Blue Lagoon Mojito",
    description: "Combo deal",
    price: 149,
    category: "Extras",
    imageUrl: "",
    isAvailable: true,
    addons: []
  },
  {
    name: "Potato Cheese Shots + Rasna",
    description: "Combo deal",
    price: 129,
    category: "Extras",
    imageUrl: "",
    isAvailable: true,
    addons: []
  },
  {
    name: "Potato Cheese Shots + Lemon Soda",
    description: "Combo deal",
    price: 129,
    category: "Extras",
    imageUrl: "",
    isAvailable: true,
    addons: []
  },
  {
    name: "Potato Cheese Shots + Aam Panna",
    description: "Combo deal",
    price: 139,
    category: "Extras",
    imageUrl: "",
    isAvailable: true,
    addons: []
  },
  {
    name: "Potato Cheese Shots + Sweet Lassi",
    description: "Combo deal",
    price: 149,
    category: "Extras",
    imageUrl: "",
    isAvailable: true,
    addons: []
  },
  {
    name: "Potato Cheese Shots + Green Apple Mojito",
    description: "Combo deal",
    price: 159,
    category: "Extras",
    imageUrl: "",
    isAvailable: true,
    addons: []
  },
  {
    name: "Potato Cheese Shots + Blue Lagoon Mojito",
    description: "Combo deal",
    price: 169,
    category: "Extras",
    imageUrl: "",
    isAvailable: true,
    addons: []
  },
  {
    name: "Fries + Rasna",
    description: "Combo deal",
    price: 59,
    category: "Extras",
    imageUrl: "",
    isAvailable: true,
    addons: []
  },
  {
    name: "Peri Peri Fries + Rasna",
    description: "Combo deal",
    price: 69,
    category: "Extras",
    imageUrl: "",
    isAvailable: true,
    addons: []
  },
  {
    name: "Fries + Lemon Soda",
    description: "Combo deal",
    price: 59,
    category: "Extras",
    imageUrl: "",
    isAvailable: true,
    addons: []
  },
  {
    name: "Peri Peri Fries + Lemon Soda",
    description: "Combo deal",
    price: 69,
    category: "Extras",
    imageUrl: "",
    isAvailable: true,
    addons: []
  },
  // ── Drinks ──────────────────────────────────────────
  {
    name: "Blue Lagoon Mojito",
    description: "Premium drink",
    price: 49,
    category: "Drinks",
    imageUrl: "",
    isAvailable: true,
    addons: []
  },
  {
    name: "Green Apple Mojito",
    description: "Premium drink",
    price: 49,
    category: "Drinks",
    imageUrl: "",
    isAvailable: true,
    addons: []
  },
  {
    name: "Strawberry Slush",
    description: "Premium drink",
    price: 49,
    category: "Drinks",
    imageUrl: "",
    isAvailable: true,
    addons: []
  },
  {
    name: "Litchi Slush",
    description: "Premium drink",
    price: 49,
    category: "Drinks",
    imageUrl: "",
    isAvailable: true,
    addons: []
  },
  {
    name: "Rasna",
    description: "Budget drink",
    price: 19,
    category: "Drinks",
    imageUrl: "",
    isAvailable: true,
    addons: []
  },
  {
    name: "Fresh Lemon Soda",
    description: "Budget drink",
    price: 19,
    category: "Drinks",
    imageUrl: "",
    isAvailable: true,
    addons: []
  },
  {
    name: "Chilled Water Bottle",
    description: "Budget drink",
    price: 20,
    category: "Drinks",
    imageUrl: "",
    isAvailable: true,
    addons: []
  },
  {
    name: "Aam Panna",
    description: "Traditional drink",
    price: 29,
    category: "Drinks",
    imageUrl: "",
    isAvailable: true,
    addons: []
  },
  {
    name: "Sweet Lassi",
    description: "Traditional drink",
    price: 39,
    category: "Drinks",
    imageUrl: "",
    isAvailable: true,
    addons: []
  }
];

async function seedMenu() {
  console.log("🗑️  Clearing existing menu items...");
  const existing = await db.collection("menu").get();
  if (existing.docs.length > 0) {
    const deleteBatch = db.batch();
    existing.docs.forEach((doc) => deleteBatch.delete(doc.ref));
    await deleteBatch.commit();
    console.log(`   Deleted ${existing.docs.length} old items.\n`);
  } else {
    console.log("   No existing items found.\n");
  }

  console.log("🌱 Seeding new menu items...");
  for (const item of MENU) {
    const ref = db.collection("menu").doc();
    await ref.set({ ...item, id: ref.id });
    console.log(`   ✓ [${item.category}] ${item.name} — ₹${item.price}`);
  }

  console.log(`\n✅ Done! Seeded ${MENU.length} items across Mains, Snacks, Extras, and Drinks.`);
  process.exit(0);
}

seedMenu().catch((err) => {
  console.error("❌ Error:", err.message);
  process.exit(1);
});
