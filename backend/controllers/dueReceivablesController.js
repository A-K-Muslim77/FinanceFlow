const DueReceivable = require("../models/DueReceivables");
const mongoose = require("mongoose");

// Helper function to calculate totals
const calculateTotals = (entries) => {
  const totals = {
    dues: 0,
    receivables: 0,
    totalPeople: 0,
  };

  const uniquePeople = new Set();

  entries.forEach((entry) => {
    uniquePeople.add(entry.person.toLowerCase());

    if (entry.type === "due") {
      if (entry.status === "pending") {
        totals.dues += entry.amount;
      }
    } else if (entry.type === "receivable") {
      if (entry.status === "pending") {
        totals.receivables += entry.amount;
      }
    }
  });

  totals.totalPeople = uniquePeople.size;
  return totals;
};

// Get all due/receivables for user
exports.getAllDueReceivables = async (req, res) => {
  try {
    const entries = await DueReceivable.find({ userId: req.user._id })
      .sort({ due_date: 1, createdAt: -1 })
      .lean();

    // Calculate totals
    const totals = calculateTotals(entries);

    res.status(200).json({
      success: true,
      count: entries.length,
      totals,
      data: entries,
    });
  } catch (error) {
    console.error("Error fetching due/receivables:", error);
    res.status(500).json({
      success: false,
      error: "Server Error: " + error.message,
    });
  }
};

// Get single due/receivable
exports.getDueReceivableById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid due/receivable ID",
      });
    }

    const entry = await DueReceivable.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!entry) {
      return res.status(404).json({
        success: false,
        error: "Due/Receivable entry not found",
      });
    }

    res.status(200).json({
      success: true,
      data: entry,
    });
  } catch (error) {
    console.error("Error fetching due/receivable by ID:", error);
    res.status(500).json({
      success: false,
      error: "Server Error: " + error.message,
    });
  }
};

// Create new due/receivable
exports.createDueReceivable = async (req, res) => {
  try {
    const { type, amount, person, due_date, status, notes } = req.body;

    // Validation
    if (!type || !["due", "receivable"].includes(type)) {
      return res.status(400).json({
        success: false,
        error: "Valid type is required (due/receivable)",
      });
    }

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: "Amount must be greater than 0",
      });
    }

    if (!person || person.trim() === "") {
      return res.status(400).json({
        success: false,
        error: "Person/Entity name is required",
      });
    }

    if (!due_date) {
      return res.status(400).json({
        success: false,
        error: "Due date is required",
      });
    }

    const dueReceivable = await DueReceivable.create({
      type,
      amount,
      person: person.trim(),
      due_date: new Date(due_date),
      status: status || "pending",
      notes: notes || "",
      userId: req.user._id,
    });

    res.status(201).json({
      success: true,
      data: dueReceivable,
    });
  } catch (error) {
    console.error("Error creating due/receivable:", error);
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        error: messages.join(", "),
      });
    }

    res.status(500).json({
      success: false,
      error: "Server Error: " + error.message,
    });
  }
};

// Update due/receivable
exports.updateDueReceivable = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid due/receivable ID",
      });
    }

    let entry = await DueReceivable.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!entry) {
      return res.status(404).json({
        success: false,
        error: "Due/Receivable entry not found or you don't have permission",
      });
    }

    const { type, amount, person, due_date, status, notes } = req.body;

    // Update fields
    if (type !== undefined && ["due", "receivable"].includes(type)) {
      entry.type = type;
    }

    if (amount !== undefined) {
      if (amount <= 0) {
        return res.status(400).json({
          success: false,
          error: "Amount must be greater than 0",
        });
      }
      entry.amount = amount;
    }

    if (person !== undefined) {
      if (person.trim() === "") {
        return res.status(400).json({
          success: false,
          error: "Person/Entity name cannot be empty",
        });
      }
      entry.person = person.trim();
    }

    if (due_date !== undefined) {
      entry.due_date = new Date(due_date);
    }

    if (status !== undefined && ["pending", "paid"].includes(status)) {
      entry.status = status;
    }

    if (notes !== undefined) {
      entry.notes = notes;
    }

    await entry.save();

    res.status(200).json({
      success: true,
      data: entry,
    });
  } catch (error) {
    console.error("Error updating due/receivable:", error);
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        error: messages.join(", "),
      });
    }

    res.status(500).json({
      success: false,
      error: "Server Error: " + error.message,
    });
  }
};

// Delete due/receivable
exports.deleteDueReceivable = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid due/receivable ID",
      });
    }

    const entry = await DueReceivable.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!entry) {
      return res.status(404).json({
        success: false,
        error: "Due/Receivable entry not found or you don't have permission",
      });
    }

    res.status(200).json({
      success: true,
      data: {},
      message: "Due/Receivable entry deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting due/receivable:", error);
    res.status(500).json({
      success: false,
      error: "Server Error: " + error.message,
    });
  }
};

// Get due/receivables by type
exports.getDueReceivablesByType = async (req, res) => {
  try {
    const { type } = req.params;

    if (!["due", "receivable"].includes(type)) {
      return res.status(400).json({
        success: false,
        error: "Invalid type. Must be 'due' or 'receivable'",
      });
    }

    const entries = await DueReceivable.find({
      userId: req.user._id,
      type,
    }).sort({ due_date: 1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: entries.length,
      data: entries,
    });
  } catch (error) {
    console.error("Error fetching due/receivables by type:", error);
    res.status(500).json({
      success: false,
      error: "Server Error: " + error.message,
    });
  }
};

// Get due/receivables by status
exports.getDueReceivablesByStatus = async (req, res) => {
  try {
    const { status } = req.params;

    if (!["pending", "paid"].includes(status)) {
      return res.status(400).json({
        success: false,
        error: "Invalid status. Must be pending or paid",
      });
    }

    const entries = await DueReceivable.find({
      userId: req.user._id,
      status,
    }).sort({ due_date: 1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: entries.length,
      data: entries,
    });
  } catch (error) {
    console.error("Error fetching due/receivables by status:", error);
    res.status(500).json({
      success: false,
      error: "Server Error: " + error.message,
    });
  }
};
