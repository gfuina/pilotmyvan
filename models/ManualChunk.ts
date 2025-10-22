import mongoose, { Document, Model } from "mongoose";

export interface IManualChunk extends Document {
  equipmentId: mongoose.Types.ObjectId;
  manualTitle: string;
  manualUrl: string;
  chunkIndex: number;
  content: string;
  embedding: number[];
  metadata?: {
    pageNumber?: number;
    section?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const ManualChunkSchema = new mongoose.Schema<IManualChunk>(
  {
    equipmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Equipment",
      required: true,
      index: true,
    },
    manualTitle: {
      type: String,
      required: true,
    },
    manualUrl: {
      type: String,
      required: true,
    },
    chunkIndex: {
      type: Number,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    embedding: {
      type: [Number],
      required: true,
    },
    metadata: {
      pageNumber: Number,
      section: String,
    },
  },
  {
    timestamps: true,
  }
);

// Index for vector search (requires MongoDB Atlas)
ManualChunkSchema.index({ equipmentId: 1, manualUrl: 1 });

const ManualChunk: Model<IManualChunk> =
  mongoose.models?.ManualChunk ||
  mongoose.model<IManualChunk>("ManualChunk", ManualChunkSchema);

export default ManualChunk;

