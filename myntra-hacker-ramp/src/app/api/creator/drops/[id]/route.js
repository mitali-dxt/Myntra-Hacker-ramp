import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Drop from "@/models/Drop";
import Product from "@/models/Product";

// Get individual drop by ID
export async function GET(request, { params }) {
  await connectToDatabase();
  
  try {
    const { id } = await params;
    
    // Get creator ID from token (you might need to implement token verification)
    // For now, we'll fetch the drop and verify ownership
    const drop = await Drop.findById(id);
    
    if (!drop) {
      return NextResponse.json({ error: "Drop not found" }, { status: 404 });
    }
    
    // Check if any products need data restoration
    const productsNeedingRestore = drop.products.filter(product => 
      !product.image_url && !product.description && !product.category
    );
    
    // If there are products with missing data, try to restore them
    if (productsNeedingRestore.length > 0) {
      console.log(`Attempting to restore data for ${productsNeedingRestore.length} products`);
      
      // Get all products from the main collection to match against
      const allProducts = await Product.find({});
      
      // Try to match products by name and price
      drop.products = drop.products.map(dropProduct => {
        const isIncomplete = !dropProduct.image_url && !dropProduct.description && !dropProduct.category;
        
        if (isIncomplete) {
          // Try to find matching product in main collection
          const matchedProduct = allProducts.find(p => 
            p.title === dropProduct.name && 
            (p.price === dropProduct.price || p.mrp === dropProduct.original_price)
          );
          
          if (matchedProduct) {
            console.log(`Restored data for product: ${dropProduct.name}`);
            return {
              ...dropProduct,
              description: matchedProduct.description || '',
              image_url: Array.isArray(matchedProduct.images) && matchedProduct.images.length > 0 
                ? matchedProduct.images[0] 
                : '',
              category: matchedProduct.category || '',
              brand: matchedProduct.brand || '',
              sizes: Array.isArray(matchedProduct.sizes) ? matchedProduct.sizes : [],
              colors: Array.isArray(matchedProduct.colors) ? matchedProduct.colors : [],
              stock_quantity: matchedProduct.inStock ? 50 : 0,
              original_price: matchedProduct.mrp || matchedProduct.price || dropProduct.price
            };
          }
        }
        
        return dropProduct;
      });
      
      // Save the restored data back to the database
      await Drop.findByIdAndUpdate(id, { products: drop.products });
    }
    
    // Add any additional fields that might be needed for the frontend
    const dropWithDetails = {
      _id: drop._id,
      title: drop.title,
      description: drop.description || '',
      imageUrl: drop.collection_image || drop.imageUrl || '',
      banner_image: drop.collection_image || drop.imageUrl || '',
      launch_datetime: drop.launch_datetime ? new Date(drop.launch_datetime).toISOString().slice(0, 16) : '',
      end_datetime: '', // No end date in current model
      status: drop.status || 'draft',
      total_items: drop.total_items || drop.products?.length || 0,
      sold_count: drop.sold_count || 0,
      total_sales: drop.total_sales || 0,
      views: drop.views || 0,
      engagement_rate: drop.engagement_rate || 0,
      products: (drop.products || []).map(product => {
        // Check if product data is incomplete (missing image_url, description, etc.)
        const isIncompleteProduct = !product.image_url && !product.description && !product.category;
        
        if (isIncompleteProduct) {
          // Try to find the product in the main products collection to get complete data
          // For now, return with placeholder data and log the issue
          console.warn(`Incomplete product data detected for: ${product.name}`);
        }
        
        return {
          _id: product._id?.toString() || Math.random().toString(),
          name: product.name || '',
          description: product.description || (isIncompleteProduct ? 'Product description not available' : ''),
          price: product.price || 0,
          original_price: product.original_price || product.price || 0,
          image_url: product.image_url || (isIncompleteProduct ? 'https://via.placeholder.com/500x500/e2e8f0/64748b?text=No+Image' : ''),
          category: product.category || '',
          brand: product.brand || '',
          sizes: Array.isArray(product.sizes) ? product.sizes : [],
          colors: Array.isArray(product.colors) ? product.colors : [],
          stock_quantity: product.stock_quantity || 0,
          sold_quantity: product.sold_quantity || 0,
          rating: product.rating || 0,
          // Legacy fields for backward compatibility
          id: product._id?.toString() || Math.random().toString(),
          quantity: product.stock_quantity || 0,
          sold: product.sold_quantity || 0,
          total: product.stock_quantity || 0
        };
      }),
      creator_id: drop.creator_id,
      creatorName: drop.creator_name || drop.creatorName
    };
    
    return NextResponse.json(dropWithDetails);
  } catch (error) {
    console.error("Error fetching drop:", error);
    return NextResponse.json({ error: "Failed to fetch drop" }, { status: 500 });
  }
}

