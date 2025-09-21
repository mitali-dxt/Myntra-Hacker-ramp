import mongoose, { Schema } from "mongoose";

const TribeSchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String },
    slug: { type: String, required: true, unique: true, index: true },
    coverImage: { type: String },
    memberCount: { type: Number, default: 0 },
    tags: [{ type: String }],
    // Tribe management
    owner: { type: Schema.Types.ObjectId, ref: "User", index: true },
    members: [{ type: Schema.Types.ObjectId, ref: "User" }],
    products: [{ type: Schema.Types.ObjectId, ref: "Product" }],
    isPublic: { type: Boolean, default: true },
    // AI product recommendations tracking
    aiProductCount: { type: Number, default: 0 },
    lastAISync: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.models.Tribe || mongoose.model("Tribe", TribeSchema);


