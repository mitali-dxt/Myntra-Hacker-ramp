import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Vote from "@/models/Vote";
import jwt from "jsonwebtoken";

export async function GET(request) {
  await connectToDatabase();
  
  try {
    const url = new URL(request.url);
    const questId = url.searchParams.get('questId');
    const userId = url.searchParams.get('userId');
    
    if (!questId) {
      return NextResponse.json({ error: 'Quest ID is required' }, { status: 400 });
    }
    
    let query = { quest: questId };
    
    // If userId is provided, filter votes by user
    if (userId) {
      query.user = userId;
    }
    
    const votes = await Vote.find(query)
      .populate('user', 'fullName username')
      .populate('submission', 'imageUrl description');
    
    return NextResponse.json({ votes });
  } catch (error) {
    console.error("Error fetching votes:", error);
    return NextResponse.json({ error: "Failed to fetch votes" }, { status: 500 });
  }
}

export async function POST(request) {
  await connectToDatabase();
  
  try {
    const body = await request.json();
    const { questId, submissionId } = body;
    
    // Get user from JWT token
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    
    let userId;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      userId = decoded.userId;
    } catch (error) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
    
    // Check if user has already voted for this submission
    const existingVote = await Vote.findOne({
      user: userId,
      quest: questId,
      submission: submissionId
    });
    
    if (existingVote) {
      return NextResponse.json({ error: "You have already voted for this submission" }, { status: 400 });
    }
    
    // Create new vote
    const vote = await Vote.create({
      user: userId,
      quest: questId,
      submission: submissionId
    });
    
    return NextResponse.json({ vote }, { status: 201 });
  } catch (error) {
    console.error("Error creating vote:", error);
    return NextResponse.json({ error: "Failed to create vote" }, { status: 500 });
  }
}