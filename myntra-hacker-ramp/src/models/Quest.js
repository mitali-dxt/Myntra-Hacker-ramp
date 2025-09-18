import mongoose, { Schema } from "mongoose";

const QuestSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    coverImageUrl: { type: String },
    submissionStartDate: { type: Date, required: true },
    submissionEndDate: { type: Date, required: true },
    votingEndDate: { type: Date, required: true },
    prizeDiscountPercentage: { type: Number, default: 0 },
    prizeBadgeName: { type: String },
    prizeBadgeImageUrl: { type: String },
    status: { 
      type: String, 
      enum: ['upcoming', 'active', 'voting', 'completed'], 
      default: 'upcoming' 
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    winnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    
    // Legacy fields for backward compatibility
    rewardType: { type: String, enum: ["DISCOUNT", "BADGE", "POINTS"] },
    rewardValue: { type: String },
    isActive: { type: Boolean, default: true },
    progress: { type: Number, default: 0 },
  },
  { 
    timestamps: true,
    collection: 'quests' // Explicitly set collection name
  }
);

// Delete the existing model if it exists to avoid conflicts
if (mongoose.models.Quest) {
  delete mongoose.models.Quest;
}

export default mongoose.model("Quest", QuestSchema);


