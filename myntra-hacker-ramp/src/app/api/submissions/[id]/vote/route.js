import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { cookies } from "next/headers";
import User from "@/models/User";
import Submission from "@/models/Submission";
import Vote from "@/models/Vote";
import Quest from "@/models/Quest";

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

  const { id } = await params; // submission ID

  try {
    const submission = await Submission.findById(id);
    if (!submission) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    // Check if quest is in voting phase
    const quest = await Quest.findById(submission.challengeId);
    if (quest.status !== 'voting' && quest.status !== 'active') {
      return NextResponse.json({ 
        error: "Voting is not open for this quest" 
      }, { status: 400 });
    }

    // Check if user is trying to vote for their own submission
    if (submission.userId.toString() === user._id.toString()) {
      return NextResponse.json({ 
        error: "You cannot vote for your own submission" 
      }, { status: 400 });
    }

    // Check if user already voted for this submission
    const existingVote = await Vote.findOne({
      userId: user._id,
      submissionId: id
    });

    if (existingVote) {
      return NextResponse.json({ 
        error: "You have already voted for this submission" 
      }, { status: 400 });
    }

    // Create vote and update submission vote count
    await Vote.create({
      userId: user._id,
      submissionId: id,
      challengeId: submission.challengeId
    });

    await Submission.findByIdAndUpdate(id, {
      $inc: { voteCount: 1 }
    });

    return NextResponse.json({ message: "Vote cast successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to cast vote" }, { status: 500 });
  }
}