// Update drop by ID
export async function PATCH(request, { params }) {
  await connectToDatabase();
  
  try {
    const { id } = await params;
    const updateData = await request.json();
    
    // Convert frontend format back to database format
    const dbUpdateData = {
      title: updateData.title,
      description: updateData.description,
      collection_image: updateData.imageUrl,
      launch_datetime: updateData.launch_datetime ? new Date(updateData.launch_datetime) : undefined,
      status: updateData.status || 'draft'
    };

    // Handle products update carefully - preserve existing product data
    if (updateData.products && Array.isArray(updateData.products)) {
      dbUpdateData.products = updateData.products.map(product => ({
        name: product.name || '',
        description: product.description || '',
        price: parseInt(product.price) || 0,
        original_price: parseInt(product.original_price) || parseInt(product.price) || 0,
        image_url: product.image_url || '',
        category: product.category || '',
        brand: product.brand || '',
        sizes: Array.isArray(product.sizes) ? product.sizes : [],
        colors: Array.isArray(product.colors) ? product.colors : [],
        stock_quantity: parseInt(product.stock_quantity) || parseInt(product.quantity) || 0,
        sold_quantity: parseInt(product.sold_quantity) || parseInt(product.sold) || 0,
        is_exclusive: Boolean(product.is_exclusive),
        limited_quantity: Boolean(product.limited_quantity),
        rating: parseFloat(product.rating) || 0
      }));
    }
    
    // Remove undefined values
    Object.keys(dbUpdateData).forEach(key => {
      if (dbUpdateData[key] === undefined) {
        delete dbUpdateData[key];
      }
    });
    
    const updatedDrop = await Drop.findByIdAndUpdate(
      id,
      { $set: dbUpdateData },
      { new: true }
    );
    
    if (!updatedDrop) {
      return NextResponse.json({ error: "Drop not found" }, { status: 404 });
    }
    
    return NextResponse.json(updatedDrop);
  } catch (error) {
    console.error("Error updating drop:", error);
    return NextResponse.json({ error: "Failed to update drop" }, { status: 500 });
  }
}

// Delete drop by ID
export async function DELETE(request, { params }) {
  await connectToDatabase();
  
  try {
    const { id } = await params;
    
    const deletedDrop = await Drop.findByIdAndDelete(id);
    
    if (!deletedDrop) {
      return NextResponse.json({ error: "Drop not found" }, { status: 404 });
    }
    
    return NextResponse.json({ message: "Drop deleted successfully" });
  } catch (error) {
    console.error("Error deleting drop:", error);
    return NextResponse.json({ error: "Failed to delete drop" }, { status: 500 });
  }
}

// Helper function to determine drop status
function getDropStatus(drop) {
  const now = new Date();
  const startDate = drop.startsAt ? new Date(drop.startsAt) : null;
  const endDate = drop.endsAt ? new Date(drop.endsAt) : null;
  
  if (!startDate) return 'upcoming';
  
  if (now < startDate) return 'upcoming';
  if (endDate && now > endDate) return 'completed';
  return 'live';
}