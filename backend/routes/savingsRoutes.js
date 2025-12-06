const express = require("express");
const router = express.Router();
const savingsController = require("../controllers/savingsController");
const { authMiddleware } = require("../middleware/authMiddleware");

// GET /api/savings - Get all savings goals
router.get("/", authMiddleware, savingsController.getAllSavings);

// GET /api/savings/:id - Get single savings goal
router.get("/:id", authMiddleware, savingsController.getSavingsById);

// POST /api/savings - Create new savings goal
router.post("/", authMiddleware, savingsController.createSavings);

// PUT /api/savings/:id - Update savings goal
router.put("/:id", authMiddleware, savingsController.updateSavings);

// DELETE /api/savings/:id - Delete savings goal
router.delete("/:id", authMiddleware, savingsController.deleteSavings);

// POST /api/savings/:id/transactions - Add deposit/withdrawal
router.post(
  "/:id/transactions",
  authMiddleware,
  savingsController.addTransaction
);

// GET /api/savings/:id/transactions - Get all transactions for a goal
router.get(
  "/:id/transactions",
  authMiddleware,
  savingsController.getTransactions
);

// GET /api/savings/status/:status - Get savings goals by status
router.get(
  "/status/:status",
  authMiddleware,
  savingsController.getSavingsByStatus
);

module.exports = router;
