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
  const slug = params.slug;
  const tribe = await Tribe.findOne({ slug })
    .populate("owner", "username displayName")
    .populate("products");
  if (!tribe) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const isMember = uid ? tribe.members.map(String).includes(String(uid)) : false;
  return NextResponse.json({ tribe, isMember });
}
