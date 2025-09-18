import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Tribe from "@/models/Tribe";
import "@/models/Product"; // ensure Product model is registered for populate
import "@/models/User"; // ensure User model is registered for populate

export async function GET() {
  await connectToDatabase();
  const tribes = await Tribe.find({ isPublic: true })
    .populate("owner", "username displayName")
    .populate("products")
    .sort({ memberCount: -1 })
    .limit(50);
  return NextResponse.json(tribes);
}

export async function POST(request) {
  await connectToDatabase();
  const body = await request.json();
  const { action } = body;

  if (action === "create") {
    const { name, description, coverImage, tags } = body;
    const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
    const created = await Tribe.create({
      name,
      description,
      slug,
      coverImage: coverImage || "https://placehold.co/1200x400/7c3aed/fff?text=" + encodeURIComponent(name),
      tags: tags || [],
      owner: body.ownerId,
      members: [body.ownerId],
      memberCount: 1,
    });
    return NextResponse.json(created, { status: 201 });
  }

  if (action === "join") {
    const { tribeId, userId } = body;
    const tribe = await Tribe.findByIdAndUpdate(
      tribeId,
      { $addToSet: { members: userId }, $inc: { memberCount: 1 } },
      { new: true }
    ).populate("owner", "username displayName").populate("products");
    if (!tribe) return NextResponse.json({ error: "Tribe not found" }, { status: 404 });
    return NextResponse.json(tribe);
  }

  if (action === "leave") {
    const { tribeId, userId } = body;
    const tribe = await Tribe.findByIdAndUpdate(
      tribeId,
      { $pull: { members: userId }, $inc: { memberCount: -1 } },
      { new: true }
    ).populate("owner", "username displayName").populate("products");
    if (!tribe) return NextResponse.json({ error: "Tribe not found" }, { status: 404 });
    return NextResponse.json(tribe);
  }

  if (action === "addProducts") {
    const { tribeId, productIds } = body;
    const tribe = await Tribe.findByIdAndUpdate(
      tribeId,
      { $addToSet: { products: { $each: productIds } } },
      { new: true }
    ).populate("products");
    if (!tribe) return NextResponse.json({ error: "Tribe not found" }, { status: 404 });
    return NextResponse.json(tribe);
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}