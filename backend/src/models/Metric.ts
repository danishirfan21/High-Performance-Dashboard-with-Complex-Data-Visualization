import mongoose, { Schema, Document } from 'mongoose';

export interface IMetric extends Document {
  type: 'revenue' | 'users' | 'conversion' | 'growth';
  value: number;
  previousValue?: number;
  change?: number;
  changePercent?: number;
  timestamp: Date;
  metadata?: Record<string, any>;
}

const MetricSchema = new Schema<IMetric>({
  type: {
    type: String,
    required: true,
    enum: ['revenue', 'users', 'conversion', 'growth'],
    index: true,
  },
  value: {
    type: Number,
    required: true,
  },
  previousValue: {
    type: Number,
  },
  change: {
    type: Number,
  },
  changePercent: {
    type: Number,
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true,
  },
  metadata: {
    type: Schema.Types.Mixed,
  },
});

// Compound index for efficient queries by type and timestamp
MetricSchema.index({ type: 1, timestamp: -1 });

export default mongoose.model<IMetric>('Metric', MetricSchema);
