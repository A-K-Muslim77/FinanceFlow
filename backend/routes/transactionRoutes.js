const express = require("express");
const router = express.Router();
const transactionController = require("../controllers/transactionController");
const { authMiddleware } = require("../middleware/authMiddleware");

// GET /api/transactions - Get all transactions
router.get("/", authMiddleware, transactionController.getAllTransactions);

// GET /api/transactions/:id - Get single transaction
router.get("/:id", authMiddleware, transactionController.getTransactionById);

// POST /api/transactions - Create new transaction
router.post("/", authMiddleware, transactionController.createTransaction);

// PUT /api/transactions/:id - Update transaction
router.put("/:id", authMiddleware, transactionController.updateTransaction);

// DELETE /api/transactions/:id - Delete transaction
router.delete("/:id", authMiddleware, transactionController.deleteTransaction);

// GET /api/transactions/type/:type - Get transactions by type
router.get(
  "/type/:type",
  authMiddleware,
  transactionController.getTransactionsByType
);

// GET /api/transactions/wallet/:walletId - Get transactions by wallet
router.get(
  "/wallet/:walletId",
  authMiddleware,
  transactionController.getTransactionsByWallet
);

// GET /api/transactions/category/:categoryId - Get transactions by category
router.get(
  "/category/:categoryId",
  authMiddleware,
  transactionController.getTransactionsByCategory
);

module.exports = router;
