import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import TribeCuratedProduct from "@/models/TribeCuratedProduct";
import Tribe from "@/models/Tribe";
import Product from "@/models/Product";
import User from "@/models/User";

// Admin auth middleware
async function checkAdminAuth(request) {
  try {
    // Simple auth check - in production, implement proper JWT validation
    return true;
  } catch (error) {
    return false;
  }
}

// Get curated products for a tribe
export async function GET(request, { params }) {
  await connectToDatabase();
  const { tribeId } = await params;

  if (!await checkAdminAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const curatedProducts = await TribeCuratedProduct.find({ 
      tribe: tribeId, 
      isActive: true 
    })
    .populate("product")
    .populate("curatedBy", "username")
    .sort({ order: 1, createdAt: -1 });

    return NextResponse.json(curatedProducts);
  } catch (error) {
    console.error("Error fetching curated products:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

// Add product to tribe curation
export async function POST(request, { params }) {
  await connectToDatabase();
  const { tribeId } = await params;

  if (!await checkAdminAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { productId, reason } = body;

    // Check if tribe exists
    const tribe = await Tribe.findById(tribeId);
    if (!tribe) {
      return NextResponse.json({ error: "Tribe not found" }, { status: 404 });
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Check if already curated
    const existing = await TribeCuratedProduct.findOne({
      tribe: tribeId,
      product: productId,
      isActive: true
    });

    if (existing) {
      return NextResponse.json({ error: "Product already curated for this tribe" }, { status: 400 });
    }

    // Find admin user (or create a system admin if none exists)
    let adminUser = await User.findOne({ role: 'ADMIN' });
    if (!adminUser) {
      // Create a system admin user if none exists
      adminUser = await User.create({
        username: 'system-admin',
        email: 'admin@myntra.com',
        displayName: 'System Admin',
        role: 'ADMIN',
        gender: 'OTHER'
      });
    }

    // Add to curated products
    const curatedProduct = await TribeCuratedProduct.create({
      tribe: tribeId,
      product: productId,
      curatedBy: adminUser._id, // Use actual admin user ObjectId
      reason: reason || "Admin curated"
    });

    // Also add to tribe's products array for backward compatibility
    await Tribe.findByIdAndUpdate(tribeId, {
      $addToSet: { products: productId }
    });

    const populatedProduct = await TribeCuratedProduct.findById(curatedProduct._id)
      .populate("product")
      .populate("curatedBy", "username");

    return NextResponse.json(populatedProduct, { status: 201 });
  } catch (error) {
    console.error("Error adding curated product:", error);
    return NextResponse.json({ error: "Failed to add product" }, { status: 500 });
  }
}

// Remove product from curation
export async function DELETE(request, { params }) {
  await connectToDatabase();
  const { tribeId } = await params;

  if (!await checkAdminAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { productId } = body;

    // Remove from curated products
    await TribeCuratedProduct.findOneAndUpdate(
      { tribe: tribeId, product: productId },
      { isActive: false }
    );

    // Also remove from tribe's products array
    await Tribe.findByIdAndUpdate(tribeId, {
      $pull: { products: productId }
    });

    return NextResponse.json({ message: "Product removed from curation" });
  } catch (error) {
    console.error("Error removing curated product:", error);
    return NextResponse.json({ error: "Failed to remove product" }, { status: 500 });
  }
}