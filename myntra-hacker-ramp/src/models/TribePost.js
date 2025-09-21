import mongoose, { Schema } from "mongoose";

const TribePostSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    tribe: { type: Schema.Types.ObjectId, ref: "Tribe", required: true, index: true },
    postType: { 
      type: String, 
      enum: ["image", "text", "discussion"], 
      required: true 
    },
    content: { type: String, required: true }, // Caption for images, full text for discussions
    imageUrl: { type: String }, // For image posts
    taggedProducts: [{
      product: { type: Schema.Types.ObjectId, ref: "Product" },
      x: { type: Number }, // X coordinate for product tag positioning
      y: { type: Number }  // Y coordinate for product tag positioning
    }],
    likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
    likesCount: { type: Number, default: 0 },
    commentsCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false }, // For weekly challenges winners
  },
  { timestamps: true }
);

// Indexes for performance
TribePostSchema.index({ tribe: 1, createdAt: -1 });
TribePostSchema.index({ user: 1, createdAt: -1 });
TribePostSchema.index({ likesCount: -1, createdAt: -1 });

export default mongoose.models.TribePost || mongoose.model("TribePost", TribePostSchema);