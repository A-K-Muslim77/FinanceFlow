const Savings = require("../models/Savings");
const mongoose = require("mongoose");

// Helper function to calculate balance from transactions
const calculateBalance = (transactions) => {
  const totalDeposits = transactions
    .filter((t) => t.type === "deposit")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalWithdrawals = transactions
    .filter((t) => t.type === "withdrawal")
    .reduce((sum, t) => sum + t.amount, 0);

  return totalDeposits - totalWithdrawals;
};

// Helper function to calculate progress
const calculateProgress = (currentBalance, targetAmount) => {
  if (targetAmount <= 0) return 0;
  return Math.min(100, (currentBalance / targetAmount) * 100);
};

// Get all savings goals for user
exports.getAllSavings = async (req, res) => {
  try {
    const savings = await Savings.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .lean();

    // Add calculated fields
    const savingsWithCalculations = savings.map((goal) => {
      const currentBalance = calculateBalance(goal.transactions || []);
      const progress = calculateProgress(currentBalance, goal.targetAmount);
      const remainingAmount = Math.max(0, goal.targetAmount - currentBalance);

      return {
        ...goal,
        currentBalance,
        progressPercentage: progress,
        remainingAmount,
        isCompleted: currentBalance >= goal.targetAmount,
      };
    });

    // Calculate totals
    const totals = savingsWithCalculations.reduce(
      (acc, goal) => {
        acc.totalBalance += goal.currentBalance || 0;
        acc.totalTarget += goal.targetAmount || 0;
        acc.activeGoals += goal.status === "active" ? 1 : 0;
        return acc;
      },
      { totalBalance: 0, totalTarget: 0, activeGoals: 0 }
    );

    res.status(200).json({
      success: true,
      count: savings.length,
      totals,
      data: savingsWithCalculations,
    });
  } catch (error) {
    console.error("Error fetching savings:", error);
    res.status(500).json({
      success: false,
      error: "Server Error: " + error.message,
    });
  }
};

// Get single savings goal
exports.getSavingsById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid savings goal ID",
      });
    }

    const savings = await Savings.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!savings) {
      return res.status(404).json({
        success: false,
        error: "Savings goal not found",
      });
    }

    // Calculate fields
    const currentBalance = calculateBalance(savings.transactions);
    const progress = calculateProgress(currentBalance, savings.targetAmount);
    const remainingAmount = Math.max(0, savings.targetAmount - currentBalance);

    const savingsData = {
      ...savings.toObject(),
      currentBalance,
      progressPercentage: progress,
      remainingAmount,
      isCompleted: currentBalance >= savings.targetAmount,
    };

    res.status(200).json({
      success: true,
      data: savingsData,
    });
  } catch (error) {
    console.error("Error fetching savings by ID:", error);
    res.status(500).json({
      success: false,
      error: "Server Error: " + error.message,
    });
  }
};

// Create new savings goal
exports.createSavings = async (req, res) => {
  try {
    const { name, targetAmount, monthlyTarget, description, icon, color } =
      req.body;

    // Validation
    if (!name || !targetAmount) {
      return res.status(400).json({
        success: false,
        error: "Name and target amount are required",
      });
    }

    if (targetAmount <= 0) {
      return res.status(400).json({
        success: false,
        error: "Target amount must be greater than 0",
      });
    }

    const savings = await Savings.create({
      name,
      targetAmount,
      monthlyTarget: monthlyTarget || null,
      description: description || "",
      icon: icon || "piggy-bank",
      color: color || "#3b82f6",
      userId: req.user._id,
    });

    // Add calculated fields
    const savingsData = {
      ...savings.toObject(),
      currentBalance: 0,
      progressPercentage: 0,
      remainingAmount: savings.targetAmount,
      isCompleted: false,
    };

    res.status(201).json({
      success: true,
      data: savingsData,
    });
  } catch (error) {
    console.error("Error creating savings:", error);
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

// Update savings goal
exports.updateSavings = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid savings goal ID",
      });
    }

    let savings = await Savings.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!savings) {
      return res.status(404).json({
        success: false,
        error: "Savings goal not found or you don't have permission",
      });
    }

    const {
      name,
      targetAmount,
      monthlyTarget,
      description,
      icon,
      color,
      status,
    } = req.body;

    // Update fields
    if (name !== undefined) savings.name = name;
    if (targetAmount !== undefined) {
      if (targetAmount <= 0) {
        return res.status(400).json({
          success: false,
          error: "Target amount must be greater than 0",
        });
      }
      savings.targetAmount = targetAmount;
    }
    if (monthlyTarget !== undefined) savings.monthlyTarget = monthlyTarget;
    if (description !== undefined) savings.description = description;
    if (icon !== undefined) savings.icon = icon;
    if (color !== undefined) savings.color = color;
    if (
      status !== undefined &&
      ["active", "completed", "archived"].includes(status)
    ) {
      savings.status = status;
    }

    await savings.save();

    // Calculate updated fields
    const currentBalance = calculateBalance(savings.transactions);
    const progress = calculateProgress(currentBalance, savings.targetAmount);
    const remainingAmount = Math.max(0, savings.targetAmount - currentBalance);
    const isCompleted = currentBalance >= savings.targetAmount;

    // Update status if completed
    if (isCompleted && savings.status === "active") {
      savings.status = "completed";
      await savings.save();
    }

    const savingsData = {
      ...savings.toObject(),
      currentBalance,
      progressPercentage: progress,
      remainingAmount,
      isCompleted,
    };

    res.status(200).json({
      success: true,
      data: savingsData,
    });
  } catch (error) {
    console.error("Error updating savings:", error);
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

// Delete savings goal
exports.deleteSavings = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid savings goal ID",
      });
    }

    const savings = await Savings.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!savings) {
      return res.status(404).json({
        success: false,
        error: "Savings goal not found or you don't have permission",
      });
    }

    res.status(200).json({
      success: true,
      data: {},
      message: "Savings goal deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting savings:", error);
    res.status(500).json({
      success: false,
      error: "Server Error: " + error.message,
    });
  }
};

