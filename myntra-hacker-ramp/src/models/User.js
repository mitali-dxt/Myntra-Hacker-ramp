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

// Add indexes separately to avoid duplicates
UserSchema.index({ username: 1 });
UserSchema.index({ email: 1 });

export default mongoose.models.User || mongoose.model("User", UserSchema);


