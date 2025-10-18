import mongoose, { Schema, Document, Model } from "mongoose";

export interface IMaintenanceRecord extends Document {
  vehicleMaintenanceScheduleId: mongoose.Types.ObjectId;
  vehicleId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  completedAt: Date;
  mileageAtCompletion?: number;
  notes?: string;
  attachments: Array<{
    url: string;
    filename: string;
    contentType: string;
    size: number;
    uploadedAt: Date;
  }>;
  cost?: number;
  location?: string; // Où l'entretien a été effectué (garage, domicile, etc.)
  createdAt: Date;
  updatedAt: Date;
}

const MaintenanceRecordSchema: Schema<IMaintenanceRecord> = new Schema(
  {
    vehicleMaintenanceScheduleId: {
      type: Schema.Types.ObjectId,
      ref: "VehicleMaintenanceSchedule",
      required: true,
      index: true,
    },
    vehicleId: {
      type: Schema.Types.ObjectId,
      ref: "Vehicle",
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    completedAt: {
      type: Date,
      required: true,
      index: true,
    },
    mileageAtCompletion: {
      type: Number,
      min: 0,
    },
    notes: {
      type: String,
    },
    attachments: [
      {
        url: {
          type: String,
          required: true,
        },
        filename: {
          type: String,
          required: true,
        },
        contentType: {
          type: String,
          required: true,
        },
        size: {
          type: Number,
          required: true,
        },
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    cost: {
      type: Number,
      min: 0,
    },
    location: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Index composés pour requêtes optimisées
MaintenanceRecordSchema.index({
  vehicleMaintenanceScheduleId: 1,
  completedAt: -1,
});
MaintenanceRecordSchema.index({ vehicleId: 1, completedAt: -1 });
MaintenanceRecordSchema.index({ userId: 1, completedAt: -1 });

const MaintenanceRecord: Model<IMaintenanceRecord> =
  (mongoose.models?.MaintenanceRecord as Model<IMaintenanceRecord>) ||
  mongoose.model<IMaintenanceRecord>(
    "MaintenanceRecord",
    MaintenanceRecordSchema
  );

export default MaintenanceRecord;

