const mongoose = require("mongoose");

const dueReceivableSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: [true, "Type is required"],
      enum: ["due", "receivable"],
      default: "due",
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0.01, "Amount must be greater than 0"],
    },
    person: {
      type: String,
      required: [true, "Person/Entity name is required"],
      trim: true,
      maxlength: [200, "Name cannot exceed 200 characters"],
    },
    due_date: {
      type: Date,
      required: [true, "Due date is required"],
    },
    status: {
      type: String,
      enum: ["pending", "paid"],
      default: "pending",
    },
    notes: {
      type: String,
      default: "",
      trim: true,
      maxlength: [500, "Notes cannot exceed 500 characters"],
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
dueReceivableSchema.index({ userId: 1, status: 1 });
dueReceivableSchema.index({ userId: 1, due_date: 1 });
dueReceivableSchema.index({ userId: 1, type: 1 });

const DueReceivable = mongoose.model("DueReceivable", dueReceivableSchema);

module.exports = DueReceivable;
