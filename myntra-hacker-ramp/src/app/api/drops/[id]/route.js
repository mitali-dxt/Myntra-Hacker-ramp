import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Drop from "@/models/Drop";

export async function GET(request, { params }) {
  try {
    await connectToDatabase();
    
    const { id } = await params;
    console.log('Fetching drop with ID:', id);
    
    const drop = await Drop.findById(id);
    
    if (!drop) {
      console.log('Drop not found');
      return NextResponse.json(
        { message: 'Drop not found' },
        { status: 404 }
      );
    }

    console.log('Found drop:', drop.title);
    
    // Increment view count
    await Drop.findByIdAndUpdate(id, { $inc: { views: 1 } });
    
    // Map database fields to frontend-expected fields
    const mappedDrop = {
      _id: drop._id,
      title: drop.title,
      description: drop.description,
      creatorName: drop.creator_name || drop.creatorName,
      creator_name: drop.creator_name || drop.creatorName,
      creator_image: drop.creator_image,
      creatorImageUrl: drop.creator_image, // Map for consistency
      collectionName: drop.title,
      imageUrl: drop.collection_image || drop.imageUrl,
      collection_image: drop.collection_image,
      startsAt: drop.launch_datetime,
      endsAt: drop.end_datetime || null,
      launch_datetime: drop.launch_datetime,
      end_datetime: drop.end_datetime,
      status: drop.status,
      products: drop.products || [],
      total_items: drop.total_items,
      views: drop.views || 0,
      engagement_rate: drop.engagement_rate || 0,
      is_featured: drop.is_featured || false
    };
    
    return NextResponse.json(mappedDrop);
  } catch (error) {
    console.error('Error fetching drop:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}