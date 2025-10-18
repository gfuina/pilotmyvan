import mongoose, { Schema, Document, Model } from "mongoose";

export interface IVehicleEquipment extends Document {
  vehicleId: mongoose.Types.ObjectId;
  equipmentId: mongoose.Types.ObjectId;
  installDate?: Date;
  notes?: string;
  isCustom: boolean; // true si équipement créé par l'utilisateur
  // Custom equipment data (if isCustom = true)
  customData?: {
    name: string;
    description?: string;
    brand?: string;
    model?: string;
    photos?: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

const VehicleEquipmentSchema: Schema<IVehicleEquipment> = new Schema(
  {
    vehicleId: {
      type: Schema.Types.ObjectId,
      ref: "Vehicle",
      required: true,
      index: true,
    },
    equipmentId: {
      type: Schema.Types.ObjectId,
      ref: "Equipment",
      required: false, // Not required if custom
    },
    installDate: {
      type: Date,
    },
    notes: {
      type: String,
      trim: true,
    },
    isCustom: {
      type: Boolean,
      default: false,
    },
    customData: {
      name: String,
      description: String,
      brand: String,
      model: String,
      photos: [String],
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for unique vehicle-equipment pairs
VehicleEquipmentSchema.index({ vehicleId: 1, equipmentId: 1 }, { unique: true, sparse: true });

const VehicleEquipment: Model<IVehicleEquipment> =
  (mongoose.models?.VehicleEquipment as Model<IVehicleEquipment>) ||
  mongoose.model<IVehicleEquipment>("VehicleEquipment", VehicleEquipmentSchema);

export default VehicleEquipment;

