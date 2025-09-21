import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Product from "@/models/Product";
// You don't need the other models for this specific operation
// import Tribe from "@/models/Tribe";
// import Drop from "@/models/Drop";
// import Quest from "@/models/Quest";

export async function POST() {
  await connectToDatabase();

  // This is your new data with the detailed descriptions
  const productsWithNewDescriptions = [
    {
      title: "Men Black Slim Fit T-Shirt",
      brand: "Roadster",
      description: "A timeless wardrobe staple from Roadster, this black slim-fit t-shirt is crafted from breathable pure cotton for all-day comfort. Featuring a classic crew-neck design, it's the perfect canvas for any look. Occasion: Ideal for casual outings, weekend layering, or as a versatile basic. Season: An all-season essential. Vibe: Effortless, minimalist, and cool.",
    },
    {
      title: "Women Floral Summer Dress",
      brand: "Sassafras",
      description: "Embrace the sunshine with this charming floral summer dress from Sassafras. Designed with a flattering A-line silhouette and a vibrant floral print, this midi dress is made from a lightweight and flowy viscose rayon. Occasion: Perfect for weekend brunches, beach vacations, or any sunny day out. Season: A must-have for your summer and spring wardrobe. Vibe: Cheerful, feminine, and effortlessly romantic.",
    },
    {
      title: "Unisex White Sneakers",
      brand: "HRX",
      description: "Step up your style game with these versatile white sneakers from HRX. Featuring a clean, low-top design and a cushioned footbed for superior comfort, they are built for the urban hustle. Material: Durable synthetic upper with a comfortable rubber sole. Occasion: Your go-to choice for everyday wear, from college to casual outings. Season: A timeless, all-season footwear staple. Vibe: Sporty, modern, and effortlessly cool.",
    },
    {
      title: "Men Blue Slim Jeans",
      brand: "Levis",
      description: "Experience iconic style and modern comfort with these slim-fit jeans from Levis. Crafted from premium stretch-infused cotton denim, they offer a perfect blend of structure and flexibility. The classic blue wash ensures timeless appeal. Occasion: A versatile foundation for any casual look, perfect for weekends or nights out. Season: An all-season wardrobe workhorse. Vibe: Confident, classic, and rugged.",
    },
    {
      title: "Women Black Leggings",
      brand: "H&M",
      description: "From workouts to weekends, these H&M high-waist leggings offer unbeatable comfort and style. Made from a soft and stretchy cotton-elastane blend, they provide a supportive fit that moves with you. Occasion: Perfect for the gym, yoga sessions, running errands, or simply lounging in style. Season: An essential for every season. Vibe: Active, comfortable, and effortlessly sleek.",
    },
    {
      title: "Men Checked Casual Shirt",
      brand: "Highlander",
      description: "A cool and casual staple, this checked shirt from Highlander is cut from soft, breathable cotton. It features a sharp spread collar and half-sleeves, making it perfect for warmer weather. Occasion: Ideal for a relaxed weekend, a casual Friday at work, or a day out with friends. Season: Best for summer and spring. Vibe: Laid-back, approachable, and stylish.",
    },
    {
      title: "Women Oversized Hoodie",
      brand: "Roadster",
      description: "Stay cozy and chic in this oversized hoodie from Roadster. Crafted from a soft fleece fabric, it offers a relaxed fit for maximum comfort. The solid beige color makes it a versatile layering piece. Occasion: Perfect for lounging at home, casual coffee runs, or travel days. Season: A go-to for autumn and winter. Vibe: Comfortable, trendy, and relaxed.",
    },
    {
      title: "Unisex Baseball Cap",
      brand: "Mast & Harbour",
      description: "Top off your look with this classic baseball cap. Made from durable cotton twill, it features an adjustable strap for a custom fit. A simple and stylish way to shield yourself from the sun. Occasion: Great for sporting events, outdoor activities, or adding a casual touch to any outfit. Season: All-season accessory. Vibe: Sporty, casual, and practical.",
    },
    {
      title: "Men Running Shorts",
      brand: "Adidas",
      description: "Engineered for performance, these running shorts from Adidas are made from a lightweight, moisture-wicking polyester fabric to keep you dry and comfortable. The breathable design allows for maximum airflow. Occasion: Ideal for running, gym workouts, and other high-intensity sports. Season: Perfect for summer training. Vibe: Athletic, focused, and high-performance.",
    },
    {
      title: "Women Sports Bra",
      brand: "Nike",
      description: "Power through your workouts with this high-support sports bra from Nike. It's crafted from sweat-wicking Dri-FIT fabric with a compression fit to minimize bounce and maximize comfort. Occasion: Essential for running, HIIT, and other high-impact activities. Season: A year-round workout necessity. Vibe: Empowered, supportive, and energetic.",
    },
    {
      title: "Men Leather Belt",
      brand: "Allen Solly",
      description: "Add a touch of sophistication to your ensemble with this belt from Allen Solly. Expertly crafted from genuine leather, it features a sleek metal buckle for a polished finish. Occasion: A must-have for formal events, office wear, and business meetings. Season: A timeless, all-season accessory. Vibe: Professional, sharp, and refined.",
    },
    {
      title: "Women Ethnic Kurta",
      brand: "Anouk",
      description: "Celebrate traditional aesthetics with this elegant printed kurta from Anouk. Made from soft and comfortable cotton, it features a classic straight cut that is both graceful and stylish. Occasion: Perfect for festive gatherings, casual family functions, or daily ethnic wear. Season: Ideal for all seasons, especially during festive periods. Vibe: Graceful, traditional, and chic.",
    },
    {
      title: "Men Ethnic Nehru Jacket",
      brand: "Manyavar",
      description: "Elevate your ethnic attire with this sophisticated Nehru jacket from Manyavar. Crafted from a rich blended fabric, this solid maroon jacket features a sharp mandarin collar for a regal look. Occasion: An excellent choice for weddings, sangeets, and other grand festive celebrations. Season: A year-round staple for ethnic events. Vibe: Royal, dapper, and celebratory.",
    },
    {
      title: "Women Heeled Sandals",
      brand: "Catwalk",
      description: "Step into the spotlight with these stunning heeled sandals from Catwalk. Featuring elegant straps and a comfortable yet stylish block heel, these golden sandals are designed to make a statement. Occasion: The perfect accessory for parties, weddings, and formal evening events. Season: A glamorous choice for any party season. Vibe: Glamorous, confident, and chic.",
    },
    {
      title: "Men Formal Oxford Shoes",
      brand: "Red Tape",
      description: "Command attention in the boardroom with these classic Oxford shoes by Red Tape. Meticulously crafted from high-quality genuine leather, they feature a sleek, timeless design that exudes professionalism. Occasion: Essential for business meetings, formal events, and daily office wear. Season: An all-season formal staple. Vibe: Sophisticated, powerful, and elegant.",
    },
    {
      title: "Unisex Denim Jacket",
      brand: "Levis",
      description: "An undisputed icon of style, the Levis trucker jacket is a must-have in any wardrobe. This unisex piece is made from durable, non-stretch cotton denim that gets better with age. Occasion: The ultimate layering piece for concerts, casual outings, and travel. Season: Perfect for spring, autumn, and cool summer evenings. Vibe: Timeless, rebellious, and effortlessly cool.",
    },
    {
      title: "Women Cardigan Sweater",
      brand: "ONLY",
      description: "Wrap yourself in warmth and style with this soft-knit cardigan from ONLY. It features a classic button-front design and is crafted from a cozy acrylic blend, making it a perfect layering piece. Occasion: Ideal for a day at the office, a casual brunch, or relaxing at home. Season: An essential for autumn and winter. Vibe: Cozy, chic, and sophisticated.",
    },
    {
      title: "Men Puffer Jacket",
      brand: "Wildcraft",
      description: "Brave the cold with this lightweight yet incredibly warm puffer jacket from Wildcraft. It's engineered with thermal insulation to protect you from the elements without weighing you down. Occasion: Perfect for winter travel, hiking, and everyday protection from the cold. Season: A winter wardrobe essential. Vibe: Adventurous, functional, and modern.",
    },
    {
      title: "Women Straight Pants",
      brand: "Zara",
      description: "Achieve a sleek, modern silhouette with these high-rise straight-leg pants from Zara. The clean lines and structured fabric create a polished look that can transition effortlessly from day to night. Material: A comfortable and durable polyester blend. Occasion: Ideal for office wear, business casual meetings, or a sophisticated evening out. Season: A versatile, all-season piece. Vibe: Minimalist, powerful, and chic.",
    },
    {
      title: "Unisex Graphic Tee",
      brand: "Bewakoof",
      description: "Make a statement without saying a word in this oversized graphic t-shirt from Bewakoof. Made from soft cotton and featuring a bold, expressive print, this tee is all about personality. Occasion: Perfect for college, casual hangouts, concerts, or any time you want to show off your unique style. Season: An all-season favorite. Vibe: Expressive, bold, and trendy.",
    },
    {
      title: "Men Training Trackpants",
      brand: "Puma",
      description: "Combine performance and streetwear style with these training trackpants from Puma. They are crafted from moisture-wicking fabric to keep you cool and dry, featuring a tapered fit for a modern look. Occasion: Excellent for gym sessions, training, or as part of a stylish athleisure outfit. Season: A versatile piece for all seasons. Vibe: Athletic, focused, and stylish.",
    },
    {
      title: "Women Tote Bag",
      brand: "Lino Perros",
      description: "Carry your essentials in style with this spacious and structured tote bag from Lino Perros. Made from high-quality faux leather with a refined tan finish, it's both functional and fashionable. Occasion: The perfect companion for work, shopping trips, or everyday use. Season: A classic, all-season handbag. Vibe: Sophisticated, organized, and elegant.",
    },
    {
      title: "Unisex Wayfarer Sunglasses",
      brand: "Ray-Ban",
      description: "An icon of cool, the Ray-Ban Wayfarer is a timeless accessory that never goes out of style. Offering 100% UV protection, these sunglasses combine classic design with superior lens technology. Occasion: A must-have for sunny days, driving, vacations, or simply adding an edge to your look. Season: A year-round essential, especially for summer. Vibe: Iconic, confident, and effortlessly cool.",
    },
    {
      title: "Men Polo T-Shirt",
      brand: "U.S. Polo Assn.",
      description: "Achieve a look of smart, preppy style with this classic polo t-shirt from U.S. Polo Assn. It's crafted from breathable cotton pique fabric and features the iconic embroidered logo on the chest. Occasion: Perfect for a smart-casual look at brunches, golf outings, or casual Fridays. Season: An all-season classic. Vibe: Preppy, polished, and timeless.",
    }
  ];

  try {
    // Create an array of promises for each update operation
    const updatePromises = productsWithNewDescriptions.map(productData =>
      Product.updateOne(
        { title: productData.title }, // Find the document by its title
        { $set: { description: productData.description } } // Set the new description
      )
    );

    // Execute all update promises in parallel
    const results = await Promise.all(updatePromises);

    const totalModified = results.reduce((sum, result) => sum + (result.modifiedCount || 0), 0);
    const totalMatched = results.reduce((sum, result) => sum + (result.matchedCount || 0), 0);

    console.log(`Update complete. Matched: ${totalMatched}, Modified: ${totalModified}`);

    return NextResponse.json({
      ok: true,
      message: `Successfully updated descriptions for ${totalModified} of ${totalMatched} matched products.`
    });

  } catch (error) {
    console.error("Failed to update product descriptions:", error);
    return NextResponse.json(
      { ok: false, message: "An error occurred during the update process." },
      { status: 500 }
    );
  }
}