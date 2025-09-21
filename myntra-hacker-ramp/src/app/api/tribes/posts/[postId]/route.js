import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import TribePost from "@/models/TribePost";
import TribeComment from "@/models/TribeComment";
import { cookies } from "next/headers";
import "@/models/User";

// Toggle like on a post
export async function POST(request, { params }) {
  await connectToDatabase();
  const { postId } = await params;
  const cookieStore = await cookies();
  const uid = cookieStore.get("uid")?.value;

  if (!uid) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  try {
    const post = await TribePost.findById(postId);
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const userLiked = post.likes.includes(uid);
    
    if (userLiked) {
      // Unlike the post
      post.likes.pull(uid);
      post.likesCount = Math.max(0, post.likesCount - 1);
    } else {
      // Like the post
      post.likes.push(uid);
      post.likesCount += 1;
    }

    await post.save();

    return NextResponse.json({
      liked: !userLiked,
      likesCount: post.likesCount
    });
  } catch (error) {
    console.error("Error toggling like:", error);
    return NextResponse.json({ error: "Failed to toggle like" }, { status: 500 });
  }
}

// Get post comments
export async function GET(request, { params }) {
  await connectToDatabase();
  const { postId } = await params;
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const skip = (page - 1) * limit;

  try {
    const comments = await TribeComment.find({ 
      post: postId, 
      isActive: true 
    })
    .populate("user", "username displayName avatar")
    .sort({ createdAt: 1 })
    .skip(skip)
    .limit(limit);

    const totalComments = await TribeComment.countDocuments({ 
      post: postId, 
      isActive: true 
    });

    return NextResponse.json({
      comments,
      pagination: {
        page,
        limit,
        total: totalComments,
        pages: Math.ceil(totalComments / limit)
      }
    });
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 });
  }
}