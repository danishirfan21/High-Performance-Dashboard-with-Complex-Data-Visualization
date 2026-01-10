import mongoose, { Schema, Document } from 'mongoose';

export interface ISale extends Document {
  productId: string;
  productName: string;
  category: string;
  amount: number;
  quantity: number;
  userId: string;
  status: 'completed' | 'pending' | 'refunded';
  timestamp: Date;
  metadata?: {
    region?: string;
    channel?: string;
  };
}

const SaleSchema = new Schema<ISale>({
  productId: {
    type: String,
    required: true,
    index: true,
  },
  productName: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
    index: true,
    enum: ['Electronics', 'Clothing', 'Food', 'Books', 'Home', 'Sports'],
  },
  amount: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['completed', 'pending', 'refunded'],
    default: 'completed',
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true,
  },
  metadata: {
    region: String,
    channel: String,
  },
});

// Compound indexes for aggregation pipelines
SaleSchema.index({ category: 1, timestamp: -1 });
SaleSchema.index({ timestamp: -1, status: 1 });

export default mongoose.model<ISale>('Sale', SaleSchema);
