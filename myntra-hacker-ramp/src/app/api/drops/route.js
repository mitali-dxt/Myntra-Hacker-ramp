import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Drop from "@/models/Drop";

export async function GET() {
  await connectToDatabase();
  
  console.log('Fetching public drops...');
  
  // Get all drops that are live or upcoming
  const drops = await Drop.find({ 
    status: { $in: ['live', 'upcoming', 'scheduled'] }
  })
    .sort({ launch_datetime: 1 })
    .limit(50);
    
  console.log('Found public drops:', drops.length);
  
  // Map database fields to frontend-expected fields
  const mappedDrops = drops.map(drop => ({
    _id: drop._id,
    title: drop.title,
    description: drop.description,
    creatorName: drop.creator_name || drop.creatorName,
    creator_name: drop.creator_name || drop.creatorName,
    creator_image: drop.creator_image,
    collectionName: drop.title, // Map title to collectionName for compatibility
    imageUrl: drop.collection_image || drop.imageUrl, // Map collection_image to imageUrl
    startsAt: drop.launch_datetime,
    endsAt: drop.end_datetime || null,
    launch_datetime: drop.launch_datetime,
    status: drop.status,
    products: drop.products || [],
    total_items: drop.total_items,
    views: drop.views || 0,
    engagement_rate: drop.engagement_rate || 0,
    is_featured: drop.is_featured || false
  }));
  
  console.log('Mapped drops with imageUrls:', mappedDrops.map(d => ({ 
    id: d._id, 
    title: d.title, 
    imageUrl: d.imageUrl,
    collection_image: d.collection_image
  })));
  
  return NextResponse.json(mappedDrops);
}

export async function POST(request) {
  await connectToDatabase();
  const body = await request.json();
  const created = await Drop.create(body);
  return NextResponse.json(created, { status: 201 });
}


