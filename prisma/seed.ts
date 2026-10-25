import prisma from "../src/lib/prisma";
import { auth } from "../src/lib/auth";

async function main() {
  console.log("🌱 Starting Movli database seed...");

  // 1. Create or ensure Categories
  const categoriesData = [
    {
      name: "Fresh Market & Seafood",
      slug: "fresh-market-seafood",
      description: "Freshly harvested local fish, seafood, and market produce delivered daily.",
      imageUrl: "https://images.unsplash.com/photo-1534483509719-3feaee7c30da?auto=format&fit=crop&w=600&q=80",
    },
    {
      name: "Local Delicacies & Snacks",
      slug: "local-delicacies-snacks",
      description: "Authentic regional delicacies, native sweets, and famous local specialties.",
      imageUrl: "https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=600&q=80",
    },
    {
      name: "Daily Pantry & Groceries",
      slug: "daily-pantry-groceries",
      description: "Pantry staples, cooking essentials, oils, rice, and household goods.",
      imageUrl: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80",
    },
    {
      name: "Beverages & Refreshments",
      slug: "beverages-refreshments",
      description: "Cold drinks, local roast coffee, fresh fruit juices, and teas.",
      imageUrl: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80",
    },
    {
      name: "Home & Personal Care",
      slug: "home-personal-care",
      description: "Organic hygiene items, artisan home goods, and daily wellness essentials.",
      imageUrl: "https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=600&q=80",
    },
    {
      name: "Mobile & Everyday Gear",
      slug: "mobile-everyday-gear",
      description: "Cables, chargers, protective accessories, and everyday mobile tech.",
      imageUrl: "https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=600&q=80",
    },
  ];

  console.log("Creating categories...");
  const categoryMap = new Map<string, string>();

  for (const cat of categoriesData) {
    const existing = await prisma.category.findUnique({
      where: { slug: cat.slug },
    });
    if (!existing) {
      const created = await prisma.category.create({
        data: cat,
      });
      categoryMap.set(cat.slug, created.id);
    } else {
      categoryMap.set(cat.slug, existing.id);
    }
  }

  // 2. Create sample products
  const productsData = [
    // Fresh Market
    {
      name: "Dagupan Boneless Bangus (Marinated, 2-pack)",
      slug: "dagupan-boneless-bangus-2pack",
      description: "Freshly deboned milkfish marinated in natural native vinegar, crushed garlic, black peppercorns, and sea salt. Ready to pan-fry.",
      price: 245.00,
      stock: 35,
      imageUrl: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80",
      categorySlug: "fresh-market-seafood",
      published: true,
    },
    {
      name: "Lingayen Traditional Bagoong Monamon (750ml)",
      slug: "lingayen-bagoong-monamon-750ml",
      description: "Authentic, time-honored Lingayen fermented anchovy fish sauce in glass bottle. Perfectly aged for rich savory umami flavour.",
      price: 135.00,
      stock: 60,
      imageUrl: "https://images.unsplash.com/photo-1628525805785-cc179798b09a?auto=format&fit=crop&w=800&q=80",
      categorySlug: "fresh-market-seafood",
      published: true,
    },
    {
      name: "Pangasinan Sweet Carabao Mangoes (1kg)",
      slug: "pangasinan-sweet-mangoes-1kg",
      description: "Export-grade golden yellow Carabao mangoes harvested fresh from local Pangasinan orchards. Sweet, juicy, and aromatic.",
      price: 180.00,
      stock: 45,
      imageUrl: "https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=800&q=80",
      categorySlug: "fresh-market-seafood",
      published: true,
    },
    // Local Delicacies
    {
      name: "Calasiao White Puto Mini Tub (30 pcs)",
      slug: "calasiao-white-puto-30pcs",
      description: "Bite-sized steamed rice cakes made from fermented semi-polished rice. Soft, slightly sweet, and freshly steamed every morning.",
      price: 95.00,
      stock: 40,
      imageUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80",
      categorySlug: "local-delicacies-snacks",
      published: true,
    },
    {
      name: "Native Charcoal-Grilled Tupig (Bundle of 10)",
      slug: "native-grilled-tupig-10pcs",
      description: "Traditional delicacy made of glutinous rice flour, shredded young coconut flesh, and molasses, wrapped in banana leaves and slow-grilled over charcoal.",
      price: 120.00,
      stock: 50,
      imageUrl: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=800&q=80",
      categorySlug: "local-delicacies-snacks",
      published: true,
    },
    {
      name: "Crunchy Garlic Cornick Chips (350g)",
      slug: "crunchy-garlic-cornick-350g",
      description: "Crispy fried whole corn kernels seasoned with real fried garlic bits and native salt. The classic Filipino road-trip snack.",
      price: 85.00,
      stock: 75,
      imageUrl: "https://images.unsplash.com/photo-1579294800821-694d95e86143?auto=format&fit=crop&w=800&q=80",
      categorySlug: "local-delicacies-snacks",
      published: true,
    },
    // Daily Pantry & Groceries
    {
      name: "Premium Sinandomeng Fragrant Rice (5kg)",
      slug: "premium-sinandomeng-rice-5kg",
      description: "Long-grain whole polished white rice. Fluffy, fragrant, and soft when cooked. Sourced directly from Central Luzon rice mills.",
      price: 295.00,
      stock: 80,
      imageUrl: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80",
      categorySlug: "daily-pantry-groceries",
      published: true,
    },
    {
      name: "Pure Coconut Cooking Oil (1 Liter)",
      slug: "pure-coconut-cooking-oil-1l",
      description: "Naturally refined high-smoke-point Philippine coconut cooking oil. Healthy, neutral taste, and packed with medium-chain fatty acids.",
      price: 115.00,
      stock: 90,
      imageUrl: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=800&q=80",
      categorySlug: "daily-pantry-groceries",
      published: true,
    },
    {
      name: "Pangasinan Natural Rock Salt (1kg)",
      slug: "pangasinan-natural-rock-salt-1kg",
      description: "Pure sun-evaporated mineral-rich sea salt from the historical salt beds of Pangasinan. Essential for cooking and curing.",
      price: 45.00,
      stock: 120,
      imageUrl: "https://images.unsplash.com/photo-1518110903416-d80509420042?auto=format&fit=crop&w=800&q=80",
      categorySlug: "daily-pantry-groceries",
      published: true,
    },
    // Beverages
    {
      name: "Benguet Highland Arabica Cold Brew (500ml)",
      slug: "benguet-arabica-cold-brew-500ml",
      description: "Smooth 18-hour slow-steeped Arabica coffee beans from northern highland farms. Low acidity with notes of dark chocolate and caramel.",
      price: 130.00,
      stock: 30,
      imageUrl: "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=800&q=80",
      categorySlug: "beverages-refreshments",
      published: true,
    },
    {
      name: "Fresh Coconut Buko Juice with Pulp (1 Liter)",
      slug: "fresh-coconut-buko-juice-1l",
      description: "Freshly cracked young coconut water blended with shredded tender buko meat. Chilled, refreshing, with zero added sugar.",
      price: 80.00,
      stock: 40,
      imageUrl: "https://images.unsplash.com/photo-1525385133512-2f3bdd039054?auto=format&fit=crop&w=800&q=80",
      categorySlug: "beverages-refreshments",
      published: true,
    },
    // Home & Personal Care
    {
      name: "Handmade Virgin Coconut Oil Soap Bar (135g)",
      slug: "handmade-vco-soap-135g",
      description: "Cold-processed moisturizing soap made with pure organic virgin coconut oil and essential oils. Gentle for sensitive skin.",
      price: 75.00,
      stock: 65,
      imageUrl: "https://images.unsplash.com/photo-1607006314188-75122119b360?auto=format&fit=crop&w=800&q=80",
      categorySlug: "home-personal-care",
      published: true,
    },
    // Mobile Gear
    {
      name: "Reinforced Braided USB-C Fast Charging Cable (1.5m)",
      slug: "braided-usbc-fast-charging-cable-15m",
      description: "Durable nylon braided high-speed data and 65W PD fast charging cable with reinforced aluminum connectors.",
      price: 165.00,
      stock: 55,
      imageUrl: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=800&q=80",
      categorySlug: "mobile-everyday-gear",
      published: true,
    },
  ];

  console.log("Creating products...");
  for (const prod of productsData) {
    const categoryId = categoryMap.get(prod.categorySlug);
    if (!categoryId) continue;

    const existing = await prisma.product.findUnique({
      where: { slug: prod.slug },
    });

    if (!existing) {
      await prisma.product.create({
        data: {
          name: prod.name,
          slug: prod.slug,
          description: prod.description,
          price: prod.price,
          stock: prod.stock,
          imageUrl: prod.imageUrl,
          categoryId,
          published: prod.published,
        },
      });
    }
  }

  // 3. Seed Default Accounts (Admin, Rider, Customer)
  console.log("Setting up standard seed accounts...");

  const usersToSeed = [
    {
      name: "Movli Administrator",
      email: "admin@movli.com",
      password: "Password123!",
      role: "ADMIN" as const,
      phone: "+639171234567",
    },
    {
      name: "Juan Dela Cruz (Rider)",
      email: "rider@movli.com",
      password: "Password123!",
      role: "RIDER" as const,
      phone: "+639189876543",
    },
    {
      name: "Maria Santos (Customer)",
      email: "customer@movli.com",
      password: "Password123!",
      role: "CUSTOMER" as const,
      phone: "+639201122334",
    },
  ];

  for (const u of usersToSeed) {
    const existing = await prisma.user.findUnique({
      where: { email: u.email },
    });

    if (!existing) {
      try {
        const signupRes = await auth.api.signUpEmail({
          body: {
            name: u.name,
            email: u.email,
            password: u.password,
          },
        });

        if (signupRes?.user?.id) {
          await prisma.user.update({
            where: { id: signupRes.user.id },
            data: {
              role: u.role,
              phone: u.phone,
            },
          });
          console.log(`✓ Created ${u.role}: ${u.email}`);
        }
      } catch (err: unknown) {
        console.warn(`Could not signup user ${u.email} via Better Auth API:`, (err as Error)?.message);
      }
    } else {
      await prisma.user.update({
        where: { id: existing.id },
        data: {
          role: u.role,
          phone: u.phone,
        },
      });
      console.log(`✓ Updated role for existing ${u.email} to ${u.role}`);
    }
  }

  console.log("✅ Movli database seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
