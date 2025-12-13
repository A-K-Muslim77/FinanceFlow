const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ["deposit", "withdrawal"],
      default: "deposit",
    },
    amount: {
      type: Number,
      required: true,
      min: [0.01, "Amount must be greater than 0"],
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    notes: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { _id: true }
);

const savingsSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Goal name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    targetAmount: {
      type: Number,
      required: [true, "Target amount is required"],
      min: [0.01, "Target amount must be greater than 0"],
    },
    currentBalance: {
      type: Number,
      default: 0,
      min: [0, "Balance cannot be negative"],
    },
    monthlyTarget: {
      type: Number,
      default: null,
      min: [0, "Monthly target must be positive"],
    },
    description: {
      type: String,
      default: "",
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    icon: {
      type: String,
      default: "piggy-bank",
      enum: [
        "piggy-bank",
        "wallet",
        "dollar-sign",
        "trending-up",
        "house",
        "car",
        "plane",
        "graduation-cap",
        "gift",
        "heart",
        "briefcase",
        "smartphone",
        "gamepad",
        "shirt",
        "coffee",
        "tag",
      ],
    },
    color: {
      type: String,
      default: "#3b82f6",
      match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid color hex code"],
    },
    status: {
      type: String,
      enum: ["active", "completed", "archived"],
      default: "active",
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    transactions: [transactionSchema],
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Savings = mongoose.model("Savings", savingsSchema);

module.exports = Savings;
