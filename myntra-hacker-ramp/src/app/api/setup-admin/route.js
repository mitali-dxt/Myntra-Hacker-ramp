import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";
import mongoose from "mongoose";

export async function POST() {
  await connectToDatabase();
  
  try {
    // Find the admin user
    const adminUser = await User.findOne({ email: "admin@myntra.com" });
    
    if (adminUser) {
      // Force update using direct MongoDB operations
      const db = mongoose.connection.db;
      const result = await db.collection('users').updateOne(
        { _id: adminUser._id }, 
        { 
          $set: { 
            role: "ADMIN" 
          } 
        }
      );
      
      console.log("Direct MongoDB update result:", result);
      
      // Verify the update with direct query
      const updatedUserDoc = await db.collection('users').findOne({ _id: adminUser._id });
      console.log("Direct MongoDB query result:", updatedUserDoc);
      
      // Also try with Mongoose
      const updatedUser = await User.findById(adminUser._id);
      console.log("Mongoose query result:", updatedUser?.toObject());
      
      return NextResponse.json({ 
        success: true, 
        message: "Admin role set successfully",
        directResult: updatedUserDoc,
        mongooseResult: updatedUser?.toObject(),
        updateResult: result
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        message: "Admin user not found" 
      });
    }
  } catch (error) {
    console.error("Setup error:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Setup failed",
      error: error.message 
    });
  }
}