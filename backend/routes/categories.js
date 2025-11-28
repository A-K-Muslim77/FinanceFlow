const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController");
const { authMiddleware } = require("../middleware/authMiddleware");

// GET /api/categories - Get all categories
router.get("/", authMiddleware, categoryController.getAllCategories);

// GET /api/categories/:id - Get single category
router.get("/:id", authMiddleware, categoryController.getCategoryById);

// POST /api/categories - Create new category
router.post("/", authMiddleware, categoryController.createCategory);

// PUT /api/categories/:id - Update category
router.put("/:id", authMiddleware, categoryController.updateCategory);

// DELETE /api/categories/:id - Delete category
router.delete("/:id", authMiddleware, categoryController.deleteCategory);

module.exports = router;
