const Category = require("../models/Category");
const mongoose = require("mongoose");

// Get all categories for the logged-in user
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find({
      $or: [
        { userId: req.user._id }, // User's custom categories
        { userId: null }, // Default categories
      ],
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories,
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

// Get single category by ID - only if user owns it or it's default
exports.getCategoryById = async (req, res) => {
  try {
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid category ID",
      });
    }

    const category = await Category.findOne({
      _id: req.params.id,
      $or: [
        { userId: req.user._id }, // User's custom category
        { userId: null }, // Default category
      ],
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        error: "Category not found",
      });
    }

    res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error) {
    console.error("Error fetching category:", error);
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

// Create new category for the logged-in user
exports.createCategory = async (req, res) => {
  try {
    const { name, type, icon, color } = req.body;

    // Validate required fields
    if (!name || !type) {
      return res.status(400).json({
        success: false,
        error: "Name and type are required",
      });
    }

    // Check if category with same name already exists for this user
    const existingCategory = await Category.findOne({
      name: name.trim(),
      $or: [{ userId: req.user._id }, { userId: null }],
    });

    if (existingCategory) {
      return res.status(400).json({
        success: false,
        error: "Category with this name already exists",
      });
    }

    const category = await Category.create({
      name: name.trim(),
      type,
      icon: icon || "tag",
      color: color || "#f59e0b",
      isDefault: false,
      userId: req.user._id, // Assign to logged-in user
    });

    res.status(201).json({
      success: true,
      data: category,
    });
  } catch (error) {
    console.error("Error creating category:", error);

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        error: messages.join(", "),
      });
    }

    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

// Update category - only if user owns it
exports.updateCategory = async (req, res) => {
  try {
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid category ID",
      });
    }

    let category = await Category.findOne({
      _id: req.params.id,
      userId: req.user._id, // Only user's own categories can be updated
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        error: "Category not found or you don't have permission to update it",
      });
    }

    // Prevent updating default categories (though they shouldn't have userId anyway)
    if (category.isDefault) {
      return res.status(400).json({
        success: false,
        error: "Cannot update default categories",
      });
    }

    const { name, type, icon, color } = req.body;

    // Check if new name conflicts with existing categories
    if (name && name.trim() !== category.name) {
      const existingCategory = await Category.findOne({
        name: name.trim(),
        $or: [{ userId: req.user._id }, { userId: null }],
        _id: { $ne: req.params.id }, // Exclude current category
      });

      if (existingCategory) {
        return res.status(400).json({
          success: false,
          error: "Category with this name already exists",
        });
      }
    }

    // Build update object
    const updateFields = {};
    if (name) updateFields.name = name.trim();
    if (type) updateFields.type = type;
    if (icon) updateFields.icon = icon;
    if (color) updateFields.color = color;

    category = await Category.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error) {
    console.error("Error updating category:", error);

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        error: messages.join(", "),
      });
    }

    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

// Delete category - only if user owns it
exports.deleteCategory = async (req, res) => {
  try {
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid category ID",
      });
    }

    const category = await Category.findOne({
      _id: req.params.id,
      userId: req.user._id, // Only user's own categories can be deleted
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        error: "Category not found or you don't have permission to delete it",
      });
    }

    // Prevent deleting default categories (though they shouldn't have userId anyway)
    if (category.isDefault) {
      return res.status(400).json({
        success: false,
        error: "Cannot delete default categories",
      });
    }

    await Category.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      data: {},
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

// Get categories by type for the logged-in user
exports.getCategoriesByType = async (req, res) => {
  try {
    const { type } = req.params;

    if (!["income", "expense"].includes(type)) {
      return res.status(400).json({
        success: false,
        error: "Type must be either 'income' or 'expense'",
      });
    }

    const categories = await Category.find({
      type,
      $or: [{ userId: req.user._id }, { userId: null }],
    }).sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories,
    });
  } catch (error) {
    console.error("Error fetching categories by type:", error);
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};
