import mongoose, { Schema, Document, Model } from "mongoose";

export interface IMileageHistory extends Document {
  userId: mongoose.Types.ObjectId;
  vehicleId: mongoose.Types.ObjectId;
  mileage: number;
  recordedAt: Date;
  createdAt: Date;
}

const MileageHistorySchema: Schema<IMileageHistory> = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    vehicleId: {
      type: Schema.Types.ObjectId,
      ref: "Vehicle",
      required: true,
      index: true,
    },
    mileage: {
      type: Number,
      required: true,
      min: 0,
    },
    recordedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index composés pour requêtes optimisées
MileageHistorySchema.index({ userId: 1, vehicleId: 1, recordedAt: -1 });
MileageHistorySchema.index({ vehicleId: 1, recordedAt: -1 });

const MileageHistory: Model<IMileageHistory> =
  (mongoose.models?.MileageHistory as Model<IMileageHistory>) ||
  mongoose.model<IMileageHistory>("MileageHistory", MileageHistorySchema);

export default MileageHistory;

