import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Creator from '@/models/Creator';

export async function POST(request) {
  try {
    await connectToDatabase();

    // Check if test creator already exists
    const existingCreator = await Creator.findOne({ username: 'diyamitali120' });
    
    if (existingCreator) {
      return NextResponse.json(
        { message: 'Test creator already exists' },
        { status: 200 }
      );
    }

    // Create test creator
    const testCreator = new Creator({
      name: 'Diya Mitali',
      email: 'diya.mitali@example.com',
      username: 'diyamitali120',
      password: 'A0w^FuyBz#BO', // Will be hashed by pre-save middleware
      bio: 'Fashion content creator and style influencer. Bringing you the latest trends and timeless classics.',
      social_links: {
        instagram: 'diyamitali120',
        youtube: 'diyamitali',
        twitter: 'diyamitali120',
        website: 'https://diyamitali.com'
      },
      followers: 125000,
      verified: true,
      status: 'active',
      rating: 4.8,
      total_drops: 3,
      total_sales: 45000,
      commission_rate: 18,
      created_by_admin: 'admin'
    });

    await testCreator.save();

    return NextResponse.json({
      message: 'Test creator added successfully',
      creator: {
        username: 'diyamitali120',
        password: 'A0w^FuyBz#BO',
        name: 'Diya Mitali'
      }
    });

  } catch (error) {
    console.error('Error creating test creator:', error);
    return NextResponse.json(
      { message: 'Error creating test creator', error: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  return NextResponse.json({
    message: 'Test Creator Seed Endpoint',
    usage: 'POST to create test creator with username: diyamitali120, password: A0w^FuyBz#BO'
  });
}