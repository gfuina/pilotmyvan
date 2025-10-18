import mongoose, { Schema, Document, Model } from "mongoose";

export interface IMaintenanceHistory {
  date: Date;
  mileage?: number;
  cost?: number;
  notes?: string;
  performedBy?: string; // "self" | "garage" | autre
}

export interface IVehicleMaintenanceSchedule extends Document {
  vehicleId: mongoose.Types.ObjectId;
  vehicleEquipmentId: mongoose.Types.ObjectId; // Lien vers VehicleEquipment
  maintenanceId?: mongoose.Types.ObjectId; // Lien vers Maintenance (bibliothèque)
  
  // Custom maintenance data (si pas de maintenanceId)
  isCustom: boolean;
  customData?: {
    name: string;
    type: string;
    priority: string;
    difficulty: string;
    recurrence: {
      time?: { value: number; unit: string };
      kilometers?: number;
    };
    description?: string;
    instructions?: string;
    estimatedDuration?: number;
    estimatedCost?: number;
  };

  // Historique des entretiens effectués (deprecated - use MaintenanceRecord model)
  history: IMaintenanceHistory[];

  // Dernière exécution (synchronisé avec le dernier MaintenanceRecord)
  lastCompletedAt?: Date;
  lastCompletedMileage?: number;

  // Calcul de la prochaine échéance
  nextDueDate?: Date;
  nextDueKilometers?: number;
  
  // État
  status: "pending" | "due_soon" | "overdue" | "completed";
  
  // Notes utilisateur
  notes?: string;

  createdAt: Date;
  updatedAt: Date;

  // Methods
  calculateNextDue(currentMileage: number, maintenanceData: any): this;
}

const MaintenanceHistorySchema = new Schema({
  date: {
    type: Date,
    required: true,
  },
  mileage: Number,
  cost: Number,
  notes: String,
  performedBy: String,
});

const VehicleMaintenanceScheduleSchema: Schema<IVehicleMaintenanceSchedule> = new Schema(
  {
    vehicleId: {
      type: Schema.Types.ObjectId,
      ref: "Vehicle",
      required: true,
      index: true,
    },
    vehicleEquipmentId: {
      type: Schema.Types.ObjectId,
      ref: "VehicleEquipment",
      required: true,
      index: true,
    },
    maintenanceId: {
      type: Schema.Types.ObjectId,
      ref: "Maintenance",
      required: false, // Not required if custom
    },
    isCustom: {
      type: Boolean,
      default: false,
    },
    customData: {
      name: String,
      type: String,
      priority: String,
      difficulty: String,
      recurrence: {
        time: {
          value: Number,
          unit: String,
        },
        kilometers: Number,
      },
      description: String,
      instructions: String,
      estimatedDuration: Number,
      estimatedCost: Number,
    },
    history: {
      type: [MaintenanceHistorySchema],
      default: [],
    },
    lastCompletedAt: {
      type: Date,
    },
    lastCompletedMileage: {
      type: Number,
      min: 0,
    },
    nextDueDate: Date,
    nextDueKilometers: Number,
    status: {
      type: String,
      enum: ["pending", "due_soon", "overdue", "completed"],
      default: "pending",
    },
    notes: String,
  },
  {
    timestamps: true,
  }
);

// Compound index for unique vehicle-equipment-maintenance
VehicleMaintenanceScheduleSchema.index(
  { vehicleId: 1, vehicleEquipmentId: 1, maintenanceId: 1 },
  { unique: true, sparse: true }
);

// Method to calculate next due based on last maintenance
VehicleMaintenanceScheduleSchema.methods.calculateNextDue = function (
  currentMileage: number,
  maintenanceData: any
) {
  const lastHistory = this.history[this.history.length - 1];
  
  if (!lastHistory) {
    // No history yet, use current date/mileage
    if (maintenanceData.recurrence?.time) {
      const { value, unit } = maintenanceData.recurrence.time;
      const date = new Date();
      
      if (unit === "days") {
        date.setDate(date.getDate() + value);
      } else if (unit === "months") {
        date.setMonth(date.getMonth() + value);
      } else if (unit === "years") {
        date.setFullYear(date.getFullYear() + value);
      }
      
      this.nextDueDate = date;
    }
    
    if (maintenanceData.recurrence?.kilometers) {
      this.nextDueKilometers = currentMileage + maintenanceData.recurrence.kilometers;
    }
  } else {
    // Calculate from last maintenance
    if (maintenanceData.recurrence?.time) {
      const { value, unit } = maintenanceData.recurrence.time;
      const date = new Date(lastHistory.date);
      
      if (unit === "days") {
        date.setDate(date.getDate() + value);
      } else if (unit === "months") {
        date.setMonth(date.getMonth() + value);
      } else if (unit === "years") {
        date.setFullYear(date.getFullYear() + value);
      }
      
      this.nextDueDate = date;
    }
    
    if (maintenanceData.recurrence?.kilometers && lastHistory.mileage) {
      this.nextDueKilometers = lastHistory.mileage + maintenanceData.recurrence.kilometers;
    }
  }
  
  return this;
};

const VehicleMaintenanceSchedule: Model<IVehicleMaintenanceSchedule> =
  (mongoose.models?.VehicleMaintenanceSchedule as Model<IVehicleMaintenanceSchedule>) ||
  mongoose.model<IVehicleMaintenanceSchedule>(
    "VehicleMaintenanceSchedule",
    VehicleMaintenanceScheduleSchema
  );

export default VehicleMaintenanceSchedule;

