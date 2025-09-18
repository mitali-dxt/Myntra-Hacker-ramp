import mongoose, { Schema } from "mongoose";

const SubmissionSchema = new Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    challengeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quest', required: true },
    imageUrl: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    submissionDate: { type: Date, default: Date.now },
    voteCount: { type: Number, default: 0 },
    myntraProducts: [{ type: String }], // Array of product IDs/names tagged
  },
  { timestamps: true }
);

// Compound index to ensure one submission per user per challenge
SubmissionSchema.index({ userId: 1, challengeId: 1 }, { unique: true });

export default mongoose.models.Submission || mongoose.model("Submission", SubmissionSchema);