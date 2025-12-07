const express = require("express");
const router = express.Router();
const dueReceivablesController = require("../controllers/dueReceivablesController");
const { authMiddleware } = require("../middleware/authMiddleware");

// Apply auth middleware to all routes
router.use(authMiddleware);

// GET /api/due-receivables - Get all due/receivables
router.get("/", dueReceivablesController.getAllDueReceivables);

// GET /api/due-receivables/:id - Get single due/receivable
router.get("/:id", dueReceivablesController.getDueReceivableById);

// POST /api/due-receivables - Create new due/receivable
router.post("/", dueReceivablesController.createDueReceivable);

// PUT /api/due-receivables/:id - Update due/receivable
router.put("/:id", dueReceivablesController.updateDueReceivable);

// DELETE /api/due-receivables/:id - Delete due/receivable
router.delete("/:id", dueReceivablesController.deleteDueReceivable);

// GET /api/due-receivables/type/:type - Get due/receivables by type
router.get("/type/:type", dueReceivablesController.getDueReceivablesByType);

// GET /api/due-receivables/status/:status - Get due/receivables by status
router.get(
  "/status/:status",
  dueReceivablesController.getDueReceivablesByStatus
);

module.exports = router;
