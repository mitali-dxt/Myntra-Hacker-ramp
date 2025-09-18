import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { cookies } from "next/headers";
import User from "@/models/User";
import Quest from "@/models/Quest";
import Submission from "@/models/Submission";

// Helper function to check admin authentication
async function checkAdmin() {
  const cookieStore = await cookies();
  const uid = cookieStore.get("uid")?.value;
  console.log("Admin check - uid:", uid);
  if (!uid) return null;
  
  const user = await User.findById(uid);
//   console.log("Admin check - user:", user ? user.toObject() : null);
  
  // Special case for admin@myntra.com - always treat as admin
  if (user && user.email === "admin@myntra.com") {
    console.log("Admin user detected by email");
    return user;
  }
  
  if (!user || user.role !== "ADMIN") return null;
  
  return user;
}

export async function POST(request) {
  await connectToDatabase();
  
  const admin = await checkAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  const body = await request.json();
  const {
    title,
    description,
    coverImageUrl,
    submissionStartDate,
    submissionEndDate,
    votingEndDate,
    prizeDiscountPercentage,
    prizeBadgeName,
    prizeBadgeImageUrl
  } = body;

  if (!title || !description || !submissionStartDate || !submissionEndDate || !votingEndDate) {
    return NextResponse.json({ 
      error: "Title, description, submission dates, and voting end date are required" 
    }, { status: 400 });
  }

  try {
    const quest = await Quest.create({
      title,
      description,
      coverImageUrl,
      submissionStartDate: new Date(submissionStartDate),
      submissionEndDate: new Date(submissionEndDate),
      votingEndDate: new Date(votingEndDate),
      prizeDiscountPercentage: prizeDiscountPercentage || 0,
      prizeBadgeName,
      prizeBadgeImageUrl,
      createdBy: admin._id,
      status: new Date(submissionStartDate) > new Date() ? 'upcoming' : 'active'
    });

    return NextResponse.json(quest, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create quest" }, { status: 500 });
  }
}

export async function GET() {
  await connectToDatabase();
  
  const admin = await checkAdmin();
  console.log("Admin GET request - admin:", admin ? admin.email : "null");
  if (!admin) {
    console.log("Admin access denied");
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  try {
    console.log("About to query quests...");
    const quests = await Quest.find().sort({ createdAt: -1 }).populate('createdBy', 'username email');
    console.log("Raw quest query result:", quests);
    console.log("Found quests:", quests.length);
    
    if (quests.length > 0) {
      console.log("First quest:", JSON.stringify(quests[0], null, 2));
    }
    
    return NextResponse.json(quests);
  } catch (error) {
    console.error("Error fetching quests:", error);
    return NextResponse.json({ error: "Failed to fetch quests" }, { status: 500 });
  }
}