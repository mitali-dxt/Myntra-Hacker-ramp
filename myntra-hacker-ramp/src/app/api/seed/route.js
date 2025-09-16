import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Product from "@/models/Product";
import Tribe from "@/models/Tribe";
import Drop from "@/models/Drop";
import Quest from "@/models/Quest";

export async function POST() {
  await connectToDatabase();

  const products = [
    {
      title: "Men Black Slim Fit T-Shirt",
      brand: "Roadster",
      description: "Cotton crew-neck tee",
      price: 499,
      mrp: 999,
      discountPercent: 50,
      category: "T-Shirts",
      gender: "MEN",
      sizes: ["S","M","L","XL"],
      colors: ["Black"],
      images: [
        "https://images.unsplash.com/photo-1520971347561-8c6154b87b1e?q=80&w=1080&auto=format&fit=crop"
      ],
      tags: ["streetwear","basic"],
    },
    {
      title: "Women Floral Summer Dress",
      brand: "Sassafras",
      description: "A-line midi with floral print",
      price: 1299,
      mrp: 1999,
      discountPercent: 35,
      category: "Dresses",
      gender: "WOMEN",
      sizes: ["XS","S","M","L"],
      colors: ["Red"],
      images: [
        "https://images.unsplash.com/photo-1520975693411-6b1e923a56f7?q=80&w=1080&auto=format&fit=crop"
      ],
      tags: ["summer","floral"],
    },
    {
      title: "Unisex White Sneakers",
      brand: "HRX",
      description: "Low-top everyday sneakers",
      price: 1799,
      mrp: 2499,
      discountPercent: 28,
      category: "Shoes",
      gender: "UNISEX",
      sizes: ["6","7","8","9","10"],
      colors: ["White"],
      images: [
        "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1080&auto=format&fit=crop"
      ],
      tags: ["sneakers","streetwear"],
    },
    {
      title: "Men Blue Slim Jeans",
      brand: "Levis",
      description: "Stretch denim with classic wash",
      price: 2199,
      mrp: 3299,
      discountPercent: 33,
      category: "Jeans",
      gender: "MEN",
      sizes: ["30","32","34","36"],
      colors: ["Blue"],
      images: [
        "https://images.unsplash.com/photo-1516826957135-700dedea698c?q=80&w=1080&auto=format&fit=crop"
      ],
      tags: ["denim"],
    },
    {
      title: "Women Black Leggings",
      brand: "H&M",
      description: "High-waist athleisure leggings",
      price: 799,
      mrp: 1199,
      discountPercent: 33,
      category: "Bottomwear",
      gender: "WOMEN",
      sizes: ["XS","S","M","L"],
      colors: ["Black"],
      images: [
        "https://images.unsplash.com/photo-1549576910-47d709e2c3b6?q=80&w=1080&auto=format&fit=crop"
      ],
      tags: ["athleisure"],
    },
    {
      title: "Men Checked Casual Shirt",
      brand: "Highlander",
      description: "Half-sleeve cotton checks",
      price: 999,
      mrp: 1699,
      discountPercent: 41,
      category: "Shirts",
      gender: "MEN",
      sizes: ["S","M","L","XL"],
      colors: ["Navy"],
      images: [
        "https://images.unsplash.com/photo-1520975657286-4f922a9b12e8?q=80&w=1080&auto=format&fit=crop"
      ],
      tags: ["checks","casual"],
    },
    {
      title: "Women Oversized Hoodie",
      brand: "Roadster",
      description: "Cozy fleece hoodie",
      price: 1499,
      mrp: 2499,
      discountPercent: 40,
      category: "Sweatshirts",
      gender: "WOMEN",
      sizes: ["S","M","L"],
      colors: ["Beige"],
      images: [
        "https://images.unsplash.com/photo-1516822003754-cca485356ecb?q=80&w=1080&auto=format&fit=crop"
      ],
      tags: ["hoodie","casual"],
    },
    {
      title: "Unisex Baseball Cap",
      brand: "Mast & Harbour",
      description: "Adjustable cotton cap",
      price: 399,
      mrp: 699,
      discountPercent: 43,
      category: "Accessories",
      gender: "UNISEX",
      sizes: ["Free"],
      colors: ["Khaki"],
      images: [
        "https://images.unsplash.com/photo-1514136649217-b627b4b9cfb2?q=80&w=1080&auto=format&fit=crop"
      ],
      tags: ["cap","accessories"],
    },
    {
      title: "Men Running Shorts",
      brand: "Adidas",
      description: "Lightweight breathable shorts",
      price: 1299,
      mrp: 1799,
      discountPercent: 28,
      category: "Shorts",
      gender: "MEN",
      sizes: ["S","M","L","XL"],
      colors: ["Grey"],
      images: [
        "https://images.unsplash.com/photo-1520972161261-381c6d8ac481?q=80&w=1080&auto=format&fit=crop"
      ],
      tags: ["sports"],
    },
    {
      title: "Women Sports Bra",
      brand: "Nike",
      description: "High support training bra",
      price: 1599,
      mrp: 2299,
      discountPercent: 30,
      category: "Activewear",
      gender: "WOMEN",
      sizes: ["XS","S","M","L"],
      colors: ["Pink"],
      images: [
        "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1080&auto=format&fit=crop"
      ],
      tags: ["sports","athleisure"],
    },
    {
      title: "Men Leather Belt",
      brand: "Allen Solly",
      description: "Genuine leather formal belt",
      price: 899,
      mrp: 1299,
      discountPercent: 31,
      category: "Accessories",
      gender: "MEN",
      sizes: ["32","34","36","38"],
      colors: ["Brown"],
      images: [
        "https://images.unsplash.com/photo-1520975602322-6624e56b9a7d?q=80&w=1080&auto=format&fit=crop"
      ],
      tags: ["formal"],
    },
    {
      title: "Women Ethnic Kurta",
      brand: "Anouk",
      description: "Printed straight kurta",
      price: 999,
      mrp: 1699,
      discountPercent: 41,
      category: "Ethnic Wear",
      gender: "WOMEN",
      sizes: ["XS","S","M","L"],
      colors: ["Blue"],
      images: [
        "https://images.unsplash.com/photo-1600369672483-587e741e40c8?q=80&w=1080&auto=format&fit=crop"
      ],
      tags: ["desi","festive"],
    },
    {
      title: "Men Ethnic Nehru Jacket",
      brand: "Manyavar",
      description: "Solid mandarin collar jacket",
      price: 2499,
      mrp: 3499,
      discountPercent: 29,
      category: "Ethnic Wear",
      gender: "MEN",
      sizes: ["M","L","XL"],
      colors: ["Maroon"],
      images: [
        "https://images.unsplash.com/photo-1594633313593-bab3825d0caf?q=80&w=1080&auto=format&fit=crop"
      ],
      tags: ["wedding","festive"],
    },
    {
      title: "Women Heeled Sandals",
      brand: "Catwalk",
      description: "Block heels for parties",
      price: 1499,
      mrp: 2299,
      discountPercent: 35,
      category: "Footwear",
      gender: "WOMEN",
      sizes: ["4","5","6","7"],
      colors: ["Gold"],
      images: [
        "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=1080&auto=format&fit=crop"
      ],
      tags: ["heels","party"],
    },
    {
      title: "Men Formal Oxford Shoes",
      brand: "Red Tape",
      description: "Classic leather oxfords",
      price: 2799,
      mrp: 3999,
      discountPercent: 30,
      category: "Footwear",
      gender: "MEN",
      sizes: ["7","8","9","10"],
      colors: ["Black"],
      images: [
        "https://images.unsplash.com/photo-1520974735194-6a4f3b1037c4?q=80&w=1080&auto=format&fit=crop"
      ],
      tags: ["formal","office"],
    },
    {
      title: "Unisex Denim Jacket",
      brand: "Levis",
      description: "Classic trucker jacket",
      price: 2499,
      mrp: 3499,
      discountPercent: 29,
      category: "Jackets",
      gender: "UNISEX",
      sizes: ["S","M","L","XL"],
      colors: ["Blue"],
      images: [
        "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1080&auto=format&fit=crop"
      ],
      tags: ["denim","streetwear"],
    },
    {
      title: "Women Cardigan Sweater",
      brand: "ONLY",
      description: "Soft knit buttoned cardigan",
      price: 1299,
      mrp: 1999,
      discountPercent: 35,
      category: "Knitwear",
      gender: "WOMEN",
      sizes: ["S","M","L"],
      colors: ["Cream"],
      images: [
        "https://images.unsplash.com/photo-1475180098004-ca77a66827be?q=80&w=1080&auto=format&fit=crop"
      ],
      tags: ["winter"],
    },
    {
      title: "Men Puffer Jacket",
      brand: "Wildcraft",
      description: "Lightweight insulated puffer",
      price: 2999,
      mrp: 4499,
      discountPercent: 33,
      category: "Jackets",
      gender: "MEN",
      sizes: ["M","L","XL"],
      colors: ["Olive"],
      images: [
        "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1080&auto=format&fit=crop"
      ],
      tags: ["winter","outdoor"],
    },
    {
      title: "Women Straight Pants",
      brand: "Zara",
      description: "High-rise straight leg",
      price: 1999,
      mrp: 2999,
      discountPercent: 33,
      category: "Bottomwear",
      gender: "WOMEN",
      sizes: ["XS","S","M","L"],
      colors: ["Beige"],
      images: [
        "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=1080&auto=format&fit=crop"
      ],
      tags: ["office","minimal"],
    },
    {
      title: "Unisex Graphic Tee",
      brand: "Bewakoof",
      description: "Oversized printed t-shirt",
      price: 699,
      mrp: 1199,
      discountPercent: 42,
      category: "T-Shirts",
      gender: "UNISEX",
      sizes: ["S","M","L","XL"],
      colors: ["White"],
      images: [
        "https://images.unsplash.com/photo-1554568218-0f1715e72254?q=80&w=1080&auto=format&fit=crop"
      ],
      tags: ["graphic","streetwear"],
    },
    {
      title: "Men Training Trackpants",
      brand: "Puma",
      description: "Moisture-wicking joggers",
      price: 1499,
      mrp: 2299,
      discountPercent: 35,
      category: "Trackpants",
      gender: "MEN",
      sizes: ["S","M","L","XL"],
      colors: ["Black"],
      images: [
        "https://images.unsplash.com/photo-1517676109074-56a5b6ad1ef3?q=80&w=1080&auto=format&fit=crop"
      ],
      tags: ["athleisure"],
    },
    {
      title: "Women Tote Bag",
      brand: "Lino Perros",
      description: "Faux leather spacious tote",
      price: 1799,
      mrp: 2799,
      discountPercent: 36,
      category: "Bags",
      gender: "WOMEN",
      sizes: ["Free"],
      colors: ["Tan"],
      images: [
        "https://images.unsplash.com/photo-1520975652066-c0fd37f65d05?q=80&w=1080&auto=format&fit=crop"
      ],
      tags: ["bag","office"],
    },
    {
      title: "Unisex Wayfarer Sunglasses",
      brand: "Ray-Ban",
      description: "UV-protected wayfarers",
      price: 3999,
      mrp: 5999,
      discountPercent: 33,
      category: "Accessories",
      gender: "UNISEX",
      sizes: ["Free"],
      colors: ["Black"],
      images: [
        "https://images.unsplash.com/photo-1518544801976-3e188ae6069f?q=80&w=1080&auto=format&fit=crop"
      ],
      tags: ["sunglasses","summer"],
    },
    {
      title: "Men Polo T-Shirt",
      brand: "U.S. Polo Assn.",
      description: "Cotton pique polo",
      price: 1199,
      mrp: 1799,
      discountPercent: 33,
      category: "T-Shirts",
      gender: "MEN",
      sizes: ["S","M","L","XL"],
      colors: ["Navy"],
      images: [
        "https://images.unsplash.com/photo-1520971347561-8c6154b87b1e?q=80&w=1080&auto=format&fit=crop"
      ],
      tags: ["polo","casual"],
    }
  ];

  const tribes = [
    { name: "Streetwear Squad", description: "Hype and sneakers.", slug: "streetwear-squad", coverImage: "https://placehold.co/1200x400/111827/fff?text=Streetwear+Squad", memberCount: 15234, tags: ["streetwear","sneakers"] },
    { name: "Eco-Chic Circle", description: "Sustainable fits.", slug: "eco-chic-circle", coverImage: "https://placehold.co/1200x400/065f46/fff?text=Eco+Chic", memberCount: 9721, tags: ["sustainable","eco"] },
    { name: "Desi Glam Gang", description: "Ethnic glam.", slug: "desi-glam-gang", coverImage: "https://placehold.co/1200x400/b91c1c/fff?text=Desi+Glam", memberCount: 18765, tags: ["ethnic","festive"] }
  ];

  const quests = [
    { title: "Festive Friday", description: "Create a festive look.", rewardType: "DISCOUNT", rewardValue: "20% OFF", isActive: true, progress: 0 },
    { title: "Accessorize It!", description: "Add 3 accessories.", rewardType: "BADGE", rewardValue: "Bling Badge", isActive: true, progress: 0 },
    { title: "Monochrome Magic", description: "Style a single color.", rewardType: "POINTS", rewardValue: "50 Insider Points", isActive: true, progress: 0 }
  ];

  // Seed Products (only if empty)
  const existingProducts = await Product.countDocuments();
  if (existingProducts === 0) {
    await Product.insertMany(products);
  }

  // Seed Tribes (upsert by slug)
  for (const t of tribes) {
    await Tribe.updateOne({ slug: t.slug }, { $set: t }, { upsert: true });
  }

  // Seed Quests
  const existingQuests = await Quest.countDocuments();
  if (existingQuests === 0) {
    await Quest.insertMany(quests);
  }

  // Seed a sample Drop with first 6 products
  const firstSix = await Product.find({}).limit(6);
  const now = new Date();
  const later = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const drop = {
    creatorName: "Campus Creator Aisha",
    collectionName: "Monsoon Neutrals",
    imageUrl: "https://placehold.co/1200x400/7c3aed/fff?text=Creator+Drop",
    startsAt: now,
    endsAt: later,
    products: firstSix.map(p => p._id),
  };
  await Drop.updateOne(
    { creatorName: drop.creatorName, collectionName: drop.collectionName },
    { $set: drop },
    { upsert: true }
  );

  return NextResponse.json({ ok: true });
}


