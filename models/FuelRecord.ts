import mongoose, { Schema, Document, Model } from "mongoose";

export interface IFuelRecord extends Document {
  userId: mongoose.Types.ObjectId;
  vehicleId: mongoose.Types.ObjectId;
  mileage: number;
  amountPaid: number; // Prix payé en euros
  liters?: number; // Litres (optionnel si l'utilisateur le connaît)
  pricePerLiter?: number; // Prix au litre (calculé ou saisi)
  isFull: boolean; // Si c'est un plein complet ou non
  fuelType?: string; // Type de carburant (si différent du véhicule)
  note?: string;
  recordedAt: Date;
  createdAt: Date;
}

const FuelRecordSchema: Schema<IFuelRecord> = new Schema(
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
    amountPaid: {
      type: Number,
      required: true,
      min: 0,
    },
    liters: {
      type: Number,
      min: 0,
    },
    pricePerLiter: {
      type: Number,
      min: 0,
    },
    isFull: {
      type: Boolean,
      default: true,
    },
    fuelType: {
      type: String,
    },
    note: {
      type: String,
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
FuelRecordSchema.index({ userId: 1, vehicleId: 1, recordedAt: -1 });
FuelRecordSchema.index({ vehicleId: 1, recordedAt: -1 });

const FuelRecord: Model<IFuelRecord> =
  (mongoose.models?.FuelRecord as Model<IFuelRecord>) ||
  mongoose.model<IFuelRecord>("FuelRecord", FuelRecordSchema);

export default FuelRecord;

