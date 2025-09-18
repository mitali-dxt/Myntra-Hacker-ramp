import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Quest from "@/models/Quest";
import mongoose from "mongoose";

export async function GET() {
  await connectToDatabase();
  
  try {
    console.log("=== QUEST DEBUG ===");
    
    // Test direct MongoDB connection
    const db = mongoose.connection.db;
    const directResult = await db.collection('quests').find({}).toArray();
    console.log("Direct MongoDB query result:", directResult.length, "documents");
    if (directResult.length > 0) {
      console.log("First direct result:", JSON.stringify(directResult[0], null, 2));
    }
    
    // Clear Mongoose models cache
    if (mongoose.models.Quest) {
      delete mongoose.models.Quest;
    }
    
    // Re-import Quest model
    delete require.cache[require.resolve('@/models/Quest')];
    const QuestModel = require('@/models/Quest').default;
    
    // Test Mongoose query with fresh model
    console.log("Testing fresh Mongoose query...");
    const mongooseResult = await QuestModel.find({});
    console.log("Fresh Mongoose query result:", mongooseResult.length, "documents");
    if (mongooseResult.length > 0) {
      console.log("First fresh mongoose result:", JSON.stringify(mongooseResult[0], null, 2));
    }
    
    // Test with explicit collection
    const explicitResult = await QuestModel.collection.find({}).toArray();
    console.log("Explicit collection query result:", explicitResult.length, "documents");
    
    return NextResponse.json({
      directCount: directResult.length,
      mongooseCount: mongooseResult.length,
      explicitCount: explicitResult.length,
      success: mongooseResult.length > 0,
      directResult: directResult,
      mongooseResult: mongooseResult
    });
  } catch (error) {
    console.error("Debug error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}