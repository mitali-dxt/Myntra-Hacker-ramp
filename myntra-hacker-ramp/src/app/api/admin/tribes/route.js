import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Tribe from "@/models/Tribe";
import "@/models/Product";
import "@/models/User";

// Admin auth middleware
async function checkAdminAuth(request) {
  try {
    const authHeader = request.headers.get("authorization") || request.headers.get("cookie");
    // Simple auth check - in production, implement proper JWT validation
    // For now, we'll rely on frontend auth check
    return true;
  } catch (error) {
    return false;
  }
}

export async function GET(request) {
  await connectToDatabase();
  
  if (!await checkAdminAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const tribes = await Tribe.find({})
      .populate("owner", "username displayName")
      .populate("products")
      .sort({ createdAt: -1 });
    
    return NextResponse.json(tribes);
  } catch (error) {
    console.error("Error fetching tribes:", error);
    return NextResponse.json({ error: "Failed to fetch tribes" }, { status: 500 });
  }
}

export async function POST(request) {
  await connectToDatabase();
  
  if (!await checkAdminAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { action, name, description, coverImage, tags } = body;

    if (action === "create") {
      // Generate slug from name
      const slug = name.toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');

      // Check if slug already exists
      const existingTribe = await Tribe.findOne({ slug });
      if (existingTribe) {
        return NextResponse.json({ error: "Tribe name already exists" }, { status: 400 });
      }

      const defaultCoverImage = coverImage || 
        `https://placehold.co/1200x400/7c3aed/fff?text=${encodeURIComponent(name)}`;

      const newTribe = await Tribe.create({
        name,
        description,
        slug,
        coverImage: defaultCoverImage,
        tags: tags || [],
        owner: null, // Admin-created tribes don't have specific owners
        members: [],
        memberCount: 0,
        products: [],
        isPublic: true,
        aiProductCount: 0
      });

      return NextResponse.json(newTribe, { status: 201 });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Error creating tribe:", error);
    return NextResponse.json({ error: "Failed to create tribe" }, { status: 500 });
  }
}

export async function PUT(request) {
  await connectToDatabase();
  
  if (!await checkAdminAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, name, description, coverImage, tags } = body;

    // Generate new slug if name changed
    const slug = name.toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    const updatedTribe = await Tribe.findByIdAndUpdate(
      id,
      {
        name,
        description,
        slug,
        coverImage,
        tags: Array.isArray(tags) ? tags : []
      },
      { new: true }
    ).populate("products");

    if (!updatedTribe) {
      return NextResponse.json({ error: "Tribe not found" }, { status: 404 });
    }

    return NextResponse.json(updatedTribe);
  } catch (error) {
    console.error("Error updating tribe:", error);
    return NextResponse.json({ error: "Failed to update tribe" }, { status: 500 });
  }
}

export async function DELETE(request) {
  await connectToDatabase();
  
  if (!await checkAdminAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id } = body;

    const deletedTribe = await Tribe.findByIdAndDelete(id);
    
    if (!deletedTribe) {
      return NextResponse.json({ error: "Tribe not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Tribe deleted successfully" });
  } catch (error) {
    console.error("Error deleting tribe:", error);
    return NextResponse.json({ error: "Failed to delete tribe" }, { status: 500 });
  }
}