import mongoose, { Schema } from "mongoose";

const UserSchema = new Schema(
  {
    username: { type: String, required: true, unique: true },
    displayName: { type: String },
    name: { type: String },
    age: { type: Number },
    gender: { type: String, enum: ["MALE", "FEMALE", "NON_BINARY", "OTHER"], default: "OTHER" },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    passwordHash: { type: String, required: true },
    avatarUrl: { type: String },
    role: { type: String, enum: ["USER", "ADMIN"], default: "USER" },
    badges: [{ type: mongoose.Schema.Types.ObjectId, ref: 'UserBadge' }],
  },
  { timestamps: true }
);

// Indexes are already created by unique: true, no need to add separately

export default mongoose.models.User || mongoose.model("User", UserSchema);


