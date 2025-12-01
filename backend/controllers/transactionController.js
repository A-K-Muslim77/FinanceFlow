const Transaction = require("../models/Transaction");
const Wallet = require("../models/Wallet");
const mongoose = require("mongoose");

// Get all transactions for the logged-in user
exports.getAllTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({
      userId: req.user._id,
    })
      .populate("wallet_id", "name type icon color")
      .populate("category_id", "name type icon color")
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: transactions.length,
      data: transactions,
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

// Get single transaction by ID - only if user owns it
exports.getTransactionById = async (req, res) => {
  try {
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid transaction ID",
      });
    }

    const transaction = await Transaction.findOne({
      _id: req.params.id,
      userId: req.user._id,
    })
      .populate("wallet_id", "name type icon color")
      .populate("category_id", "name type icon color");

    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: "Transaction not found",
      });
    }

    res.status(200).json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    console.error("Error fetching transaction:", error);
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

// Create new transaction for the logged-in user
exports.createTransaction = async (req, res) => {
  try {
    const { type, amount, wallet_id, category_id, date, notes } = req.body;

    // Validate required fields
    if (!type || !amount || !wallet_id) {
      return res.status(400).json({
        success: false,
        error: "Type, amount, and wallet are required",
      });
    }

    // Validate amount
    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        error: "Amount must be greater than 0",
      });
    }

    // Check if wallet belongs to user
    const wallet = await Wallet.findOne({
      _id: wallet_id,
      userId: req.user._id,
    });

    if (!wallet) {
      return res.status(404).json({
        success: false,
        error: "Wallet not found or you don't have permission to use it",
      });
    }

    // For income/expense, validate category
    if (type !== "transfer" && !category_id) {
      return res.status(400).json({
        success: false,
        error: "Category is required for income and expense transactions",
      });
    }

    const transaction = await Transaction.create({
      type,
      amount,
      wallet_id,
      category_id: type === "transfer" ? null : category_id,
      date: date || Date.now(),
      notes: notes || "",
      userId: req.user._id,
    });

    // Update wallet balance
    if (type === "income") {
      wallet.balance += amount;
    } else if (type === "expense") {
      wallet.balance -= amount;
    }
    // Transfer doesn't affect single wallet balance (requires two wallets)
    await wallet.save();

    // Populate the transaction with wallet and category data
    const populatedTransaction = await Transaction.findById(transaction._id)
      .populate("wallet_id", "name type icon color")
      .populate("category_id", "name type icon color");

    res.status(201).json({
      success: true,
      data: populatedTransaction,
    });
  } catch (error) {
    console.error("Error creating transaction:", error);

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        error: messages.join(", "),
      });
    }

    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

