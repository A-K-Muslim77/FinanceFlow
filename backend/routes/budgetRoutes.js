// routes/budgetRoutes.js
const express = require("express");
const router = express.Router();
const budgetController = require("../controllers/budgetController");
const { authMiddleware } = require("../middleware/authMiddleware");

// GET /api/budgets/monthly - Get budgets for specific month/year with spent amounts
router.get("/monthly", authMiddleware, budgetController.getMonthlyBudgets);

// GET /api/budgets/months - Get available months with budgets
router.get("/months", authMiddleware, budgetController.getBudgetMonths);

// GET /api/budgets/check - Check if budgets exist for specific month/year
router.get("/check", authMiddleware, budgetController.checkBudgetsExist);

// GET /api/budgets/:id - Get single budget with spent amount
router.get("/:id", authMiddleware, budgetController.getBudgetById);

// POST /api/budgets - Create new budget
router.post("/", authMiddleware, budgetController.createBudget);

// PUT /api/budgets/:id - Update budget
router.put("/:id", authMiddleware, budgetController.updateBudget);

// DELETE /api/budgets/:id - Delete budget
router.delete("/:id", authMiddleware, budgetController.deleteBudget);

module.exports = router;
