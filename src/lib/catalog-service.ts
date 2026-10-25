import prisma from "@/lib/prisma";

export const SAMPLE_CATEGORIES = [
  {
    id: "cat-1",
    name: "Fresh Market & Seafood",
    slug: "fresh-market-seafood",
    description: "Freshly harvested local fish, seafood, and market produce delivered daily.",
    imageUrl: "https://images.unsplash.com/photo-1534483509719-3feaee7c30da?auto=format&fit=crop&w=600&q=80",
    active: true,
  },
  {
    id: "cat-2",
    name: "Local Delicacies & Snacks",
    slug: "local-delicacies-snacks",
    description: "Authentic regional delicacies, native sweets, and famous local specialties.",
    imageUrl: "https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=600&q=80",
    active: true,
  },
  {
    id: "cat-3",
    name: "Daily Pantry & Groceries",
    slug: "daily-pantry-groceries",
    description: "Pantry staples, cooking essentials, oils, rice, and household goods.",
    imageUrl: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80",
    active: true,
  },
  {
    id: "cat-4",
    name: "Beverages & Refreshments",
    slug: "beverages-refreshments",
    description: "Cold drinks, local roast coffee, fresh fruit juices, and teas.",
    imageUrl: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80",
    active: true,
  },
  {
    id: "cat-5",
    name: "Home & Personal Care",
    slug: "home-personal-care",
    description: "Organic hygiene items, artisan home goods, and daily wellness essentials.",
    imageUrl: "https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=600&q=80",
    active: true,
  },
  {
    id: "cat-6",
    name: "Mobile & Everyday Gear",
    slug: "mobile-everyday-gear",
    description: "Cables, chargers, protective accessories, and everyday mobile tech.",
    imageUrl: "https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=600&q=80",
    active: true,
  },
];

export const SAMPLE_PRODUCTS = [
  {
    id: "prod-1",
    name: "Dagupan Boneless Bangus (Marinated, 2-pack)",
    slug: "dagupan-boneless-bangus-2pack",
    description: "Freshly deboned milkfish marinated in natural native vinegar, crushed garlic, black peppercorns, and sea salt. Ready to pan-fry.",
    price: 245.0,
    stock: 35,
    imageUrl: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80",
    categoryId: "cat-1",
    category: { name: "Fresh Market & Seafood", slug: "fresh-market-seafood" },
    published: true,
  },
  {
    id: "prod-2",
    name: "Lingayen Traditional Bagoong Monamon (750ml)",
    slug: "lingayen-bagoong-monamon-750ml",
    description: "Authentic, time-honored Lingayen fermented anchovy fish sauce in glass bottle. Perfectly aged for rich savory umami flavour.",
    price: 135.0,
    stock: 60,
    imageUrl: "https://images.unsplash.com/photo-1628525805785-cc179798b09a?auto=format&fit=crop&w=800&q=80",
    categoryId: "cat-1",
    category: { name: "Fresh Market & Seafood", slug: "fresh-market-seafood" },
    published: true,
  },
  {
    id: "prod-3",
    name: "Pangasinan Sweet Carabao Mangoes (1kg)",
    slug: "pangasinan-sweet-mangoes-1kg",
    description: "Export-grade golden yellow Carabao mangoes harvested fresh from local Pangasinan orchards. Sweet, juicy, and aromatic.",
    price: 180.0,
    stock: 45,
    imageUrl: "https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=800&q=80",
    categoryId: "cat-1",
    category: { name: "Fresh Market & Seafood", slug: "fresh-market-seafood" },
    published: true,
  },
  {
    id: "prod-4",
    name: "Calasiao White Puto Mini Tub (30 pcs)",
    slug: "calasiao-white-puto-30pcs",
    description: "Bite-sized steamed rice cakes made from fermented semi-polished rice. Soft, slightly sweet, and freshly steamed every morning.",
    price: 95.0,
    stock: 40,
    imageUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80",
    categoryId: "cat-2",
    category: { name: "Local Delicacies & Snacks", slug: "local-delicacies-snacks" },
    published: true,
  },
  {
    id: "prod-5",
    name: "Native Charcoal-Grilled Tupig (Bundle of 10)",
    slug: "native-grilled-tupig-10pcs",
    description: "Traditional delicacy made of glutinous rice flour, shredded young coconut flesh, and molasses, wrapped in banana leaves and slow-grilled over charcoal.",
    price: 120.0,
    stock: 50,
    imageUrl: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=800&q=80",
    categoryId: "cat-2",
    category: { name: "Local Delicacies & Snacks", slug: "local-delicacies-snacks" },
    published: true,
  },
  {
    id: "prod-6",
    name: "Crunchy Garlic Cornick Chips (350g)",
    slug: "crunchy-garlic-cornick-350g",
    description: "Crispy fried whole corn kernels seasoned with real fried garlic bits and native salt. The classic Filipino road-trip snack.",
    price: 85.0,
    stock: 75,
    imageUrl: "https://images.unsplash.com/photo-1579294800821-694d95e86143?auto=format&fit=crop&w=800&q=80",
    categoryId: "cat-2",
    category: { name: "Local Delicacies & Snacks", slug: "local-delicacies-snacks" },
    published: true,
  },
  {
    id: "prod-7",
    name: "Premium Sinandomeng Fragrant Rice (5kg)",
    slug: "premium-sinandomeng-rice-5kg",
    description: "Long-grain whole polished white rice. Fluffy, fragrant, and soft when cooked. Sourced directly from Central Luzon rice mills.",
    price: 295.0,
    stock: 80,
    imageUrl: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80",
    categoryId: "cat-3",
    category: { name: "Daily Pantry & Groceries", slug: "daily-pantry-groceries" },
    published: true,
  },
  {
    id: "prod-8",
    name: "Benguet Highland Arabica Cold Brew (500ml)",
    slug: "benguet-arabica-cold-brew-500ml",
    description: "Smooth 18-hour slow-steeped Arabica coffee beans from northern highland farms. Low acidity with notes of dark chocolate and caramel.",
    price: 130.0,
    stock: 30,
    imageUrl: "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=800&q=80",
    categoryId: "cat-4",
    category: { name: "Beverages & Refreshments", slug: "beverages-refreshments" },
    published: true,
  },
];

