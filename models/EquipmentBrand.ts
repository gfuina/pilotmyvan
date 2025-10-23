import mongoose, { Schema, Document, Model } from "mongoose";

export interface IEquipmentBrand extends Document {
  name: string;
  logo?: string;
  status?: "approved" | "pending" | "rejected";
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const EquipmentBrandSchema: Schema<IEquipmentBrand> = new Schema(
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
    status: {
      type: String,
      enum: ["approved", "pending", "rejected"],
      default: "approved",
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const EquipmentBrand: Model<IEquipmentBrand> =
  (mongoose.models?.EquipmentBrand as Model<IEquipmentBrand>) ||
  mongoose.model<IEquipmentBrand>("EquipmentBrand", EquipmentBrandSchema);

export default EquipmentBrand;

