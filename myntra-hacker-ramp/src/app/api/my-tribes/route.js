import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectToDatabase } from "@/lib/db";
import Tribe from "@/models/Tribe";

export async function GET() {
  await connectToDatabase();
  const cookieStore = await cookies();
  const uid = cookieStore.get("uid")?.value;
  if (!uid) return NextResponse.json([], { status: 200 });

  const tribes = await Tribe.find({ owner: uid })
    .populate("products")
    .sort({ updatedAt: -1 });
  return NextResponse.json(tribes);
}
