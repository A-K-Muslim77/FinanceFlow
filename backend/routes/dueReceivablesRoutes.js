const express = require("express");
const router = express.Router();
const dueReceivablesController = require("../controllers/dueReceivablesController");
const { authMiddleware } = require("../middleware/authMiddleware");

// GET /api/dues - Get all dues/receivables
router.get("/", authMiddleware, dueReceivablesController.getAllDues);

// GET /api/dues/:id - Get single due/receivable
router.get("/:id", authMiddleware, dueReceivablesController.getDueById);

// POST /api/dues - Create new due/receivable
router.post("/", authMiddleware, dueReceivablesController.createDue);

// PUT /api/dues/:id - Update due/receivable
router.put("/:id", authMiddleware, dueReceivablesController.updateDue);

// DELETE /api/dues/:id - Delete due/receivable
router.delete("/:id", authMiddleware, dueReceivablesController.deleteDue);

// POST /api/dues/:id/transactions - Add due/payment transaction
router.post(
  "/:id/transactions",
  authMiddleware,
  dueReceivablesController.addTransaction
);

// GET /api/dues/:id/transactions - Get all transactions for a due
router.get(
  "/:id/transactions",
  authMiddleware,
  dueReceivablesController.getTransactions
);

// GET /api/dues/status/:status - Get dues by status
router.get(
  "/status/:status",
  authMiddleware,
  dueReceivablesController.getDuesByStatus
);

module.exports = router;
