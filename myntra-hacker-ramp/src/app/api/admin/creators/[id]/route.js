import { NextResponse } from 'next/server';
import { connectToDatabase } from "@/lib/db";
import Creator from '@/models/Creator';

// GET: Fetch single creator (Admin only)
export async function GET(request, { params }) {
  try {
    await connectToDatabase();

    const creator = await Creator.findById(params.id).select('-password');
    
    if (!creator) {
      return NextResponse.json(
        { message: 'Creator not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(creator);
  } catch (error) {
    console.error('Error fetching creator:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH: Update creator (Admin only)
export async function PATCH(request, { params }) {
  try {
    await connectToDatabase();

    const body = await request.json();
    const allowedUpdates = [
      'name', 'email', 'bio', 'social_links', 'status', 
      'verified', 'commission_rate', 'followers', 'rating'
    ];

    const updates = {};
    Object.keys(body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = body[key];
      }
    });

    // If username is being updated, check for uniqueness
    if (body.username) {
      const existingCreator = await Creator.findOne({
        username: body.username,
        _id: { $ne: params.id }
      });

      if (existingCreator) {
        return NextResponse.json(
          { message: 'Username already exists' },
          { status: 409 }
        );
      }
      updates.username = body.username;
    }

    // If email is being updated, check for uniqueness
    if (body.email) {
      const existingCreator = await Creator.findOne({
        email: body.email,
        _id: { $ne: params.id }
      });

      if (existingCreator) {
        return NextResponse.json(
          { message: 'Email already exists' },
          { status: 409 }
        );
      }
      updates.email = body.email;
    }

    const creator = await Creator.findByIdAndUpdate(
      params.id,
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
    console.error('Error updating creator:', error);
    
    if (error.code === 11000) {
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

// DELETE: Delete creator (Admin only)
export async function DELETE(request, { params }) {
  try {
    await connectToDatabase();

    const creator = await Creator.findByIdAndDelete(params.id);

    if (!creator) {
      return NextResponse.json(
        { message: 'Creator not found' },
        { status: 404 }
      );
    }

    // In a real app, you might want to:
    // 1. Soft delete instead of hard delete
    // 2. Clean up related data (drops, etc.)
    // 3. Send notification to creator

    return NextResponse.json(
      { message: 'Creator deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting creator:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}