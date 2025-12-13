const DueReceivables = require("../models/DueReceivables");
const mongoose = require("mongoose");

// Helper function to calculate current amount from transactions
const calculateCurrentAmount = (transactions) => {
  const totalDue = transactions
    .filter((t) => t.type === "due")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalPayments = transactions
    .filter((t) => t.type === "payment")
    .reduce((sum, t) => sum + t.amount, 0);

  return totalDue - totalPayments;
};

// Helper function to determine status based on amount
const determineStatus = (currentAmount, originalAmount) => {
  if (currentAmount <= 0) return "Received";
  if (currentAmount < originalAmount) return "Partially Paid";
  return "Due";
};

// Get all dues/receivables for user
exports.getAllDues = async (req, res) => {
  try {
    const dues = await DueReceivables.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .lean();

    // Add calculated fields
    const duesWithCalculations = dues.map((item) => {
      const currentAmount = calculateCurrentAmount(item.transactions || []);
      const remainingAmount = Math.max(0, currentAmount);
      const status = determineStatus(currentAmount, item.amount);

      return {
        ...item,
        currentAmount,
        remainingAmount,
        status, // Override stored status with calculated one
      };
    });

    res.status(200).json({
      success: true,
      count: dues.length,
      data: duesWithCalculations,
    });
  } catch (error) {
    console.error("Error fetching dues:", error);
    res.status(500).json({
      success: false,
      error: "Server Error: " + error.message,
    });
  }
};

// Get single due/receivable
exports.getDueById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid due/receivable ID",
      });
    }

    const due = await DueReceivables.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!due) {
      return res.status(404).json({
        success: false,
        error: "Due/Receivable not found",
      });
    }

    // Calculate fields
    const currentAmount = calculateCurrentAmount(due.transactions);
    const remainingAmount = Math.max(0, currentAmount);
    const status = determineStatus(currentAmount, due.amount);

    const dueData = {
      ...due.toObject(),
      currentAmount,
      remainingAmount,
      status,
    };

    res.status(200).json({
      success: true,
      data: dueData,
    });
  } catch (error) {
    console.error("Error fetching due by ID:", error);
    res.status(500).json({
      success: false,
      error: "Server Error: " + error.message,
    });
  }
};

// Create new due/receivable
exports.createDue = async (req, res) => {
  try {
    const { name, amount, date, status, description } = req.body;

    // Validation
    if (!name || !amount || !date) {
      return res.status(400).json({
        success: false,
        error: "Name, amount, and date are required",
      });
    }

    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        error: "Amount must be greater than 0",
      });
    }

    const transactions = [];

    // Always add the initial due transaction
    const dueTransaction = {
      type: "due",
      amount: amount,
      date: new Date(date),
      description: description || "Initial due amount",
    };
    transactions.push(dueTransaction);

    // If status is "Received", add a payment transaction for the full amount
    if (status === "Received") {
      const paymentTransaction = {
        type: "payment",
        amount: amount,
        date: new Date(date),
        description: "Full payment received",
      };
      transactions.push(paymentTransaction);
    }

    // Create the due record
    const dueData = {
      name,
      amount,
      date: new Date(date),
      status: status || "Due",
      description: description || "",
      userId: req.user._id,
      transactions: transactions,
    };

    const due = await DueReceivables.create(dueData);

    // Calculate fields for response
    const currentAmount = calculateCurrentAmount(due.transactions);
    const remainingAmount = Math.max(0, currentAmount);
    const calculatedStatus = determineStatus(currentAmount, due.amount);

    const responseData = {
      ...due.toObject(),
      currentAmount,
      remainingAmount,
      status: calculatedStatus,
    };

    res.status(201).json({
      success: true,
      data: responseData,
    });
  } catch (error) {
    console.error("Error creating due:", error);
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
exports.updateDue = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid due/receivable ID",
      });
    }

    let due = await DueReceivables.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!due) {
      return res.status(404).json({
        success: false,
        error: "Due/Receivable not found or you don't have permission",
      });
    }

    const { name, amount, date, status, description } = req.body;

    // Update basic fields
    if (name !== undefined) due.name = name;
    if (date !== undefined) due.date = new Date(date);
    if (description !== undefined) due.description = description;

    // Handle amount update - this should update the initial due transaction
    if (amount !== undefined) {
      if (amount <= 0) {
        return res.status(400).json({
          success: false,
          error: "Amount must be greater than 0",
        });
      }

      // Update the amount field
      due.amount = amount;

      // Find and update the initial due transaction
      const initialDueTransaction = due.transactions.find(
        (t) =>
          t.type === "due" &&
          (t.description === "Initial due amount" ||
            t.description.includes("Initial due"))
      );

      if (initialDueTransaction) {
        initialDueTransaction.amount = amount;
      } else {
        // If no initial transaction found, add one
        due.transactions.push({
          type: "due",
          amount: amount,
          date: due.date || new Date(),
          description: "Initial due amount (updated)",
        });
      }
    }

    // Handle status update - this only updates the status field, doesn't add transactions
    if (status !== undefined && ["Due", "Received"].includes(status)) {
      due.status = status;
    }

    await due.save();

    // Calculate updated fields
    const currentAmount = calculateCurrentAmount(due.transactions);
    const remainingAmount = Math.max(0, currentAmount);
    const calculatedStatus = determineStatus(currentAmount, due.amount);

    const dueData = {
      ...due.toObject(),
      currentAmount,
      remainingAmount,
      status: calculatedStatus,
    };

    res.status(200).json({
      success: true,
      data: dueData,
    });
  } catch (error) {
    console.error("Error updating due:", error);
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
exports.deleteDue = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid due/receivable ID",
      });
    }

    const due = await DueReceivables.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!due) {
      return res.status(404).json({
        success: false,
        error: "Due/Receivable not found or you don't have permission",
      });
    }

    res.status(200).json({
      success: true,
      data: {},
      message: "Due/Receivable deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting due:", error);
    res.status(500).json({
      success: false,
      error: "Server Error: " + error.message,
    });
  }
};

