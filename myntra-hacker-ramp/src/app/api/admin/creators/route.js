import { NextResponse } from 'next/server';
import { connectToDatabase } from "@/lib/db";
import Creator from '@/models/Creator';

// GET: Fetch all creators (Admin only)
export async function GET(request) {
  try {
    await connectToDatabase();

    // In a real app, verify admin authentication here
    // const adminToken = request.headers.get('authorization');
    // if (!adminToken || !verifyAdminToken(adminToken)) {
    //   return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    // }

    const creators = await Creator.find({})
      .select('-password') // Exclude password from response
      .sort({ createdAt: -1 });

    return NextResponse.json(creators);
  } catch (error) {
    console.error('Error fetching creators:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST: Create new creator (Admin only)
export async function POST(request) {
  try {
    await connectToDatabase();

    // In a real app, verify admin authentication here
    // const adminToken = request.headers.get('authorization');
    // if (!adminToken || !verifyAdminToken(adminToken)) {
    //   return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    // }

    const body = await request.json();
    const {
      name,
      email,
      username,
      password,
      bio = '',
      social_links = {},
      commission_rate = 10
    } = body;

    // Validate required fields
    if (!name || !email || !username || !password) {
      return NextResponse.json(
        { message: 'Name, email, username, and password are required' },
        { status: 400 }
      );
    }

    // Check if username or email already exists
    const existingCreator = await Creator.findOne({
      $or: [{ username }, { email }]
    });

    if (existingCreator) {
      return NextResponse.json(
        { 
          message: existingCreator.username === username 
            ? 'Username already exists' 
            : 'Email already exists' 
        },
        { status: 409 }
      );
    }

    // Create new creator
    const creator = new Creator({
      name,
      email,
      username,
      password, // Will be hashed by pre-save middleware
      bio,
      social_links,
      commission_rate,
      created_by_admin: 'admin', // In real app, use actual admin ID
      status: 'active'
    });

    await creator.save();

    // Return creator data without password
    const creatorResponse = creator.toObject();
    delete creatorResponse.password;

    return NextResponse.json(creatorResponse, { status: 201 });
  } catch (error) {
    console.error('Error creating creator:', error);
    
    if (error.code === 11000) {
      // Duplicate key error
      const field = Object.keys(error.keyPattern)[0];
      return NextResponse.json(
        { message: `${field} already exists` },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}