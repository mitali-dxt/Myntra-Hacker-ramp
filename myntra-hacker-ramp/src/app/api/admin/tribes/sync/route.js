import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Tribe from "@/models/Tribe";
import Product from "@/models/Product";

// Admin auth middleware
async function checkAdminAuth(request) {
  try {
    // Simple auth check - in production, implement proper JWT validation
    return true;
  } catch (error) {
    return false;
  }
}

export async function POST(request) {
  await connectToDatabase();
  
  if (!await checkAdminAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { tribeId, tribeName, tribeDescription, tribeTags } = await request.json();

    if (!tribeId || !tribeName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Find the tribe
    const tribe = await Tribe.findById(tribeId);
    if (!tribe) {
      return NextResponse.json({ error: "Tribe not found" }, { status: 404 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "AI service not configured" }, { status: 500 });
    }

    // Get total product count for batching
    const totalProducts = await Product.countDocuments({});
    const batchSize = 20; // Process products in batches
    const batches = Math.ceil(totalProducts / batchSize);
    
    let allRecommendedProducts = [];
    let processedCount = 0;

    // Process products in batches to avoid overwhelming the AI
    for (let batch = 0; batch < batches && batch < 10; batch++) { // Limit to first 10 batches (200 products)
      const offset = batch * batchSize;
      
      try {
        const response = await fetch(`${request.nextUrl.origin}/api/ai/classify-products`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tribeName,
            tribeDescription,
            tribeTags,
            offset,
            limit: batchSize
          })
        });

        if (!response.ok) {
          console.error(`AI classification failed for batch ${batch}`);
          continue;
        }

        const batchResult = await response.json();
        
        // Filter products with good scores (>= 0.6)
        const goodProducts = batchResult.results
          .filter(item => item.score >= 0.6)
          .map(item => item.product._id);
        
        allRecommendedProducts.push(...goodProducts);
        processedCount += batchResult.results.length;

        // Add a small delay between batches to avoid overwhelming the API
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        console.error(`Error processing batch ${batch}:`, error);
        continue;
      }
    }

    // Remove duplicates
    const uniqueProductIds = [...new Set(allRecommendedProducts)];
    
    // Update tribe with AI-recommended products (add to existing products, don't replace)
    const existingProductIds = tribe.products.map(p => p.toString());
    const newProductIds = uniqueProductIds.filter(id => !existingProductIds.includes(id.toString()));
    
    const updatedTribe = await Tribe.findByIdAndUpdate(
      tribeId,
      { 
        $addToSet: { products: { $each: newProductIds } },
        $set: { aiProductCount: uniqueProductIds.length }
      },
      { new: true }
    ).populate("products");

    return NextResponse.json({
      message: "Products synced successfully",
      totalProcessed: processedCount,
      totalSynced: uniqueProductIds.length,
      newProducts: newProductIds.length,
      products: updatedTribe.products,
      tribe: updatedTribe
    });

  } catch (error) {
    console.error("Error syncing products:", error);
    return NextResponse.json({ 
      error: "Failed to sync products", 
      details: error.message 
    }, { status: 500 });
  }
}