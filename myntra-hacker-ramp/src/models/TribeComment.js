import mongoose, { Schema } from "mongoose";

const TribeCommentSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    post: { type: Schema.Types.ObjectId, ref: "TribePost", required: true, index: true },
    content: { type: String, required: true, maxlength: 500 },
    likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
    likesCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Indexes for performance
TribeCommentSchema.index({ post: 1, createdAt: 1 });
TribeCommentSchema.index({ user: 1, createdAt: -1 });

export default mongoose.models.TribeComment || mongoose.model("TribeComment", TribeCommentSchema);