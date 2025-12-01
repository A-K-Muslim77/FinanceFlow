const mongoose = require("mongoose");

const walletSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Wallet name is required"],
      trim: true,
    },
    type: {
      type: String,
      required: [true, "Wallet type is required"],
      enum: {
        values: [
          "cash",
          "bank",
          "bkash",
          "nagad",
          "rocket",
          "credit_card",
          "other",
        ],
        message: "Invalid wallet type",
      },
      default: "cash",
    },
    icon: {
      type: String,
      required: true,
      default: "wallet",
    },
    color: {
      type: String,
      required: true,
      default: "#3b82f6",
    },
    balance: {
      type: Number,
      required: true,
      default: 0,
      min: [0, "Balance cannot be negative"],
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
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

// Index for better query performance
walletSchema.index({ type: 1, userId: 1 });
walletSchema.index({ userId: 1, isDefault: 1 });

const Wallet = mongoose.model("Wallet", walletSchema);

module.exports = Wallet;
