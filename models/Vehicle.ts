import mongoose, { Schema, Model } from "mongoose";

export interface IMileageEntry {
  mileage: number;
  date: Date;
  note?: string;
}

export interface IVehicle {
  userId: mongoose.Types.ObjectId;
  name: string;
  make: string;
  model: string;
  year: number;
  vehicleType: "van" | "camping-car" | "fourgon" | "camion aménagé";
  currentMileage: number;
  mileageHistory: IMileageEntry[];
  coverImage?: string;
  gallery: string[];
  vin?: string;
  licensePlate?: string;
  purchaseDate?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const MileageEntrySchema = new Schema({
  mileage: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    required: true,
    default: Date.now,
  },
  note: {
    type: String,
  },
});

const VehicleSchema: Schema<IVehicle> = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, "Le nom du véhicule est requis"],
      trim: true,
    },
    make: {
      type: String,
      required: [true, "La marque est requise"],
      trim: true,
    },
    model: {
      type: String,
      required: [true, "Le modèle est requis"],
      trim: true,
    },
    year: {
      type: Number,
      required: [true, "L'année est requise"],
      min: 1900,
      max: new Date().getFullYear() + 1,
    },
    vehicleType: {
      type: String,
      enum: ["van", "camping-car", "fourgon", "camion aménagé"],
      required: [true, "Le type de véhicule est requis"],
    },
    currentMileage: {
      type: Number,
      required: [true, "Le kilométrage est requis"],
      min: 0,
    },
    mileageHistory: {
      type: [MileageEntrySchema],
      default: [],
    },
    coverImage: {
      type: String,
      default: null,
    },
    gallery: {
      type: [String],
      default: [],
    },
    vin: {
      type: String,
      trim: true,
    },
    licensePlate: {
      type: String,
      trim: true,
    },
    purchaseDate: {
      type: Date,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Add initial mileage to history when creating
VehicleSchema.pre("save", function (next) {
  if (this.isNew && this.currentMileage) {
    this.mileageHistory.push({
      mileage: this.currentMileage,
      date: new Date(),
      note: "Kilométrage initial",
    });
  }
  next();
});

const Vehicle: Model<IVehicle> =
  (mongoose.models?.Vehicle as Model<IVehicle>) ||
  mongoose.model<IVehicle>("Vehicle", VehicleSchema);

export default Vehicle;

