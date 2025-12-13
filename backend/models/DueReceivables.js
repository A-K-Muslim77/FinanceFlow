const mongoose = require("mongoose");

const dueTransactionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ["due", "payment"],
      default: "due",
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
    description: {
      type: String,
      default: "",
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    transactionId: {
      type: String,
      default: () => new mongoose.Types.ObjectId().toString(),
    },
  },
  { _id: true }
);

const dueReceivablesSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0.01, "Amount must be greater than 0"],
    },
    date: {
      type: Date,
      required: [true, "Date is required"],
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["Due", "Received", "Partially Paid"],
      default: "Due",
    },
    description: {
      type: String,
      default: "",
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    transactions: [dueTransactionSchema],
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    totalDue: {
      type: Number,
      default: 0,
    },
    totalPaid: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
dueReceivablesSchema.index({ userId: 1, status: 1 });
dueReceivablesSchema.index({ userId: 1, createdAt: -1 });
dueReceivablesSchema.index({ userId: 1, name: 1 });

const DueReceivables = mongoose.model("DueReceivables", dueReceivablesSchema);

module.exports = DueReceivables;
