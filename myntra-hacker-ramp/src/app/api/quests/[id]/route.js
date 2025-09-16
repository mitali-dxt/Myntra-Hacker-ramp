import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Quest from "@/models/Quest";

export async function GET(request, { params }) {
  await connectToDatabase();
  
  const { id } = await params;

  try {
    const quest = await Quest.findById(id);
    if (!quest) {
      return NextResponse.json({ error: "Quest not found" }, { status: 404 });
    }
    return NextResponse.json(quest);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch quest" }, { status: 500 });
  }
}