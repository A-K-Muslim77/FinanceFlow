// models/Budget.js
const mongoose = require("mongoose");

const budgetSchema = new mongoose.Schema(
  {
    category_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
    },
    monthly_limit: {
      type: Number,
      required: [true, "Monthly limit is required"],
      min: [0, "Monthly limit must be greater than or equal to 0"],
    },
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
  },
  {
    timestamps: true,
  }
);

// Ensure unique budget per category per month per year per user
budgetSchema.index(
  { category_id: 1, month: 1, year: 1, userId: 1 },
  { unique: true }
);

// Index for better query performance
budgetSchema.index({ userId: 1, month: 1, year: 1 });

const Budget = mongoose.model("Budget", budgetSchema);

module.exports = Budget;
