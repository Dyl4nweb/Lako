import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting Movli Lingayen Seed Script...");

  // Clean existing data in reverse order of dependencies
  await prisma.auditLog.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.ledgerEntry.deleteMany();
  await prisma.orderStatusHistory.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.product.deleteMany();
  await prisma.store.deleteMany();
  await prisma.riderProfile.deleteMany();
  await prisma.address.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();

  const hashedPw = await bcrypt.hash("Movli2026!", 10);
  const superAdminPw = await bcrypt.hash("SuperAdmin2026!", 10);

  // 1. Secret Super Admin (Tier 0 — Founder / Developer)
  const superAdmin = await prisma.user.create({
    data: {
      email: "founder@movli.ph",
      fullName: "Marc Andrei (Founder & Lead Architect)",
      phoneNumber: "09170000001",
      role: "SUPER_ADMIN",
      passwordHash: superAdminPw,
      isActive: true,
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    },
  });

  // 2. Regular Admin (Tier 1 — Business Partner)
  const regularAdmin = await prisma.user.create({
    data: {
      email: "admin@movli.ph",
      fullName: "Carlo Gomez (Operations Director)",
      phoneNumber: "09170000002",
      role: "ADMIN",
      passwordHash: hashedPw,
      isActive: true,
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    },
  });

  // 3. Investor Admin (Tier 1 — Business Team / Financial Oversight)
  const investorAdmin = await prisma.user.create({
    data: {
      email: "investor@movli.ph",
      fullName: "Patricia Co (Investor Partner)",
      phoneNumber: "09170000003",
      role: "ADMIN",
      passwordHash: hashedPw,
      isActive: true,
      avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    },
  });

  console.log("✓ Administrative tiers provisioned");

  // 4. Riders (Couriers)
  const ridersData = [
    {
      email: "rider.mark@movli.ph",
      fullName: "Mark Dizon",
      phone: "09171112233",
      vehicle: "Honda Click 125i (Black)",
      plate: "123-PAG",
      cashOnHand: 890.0,
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    },
    {
      email: "rider.dennis@movli.ph",
      fullName: "Dennis Ramos",
      phone: "09172223344",
      vehicle: "Yamaha Mio i125 (Blue)",
      plate: "456-LIN",
      cashOnHand: 445.0,
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
    },
    {
      email: "rider.arnel@movli.ph",
      fullName: "Arnel Bautista",
      phone: "09173334455",
      vehicle: "Suzuki Smash 115 (Red)",
      plate: "789-DAG",
      cashOnHand: 0.0,
      avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80",
    },
    {
      email: "rider.joel@movli.ph",
      fullName: "Joel Castro",
      phone: "09174445566",
      vehicle: "Honda Beat 110 (White)",
      plate: "321-BIN",
      cashOnHand: 1335.0,
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80",
    },
  ];

  const createdRiders: any[] = [];
  for (const r of ridersData) {
    const user = await prisma.user.create({
      data: {
        email: r.email,
        fullName: r.fullName,
        phoneNumber: r.phone,
        role: "RIDER",
        passwordHash: hashedPw,
        avatarUrl: r.avatar,
        riderProfile: {
          create: {
            vehicleType: r.vehicle,
            plateNumber: r.plate,
            isAvailable: true,
            currentCashOnHand: r.cashOnHand,
          },
        },
      },
      include: { riderProfile: true },
    });
    createdRiders.push(user);
  }
  console.log(`✓ ${createdRiders.length} Dedicated Lingayen riders initialized`);

  // 5. Customers
  const customerTeresa = await prisma.user.create({
    data: {
      email: "customer.teresa@movli.ph",
      fullName: "Aling Teresa Santos",
      phoneNumber: "09178889901",
      role: "CUSTOMER",
      passwordHash: hashedPw,
      avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
      addresses: {
        create: [
          {
            barangay: "Poblacion",
            street: "Artacho St. corner Rizal Ave",
            landmark: "Near Lingayen Town Plaza, white gate beside bakery",
            isDefault: true,
          },
          {
            barangay: "Libsong West",
            street: "Capitol Park Walkway",
            landmark: "Facing Sison Auditorium",
            isDefault: false,
          },
        ],
      },
    },
    include: { addresses: true },
  });

  const customerBen = await prisma.user.create({
    data: {
      email: "customer.ben@movli.ph",
      fullName: "Kuya Ben Mendoza",
      phoneNumber: "09178889902",
      role: "CUSTOMER",
      passwordHash: hashedPw,
      avatarUrl: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80",
      addresses: {
        create: {
          barangay: "Maniboc",
          street: "Baywalk Highway Block 4",
          landmark: "In front of Veterans Memorial Park",
          isDefault: true,
        },
      },
    },
    include: { addresses: true },
  });

  console.log("✓ Pilot customers created with authentic Lingayen addresses");

  // 6. 10 Pilot Merchants & Product Catalogs
  const pilotStores = [
    {
      ownerEmail: "seller.senang@movli.ph",
      ownerName: "Aling Senang",
      storeName: "Aling Senang's Native Delicacies",
      slug: "aling-senang-delicacies",
      description: "Authentic Lingayen bagoong monamon, special alamang, fresh tupig, and traditional native cakes.",
      barangay: "Poblacion",
      contactNumber: "09181112201",
      logo: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=150&auto=format&fit=crop&q=80",
      banner: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&auto=format&fit=crop&q=80",
      products: [
        { name: "Lingayen Bagoong Monamon (750ml Bottle)", category: "Bagoong & Native Snacks", price: 120.0, stock: 45, desc: "Traditional fermented anchovies from Lingayen coast, extra savory." },
        { name: "Spicy Bagoong Alamang Especial (350g Jar)", category: "Bagoong & Native Snacks", price: 135.0, stock: 30, desc: "Sautéed shrimp paste with siling labuyo and garlic bits." },
        { name: "Native Charcoal-Grilled Tupig (Pack of 10)", category: "Bagoong & Native Snacks", price: 150.0, stock: 60, desc: "Fresh glutinous rice, coconut strips, wrapped in banana leaf." },
        { name: "Bibingka Galapong with Salted Egg", category: "Bagoong & Native Snacks", price: 95.0, stock: 25, desc: "Clay oven baked rice cake with local carabao butter." },
      ],
    },
    {
      ownerEmail: "seller.baywalk@movli.ph",
      ownerName: "Kuya Dennis Soriano",
      storeName: "Baywalk Seafood Grill & Inasal",
      slug: "baywalk-seafood-grill",
      description: "Charcoal-grilled Dagupan boneless bangus, pork belly inasal, and coastal seafood bowls.",
      barangay: "Maniboc",
      contactNumber: "09181112202",
      logo: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=150&auto=format&fit=crop&q=80",
      banner: "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80",
      products: [
        { name: "Inihaw na Boneless Bangus (Jumbo)", category: "Food & Meals", price: 280.0, stock: 20, desc: "Stuffed with fresh onions, native tomatoes, and calamansi glaze." },
        { name: "Grilled Pork Liempo Inasal with Garlic Rice", category: "Food & Meals", price: 185.0, stock: 35, desc: "Marinated 24 hours in lemongrass and Annatto oil." },
        { name: "Sinigang na Hipon sa Bayabas", category: "Food & Meals", price: 295.0, stock: 15, desc: "Fresh Gulf prawns in sweet-sour native guava broth." },
        { name: "Extra Garlic Annatto Rice", category: "Food & Meals", price: 35.0, stock: 100, desc: "Toasted garlic flakes over steaming native jasmine rice." },
      ],
    },
    {
      ownerEmail: "seller.bakeshop@movli.ph",
      ownerName: "Rosanna Cruz",
      storeName: "Lingayen Heritage Bakery & Cafe",
      slug: "lingayen-heritage-bakery",
      description: "Warm morning pan de sal, creamy cheese ensaymada, and local Kapeng Barako cold brew.",
      barangay: "Poblacion",
      contactNumber: "09181112203",
      logo: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=150&auto=format&fit=crop&q=80",
      banner: "https://images.unsplash.com/photo-1517433670267-08bbd4be890f?w=800&auto=format&fit=crop&q=80",
      products: [
        { name: "Hot Pugon Pan de Sal (Pack of 12)", category: "Bakery", price: 60.0, stock: 80, desc: "Wood-fired hearth rolls baked hourly from 5 AM." },
        { name: "Special Cheesy Ensaymada", category: "Bakery", price: 75.0, stock: 40, desc: "Fluffy brioche laden with Queensland butter and aged cheddar." },
        { name: "Ube Halaya Cheese Pandesal (6 pcs)", category: "Bakery", price: 110.0, stock: 30, desc: "Filled with real Baguio ube jam and melting cheddar." },
        { name: "Iced Lingayen Brewed Coffee (16oz)", category: "Bakery", price: 85.0, stock: 50, desc: "Slow-dripped dark roast with sweet condensed milk." },
      ],
    },
    {
      ownerEmail: "seller.maramba@movli.ph",
      ownerName: "Manang Lita",
      storeName: "Maramba Public Market Fresh Produce",
      slug: "maramba-market-fresh",
      description: "Direct farm-to-door fresh vegetables, Pangasinan red onions, and market staple ingredients.",
      barangay: "Poblacion",
      contactNumber: "09181112204",
      logo: "https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=150&auto=format&fit=crop&q=80",
      banner: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop&q=80",
      products: [
        { name: "Pangasinan Red Onions (1kg Mesh Bag)", category: "Groceries", price: 160.0, stock: 50, desc: "Locally harvested pungent red shallots and onions." },
        { name: "Fresh Native Tomatoes (1kg)", category: "Groceries", price: 75.0, stock: 40, desc: "Firm and juicy vine-ripened local tomatoes." },
        { name: "Ilocos-Pangasinan Native Garlic (500g)", category: "Groceries", price: 130.0, stock: 35, desc: "Small clove high-aroma native Philippine garlic." },
        { name: "Fresh Calamansi (500g Bag)", category: "Groceries", price: 45.0, stock: 60, desc: "Juicy green citrus freshly picked from local orchards." },
      ],
    },
    {
      ownerEmail: "seller.pharmacy@movli.ph",
      ownerName: "Dr. Jonathan Reyes",
      storeName: "Plaza Pharmacy & QuickCare",
      slug: "plaza-pharmacy",
      description: "Over-the-counter medicine, first-aid, infant nutrition, and household healthcare.",
      barangay: "Poblacion",
      contactNumber: "09181112205",
      logo: "https://images.unsplash.com/photo-1576602976047-174e57a47881?w=150&auto=format&fit=crop&q=80",
      banner: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop&q=80",
      products: [
        { name: "Paracetamol 500mg Tablets (Blister of 10)", category: "Pharmacy", price: 55.0, stock: 120, desc: "Fast-acting relief for headache, fever, and muscle aches." },
        { name: "Vitamin C with Zinc 500mg (10 Capsules)", category: "Pharmacy", price: 80.0, stock: 90, desc: "Daily immune system booster." },
        { name: "Isopropyl Alcohol 70% with Moisturizer (500ml)", category: "Pharmacy", price: 85.0, stock: 45, desc: "Antiseptic hospital-grade disinfectant." },
        { name: "Emergency Household First Aid Kit", category: "Pharmacy", price: 299.0, stock: 20, desc: "Bandages, povidone-iodine, cotton, tape, and scissors." },
      ],
    },
    {
      ownerEmail: "seller.alvear@movli.ph",
      ownerName: "Marco Rivera",
      storeName: "Alvear Pizza & Fast Bites",
      slug: "alvear-pizza-fast-bites",
      description: "Stone-baked artisan pizzas, crispy chicken wings, and loaded fries near the beach avenue.",
      barangay: "Libsong East",
      contactNumber: "09181112206",
      logo: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=150&auto=format&fit=crop&q=80",
      banner: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&auto=format&fit=crop&q=80",
      products: [
        { name: "Lingayen Longganisa Artisan Pizza (12-inch)", category: "Food & Meals", price: 395.0, stock: 25, desc: "Garlicky local longganisa, mozzarella, and roasted bell peppers." },
        { name: "Four Cheese Classic Pizza (12-inch)", category: "Food & Meals", price: 360.0, stock: 20, desc: "Mozzarella, cheddar, parmesan, and creamy Kesong Puti." },
        { name: "Cheesy Overload Potato Fries", category: "Food & Meals", price: 120.0, stock: 50, desc: "Crinkle cut fries drenched in warm cheddar sauce and bacon bits." },
      ],
    },
    {
      ownerEmail: "seller.chicken@movli.ph",
      ownerName: "Dennis Bautista",
      storeName: "Capitan Dennis Lechon Manok & Liempo",
      slug: "capitan-dennis-lechon",
      description: "Golden charcoal roasted whole chicken and crispy rolled pork belly liempo.",
      barangay: "Baay",
      contactNumber: "09181112207",
      logo: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=150&auto=format&fit=crop&q=80",
      banner: "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=800&auto=format&fit=crop&q=80",
      products: [
        { name: "Charcoal-Roasted Whole Lechon Manok", category: "Food & Meals", price: 340.0, stock: 30, desc: "Stuffed with lemongrass and secret garlic spice blend." },
        { name: "Crispy Rolled Lechon Liempo (500g Slab)", category: "Food & Meals", price: 380.0, stock: 20, desc: "Crackling pork skin with juicy tender meat." },
        { name: "Special Toyo-Mansi Sarsa Bottle (250ml)", category: "Food & Meals", price: 40.0, stock: 40, desc: "Spiced native soy sauce, vinegar, and calamansi." },
      ],
    },
    {
      ownerEmail: "seller.halohalo@movli.ph",
      ownerName: "Tita Grace",
      storeName: "Libsong Beachfront Halo-Halo & Coolers",
      slug: "libsong-beach-halohalo",
      description: "Creamy crushed ice halo-halo with homemade ube halaya and fresh coastal coconut juices.",
      barangay: "Libsong West",
      contactNumber: "09181112208",
      logo: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=150&auto=format&fit=crop&q=80",
      banner: "https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=800&auto=format&fit=crop&q=80",
      products: [
        { name: "Super Especial Halo-Halo with Leche Flan", category: "Food & Meals", price: 110.0, stock: 50, desc: "12 ingredients topped with creamy leche flan and artisanal ube scoop." },
        { name: "Mais con Yelo Especial", category: "Food & Meals", price: 80.0, stock: 40, desc: "Sweet corn kernels, condensed milk, cornflakes, and vanilla ice cream." },
        { name: "Fresh Pure Buko Juice (1-Liter Chilled Jug)", category: "Food & Meals", price: 70.0, stock: 30, desc: "100% natural young coconut water with tender shredded coconut meat." },
      ],
    },
    {
      ownerEmail: "seller.tonton@movli.ph",
      ownerName: "Mang Tony",
      storeName: "Tonton Mart & Pantry Essentials",
      slug: "tonton-mart",
      description: "Quality Sinandomeng rice, premium cooking oils, beverages, and daily household cleaners.",
      barangay: "Tonton",
      contactNumber: "09181112209",
      logo: "https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=150&auto=format&fit=crop&q=80",
      banner: "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=800&auto=format&fit=crop&q=80",
      products: [
        { name: "Sinandomeng Special Rice (5kg Bag)", category: "Groceries", price: 285.0, stock: 40, desc: "White, aromatic, soft-cooking Philippine rice." },
        { name: "Pure Palm Cooking Oil (1-Liter Pouch)", category: "Groceries", price: 85.0, stock: 60, desc: "Cholesterol-free, high-smoke point clear cooking oil." },
        { name: "Concentrated Dishwashing Liquid (500ml)", category: "Retail", price: 55.0, stock: 45, desc: "Lemon power degreaser." },
      ],
    },
    {
      ownerEmail: "seller.salt@movli.ph",
      ownerName: "Kuya Rolly Asinan",
      storeName: "Pangapisan Natural Salt & Gourmet Pantry",
      slug: "pangapisan-gourmet-salt",
      description: "Direct from the historic salt beds (asinan) of Pangapisan, Lingayen. Hand-harvested artisan sea salts.",
      barangay: "Pangapisan North",
      contactNumber: "09181112210",
      logo: "https://images.unsplash.com/photo-1518110925495-5fe2fda0442c?w=150&auto=format&fit=crop&q=80",
      banner: "https://images.unsplash.com/photo-1506368249639-73a05d6f6488?w=800&auto=format&fit=crop&q=80",
      products: [
        { name: "Pangapisan Sun-Dried Coarse Sea Salt (1kg)", category: "Retail", price: 65.0, stock: 100, desc: "Pure white mineral-rich hand-raked Lingayen sea salt." },
        { name: "Toasted Garlic Herb Sea Salt Blend (250g Jar)", category: "Retail", price: 120.0, stock: 40, desc: "Gourmet finishing salt with native garlic and rosemary." },
        { name: "Crispy Bangus Belly Flakes in Garlic Oil (220g)", category: "Bagoong & Native Snacks", price: 195.0, stock: 35, desc: "Ready-to-eat savory fish flakes seasoned with Pangapisan sea salt." },
      ],
    },
  ];

  const createdStores: any[] = [];
  for (const s of pilotStores) {
    const owner = await prisma.user.create({
      data: {
        email: s.ownerEmail,
        fullName: s.ownerName,
        phoneNumber: s.contactNumber,
        role: "SELLER",
        passwordHash: hashedPw,
        avatarUrl: s.logo,
        store: {
          create: {
            name: s.storeName,
            slug: s.slug,
            description: s.description,
            barangay: s.barangay,
            contactNumber: s.contactNumber,
            logoUrl: s.logo,
            bannerUrl: s.banner,
            commissionRate: 0.05, // 5% platform commission
            isOpen: true,
            products: {
              create: s.products.map((p) => ({
                name: p.name,
                category: p.category,
                price: p.price,
                stock: p.stock,
                description: p.desc,
                imageUrl: s.banner,
                isAvailable: true,
              })),
            },
          },
        },
      },
      include: {
        store: {
          include: { products: true },
        },
      },
    });
    createdStores.push(owner.store);
  }

  console.log(`✓ 10 Pilot Stores seeded across Lingayen with full product catalogs`);

  // 7. Seed Initial Orders Representing Complete State Machine Lifecycles
  // Order 1: DELIVERED (Order 1 - Senang Delicacies to Aling Teresa)
  const store1 = createdStores[0];
  const prod1_1 = store1.products[0]; // Bagoong Monamon 120
  const prod1_2 = store1.products[2]; // Tupig 150 (2x) = 300
  // Subtotal: 120 + 300 = 420. Delivery: 45. Total: 465.
  // Commission 5%: 21.00. Merchant Payout: 399.00. Rider Payout: 35.00. Platform Margin: 10.00.
  const deliveredOrder = await prisma.order.create({
    data: {
      orderNumber: "MOV-261025-001",
      customerId: customerTeresa.id,
      storeId: store1.id,
      riderId: createdRiders[0].riderProfile.id,
      status: "DELIVERED",
      subtotalAmount: 420.0,
      deliveryFee: 45.0,
      totalAmount: 465.0,
      commissionAmount: 21.0,
      merchantPayoutAmount: 399.0,
      riderPayoutAmount: 35.0,
      platformMarginAmount: 10.0,
      podImageUrl: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&auto=format&fit=crop&q=80",
      deliveryAddressJson: JSON.stringify({
        recipient: "Aling Teresa Santos",
        phoneNumber: "09178889901",
        barangay: "Poblacion",
        street: "Artacho St. corner Rizal Ave",
        landmark: "Near Lingayen Town Plaza, white gate beside bakery",
      }),
      orderItems: {
        create: [
          { productId: prod1_1.id, unitPrice: 120.0, quantity: 1, lineTotal: 120.0 },
          { productId: prod1_2.id, unitPrice: 150.0, quantity: 2, lineTotal: 300.0 },
        ],
      },
      statusHistory: {
        create: [
          { status: "PENDING", changedById: customerTeresa.id, notes: "Order placed by customer (COD)" },
          { status: "ACCEPTED", changedById: store1.ownerId, notes: "Estimated prep time: 15 mins" },
          { status: "PREPARING", changedById: store1.ownerId, notes: "Packaging fresh goods" },
          { status: "READY_FOR_PICKUP", changedById: store1.ownerId, notes: "Awaiting courier" },
          { status: "ASSIGNED", changedById: regularAdmin.id, notes: "Assigned to Mark Dizon" },
          { status: "PICKED_UP", changedById: createdRiders[0].id, notes: "Items verified and picked up" },
          { status: "IN_TRANSIT", changedById: createdRiders[0].id, notes: "Heading to Artacho St" },
          { status: "DELIVERED", changedById: createdRiders[0].id, notes: "Delivered to buyer, ₱465.00 cash received" },
        ],
      },
    },
  });

  // Post Double-Entry Ledger Entries for Delivered Order (Section 12.1 in Master Plan)
  await prisma.ledgerEntry.createMany({
    data: [
      { orderId: deliveredOrder.id, accountCode: "1010", description: `COD in Transit - Order ${deliveredOrder.orderNumber}`, debit: 465.0, credit: 0.0 },
      { orderId: deliveredOrder.id, accountCode: "2010", description: `AP Merchant: ${store1.name}`, debit: 0.0, credit: 399.0 },
      { orderId: deliveredOrder.id, accountCode: "2020", description: `AP Rider: Mark Dizon`, debit: 0.0, credit: 35.0 },
      { orderId: deliveredOrder.id, accountCode: "4010", description: `Revenue: 5% Marketplace Commission`, debit: 0.0, credit: 21.0 },
      { orderId: deliveredOrder.id, accountCode: "4020", description: `Revenue: Delivery Service Fee Margin`, debit: 0.0, credit: 10.0 },
    ],
  });

  // Order 2: READY_FOR_PICKUP (Baywalk Grill - needs dispatch assignment)
  const store2 = createdStores[1];
  const prod2_1 = store2.products[0]; // Inihaw Bangus 280
  const prod2_4 = store2.products[3]; // Garlic Rice 35 (2x) = 70
  // Subtotal 350. Delivery 45. Total 395.
  await prisma.order.create({
    data: {
      orderNumber: "MOV-261025-002",
      customerId: customerBen.id,
      storeId: store2.id,
      status: "READY_FOR_PICKUP",
      subtotalAmount: 350.0,
      deliveryFee: 45.0,
      totalAmount: 395.0,
      commissionAmount: 17.5,
      merchantPayoutAmount: 332.5,
      riderPayoutAmount: 35.0,
      platformMarginAmount: 10.0,
      deliveryAddressJson: JSON.stringify({
        recipient: "Kuya Ben Mendoza",
        phoneNumber: "09178889902",
        barangay: "Maniboc",
        street: "Baywalk Highway Block 4",
        landmark: "In front of Veterans Memorial Park",
      }),
      orderItems: {
        create: [
          { productId: prod2_1.id, unitPrice: 280.0, quantity: 1, lineTotal: 280.0 },
          { productId: prod2_4.id, unitPrice: 35.0, quantity: 2, lineTotal: 70.0 },
        ],
      },
      statusHistory: {
        create: [
          { status: "PENDING", changedById: customerBen.id, notes: "Order submitted" },
          { status: "ACCEPTED", changedById: store2.ownerId, notes: "Grill heating" },
          { status: "PREPARING", changedById: store2.ownerId, notes: "Bangus grilled over coconut charcoal" },
          { status: "READY_FOR_PICKUP", changedById: store2.ownerId, notes: "Packed hot in insulated box" },
        ],
      },
    },
  });

  // Order 3: IN_TRANSIT (Alvear Pizza to Aling Teresa)
  const store6 = createdStores[5];
  const prod6_1 = store6.products[0]; // Longganisa Pizza 395
  await prisma.order.create({
    data: {
      orderNumber: "MOV-261025-003",
      customerId: customerTeresa.id,
      storeId: store6.id,
      riderId: createdRiders[1].riderProfile.id, // Dennis Ramos
      status: "IN_TRANSIT",
      subtotalAmount: 395.0,
      deliveryFee: 45.0,
      totalAmount: 440.0,
      commissionAmount: 19.75,
      merchantPayoutAmount: 375.25,
      riderPayoutAmount: 35.0,
      platformMarginAmount: 10.0,
      deliveryAddressJson: JSON.stringify({
        recipient: "Aling Teresa Santos",
        phoneNumber: "09178889901",
        barangay: "Poblacion",
        street: "Artacho St. corner Rizal Ave",
        landmark: "Near Lingayen Town Plaza, white gate beside bakery",
      }),
      orderItems: {
        create: [{ productId: prod6_1.id, unitPrice: 395.0, quantity: 1, lineTotal: 395.0 }],
      },
      statusHistory: {
        create: [
          { status: "PENDING", changedById: customerTeresa.id, notes: "Lunch pizza craving" },
          { status: "ACCEPTED", changedById: store6.ownerId, notes: "Baking" },
          { status: "READY_FOR_PICKUP", changedById: store6.ownerId, notes: "Boxed hot" },
          { status: "ASSIGNED", changedById: regularAdmin.id, notes: "Dennis Ramos assigned" },
          { status: "PICKED_UP", changedById: createdRiders[1].id, notes: "Picked up at Libsong East" },
          { status: "IN_TRANSIT", changedById: createdRiders[1].id, notes: "Rider on the way to Poblacion" },
        ],
      },
    },
  });

  // Order 4: PENDING (Plaza Pharmacy to Ben)
  const store5 = createdStores[4];
  const prod5_1 = store5.products[0]; // Paracetamol 55 (2x) = 110
  const prod5_2 = store5.products[1]; // Vitamin C 80
  await prisma.order.create({
    data: {
      orderNumber: "MOV-261025-004",
      customerId: customerBen.id,
      storeId: store5.id,
      status: "PENDING",
      subtotalAmount: 190.0,
      deliveryFee: 45.0,
      totalAmount: 235.0,
      commissionAmount: 9.5,
      merchantPayoutAmount: 180.5,
      riderPayoutAmount: 35.0,
      platformMarginAmount: 10.0,
      deliveryAddressJson: JSON.stringify({
        recipient: "Kuya Ben Mendoza",
        phoneNumber: "09178889902",
        barangay: "Maniboc",
        street: "Baywalk Highway Block 4",
        landmark: "In front of Veterans Memorial Park",
      }),
      orderItems: {
        create: [
          { productId: prod5_1.id, unitPrice: 55.0, quantity: 2, lineTotal: 110.0 },
          { productId: prod5_2.id, unitPrice: 80.0, quantity: 1, lineTotal: 80.0 },
        ],
      },
      statusHistory: {
        create: [{ status: "PENDING", changedById: customerBen.id, notes: "Customer requested quick delivery" }],
      },
    },
  });

  // Seed sample initial operating expenses (Master plan section 9.3 & 12.1)
  await prisma.expense.createMany({
    data: [
      {
        category: "SUPPLIES",
        amount: 3200.0,
        description: "Initial 4x Movli Thermal Insulated Delivery Backpacks with rain-covers",
        loggedById: regularAdmin.id,
      },
      {
        category: "MARKETING",
        amount: 1500.0,
        description: "2,000 Lingayen Launch Flyers distributed at Baywalk & Public Market",
        loggedById: regularAdmin.id,
      },
      {
        category: "INFRASTRUCTURE",
        amount: 1200.0,
        description: "Cloud domain movli.ph and server reserves",
        loggedById: superAdmin.id,
      },
    ],
  });

  // Seed Initial Audit Log entry
  await prisma.auditLog.create({
    data: {
      userId: superAdmin.id,
      action: "INITIAL_SYSTEM_BOOTSTRAP",
      resourceType: "SYSTEM",
      resourceId: "LINGAYEN_V1",
      detailsJson: JSON.stringify({ version: "1.0.0", market: "Lingayen, Pangasinan" }),
      ipAddress: "127.0.0.1",
    },
  });

  console.log("=================================================");
  console.log("🎉 MOVLI DATABASE SEEDING COMPLETED SUCCESSFULLY!");
  console.log("=================================================");
  console.log("Logins provisioned:");
  console.log("  Super Admin : founder@movli.ph       / SuperAdmin2026!");
  console.log("  Admin       : admin@movli.ph         / Movli2026!");
  console.log("  Investor    : investor@movli.ph      / Movli2026!");
  console.log("  Sellers (10): seller.senang@movli.ph / Movli2026! (etc.)");
  console.log("  Riders (4)  : rider.mark@movli.ph    / Movli2026! (etc.)");
  console.log("  Customer    : customer.teresa@movli.ph / Movli2026!");
  console.log("=================================================");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
