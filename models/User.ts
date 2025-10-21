import mongoose, { Schema, Document, Model } from "mongoose";
import bcrypt from "bcryptjs";

export interface IPushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  userAgent?: string;
  subscribedAt: Date;
}

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  emailVerified?: Date | null;
  image?: string | null;
  isAdmin: boolean;
  notificationPreferences: {
    daysBeforeMaintenance: number[]; // Jours avant l'entretien pour recevoir une notification
  };
  pushSubscriptions: IPushSubscription[]; // Subscriptions pour les notifications push
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema: Schema<IUser> = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      select: false, // Don't return password by default
    },
    emailVerified: {
      type: Date,
      default: null,
    },
    image: {
      type: String,
      default: null,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    notificationPreferences: {
      type: {
        daysBeforeMaintenance: {
          type: [Number],
          default: [1], // Par défaut 1 jour (24h) avant
        },
      },
      default: () => ({ daysBeforeMaintenance: [1] }),
    },
    pushSubscriptions: {
      type: [
        {
          endpoint: { type: String, required: true },
          keys: {
            p256dh: { type: String, required: true },
            auth: { type: String, required: true },
          },
          userAgent: { type: String },
          subscribedAt: { type: Date, default: Date.now },
        },
      ],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Compare password method
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  if (!this.password) {
    return false;
  }
  return bcrypt.compare(candidatePassword, this.password);
};

const User: Model<IUser> =
  (mongoose.models?.User as Model<IUser>) || mongoose.model<IUser>("User", UserSchema);

export default User;

