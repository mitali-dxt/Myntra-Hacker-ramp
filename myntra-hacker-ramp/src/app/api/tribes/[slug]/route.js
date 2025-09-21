import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectToDatabase } from "@/lib/db";
import Tribe from "@/models/Tribe";
import "@/models/Product";
import "@/models/User";

export async function GET(_request, { params }) {
  await connectToDatabase();
  const cookieStore = await cookies();
  const uid = cookieStore.get("uid")?.value;
  const { slug } = await params;
  
  // Try to find by slug first, then by ID (for admin routes)
  let tribe = await Tribe.findOne({ slug })
    .populate("owner", "username displayName")
    .populate("products");

  if (!tribe) {
    // If not found by slug, try by ID (for admin routes)
    try {
      tribe = await Tribe.findById(slug)
        .populate("owner", "username displayName")
        .populate("products");
    } catch (error) {
      // Invalid ObjectId format, ignore
    }
  }

  if (!tribe) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const isMember = uid ? tribe.members.map(String).includes(String(uid)) : false;
  return NextResponse.json({ tribe, isMember });
}
