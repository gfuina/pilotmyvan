import mongoose, { Document, Model } from "mongoose";

export interface ICategory extends Document {
  name: string;
  level: number;
  parentId?: mongoose.Types.ObjectId;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new mongoose.Schema<ICategory>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    level: {
      type: Number,
      required: true,
      min: 1,
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
CategorySchema.index({ parentId: 1, order: 1 });
CategorySchema.index({ level: 1 });

const Category: Model<ICategory> =
  (mongoose.models?.Category as Model<ICategory>) || mongoose.model<ICategory>("Category", CategorySchema);

export default Category;