export function isDatabaseConfigured(): boolean {
  const url = process.env.DATABASE_URL;
  if (!url) return false;
  if (url.includes("YOUR_PASSWORD") || url.includes("ep-sample-pooler") || url.includes("ep-sample")) {
    return false;
  }
  return true;
}

export async function getCategories() {
  if (!isDatabaseConfigured()) {
    return SAMPLE_CATEGORIES;
  }

  try {
    const list = await prisma.category.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
    });
    if (list && list.length > 0) return list;
    return SAMPLE_CATEGORIES;
  } catch (err) {
    return SAMPLE_CATEGORIES;
  }
}

export async function getProducts(options?: {
  categoryId?: string;
  categorySlug?: string;
  searchQuery?: string;
  sort?: string;
  limit?: number;
}) {
  if (isDatabaseConfigured()) {
    try {
      const where: Record<string, unknown> = { published: true };

      if (options?.categorySlug) {
        where.category = { slug: options.categorySlug };
      } else if (options?.categoryId) {
        where.categoryId = options.categoryId;
      }

      if (options?.searchQuery) {
        where.OR = [
          { name: { contains: options.searchQuery, mode: "insensitive" } },
          { description: { contains: options.searchQuery, mode: "insensitive" } },
        ];
      }

      let orderBy: Record<string, "asc" | "desc"> = { createdAt: "desc" };
      if (options?.sort === "price-asc") orderBy = { price: "asc" };
      if (options?.sort === "price-desc") orderBy = { price: "desc" };

      const list = await prisma.product.findMany({
        where,
        include: {
          category: {
            select: { name: true, slug: true },
          },
        },
        orderBy,
        take: options?.limit,
      });

      if (list && list.length > 0) {
        return list.map((p) => ({
          ...p,
          price: Number(p.price),
        }));
      }
    } catch (err) {
      // Fallback
    }
  }

  // Fallback filtering on SAMPLE_PRODUCTS
  let filtered = [...SAMPLE_PRODUCTS];
  if (options?.categorySlug) {
    filtered = filtered.filter((p) => p.category.slug === options.categorySlug);
  }
  if (options?.searchQuery) {
    const q = options.searchQuery.toLowerCase();
    filtered = filtered.filter(
      (p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
    );
  }
  if (options?.sort === "price-asc") {
    filtered.sort((a, b) => a.price - b.price);
  } else if (options?.sort === "price-desc") {
    filtered.sort((a, b) => b.price - a.price);
  }
  if (options?.limit) {
    filtered = filtered.slice(0, options.limit);
  }

  return filtered;
}

export async function getProductById(id: string) {
  if (isDatabaseConfigured()) {
    try {
      const prod = await prisma.product.findUnique({
        where: { id },
        include: {
          category: true,
        },
      });
      if (prod) {
        return {
          ...prod,
          price: Number(prod.price),
        };
      }
    } catch (err) {
      // Fallback
    }
  }

  const sample = SAMPLE_PRODUCTS.find((p) => p.id === id);
  if (sample) {
    return {
      ...sample,
      category: {
        id: sample.categoryId,
        name: sample.category.name,
        slug: sample.category.slug,
        description: null,
        imageUrl: null,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  return null;
}
