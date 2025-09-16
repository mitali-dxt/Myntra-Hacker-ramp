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
  console.log('Drop details:', drops.map(d => ({ 
    id: d._id, 
    title: d.title, 
    status: d.status, 
    launch_datetime: d.launch_datetime 
  })));
  
  return NextResponse.json(drops);
}

export async function POST(request) {
  await connectToDatabase();
  const body = await request.json();
  const created = await Drop.create(body);
  return NextResponse.json(created, { status: 201 });
}


