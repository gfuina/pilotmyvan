import mongoose, { Schema, Document, Model } from "mongoose";

export interface INotificationHistory extends Document {
  userId: mongoose.Types.ObjectId;
  maintenanceScheduleId: mongoose.Types.ObjectId;
  vehicleId: mongoose.Types.ObjectId;
  notificationDate: Date;
  daysBefore: number;
  emailSent: boolean;
  emailSentAt?: Date;
  error?: string;
  createdAt: Date;
}

const NotificationHistorySchema: Schema<INotificationHistory> = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    maintenanceScheduleId: {
      type: Schema.Types.ObjectId,
      ref: "VehicleMaintenanceSchedule",
      required: true,
      index: true,
    },
    vehicleId: {
      type: Schema.Types.ObjectId,
      ref: "Vehicle",
      required: true,
    },
    notificationDate: {
      type: Date,
      required: true,
      index: true,
    },
    daysBefore: {
      type: Number,
      required: true,
    },
    emailSent: {
      type: Boolean,
      default: false,
    },
    emailSentAt: {
      type: Date,
    },
    error: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Index composé pour éviter les doublons
NotificationHistorySchema.index(
  { userId: 1, maintenanceScheduleId: 1, notificationDate: 1, daysBefore: 1 },
  { unique: true }
);

const NotificationHistory: Model<INotificationHistory> =
  (mongoose.models?.NotificationHistory as Model<INotificationHistory>) ||
  mongoose.model<INotificationHistory>("NotificationHistory", NotificationHistorySchema);

export default NotificationHistory;

