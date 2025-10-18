import mongoose, { Schema, Document, Model } from "mongoose";

export interface IVehicleBrand extends Document {
  name: string;
  logo?: string;
  createdAt: Date;
  updatedAt: Date;
}

const VehicleBrandSchema: Schema<IVehicleBrand> = new Schema(
  {
    name: {
      type: String,
      required: [true, "Le nom de la marque est requis"],
      unique: true,
      trim: true,
    },
    logo: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const VehicleBrand: Model<IVehicleBrand> =
  (mongoose.models?.VehicleBrand as Model<IVehicleBrand>) ||
  mongoose.model<IVehicleBrand>("VehicleBrand", VehicleBrandSchema);

export default VehicleBrand;

