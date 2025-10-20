import mongoose, { Document, Model } from "mongoose";

export interface IMaintenance extends Document {
  equipmentId: mongoose.Types.ObjectId;
  name: string;
  type:
    | "inspection"
    | "cleaning"
    | "replacement"
    | "service"
    | "lubrication"
    | "adjustment"
    | "drain"
    | "test"
    | "calibration"
    | "other";
  priority: "critical" | "important" | "recommended" | "optional";
  difficulty: "easy" | "intermediate" | "advanced" | "professional";

  // Récurrence (au moins 1 requis)
  recurrence: {
    time?: {
      value: number;
      unit: "days" | "week" | "weeks" | "months" | "years";
    };
    kilometers?: number;
  };

  // Conditions spéciales
  conditions?: string[];

  // Détails
  description?: string;
  instructions?: string;
  photos?: string[];
  videos?: string[];

  // Pièces & consommables
  parts?: Array<{
    name: string;
    reference?: string;
    quantity: number;
    estimatedCost?: number;
    purchaseLink?: string;
  }>;

  // Estimations
  estimatedDuration?: number; // en minutes
  estimatedCost?: number;

  // Tags
  tags?: string[];

  // Métadonnées
  isOfficial?: boolean;
  source?: string;

  // Contribution utilisateur
  isUserContributed?: boolean;
  contributedBy?: mongoose.Types.ObjectId;
  status?: "pending" | "approved" | "rejected";

  createdAt: Date;
  updatedAt: Date;
}

const MaintenanceSchema = new mongoose.Schema<IMaintenance>(
  {
    equipmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Equipment",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: [
        "inspection",
        "cleaning",
        "replacement",
        "service",
        "lubrication",
        "adjustment",
        "drain",
        "test",
        "calibration",
        "other",
      ],
      required: true,
    },
    priority: {
      type: String,
      enum: ["critical", "important", "recommended", "optional"],
      default: "recommended",
    },
    difficulty: {
      type: String,
      enum: ["easy", "intermediate", "advanced", "professional"],
      default: "intermediate",
    },
    recurrence: {
      time: {
        value: Number,
        unit: {
          type: String,
          enum: ["days", "week", "weeks", "months", "years"],
        },
      },
      kilometers: Number,
    },
    conditions: [String],
    description: String,
    instructions: String,
    photos: [String],
    videos: [String],
    parts: [
      {
        name: {
          type: String,
          required: true,
        },
        reference: String,
        quantity: {
          type: Number,
          required: true,
        },
        estimatedCost: Number,
        purchaseLink: String,
      },
    ],
    estimatedDuration: Number,
    estimatedCost: Number,
    tags: [String],
    isOfficial: {
      type: Boolean,
      default: true,
    },
    source: String,
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
      default: "approved",
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
MaintenanceSchema.index({ equipmentId: 1 });
MaintenanceSchema.index({ type: 1 });
MaintenanceSchema.index({ priority: 1 });

// Validate at least one recurrence is set
MaintenanceSchema.pre("save", function (next) {
  if (!this.recurrence?.time && !this.recurrence?.kilometers) {
    next(new Error("Au moins une récurrence (temporelle ou kilométrique) est requise"));
  } else {
    next();
  }
});

const Maintenance: Model<IMaintenance> =
  mongoose.models?.Maintenance ||
  mongoose.model<IMaintenance>("Maintenance", MaintenanceSchema);

export default Maintenance;

