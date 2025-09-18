import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Drop from "@/models/Drop";

export async function GET(request, { params }) {
  try {
    await connectToDatabase();
    
    console.log('Fetching drop with ID:', params.id);
    
    const drop = await Drop.findById(params.id);
    
    if (!drop) {
      console.log('Drop not found');
      return NextResponse.json(
        { message: 'Drop not found' },
        { status: 404 }
      );
    }

    console.log('Found drop:', drop.title);
    
    // Increment view count
    await Drop.findByIdAndUpdate(params.id, { $inc: { views: 1 } });
    
    return NextResponse.json(drop);
  } catch (error) {
    console.error('Error fetching drop:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}