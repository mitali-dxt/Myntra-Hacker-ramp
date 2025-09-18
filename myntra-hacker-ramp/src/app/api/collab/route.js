import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import CollabSession from "@/models/CollabSession";
import Product from "@/models/Product";

function generateCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

export async function POST(request) {
  await connectToDatabase();
  const body = await request.json();
  const { action } = body;

  try {
    if (action === "create") {
      const code = generateCode();
      const { name, hostName } = body;
      
      const session = await CollabSession.create({ 
        code, 
        name: name || "Shared Cart",
        hostId: hostName || "Host",
        participants: [{
          userId: hostName || "Host",
          userName: hostName || "Host",
          joinedAt: new Date(),
          isActive: true
        }],
        messages: [{
          _id: new Date().getTime().toString(),
          userName: 'System',
          message: 'Welcome to the shopping party! 🎉',
          timestamp: new Date(),
          type: 'system'
        }],
        status: 'active',
        createdAt: new Date(),
        lastActivity: new Date()
      });
      return NextResponse.json(session, { status: 201 });
    }

    if (action === "join") {
      const { code, userName } = body;
      const session = await CollabSession.findOne({ code });
      if (!session) return NextResponse.json({ error: "Session not found" }, { status: 404 });
      
      // Check if user is already in session
      const existingParticipant = session.participants.find(p => p.userName === userName);
      if (!existingParticipant) {
        session.participants.push({
          userId: userName,
          userName: userName,
          joinedAt: new Date(),
          isActive: true
        });
        
        // Add welcome message for new user
        session.messages.push({
          _id: new Date().getTime().toString(),
          userName: 'System',
          message: `${userName} joined the shopping party! 👋`,
          timestamp: new Date(),
          type: 'system'
        });
      }
      
      session.lastActivity = new Date();
      await session.save();
      await session.populate("items.product");
      
      return NextResponse.json(session);
    }

    if (action === "addItem") {
      const { code, productId, productData, size, color, notes, userName } = body;
      
      let product = null;
      if (productId && !productData) {
        product = await Product.findById(productId);
        if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });
      }
      
      const session = await CollabSession.findOne({ code });
      if (!session) return NextResponse.json({ error: "Session not found" }, { status: 404 });
      
      const newItem = {
        product: product ? product._id : null,
        productData: productData || product || null,
        size: size || '',
        color: color || '',
        notes: notes || '',
        addedBy: userName,
        addedAt: new Date(),
        votes: []
      };
      
      session.items.push(newItem);
      session.lastActivity = new Date();
      await session.save();
      await session.populate("items.product");
      
      return NextResponse.json(session);
    }

    if (action === "removeItem") {
      const { code, itemId, userName } = body;
      const session = await CollabSession.findOne({ code });
      if (!session) return NextResponse.json({ error: "Session not found" }, { status: 404 });
      
      const item = session.items.id(itemId);
      if (!item) return NextResponse.json({ error: "Item not found" }, { status: 404 });
      if (item.addedBy !== userName) {
        return NextResponse.json({ error: "Unauthorized to remove this item" }, { status: 403 });
      }
      
      session.items.pull(itemId);
      await session.save();
      await session.populate("items.product");
      
      return NextResponse.json(session);
    }

    if (action === "vote") {
      const { code, itemId, userName, value } = body;
      const session = await CollabSession.findOne({ code });
      if (!session) return NextResponse.json({ error: "Session not found" }, { status: 404 });
      const item = session.items.id(itemId);
      if (!item) return NextResponse.json({ error: "Item not found" }, { status: 404 });
      
      // Remove any existing vote by this user, then add new vote
      item.votes = item.votes.filter(v => v.userName !== userName);
      item.votes.push({ userName, value: value === -1 ? -1 : 1, timestamp: new Date() });
      await session.save();
      await session.populate("items.product");
      
      return NextResponse.json(session);
    }

    if (action === "sendMessage") {
      const { code, message, userName } = body;
      const session = await CollabSession.findOne({ code });
      if (!session) return NextResponse.json({ error: "Session not found" }, { status: 404 });
      
      const newMessage = {
        _id: new Date().getTime().toString(),
        userName: userName,
        message,
        timestamp: new Date(),
        type: 'user'
      };
      
      session.messages.push(newMessage);
      session.lastActivity = new Date();
      
      // Keep only last 100 messages
      if (session.messages.length > 100) {
        session.messages = session.messages.slice(-100);
      }
      
      await session.save();
      return NextResponse.json(session);
    }

    if (action === "getSession") {
      const { code } = body;
      const session = await CollabSession.findOne({ code }).populate("items.product");
      if (!session) return NextResponse.json({ error: "Session not found" }, { status: 404 });
      return NextResponse.json(session);
    }

    if (action === "end") {
      const { code } = body;
      const session = await CollabSession.findOneAndUpdate({ code }, { isActive: false }, { new: true });
      if (!session) return NextResponse.json({ error: "Session not found" }, { status: 404 });
      return NextResponse.json(session);
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    console.error("Collab API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(request) {
  await connectToDatabase();
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  if (!code) return NextResponse.json({ error: "code is required" }, { status: 400 });
  const session = await CollabSession.findOne({ code }).populate("items.product");
  if (!session) return NextResponse.json({ error: "Session not found" }, { status: 404 });
  return NextResponse.json(session);
}


