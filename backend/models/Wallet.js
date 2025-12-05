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
    description: {
      type: String,
      default: "",
      trim: true,
    },
    // REMOVED: balance field since it will be monthly specific
    // REMOVED: isDefault field since wallets are month-specific

    // ADDED: Month and year when wallet was created/active
    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },
    year: {
      type: Number,
      required: true,
      min: 2000,
      max: 2100,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ADDED: Opening balance for this month (always 0 initially)
    openingBalance: {
      type: Number,
      default: 0,
      required: true,
    },

    // ADDED: Will be calculated based on transactions
    closingBalance: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index for better query performance - now includes month/year
walletSchema.index({ userId: 1, month: 1, year: 1 });
walletSchema.index({ userId: 1, name: 1, month: 1, year: 1 }, { unique: true });

const Wallet = mongoose.model("Wallet", walletSchema);

module.exports = Wallet;
