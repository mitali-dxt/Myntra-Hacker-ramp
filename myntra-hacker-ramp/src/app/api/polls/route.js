import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectToDatabase } from "@/lib/db";
import CollabSession from "@/models/CollabSession";
import Product from "@/models/Product";

function code() { return Math.random().toString(36).slice(2, 8).toUpperCase(); }

export async function POST(request) {
  await connectToDatabase();
  const uid = cookies().get("uid")?.value;
  const body = await request.json();
  const { action } = body;

  if (action === "create") {
    const c = await CollabSession.create({ code: code(), name: body.name || "My Vote", participants: [], items: [] });
    return NextResponse.json(c, { status: 201 });
  }

  if (action === "addItem") {
    const { pollCode, productId } = body;
    const prod = await Product.findById(productId);
    if (!prod) return NextResponse.json({ error: "Product not found" }, { status: 404 });
    const s = await CollabSession.findOneAndUpdate({ code: pollCode }, { $push: { items: { product: prod._id, addedBy: uid || "anon", votes: [] } } }, { new: true }).populate("items.product");
    if (!s) return NextResponse.json({ error: "Poll not found" }, { status: 404 });
    return NextResponse.json(s);
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}

export async function GET(request) {
  await connectToDatabase();
  const { searchParams } = new URL(request.url);
  const pollCode = searchParams.get("code");
  if (!pollCode) return NextResponse.json({ error: "code required" }, { status: 400 });
  const s = await CollabSession.findOne({ code: pollCode }).populate("items.product");
  if (!s) return NextResponse.json({ error: "Poll not found" }, { status: 404 });
  return NextResponse.json(s);
}


