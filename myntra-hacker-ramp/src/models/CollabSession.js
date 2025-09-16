import mongoose, { Schema } from "mongoose";

const VoteSchema = new Schema(
  {
    userName: { type: String, required: true },
    value: { type: Number, enum: [1, -1], required: true },
    timestamp: { type: Date, default: Date.now }
  },
  { _id: false }
);

const MessageSchema = new Schema(
  {
    _id: { type: String, required: true },
    userName: { type: String, required: true },
    message: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    type: { type: String, enum: ['user', 'system', 'reaction'], default: 'user' }
  },
  { _id: false }
);

const ParticipantSchema = new Schema(
  {
    userId: { type: String, required: true },
    userName: { type: String, required: true },
    joinedAt: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true }
  },
  { _id: false }
);

const ItemSchema = new Schema(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product" },
    productData: {
      title: String,
      brand: String,
      price: Number,
      images: [String],
      url: String
    },
    size: { type: String },
    color: { type: String },
    notes: { type: String },
    addedBy: { type: String, required: true },
    votes: { type: [VoteSchema], default: [] },
    addedAt: { type: Date, default: Date.now }
  },
  { _id: true }
);

const CollabSessionSchema = new Schema(
  {
    code: { type: String, required: true, unique: true, index: true },
    name: { type: String },
    hostId: { type: String },
    participants: { type: [ParticipantSchema], default: [] },
    items: { type: [ItemSchema], default: [] },
    messages: { type: [MessageSchema], default: [] },
    status: { type: String, enum: ['active', 'ended'], default: 'active' },
    isActive: { type: Boolean, default: true },
    lastActivity: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

// Update lastActivity on any change
CollabSessionSchema.pre('save', function(next) {
  this.lastActivity = new Date();
  next();
});

export default mongoose.models.CollabSession || mongoose.model("CollabSession", CollabSessionSchema);


