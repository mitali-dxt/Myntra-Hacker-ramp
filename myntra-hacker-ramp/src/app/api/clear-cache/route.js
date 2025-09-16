import { NextResponse } from "next/server";

export async function POST() {
  try {
    // Clear all Mongoose models from cache
    const mongoose = require('mongoose');
    
    // Delete all models
    Object.keys(mongoose.models).forEach(modelName => {
      delete mongoose.models[modelName];
    });
    
    // Clear require cache for model files
    Object.keys(require.cache).forEach(key => {
      if (key.includes('/models/')) {
        delete require.cache[key];
      }
    });
    
    return NextResponse.json({ 
      success: true, 
      message: "Models cache cleared successfully" 
    });
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}