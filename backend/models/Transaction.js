const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: [true, "Transaction type is required"],
      enum: {
        values: ["income", "expense", "transfer"],
        message: "Transaction type must be income, expense, or transfer",
      },
      default: "expense",
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0.01, "Amount must be greater than 0"],
    },
    wallet_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Wallet",
      required: true,
    },
    category_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: function () {
        return this.type !== "transfer"; // Not required for transfers
      },
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
    attachment: {
      type: String,
      default: "",
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
transactionSchema.index({ type: 1, userId: 1 });
transactionSchema.index({ wallet_id: 1 });
transactionSchema.index({ category_id: 1 });
transactionSchema.index({ date: -1, userId: 1 });

const Transaction = mongoose.model("Transaction", transactionSchema);

module.exports = Transaction;