// Add deposit/withdrawal transaction
exports.addTransaction = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid savings goal ID",
      });
    }

    const { type, amount, notes } = req.body;

    // Validation
    if (!type || !["deposit", "withdrawal"].includes(type)) {
      return res.status(400).json({
        success: false,
        error: "Valid transaction type is required (deposit/withdrawal)",
      });
    }

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: "Amount must be greater than 0",
      });
    }

    const savings = await Savings.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!savings) {
      return res.status(404).json({
        success: false,
        error: "Savings goal not found or you don't have permission",
      });
    }

    // Check balance for withdrawals
    const currentBalance = calculateBalance(savings.transactions);
    if (type === "withdrawal" && currentBalance < amount) {
      return res.status(400).json({
        success: false,
        error: "Insufficient funds in savings goal",
      });
    }

    // Create transaction
    const transaction = {
      type,
      amount,
      notes: notes || "",
      date: new Date(),
    };

    // Add transaction to savings goal
    savings.transactions.push(transaction);
    await savings.save();

    // Calculate updated fields
    const newBalance = calculateBalance(savings.transactions);
    const progress = calculateProgress(newBalance, savings.targetAmount);
    const remainingAmount = Math.max(0, savings.targetAmount - newBalance);
    const isCompleted = newBalance >= savings.targetAmount;

    // Update status if completed
    if (isCompleted && savings.status === "active") {
      savings.status = "completed";
      await savings.save();
    }

    const savingsData = {
      ...savings.toObject(),
      currentBalance: newBalance,
      progressPercentage: progress,
      remainingAmount,
      isCompleted,
      lastTransaction: transaction,
    };

    res.status(201).json({
      success: true,
      data: savingsData,
      message:
        type === "deposit" ? "Deposit successful" : "Withdrawal successful",
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

// Get savings goal transactions
exports.getTransactions = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid savings goal ID",
      });
    }

    const savings = await Savings.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!savings) {
      return res.status(404).json({
        success: false,
        error: "Savings goal not found or you don't have permission",
      });
    }

    // Sort transactions by date (newest first)
    const sortedTransactions = [...savings.transactions].sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );

    res.status(200).json({
      success: true,
      count: savings.transactions.length,
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

// Get savings goals by status
exports.getSavingsByStatus = async (req, res) => {
  try {
    const { status } = req.params;

    if (!["active", "completed", "archived"].includes(status)) {
      return res.status(400).json({
        success: false,
        error: "Invalid status. Must be active, completed, or archived",
      });
    }

    const savings = await Savings.find({
      userId: req.user._id,
      status,
    }).sort({ createdAt: -1 });

    // Add calculated fields
    const savingsWithCalculations = savings.map((goal) => {
      const currentBalance = calculateBalance(goal.transactions || []);
      const progress = calculateProgress(currentBalance, goal.targetAmount);
      const remainingAmount = Math.max(0, goal.targetAmount - currentBalance);

      return {
        ...goal.toObject(),
        currentBalance,
        progressPercentage: progress,
        remainingAmount,
        isCompleted: currentBalance >= goal.targetAmount,
      };
    });

    res.status(200).json({
      success: true,
      count: savings.length,
      data: savingsWithCalculations,
    });
  } catch (error) {
    console.error("Error fetching savings by status:", error);
    res.status(500).json({
      success: false,
      error: "Server Error: " + error.message,
    });
  }
};