// Update transaction - only if user owns it
exports.updateTransaction = async (req, res) => {
  try {
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid transaction ID",
      });
    }

    let transaction = await Transaction.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        error:
          "Transaction not found or you don't have permission to update it",
      });
    }

    const { type, amount, wallet_id, category_id, date, notes } = req.body;

    // First, revert the old transaction's effect on wallet balance
    const oldWallet = await Wallet.findById(transaction.wallet_id);
    if (oldWallet) {
      if (transaction.type === "income") {
        oldWallet.balance -= transaction.amount;
      } else if (transaction.type === "expense") {
        oldWallet.balance += transaction.amount;
      }
      await oldWallet.save();
    }

    // Check if new wallet belongs to user (if wallet_id is being changed)
    let newWallet = oldWallet;
    if (
      wallet_id &&
      wallet_id.toString() !== transaction.wallet_id.toString()
    ) {
      newWallet = await Wallet.findOne({
        _id: wallet_id,
        userId: req.user._id,
      });

      if (!newWallet) {
        return res.status(404).json({
          success: false,
          error: "Wallet not found or you don't have permission to use it",
        });
      }
    }

    // Validate amount if provided
    if (amount && amount <= 0) {
      return res.status(400).json({
        success: false,
        error: "Amount must be greater than 0",
      });
    }

    // For income/expense, validate category if type is not transfer
    if (
      (type || transaction.type) !== "transfer" &&
      !category_id &&
      !transaction.category_id
    ) {
      return res.status(400).json({
        success: false,
        error: "Category is required for income and expense transactions",
      });
    }

    // Build update object
    const updateFields = {};
    if (type) updateFields.type = type;
    if (amount) updateFields.amount = amount;
    if (wallet_id) updateFields.wallet_id = wallet_id;
    if (type === "transfer") {
      updateFields.category_id = null;
    } else if (category_id !== undefined) {
      updateFields.category_id = category_id;
    }
    if (date) updateFields.date = date;
    if (notes !== undefined) updateFields.notes = notes;

    transaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true, runValidators: true }
    )
      .populate("wallet_id", "name type icon color")
      .populate("category_id", "name type icon color");

    // Apply new transaction's effect on wallet balance
    const finalWallet = newWallet || oldWallet;
    const finalType = type || transaction.type;
    const finalAmount = amount || transaction.amount;

    if (finalType === "income") {
      finalWallet.balance += finalAmount;
    } else if (finalType === "expense") {
      finalWallet.balance -= finalAmount;
    }
    await finalWallet.save();

    res.status(200).json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    console.error("Error updating transaction:", error);

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        error: messages.join(", "),
      });
    }

    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

// Delete transaction - only if user owns it
exports.deleteTransaction = async (req, res) => {
  try {
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid transaction ID",
      });
    }

    const transaction = await Transaction.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        error:
          "Transaction not found or you don't have permission to delete it",
      });
    }

    // Revert the transaction's effect on wallet balance
    const wallet = await Wallet.findById(transaction.wallet_id);
    if (wallet) {
      if (transaction.type === "income") {
        wallet.balance -= transaction.amount;
      } else if (transaction.type === "expense") {
        wallet.balance += transaction.amount;
      }
      await wallet.save();
    }

    await Transaction.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      data: {},
      message: "Transaction deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting transaction:", error);
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

// Get transactions by type for the logged-in user
exports.getTransactionsByType = async (req, res) => {
  try {
    const { type } = req.params;

    if (!["income", "expense", "transfer"].includes(type)) {
      return res.status(400).json({
        success: false,
        error: "Type must be either 'income', 'expense', or 'transfer'",
      });
    }

    const transactions = await Transaction.find({
      type,
      userId: req.user._id,
    })
      .populate("wallet_id", "name type icon color")
      .populate("category_id", "name type icon color")
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: transactions.length,
      data: transactions,
    });
  } catch (error) {
    console.error("Error fetching transactions by type:", error);
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

// Get transactions by wallet for the logged-in user
exports.getTransactionsByWallet = async (req, res) => {
  try {
    const { walletId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(walletId)) {
      return res.status(400).json({
        success: false,
        error: "Invalid wallet ID",
      });
    }

    // Check if wallet belongs to user
    const wallet = await Wallet.findOne({
      _id: walletId,
      userId: req.user._id,
    });

    if (!wallet) {
      return res.status(404).json({
        success: false,
        error: "Wallet not found",
      });
    }

    const transactions = await Transaction.find({
      wallet_id: walletId,
      userId: req.user._id,
    })
      .populate("wallet_id", "name type icon color")
      .populate("category_id", "name type icon color")
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: transactions.length,
      data: transactions,
    });
  } catch (error) {
    console.error("Error fetching transactions by wallet:", error);
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

// Get transactions by category for the logged-in user
exports.getTransactionsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return res.status(400).json({
        success: false,
        error: "Invalid category ID",
      });
    }

    const transactions = await Transaction.find({
      category_id: categoryId,
      userId: req.user._id,
    })
      .populate("wallet_id", "name type icon color")
      .populate("category_id", "name type icon color")
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: transactions.length,
      data: transactions,
    });
  } catch (error) {
    console.error("Error fetching transactions by category:", error);
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};
