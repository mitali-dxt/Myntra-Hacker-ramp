import mongoose, { Schema } from "mongoose";

const UserBadgeSchema = new Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    badgeName: { type: String, required: true },
    badgeImageUrl: { type: String },
    challengeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quest', required: true },
    earnedDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Compound index to ensure one badge per user per challenge
UserBadgeSchema.index({ userId: 1, challengeId: 1 }, { unique: true });

export default mongoose.models.UserBadge || mongoose.model("UserBadge", UserBadgeSchema);