import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import UserBadge from "@/models/UserBadge";

export async function GET(request, { params }) {
  await connectToDatabase();
  
  const { id } = await params; // user ID

  try {
    const badges = await UserBadge.find({ userId: id })
      .populate('challengeId', 'title')
      .sort({ earnedDate: -1 });
    
    return NextResponse.json(badges);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch badges" }, { status: 500 });
  }
}