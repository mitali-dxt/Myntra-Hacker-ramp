import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import TribeComment from "@/models/TribeComment";
import TribePost from "@/models/TribePost";
import { cookies } from "next/headers";
import "@/models/User";

// Create comment on a post
export async function POST(request, { params }) {
  await connectToDatabase();
  const { postId } = await params;
  const cookieStore = await cookies();
  const uid = cookieStore.get("uid")?.value;

  if (!uid) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { content } = body;

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: "Comment content is required" }, { status: 400 });
    }

    // Check if post exists
    const post = await TribePost.findById(postId);
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Create comment
    const newComment = await TribeComment.create({
      user: uid,
      post: postId,
      content: content.trim()
    });

    // Update post comment count
    await TribePost.findByIdAndUpdate(postId, {
      $inc: { commentsCount: 1 }
    });

    // Populate and return the comment
    const populatedComment = await TribeComment.findById(newComment._id)
      .populate("user", "username displayName avatar");

    return NextResponse.json(populatedComment, { status: 201 });
  } catch (error) {
    console.error("Error creating comment:", error);
    return NextResponse.json({ error: "Failed to create comment" }, { status: 500 });
  }
}