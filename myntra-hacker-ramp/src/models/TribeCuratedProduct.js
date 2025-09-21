import mongoose, { Schema } from "mongoose";

const TribeCuratedProductSchema = new Schema(
  {
    tribe: { type: Schema.Types.ObjectId, ref: "Tribe", required: true, index: true },
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true, index: true },
    curatedBy: { type: Schema.Types.ObjectId, ref: "User", required: true }, // Admin who curated
    reason: { type: String }, // Why this product fits the tribe
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 }, // For sorting curated products
  },
  { timestamps: true }
);

// Compound index to prevent duplicates
TribeCuratedProductSchema.index({ tribe: 1, product: 1 }, { unique: true });
TribeCuratedProductSchema.index({ tribe: 1, order: 1, createdAt: -1 });

export default mongoose.models.TribeCuratedProduct || mongoose.model("TribeCuratedProduct", TribeCuratedProductSchema);