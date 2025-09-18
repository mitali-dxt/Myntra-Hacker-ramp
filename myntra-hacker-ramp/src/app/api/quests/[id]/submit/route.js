import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { cookies } from "next/headers";
import User from "@/models/User";
import Quest from "@/models/Quest";
import Submission from "@/models/Submission";

// Helper function to get authenticated user
async function getAuthenticatedUser() {
  const cookieStore = await cookies();
  const uid = cookieStore.get("uid")?.value;
  if (!uid) return null;
  
  const user = await User.findById(uid);
  return user;
}

export async function POST(request, { params }) {
  await connectToDatabase();
  
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const { imageUrl, title, description, myntraProducts } = body;

  if (!imageUrl || !title || !description) {
    return NextResponse.json({ 
      error: "Image URL, title, and description are required" 
    }, { status: 400 });
  }

  try {
    // Check if quest exists and is in active status
    const quest = await Quest.findById(id);
    if (!quest) {
      return NextResponse.json({ error: "Quest not found" }, { status: 404 });
    }

    if (quest.status !== 'active') {
      return NextResponse.json({ 
        error: "Quest is not accepting submissions" 
      }, { status: 400 });
    }

    // Check if user already submitted for this quest
    const existingSubmission = await Submission.findOne({
      userId: user._id,
      challengeId: id
    });

    if (existingSubmission) {
      return NextResponse.json({ 
        error: "You have already submitted for this quest" 
      }, { status: 400 });
    }

    const submission = await Submission.create({
      userId: user._id,
      challengeId: id,
      imageUrl,
      title,
      description,
      myntraProducts: myntraProducts || []
    });

    return NextResponse.json(submission, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to submit" }, { status: 500 });
  }
}