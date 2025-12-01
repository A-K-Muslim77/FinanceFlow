const Transaction = require("../models/Transaction");
const Wallet = require("../models/Wallet");
const mongoose = require("mongoose");

// Get all transactions for the logged-in user
exports.getAllTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({
      userId: req.user._id,
    })
      .populate("from_wallet_id", "name type icon color")
      .populate("to_wallet_id", "name type icon color")
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
      .populate("from_wallet_id", "name type icon color")
      .populate("to_wallet_id", "name type icon color")
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
    const {
      type,
      amount,
      from_wallet_id,
      to_wallet_id,
      category_id,
      date,
      notes,
    } = req.body;

    // Validate required fields
    if (!type || !amount || !from_wallet_id) {
      return res.status(400).json({
        success: false,
        error: "Type, amount, and from wallet are required",
      });
    }

    // Validate amount
    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        error: "Amount must be greater than 0",
      });
    }

    // Check if from_wallet belongs to user
    const fromWallet = await Wallet.findOne({
      _id: from_wallet_id,
      userId: req.user._id,
    });

    if (!fromWallet) {
      return res.status(404).json({
        success: false,
        error: "From wallet not found or you don't have permission to use it",
      });
    }

    let toWallet = null;

    // For transfers, validate to_wallet
    if (type === "transfer") {
      if (!to_wallet_id) {
        return res.status(400).json({
          success: false,
          error: "To wallet is required for transfers",
        });
      }

      // Check if to_wallet belongs to user
      toWallet = await Wallet.findOne({
        _id: to_wallet_id,
        userId: req.user._id,
      });

      if (!toWallet) {
        return res.status(404).json({
          success: false,
          error: "To wallet not found or you don't have permission to use it",
        });
      }

      // Check if from and to wallets are different
      if (from_wallet_id === to_wallet_id) {
        return res.status(400).json({
          success: false,
          error: "From wallet and To wallet cannot be the same",
        });
      }
    } else {
      // For income/expense, validate category
      if (!category_id) {
        return res.status(400).json({
          success: false,
          error: "Category is required for income and expense transactions",
        });
      }
    }

    const transaction = await Transaction.create({
      type,
      amount,
      from_wallet_id,
      to_wallet_id: type === "transfer" ? to_wallet_id : null,
      category_id: type !== "transfer" ? category_id : null,
      date: date || Date.now(),
      notes: notes || "",
      userId: req.user._id,
    });

    // Update wallet balances
    if (type === "income") {
      fromWallet.balance += amount;
      await fromWallet.save();
    } else if (type === "expense") {
      fromWallet.balance -= amount;
      await fromWallet.save();
    } else if (type === "transfer") {
      // For transfer: deduct from from_wallet, add to to_wallet
      fromWallet.balance -= amount;
      toWallet.balance += amount;
      await fromWallet.save();
      await toWallet.save();
    }

    // Populate the transaction with wallet and category data
    const populatedTransaction = await Transaction.findById(transaction._id)
      .populate("from_wallet_id", "name type icon color")
      .populate("to_wallet_id", "name type icon color")
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

    const {
      type,
      amount,
      from_wallet_id,
      to_wallet_id,
      category_id,
      date,
      notes,
    } = req.body;

    console.log("Update request body:", req.body);

    // Validate amount if provided
    if (amount && amount <= 0) {
      return res.status(400).json({
        success: false,
        error: "Amount must be greater than 0",
      });
    }

    // First, revert the old transaction's effect on wallet balances
    const oldFromWallet = await Wallet.findById(transaction.from_wallet_id);
    const oldToWallet = transaction.to_wallet_id
      ? await Wallet.findById(transaction.to_wallet_id)
      : null;

    if (oldFromWallet) {
      if (transaction.type === "income") {
        oldFromWallet.balance -= transaction.amount;
      } else if (transaction.type === "expense") {
        oldFromWallet.balance += transaction.amount;
      } else if (transaction.type === "transfer" && oldToWallet) {
        oldFromWallet.balance += transaction.amount; // Revert deduction
        oldToWallet.balance -= transaction.amount; // Revert addition
        await oldToWallet.save();
      }
      await oldFromWallet.save();
    }

    // Build update object - include all fields that should be updated
    const updateFields = {};
    if (type !== undefined) updateFields.type = type;
    if (amount !== undefined) updateFields.amount = amount;
    if (from_wallet_id !== undefined)
      updateFields.from_wallet_id = from_wallet_id;

    // CRITICAL: Always include category_id and to_wallet_id in updates
    if (category_id !== undefined) {
      updateFields.category_id = category_id === null ? null : category_id;
    }
    if (to_wallet_id !== undefined) {
      updateFields.to_wallet_id = to_wallet_id === null ? null : to_wallet_id;
    }

    if (date !== undefined) updateFields.date = date;
    if (notes !== undefined) updateFields.notes = notes;

    console.log("Update fields being sent to database:", updateFields);

    // Update the transaction
    transaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true, runValidators: false } // TEMPORARILY disable validators to test
    )
      .populate("from_wallet_id", "name type icon color")
      .populate("to_wallet_id", "name type icon color")
      .populate("category_id", "name type icon color");

    // Apply new transaction's effect on wallet balances
    const finalAmount = amount || transaction.amount;
    const finalType = type || transaction.type;

    // Get updated wallet references
    const finalFromWallet = await Wallet.findById(transaction.from_wallet_id);
    const finalToWallet = transaction.to_wallet_id
      ? await Wallet.findById(transaction.to_wallet_id)
      : null;

    if (finalFromWallet) {
      if (finalType === "income") {
        finalFromWallet.balance += finalAmount;
      } else if (finalType === "expense") {
        finalFromWallet.balance -= finalAmount;
      } else if (finalType === "transfer" && finalToWallet) {
        finalFromWallet.balance -= finalAmount;
        finalToWallet.balance += finalAmount;
        await finalToWallet.save();
      }
      await finalFromWallet.save();
    }

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
      error: "Server Error: " + error.message,
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

    // Revert the transaction's effect on wallet balances
    const fromWallet = await Wallet.findById(transaction.from_wallet_id);
    const toWallet = transaction.to_wallet_id
      ? await Wallet.findById(transaction.to_wallet_id)
      : null;

    if (fromWallet) {
      if (transaction.type === "income") {
        fromWallet.balance -= transaction.amount;
      } else if (transaction.type === "expense") {
        fromWallet.balance += transaction.amount;
      } else if (transaction.type === "transfer" && toWallet) {
        fromWallet.balance += transaction.amount; // Revert deduction
        toWallet.balance -= transaction.amount; // Revert addition
        await toWallet.save();
      }
      await fromWallet.save();
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
      .populate("from_wallet_id", "name type icon color")
      .populate("to_wallet_id", "name type icon color")
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
      $or: [{ from_wallet_id: walletId }, { to_wallet_id: walletId }],
      userId: req.user._id,
    })
      .populate("from_wallet_id", "name type icon color")
      .populate("to_wallet_id", "name type icon color")
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
      .populate("from_wallet_id", "name type icon color")
      .populate("to_wallet_id", "name type icon color")
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
