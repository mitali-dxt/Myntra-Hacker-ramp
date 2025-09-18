import mongoose, { Schema } from "mongoose";

const VoteSchema = new Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    submissionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Submission', required: true },
    challengeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quest', required: true },
  },
  { timestamps: true }
);

// Compound index to ensure one vote per user per submission
VoteSchema.index({ userId: 1, submissionId: 1 }, { unique: true });

export default mongoose.models.Vote || mongoose.model("Vote", VoteSchema);