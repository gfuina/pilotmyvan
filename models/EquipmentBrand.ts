import mongoose, { Schema, Document, Model } from "mongoose";

export interface IEquipmentBrand extends Document {
  name: string;
  logo?: string;
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
  },
  {
    timestamps: true,
  }
);

const EquipmentBrand: Model<IEquipmentBrand> =
  (mongoose.models?.EquipmentBrand as Model<IEquipmentBrand>) ||
  mongoose.model<IEquipmentBrand>("EquipmentBrand", EquipmentBrandSchema);

export default EquipmentBrand;

