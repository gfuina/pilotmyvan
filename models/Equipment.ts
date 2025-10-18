import mongoose, { Document, Model } from "mongoose";

export interface IEquipment extends Document {
  name: string;
  description?: string;
  categoryId: mongoose.Types.ObjectId;
  vehicleBrands: mongoose.Types.ObjectId[];
  equipmentBrands: mongoose.Types.ObjectId[];
  photos: string[];
  manuals: Array<{
    title: string;
    url: string;
    isExternal: boolean; // true if URL, false if Blob
  }>;
  notes?: string;
  
  // User contribution fields
  isUserContributed: boolean;
  contributedBy?: mongoose.Types.ObjectId; // User who created it
  status: "pending" | "approved" | "rejected";
  approvedBy?: mongoose.Types.ObjectId; // Admin who approved/rejected
  approvedAt?: Date;
  rejectionReason?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

const EquipmentSchema = new mongoose.Schema<IEquipment>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    vehicleBrands: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "VehicleBrand",
      },
    ],
    equipmentBrands: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "EquipmentBrand",
      },
    ],
    photos: [
      {
        type: String,
      },
    ],
    manuals: [
      {
        title: {
          type: String,
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
        isExternal: {
          type: Boolean,
          default: false,
        },
      },
    ],
    notes: {
      type: String,
    },
    isUserContributed: {
      type: Boolean,
      default: false,
    },
    contributedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "approved", // Admin-created are auto-approved
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    approvedAt: {
      type: Date,
    },
    rejectionReason: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
EquipmentSchema.index({ categoryId: 1 });
EquipmentSchema.index({ vehicleBrands: 1 });
EquipmentSchema.index({ equipmentBrands: 1 });
EquipmentSchema.index({ status: 1 });
EquipmentSchema.index({ isUserContributed: 1, status: 1 });

const Equipment: Model<IEquipment> =
  mongoose.models?.Equipment ||
  mongoose.model<IEquipment>("Equipment", EquipmentSchema);

export default Equipment;

