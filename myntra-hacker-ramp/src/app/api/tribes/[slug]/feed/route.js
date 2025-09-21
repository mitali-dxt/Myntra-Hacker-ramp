import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import TribePost from "@/models/TribePost";
import TribeComment from "@/models/TribeComment";
import Tribe from "@/models/Tribe";
import { cookies } from "next/headers";
import "@/models/User";
import "@/models/Product";

// Get tribe feed posts
export async function GET(request, { params }) {
  await connectToDatabase();
  const { slug } = await params;
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const skip = (page - 1) * limit;

  try {
    // Find tribe by slug
    const tribe = await Tribe.findOne({ slug });
    if (!tribe) {
      return NextResponse.json({ error: "Tribe not found" }, { status: 404 });
    }

    // Get posts for this tribe
    const posts = await TribePost.find({ 
      tribe: tribe._id, 
      isActive: true 
    })
    .populate("user", "username displayName avatar")
    .populate("taggedProducts.product", "title brand price images")
    .sort({ isFeatured: -1, createdAt: -1 })
    .skip(skip)
    .limit(limit);

    const totalPosts = await TribePost.countDocuments({ 
      tribe: tribe._id, 
      isActive: true 
    });

    return NextResponse.json({
      posts,
      pagination: {
        page,
        limit,
        total: totalPosts,
        pages: Math.ceil(totalPosts / limit)
      }
    });
  } catch (error) {
    console.error("Error fetching tribe feed:", error);
    return NextResponse.json({ error: "Failed to fetch feed" }, { status: 500 });
  }
}

// Create new post in tribe
export async function POST(request, { params }) {
  await connectToDatabase();
  const { slug } = await params;
  const cookieStore = await cookies();
  const uid = cookieStore.get("uid")?.value;

  if (!uid) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { postType, content, imageUrl, taggedProducts } = body;

    // Find tribe by slug
    const tribe = await Tribe.findOne({ slug });
    if (!tribe) {
      return NextResponse.json({ error: "Tribe not found" }, { status: 404 });
    }

    // Check if user is a member of the tribe
    if (!tribe.members.includes(uid)) {
      return NextResponse.json({ error: "You must be a member to post" }, { status: 403 });
    }

    // Create new post
    const newPost = await TribePost.create({
      user: uid,
      tribe: tribe._id,
      postType,
      content,
      imageUrl: imageUrl || null,
      taggedProducts: taggedProducts || []
    });

    // Populate the post data
    const populatedPost = await TribePost.findById(newPost._id)
      .populate("user", "username displayName avatar")
      .populate("taggedProducts.product", "title brand price images");

    return NextResponse.json(populatedPost, { status: 201 });
  } catch (error) {
    console.error("Error creating post:", error);
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
  }
}