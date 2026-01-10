import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  category: string;
  price: number;
  stock: number;
  totalSales: number;
  revenue: number;
  rating: number;
  lastSold?: Date;
}

const ProductSchema = new Schema<IProduct>({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  category: {
    type: String,
    required: true,
    index: true,
  },
  price: {
    type: Number,
    required: true,
  },
  stock: {
    type: Number,
    required: true,
  },
  totalSales: {
    type: Number,
    default: 0,
  },
  revenue: {
    type: Number,
    default: 0,
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 4.0,
  },
  lastSold: {
    type: Date,
  },
});

// Indexes for sorting by sales and revenue
ProductSchema.index({ totalSales: -1 });
ProductSchema.index({ revenue: -1 });

export default mongoose.model<IProduct>('Product', ProductSchema);
