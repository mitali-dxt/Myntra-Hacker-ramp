import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";

export async function POST(request) {
  await connectToDatabase();
  const cookieStore = await cookies();
  const uid = cookieStore.get("uid")?.value;
  if (!uid) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const body = await request.json();
  const update = {
    displayName: body.displayName,
    name: body.name,
    age: body.age ? Number(body.age) : undefined,
    gender: body.gender,
    phone: body.phone,
  };
  const cleaned = Object.fromEntries(Object.entries(update).filter(([_,v]) => v !== undefined));
  const user = await User.findByIdAndUpdate(uid, { $set: cleaned }, { new: true });
  return NextResponse.json({ ok: true, user });
}


