import mongoose from "mongoose";

let isConnected = false;

export async function connectToDatabase() {
  if (isConnected) return mongoose.connection;

  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error("MONGODB_URI is not set in environment variables");
  }

  if (mongoose.connection.readyState >= 1) {
    isConnected = true;
    return mongoose.connection;
  }

  await mongoose.connect(mongoUri, {
    dbName: process.env.MONGODB_DB || "myntra_hacker_ramp",
  });
  isConnected = true;
  return mongoose.connection;
}


