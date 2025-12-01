const express = require("express");
const router = express.Router();
const walletController = require("../controllers/walletController");
const { authMiddleware } = require("../middleware/authMiddleware");

// GET /api/wallets - Get all wallets
router.get("/", authMiddleware, walletController.getAllWallets);

// GET /api/wallets/:id - Get single wallet
router.get("/:id", authMiddleware, walletController.getWalletById);

// POST /api/wallets - Create new wallet
router.post("/", authMiddleware, walletController.createWallet);

// PUT /api/wallets/:id - Update wallet
router.put("/:id", authMiddleware, walletController.updateWallet);

// DELETE /api/wallets/:id - Delete wallet
router.delete("/:id", authMiddleware, walletController.deleteWallet);

module.exports = router;
