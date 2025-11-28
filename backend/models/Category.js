const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
    },
    type: {
      type: String,
      required: [true, "Category type is required"],
      enum: {
        values: ["income", "expense"],
        message: "Category type must be either income or expense",
      },
      default: "expense",
    },
    icon: {
      type: String,
      required: true,
      default: "tag",
    },
    color: {
      type: String,
      required: true,
      default: "#f59e0b",
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null, // null for default categories
    },
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
categorySchema.index({ type: 1, userId: 1 });

const Category = mongoose.model("Category", categorySchema);

module.exports = Category;
