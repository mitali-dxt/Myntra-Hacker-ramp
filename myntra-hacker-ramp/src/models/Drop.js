import mongoose, { Schema } from "mongoose";

const ProductSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  price: { type: Number, required: true, min: 0 },
  original_price: { type: Number, default: 0, min: 0 },
  image_url: { type: String, default: '' },
  category: { type: String, default: '' },
  sizes: [{ type: String }],
  colors: [{ type: String }],
  stock_quantity: { type: Number, required: true, min: 0 },
  sold_quantity: { type: Number, default: 0, min: 0 },
  is_exclusive: { type: Boolean, default: false },
  limited_quantity: { type: Boolean, default: false },
  rating: { type: Number, default: 0, min: 0, max: 5 }
});

const DropSchema = new Schema(
  {
    // Creator-Led Drop Fields
    title: { type: String, required: true },
    description: { type: String, required: true },
    creator_id: { type: Schema.Types.ObjectId, ref: "Creator", required: true },
    creator_name: { type: String, required: true },
    creator_image: { type: String, default: '' },
    
    // Scheduling
    launch_datetime: { type: Date, required: true },
    status: { 
      type: String, 
      enum: ['draft', 'scheduled', 'upcoming', 'live', 'completed', 'cancelled'],
      default: 'draft'
    },
    
    // Products and Pricing
    products: [ProductSchema],
    price_range: {
      min: { type: Number, default: 0 },
      max: { type: Number, default: 0 }
    },
    total_items: { type: Number, default: 0 },
    total_stock: { type: Number, default: 0 },
    sold_count: { type: Number, default: 0 },
    
    // Marketing and Engagement
    tags: [{ type: String, lowercase: true }],
    collection_image: { type: String, default: '' },
    is_featured: { type: Boolean, default: false },
    views: { type: Number, default: 0 },
    engagement_rate: { type: Number, default: 0 },
    notification_count: { type: Number, default: 0 },
    
    // Business
    commission_rate: { type: Number, default: 15, min: 0, max: 50 },
    total_sales: { type: Number, default: 0 },
    revenue_share: { type: Number, default: 0 },
    
    // Social Proof
    rating: { type: Number, default: 0, min: 0, max: 5 },
    review_count: { type: Number, default: 0 },
    
    // Analytics
    click_through_rate: { type: Number, default: 0 },
    conversion_rate: { type: Number, default: 0 },
    average_order_value: { type: Number, default: 0 },
    
    // Legacy Fields (for backward compatibility)
    creatorName: { type: String },
    collectionName: { type: String },
    imageUrl: { type: String },
    startsAt: { type: Date },
    endsAt: { type: Date },
    // Personal capsule support
    owner: { type: Schema.Types.ObjectId, ref: "User", index: true },
    code: { type: String, index: true, unique: false },
    isPersonal: { type: Boolean, default: false },
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes for efficient queries
DropSchema.index({ creator_id: 1, status: 1 });
DropSchema.index({ status: 1, launch_datetime: 1 });
DropSchema.index({ is_featured: 1, status: 1 });
DropSchema.index({ tags: 1 });
DropSchema.index({ owner: 1, isPersonal: 1 }); // Legacy personal capsules

// Virtual for calculating sell-out percentage
DropSchema.virtual('sellout_percentage').get(function() {
  if (this.total_stock === 0) return 0;
  return Math.round((this.sold_count / this.total_stock) * 100);
});

// Virtual for checking if drop is sold out
DropSchema.virtual('is_sold_out').get(function() {
  return this.sold_count >= this.total_stock;
});

// Virtual for time until launch (in milliseconds)
DropSchema.virtual('time_until_launch').get(function() {
  if (this.status === 'live' || this.status === 'completed') return 0;
  return Math.max(0, new Date(this.launch_datetime).getTime() - Date.now());
});

// Virtual for days since launch
DropSchema.virtual('days_since_launch').get(function() {
  if (this.status === 'upcoming' || this.status === 'draft') return 0;
  return Math.floor((Date.now() - new Date(this.launch_datetime).getTime()) / (1000 * 60 * 60 * 24));
});

// Method to update status based on current time
DropSchema.methods.updateStatus = function() {
  const now = new Date();
  const launchTime = new Date(this.launch_datetime);
  
  if (this.status === 'scheduled' && now >= launchTime) {
    this.status = 'live';
  }
  
  if (this.status === 'live' && this.is_sold_out) {
    this.status = 'completed';
  }
  
  return this.save();
};

// Method to increment view count
DropSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

// Method to calculate engagement rate
DropSchema.methods.calculateEngagementRate = function() {
  if (this.views === 0) return 0;
  
  // Engagement factors: clicks, notifications, sales
  const engagementScore = (this.notification_count * 0.1) + 
                         (this.sold_count * 2) + 
                         (this.review_count * 1.5);
  
  this.engagement_rate = Math.round((engagementScore / this.views) * 100 * 100) / 100;
  return this.engagement_rate;
};

// Static method to get featured drops
DropSchema.statics.getFeatured = function() {
  return this.find({ 
    is_featured: true, 
    status: { $in: ['live', 'upcoming'] } 
  }).sort({ launch_datetime: -1 });
};

// Static method to get live drops
DropSchema.statics.getLive = function() {
  return this.find({ status: 'live' }).sort({ launch_datetime: -1 });
};

// Static method to get upcoming drops
DropSchema.statics.getUpcoming = function() {
  return this.find({ status: 'upcoming' }).sort({ launch_datetime: 1 });
};

// Pre-save middleware to update calculated fields
DropSchema.pre('save', function(next) {
  // Update legacy fields for backward compatibility
  if (this.title && !this.collectionName) {
    this.collectionName = this.title;
  }
  if (this.creator_name && !this.creatorName) {
    this.creatorName = this.creator_name;
  }
  if (this.collection_image && !this.imageUrl) {
    this.imageUrl = this.collection_image;
  }
  if (this.launch_datetime && !this.startsAt) {
    this.startsAt = this.launch_datetime;
  }
  
  // Calculate totals from products
  if (this.products && this.products.length > 0) {
    this.total_items = this.products.length;
    this.total_stock = this.products.reduce((sum, product) => sum + (product.stock_quantity || 0), 0);
    this.sold_count = this.products.reduce((sum, product) => sum + (product.sold_quantity || 0), 0);
    
    const prices = this.products.map(p => p.price || 0);
    this.price_range = {
      min: Math.min(...prices),
      max: Math.max(...prices)
    };
  }
  
  // Auto-update status based on time
  const now = new Date();
  const launchTime = new Date(this.launch_datetime);
  
  if (this.status === 'scheduled' && now >= launchTime) {
    this.status = 'live';
  }
  
  if (this.status === 'live' && this.sold_count >= this.total_stock) {
    this.status = 'completed';
  }
  
  next();
});

export default mongoose.models.Drop || mongoose.model("Drop", DropSchema);


