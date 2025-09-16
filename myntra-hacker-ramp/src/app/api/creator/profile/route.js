import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectToDatabase } from "@/lib/db";
import Creator from '@/models/Creator';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

// Middleware to verify creator token
function verifyCreatorToken(request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.type !== 'creator') {
      return null;
    }
    return decoded;
  } catch (error) {
    return null;
  }
}

// GET: Get creator profile
export async function GET(request) {
  try {
    await connectToDatabase();

    const decoded = verifyCreatorToken(request);
    if (!decoded) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const creator = await Creator.findById(decoded.creatorId).select('-password');
    
    if (!creator) {
      return NextResponse.json(
        { message: 'Creator not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(creator);
  } catch (error) {
    console.error('Error fetching creator profile:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH: Update creator profile
export async function PATCH(request) {
  try {
    await connectToDatabase();

    const decoded = verifyCreatorToken(request);
    if (!decoded) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const allowedUpdates = ['name', 'bio', 'profile_image', 'social_links'];

    const updates = {};
    Object.keys(body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = body[key];
      }
    });

    const creator = await Creator.findByIdAndUpdate(
      decoded.creatorId,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    if (!creator) {
      return NextResponse.json(
        { message: 'Creator not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(creator);
  } catch (error) {
    console.error('Error updating creator profile:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}