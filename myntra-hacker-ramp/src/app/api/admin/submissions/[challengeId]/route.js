import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { cookies } from "next/headers";
import User from "@/models/User";
import Submission from "@/models/Submission";

// Helper function to check admin authentication
async function checkAdmin() {
  const cookieStore = await cookies();
  const uid = cookieStore.get("uid")?.value;
  if (!uid) return null;
  
  const user = await User.findById(uid);
  
  // Special case for admin@myntra.com - always treat as admin
  if (user && user.email === "admin@myntra.com") {
    return user;
  }
  
  if (!user || user.role !== "ADMIN") return null;
  
  return user;
}

export async function GET(request, { params }) {
  await connectToDatabase();
  
  const admin = await checkAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  const { challengeId } = await params;

  try {
    const submissions = await Submission.find({ challengeId })
      .populate('userId', 'username email displayName')
      .sort({ voteCount: -1, createdAt: -1 });
    
    return NextResponse.json(submissions);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch submissions" }, { status: 500 });
  }
}