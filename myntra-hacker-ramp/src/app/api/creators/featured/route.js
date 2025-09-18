import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Creator from "@/models/Creator";

export async function GET() {
  try {
    await connectToDatabase();
    
    console.log('Fetching featured creators...');
    
    // Get the last 2 creators added, sorted by creation date
    const creators = await Creator.find({})
      .sort({ createdAt: -1 })
      .limit(2);
      
    console.log('Found featured creators:', creators.length);
    console.log('Creator details:', creators.map(c => ({ 
      id: c._id, 
      name: c.name, 
      username: c.username,
      createdAt: c.createdAt 
    })));
    
    return NextResponse.json(creators);
  } catch (error) {
    console.error('Error fetching featured creators:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}