import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectToDatabase } from "@/lib/db";
import Drop from "@/models/Drop";
import Product from "@/models/Product";

function genCode() { return Math.random().toString(36).slice(2, 8).toUpperCase(); }

export async function GET() {
  await connectToDatabase();
  const cookieStore = await cookies();
  const uid = cookieStore.get("uid")?.value;
  if (!uid) return NextResponse.json([], { status: 200 });
  const drops = await Drop.find({ owner: uid, isPersonal: true }).populate("products").sort({ updatedAt: -1 });
  return NextResponse.json(drops);
}

export async function POST(request) {
  await connectToDatabase();
  const cookieStore = await cookies();
  const uid = cookieStore.get("uid")?.value;
  if (!uid) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const body = await request.json();
  const { action } = body;

  if (action === "create") {
    const created = await Drop.create({ owner: uid, isPersonal: true, collectionName: body.name || "My Capsule", creatorName: body.creatorName || "Me", imageUrl: body.imageUrl || "", code: genCode(), products: [] });
    return NextResponse.json(created, { status: 201 });
  }

  if (action === "addItem") {
    const { dropId, productId } = body;
    const product = await Product.findById(productId);
    if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });
    const updated = await Drop.findOneAndUpdate({ _id: dropId, owner: uid }, { $addToSet: { products: product._id } }, { new: true }).populate("products");
    if (!updated) return NextResponse.json({ error: "Drop not found" }, { status: 404 });
    return NextResponse.json(updated);
  }

  if (action === "removeItem") {
    const { dropId, productId } = body;
    const updated = await Drop.findOneAndUpdate({ _id: dropId, owner: uid }, { $pull: { products: productId } }, { new: true }).populate("products");
    if (!updated) return NextResponse.json({ error: "Drop not found" }, { status: 404 });
    return NextResponse.json(updated);
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}


