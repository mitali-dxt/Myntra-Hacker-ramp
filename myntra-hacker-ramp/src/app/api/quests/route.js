import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Quest from "@/models/Quest";

export async function GET() {
  await connectToDatabase();
  
  try {
    // Auto-update status based on current date
    const now = new Date();
    console.log("Current date:", now);
    
    const updateResults = [];
    
    const upcomingUpdate = await Quest.updateMany(
      { submissionStartDate: { $gt: now } },
      { status: 'upcoming' }
    );
    updateResults.push({ upcoming: upcomingUpdate.modifiedCount });
    
    const activeUpdate = await Quest.updateMany(
      { 
        submissionStartDate: { $lte: now },
        submissionEndDate: { $gt: now }
      },
      { status: 'active' }
    );
    updateResults.push({ active: activeUpdate.modifiedCount });
    
    const votingUpdate = await Quest.updateMany(
      { 
        submissionEndDate: { $lte: now },
        votingEndDate: { $gt: now }
      },
      { status: 'voting' }
    );
    updateResults.push({ voting: votingUpdate.modifiedCount });
    
    const completedUpdate = await Quest.updateMany(
      { votingEndDate: { $lte: now } },
      { status: 'completed' }
    );
    updateResults.push({ completed: completedUpdate.modifiedCount });
    
    console.log("Status update results:", updateResults);

    console.log("About to query all quests...");
    const quests = await Quest.find().sort({ createdAt: -1 });
    console.log("Raw user quest query result:", quests);
    console.log("Found quests for users:", quests.length);
    
    if (quests.length > 0) {
      console.log("First quest for users:", JSON.stringify(quests[0], null, 2));
    }
    
    console.log("Quest details:", quests.map(q => ({
      id: q._id,
      title: q.title,
      status: q.status,
      submissionStart: q.submissionStartDate,
      submissionEnd: q.submissionEndDate,
      votingEnd: q.votingEndDate
    })));
    
    return NextResponse.json(quests);
  } catch (error) {
    console.error("Error in quests GET:", error);
    return NextResponse.json({ error: "Failed to fetch quests" }, { status: 500 });
  }
}

export async function POST(request) {
  await connectToDatabase();
  const body = await request.json();
  const created = await Quest.create(body);
  return NextResponse.json(created, { status: 201 });
}