// Add due/payment transaction
exports.addTransaction = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid due/receivable ID",
      });
    }

    const { type, amount, description } = req.body;

    // Validation
    if (!type || !["due", "payment"].includes(type)) {
      return res.status(400).json({
        success: false,
        error: "Valid transaction type is required (due/payment)",
      });
    }

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: "Amount must be greater than 0",
      });
    }

    const due = await DueReceivables.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!due) {
      return res.status(404).json({
        success: false,
        error: "Due/Receivable not found or you don't have permission",
      });
    }

    // Check for payments exceeding current due
    if (type === "payment") {
      const currentAmount = calculateCurrentAmount(due.transactions);
      if (amount > currentAmount) {
        return res.status(400).json({
          success: false,
          error: `Payment amount cannot exceed current due amount (${currentAmount})`,
        });
      }
    }

    // Create transaction
    const transaction = {
      type,
      amount,
      description:
        description ||
        (type === "payment" ? "Payment received" : "Additional due added"),
      date: new Date(),
    };

    // Add transaction to due
    due.transactions.push(transaction);

    // Calculate new status
    const currentAmount = calculateCurrentAmount(due.transactions);
    const calculatedStatus = determineStatus(currentAmount, due.amount);

    // Update status
    due.status = calculatedStatus;

    await due.save();

    // Calculate updated fields
    const remainingAmount = Math.max(0, currentAmount);

    const dueData = {
      ...due.toObject(),
      currentAmount,
      remainingAmount,
      status: calculatedStatus,
      lastTransaction: transaction,
    };

    res.status(201).json({
      success: true,
      data: dueData,
      message:
        type === "due"
          ? "Due added successfully"
          : "Payment recorded successfully",
    });
  } catch (error) {
    console.error("Error adding transaction:", error);
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

// Get due/receivable transactions
exports.getTransactions = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid due/receivable ID",
      });
    }

    const due = await DueReceivables.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!due) {
      return res.status(404).json({
        success: false,
        error: "Due/Receivable not found or you don't have permission",
      });
    }

    // Sort transactions by date (newest first) and add formatted date
    const sortedTransactions = [...due.transactions]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .map((transaction) => ({
        ...(transaction.toObject ? transaction.toObject() : transaction),
        formattedDate: new Date(transaction.date).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
      }));

    res.status(200).json({
      success: true,
      count: due.transactions.length,
      data: sortedTransactions,
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({
      success: false,
      error: "Server Error: " + error.message,
    });
  }
};

// Get dues by status
exports.getDuesByStatus = async (req, res) => {
  try {
    const { status } = req.params;

    if (!["Due", "Received", "Partially Paid"].includes(status)) {
      return res.status(400).json({
        success: false,
        error: "Invalid status. Must be Due, Received, or Partially Paid",
      });
    }

    // We need to calculate status for each due
    const dues = await DueReceivables.find({
      userId: req.user._id,
    });

    // Filter by calculated status
    const filteredDues = dues.filter((due) => {
      const currentAmount = calculateCurrentAmount(due.transactions);
      const calculatedStatus = determineStatus(currentAmount, due.amount);
      return calculatedStatus === status;
    });

    // Sort by createdAt
    const sortedDues = filteredDues.sort((a, b) => b.createdAt - a.createdAt);

    // Add calculated fields
    const duesWithCalculations = sortedDues.map((due) => {
      const currentAmount = calculateCurrentAmount(due.transactions);
      const remainingAmount = Math.max(0, currentAmount);
      const calculatedStatus = determineStatus(currentAmount, due.amount);

      return {
        ...due.toObject(),
        currentAmount,
        remainingAmount,
        status: calculatedStatus,
      };
    });

    res.status(200).json({
      success: true,
      count: duesWithCalculations.length,
      data: duesWithCalculations,
    });
  } catch (error) {
    console.error("Error fetching dues by status:", error);
    res.status(500).json({
      success: false,
      error: "Server Error: " + error.message,
    });
  }
};
