import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectToDatabase } from "@/lib/db";
import Creator from '@/models/Creator';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_EXPIRES_IN = '7d';

export async function POST(request) {
  try {
    await connectToDatabase();

    const { username, password } = await request.json();

    // Validate input
    if (!username || !password) {
      return NextResponse.json(
        { message: 'Username and password are required' },
        { status: 400 }
      );
    }

    // Find creator by username
    const creator = await Creator.findOne({ username });

    if (!creator) {
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Check if account is locked
    if (creator.isLocked()) {
      return NextResponse.json(
        { 
          message: 'Account temporarily locked due to too many failed login attempts. Please try again later.',
          locked_until: creator.locked_until
        },
        { status: 423 }
      );
    }

    // Check if account is active
    if (creator.status !== 'active') {
      return NextResponse.json(
        { message: 'Account is not active. Please contact administrator.' },
        { status: 403 }
      );
    }

    // Verify password
    const isValidPassword = await creator.comparePassword(password);

    if (!isValidPassword) {
      // Increment login attempts
      await creator.incLoginAttempts();
      
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Reset login attempts on successful login
    await creator.resetLoginAttempts();

    // Generate JWT token
    const token = jwt.sign(
      { 
        creatorId: creator._id,
        username: creator.username,
        type: 'creator'
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Prepare creator data for response (exclude sensitive fields)
    const creatorResponse = {
      _id: creator._id,
      name: creator.name,
      username: creator.username,
      email: creator.email,
      profile_image: creator.profile_image,
      bio: creator.bio,
      social_links: creator.social_links,
      followers: creator.followers,
      verified: creator.verified,
      rating: creator.rating,
      total_drops: creator.total_drops,
      total_sales: creator.total_sales,
      commission_rate: creator.commission_rate
    };

    return NextResponse.json({
      message: 'Login successful',
      token,
      creator: creatorResponse
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}