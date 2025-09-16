import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Product from "@/models/Product";

export async function GET(request) {
  await connectToDatabase();
  const { searchParams } = new URL(request.url);
  const gender = searchParams.get("gender");
  const category = searchParams.get("category");
  const q = searchParams.get("q");

  const filter = {};
  if (gender) filter.gender = gender.toUpperCase();
  if (category) filter.category = category;
  if (q) filter.$text = { $search: q };

  const products = await Product.find(filter).sort({ createdAt: -1 }).limit(100);
  return NextResponse.json(products);
}

export async function POST(request) {
  await connectToDatabase();
  const body = await request.json();
  const created = await Product.create(body);
  return NextResponse.json(created, { status: 201 });
}


