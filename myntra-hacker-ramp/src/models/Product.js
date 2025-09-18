import mongoose, { Schema } from "mongoose";

const ProductSchema = new Schema(
  {
    title: { type: String, required: true },
    brand: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    mrp: { type: Number },
    discountPercent: { type: Number, default: 0 },
    category: { type: String, index: true },
    gender: { type: String, enum: ["MEN", "WOMEN", "UNISEX"], index: true },
    sizes: [{ type: String }],
    colors: [{ type: String }],
    images: [{ type: String, required: true }],
    inStock: { type: Boolean, default: true },
    rating: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    tags: [{ type: String, index: true }],
  },
  { timestamps: true }
);

// Text index for search across key fields
ProductSchema.index({ title: "text", brand: "text", tags: "text", category: "text" });

export default mongoose.models.Product || mongoose.model("Product", ProductSchema);


