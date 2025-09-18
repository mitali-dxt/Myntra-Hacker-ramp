import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { cookies } from "next/headers";
import User from "@/models/User";
import Quest from "@/models/Quest";

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

export async function PUT(request, { params }) {
  await connectToDatabase();
  
  const admin = await checkAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();

  try {
    const quest = await Quest.findByIdAndUpdate(id, body, { new: true });
    if (!quest) {
      return NextResponse.json({ error: "Quest not found" }, { status: 404 });
    }
    return NextResponse.json(quest);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update quest" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  await connectToDatabase();
  
  const admin = await checkAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  const { id } = await params;

  try {
    const quest = await Quest.findByIdAndDelete(id);
    if (!quest) {
      return NextResponse.json({ error: "Quest not found" }, { status: 404 });
    }
    return NextResponse.json({ message: "Quest deleted successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete quest" }, { status: 500 });
  }
}