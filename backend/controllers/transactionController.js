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

    // Check if new from_wallet belongs to user (if from_wallet_id is being changed)
    let newFromWallet = oldFromWallet;
    if (
      from_wallet_id &&
      from_wallet_id.toString() !== transaction.from_wallet_id.toString()
    ) {
      newFromWallet = await Wallet.findOne({
        _id: from_wallet_id,
        userId: req.user._id,
      });

      if (!newFromWallet) {
        return res.status(404).json({
          success: false,
          error: "From wallet not found or you don't have permission to use it",
        });
      }
    }

    let newToWallet = oldToWallet;
    // For transfers, check if new to_wallet belongs to user
    if ((type || transaction.type) === "transfer" && to_wallet_id) {
      if (
        !oldToWallet ||
        to_wallet_id.toString() !== transaction.to_wallet_id?.toString()
      ) {
        newToWallet = await Wallet.findOne({
          _id: to_wallet_id,
          userId: req.user._id,
        });

        if (!newToWallet) {
          return res.status(404).json({
            success: false,
            error: "To wallet not found or you don't have permission to use it",
          });
        }
      }

      // Check if from and to wallets are different
      if (from_wallet_id && to_wallet_id && from_wallet_id === to_wallet_id) {
        return res.status(400).json({
          success: false,
          error: "From wallet and To wallet cannot be the same",
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
    const finalType = type || transaction.type;
    if (finalType !== "transfer" && !category_id && !transaction.category_id) {
      return res.status(400).json({
        success: false,
        error: "Category is required for income and expense transactions",
      });
    }

    // For transfer, validate to_wallet
    if (
      finalType === "transfer" &&
      !to_wallet_id &&
      !transaction.to_wallet_id
    ) {
      return res.status(400).json({
        success: false,
        error: "To wallet is required for transfers",
      });
    }

    // Build update object
    const updateFields = {};
    if (type) updateFields.type = type;
    if (amount) updateFields.amount = amount;
    if (from_wallet_id) updateFields.from_wallet_id = from_wallet_id;

    if (finalType === "transfer") {
      updateFields.category_id = null;
      if (to_wallet_id !== undefined) updateFields.to_wallet_id = to_wallet_id;
    } else {
      updateFields.to_wallet_id = null;
      if (category_id !== undefined) updateFields.category_id = category_id;
    }

    if (date) updateFields.date = date;
    if (notes !== undefined) updateFields.notes = notes;

    transaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true, runValidators: true }
    )
      .populate("from_wallet_id", "name type icon color")
      .populate("to_wallet_id", "name type icon color")
      .populate("category_id", "name type icon color");

    // Apply new transaction's effect on wallet balances
    const finalFromWallet = newFromWallet || oldFromWallet;
    const finalToWallet = newToWallet || oldToWallet;
    const finalAmount = amount || transaction.amount;

    if (finalType === "income") {
      finalFromWallet.balance += finalAmount;
    } else if (finalType === "expense") {
      finalFromWallet.balance -= finalAmount;
    } else if (finalType === "transfer") {
      finalFromWallet.balance -= finalAmount;
      finalToWallet.balance += finalAmount;
      await finalToWallet.save();
    }
    await finalFromWallet.save();

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
