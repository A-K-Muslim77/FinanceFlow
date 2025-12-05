const express = require("express");
const router = express.Router();
const walletController = require("../controllers/walletController");
const { authMiddleware } = require("../middleware/authMiddleware");

// GET /api/wallets/monthly - Get wallets for specific month
router.get("/monthly", authMiddleware, walletController.getMonthlyWallets);

// GET /api/wallets/months - Get available months with wallets
router.get("/months", authMiddleware, walletController.getWalletMonths);

// GET /api/wallets/:walletId/transactions - Get transactions for specific wallet in specific month (NEW)
router.get(
  "/:walletId/transactions",
  authMiddleware,
  walletController.getWalletTransactions
);

// POST /api/wallets/copy - Copy wallets from previous month
router.post("/copy", authMiddleware, walletController.copyFromPreviousMonth);

// GET /api/wallets/:id - Get single wallet
router.get("/:id", authMiddleware, walletController.getWalletById);

// POST /api/wallets - Create new wallet for current month
router.post("/", authMiddleware, walletController.createWallet);

// PUT /api/wallets/:id - Update wallet
router.put("/:id", authMiddleware, walletController.updateWallet);

// DELETE /api/wallets/:id - Delete wallet
router.delete("/:id", authMiddleware, walletController.deleteWallet);

module.exports = router;
