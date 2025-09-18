import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(request) {
  await connectToDatabase();
  const body = await request.json();
  const { action } = body;

  if (action === "login") {
    const { email, password } = body;
    if (!email || !password) return NextResponse.json({ error: "email and password required" }, { status: 400 });
    
    // Check for hardcoded admin credentials
    if (email === "admin@myntra.com" && password === "myntra@12345") {
      let adminUser = await User.findOne({ email: "admin@myntra.com" });
      if (!adminUser) {
        // Create admin user if doesn't exist
        const passwordHash = await bcrypt.hash("myntra@12345", 10);
        adminUser = await User.create({
          username: "admin",
          displayName: "Admin",
          name: "Admin User",
          email: "admin@myntra.com",
          passwordHash,
          role: "ADMIN"
        });
      } else {
        // Always ensure admin user has ADMIN role
        await User.updateOne(
          { _id: adminUser._id }, 
          { $set: { role: "ADMIN" } }
        );
        adminUser = await User.findById(adminUser._id);
      }
      
      console.log("Admin user after update:", adminUser.toObject());
      
      const cookieStore = await cookies();
      cookieStore.set("uid", String(adminUser._id), { httpOnly: true, sameSite: "lax", path: "/" });
      
      // Ensure role is included in response
      const userResponse = {
        _id: adminUser._id,
        username: adminUser.username,
        displayName: adminUser.displayName,
        name: adminUser.name,
        email: adminUser.email,
        role: "ADMIN",
        createdAt: adminUser.createdAt,
        updatedAt: adminUser.updatedAt
      };
      
      console.log("Admin login response:", userResponse);
      return NextResponse.json({ ok: true, user: userResponse });
    }
    
    const user = await User.findOne({ email });
    if (!user) return NextResponse.json({ error: "invalid credentials" }, { status: 401 });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return NextResponse.json({ error: "invalid credentials" }, { status: 401 });
    const cookieStore = await cookies();
    cookieStore.set("uid", String(user._id), { httpOnly: true, sameSite: "lax", path: "/" });
    return NextResponse.json({ ok: true, user });
  }

  if (action === "signup") {
    const { username, name, age, gender, email, phone, password } = body;
    if (!username || !email || !password) return NextResponse.json({ error: "username, email, password required" }, { status: 400 });
    const exists = await User.findOne({ $or: [{ email }, { username }] });
    if (exists) return NextResponse.json({ error: "user exists" }, { status: 409 });
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ username, displayName: name || username, name, age, gender, email, phone, passwordHash });
    const cookieStore = await cookies();
    cookieStore.set("uid", String(user._id), { httpOnly: true, sameSite: "lax", path: "/" });
    return NextResponse.json({ ok: true, user }, { status: 201 });
  }

  if (action === "logout") {
    const cookieStore = await cookies();
    cookieStore.delete("uid");
    return NextResponse.json({ ok: true });
  }

  if (action === "me") {
    const cookieStore = await cookies();
    const uid = cookieStore.get("uid")?.value;
    if (!uid) return NextResponse.json({ user: null });
    
    const user = await User.findById(uid);
    if (!user) return NextResponse.json({ user: null });
    
    // Hardcode admin role for admin@myntra.com as workaround
    if (user.email === "admin@myntra.com") {
      const adminResponse = {
        _id: user._id,
        username: user.username,
        displayName: user.displayName,
        name: user.name,
        email: user.email,
        gender: user.gender,
        role: "ADMIN", // Force admin role
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        __v: user.__v
      };
      console.log("Returning hardcoded admin response:", adminResponse);
      return NextResponse.json({ user: adminResponse });
    }
    
    console.log("Current user from me action:", user ? user.toObject() : null);
    return NextResponse.json({ user });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}


