import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Submission from "@/models/Submission";

export async function GET(request, { params }) {
  await connectToDatabase();
  
  const { id } = await params;

  try {
    const submissions = await Submission.find({ challengeId: id })
      .populate('userId', 'username displayName avatarUrl')
      .sort({ voteCount: -1, createdAt: -1 });
    
    return NextResponse.json(submissions);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch submissions" }, { status: 500 });
  }
}