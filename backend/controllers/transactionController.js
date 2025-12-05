const Transaction = require("../models/Transaction");
const Wallet = require("../models/Wallet");
const mongoose = require("mongoose");

exports.getMonthlyTransactions = async (req, res) => {
  try {
    const { month, year, type, walletId } = req.query;

    const currentDate = new Date();
    const selectedMonth = month ? parseInt(month) : currentDate.getMonth() + 1;
    const selectedYear = year ? parseInt(year) : currentDate.getFullYear();

    if (selectedMonth < 1 || selectedMonth > 12 || isNaN(selectedMonth)) {
      return res.status(400).json({
        success: false,
        error: "Invalid month. Must be between 1 and 12",
      });
    }

    if (selectedYear < 2000 || selectedYear > 2100 || isNaN(selectedYear)) {
      return res.status(400).json({
        success: false,
        error: "Invalid year",
      });
    }

    const startDate = new Date(selectedYear, selectedMonth - 1, 1);
    const endDate = new Date(selectedYear, selectedMonth, 0);
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    const query = {
      userId: req.user._id,
      date: {
        $gte: startDate,
        $lte: endDate,
      },
    };

    if (type && ["income", "expense", "transfer"].includes(type)) {
      query.type = type;
    }

    if (walletId && mongoose.Types.ObjectId.isValid(walletId)) {
      query.$or = [{ from_wallet_id: walletId }, { to_wallet_id: walletId }];
    }

    const transactions = await Transaction.find(query)
      .populate(
        "from_wallet_id",
        "name type icon color month year openingBalance closingBalance"
      )
      .populate(
        "to_wallet_id",
        "name type icon color month year openingBalance closingBalance"
      )
      .populate("category_id", "name type icon color")
      .sort({ date: -1 })
      .lean();

    const incomeTotal = transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + (t.amount || 0), 0);

    const expenseTotal = transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + (t.amount || 0), 0);

    const transferTotal = transactions
      .filter((t) => t.type === "transfer")
      .reduce((sum, t) => sum + (t.amount || 0), 0);

    const netBalance = incomeTotal - expenseTotal;

    res.status(200).json({
      success: true,
      data: {
        transactions,
        totals: {
          income: incomeTotal,
          expense: expenseTotal,
          transfer: transferTotal,
          netBalance: netBalance,
        },
        count: transactions.length,
        month: selectedMonth,
        year: selectedYear,
        monthName: new Date(selectedYear, selectedMonth - 1, 1).toLocaleString(
          "default",
          { month: "long" }
        ),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Server Error: " + error.message,
    });
  }
};

exports.getTransactionMonths = async (req, res) => {
  try {
    const months = await Transaction.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(req.user._id),
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: {
          "_id.year": -1,
          "_id.month": -1,
        },
      },
      {
        $project: {
          year: "$_id.year",
          month: "$_id.month",
          monthName: {
            $let: {
              vars: {
                monthsInString: [
                  "January",
                  "February",
                  "March",
                  "April",
                  "May",
                  "June",
                  "July",
                  "August",
                  "September",
                  "October",
                  "November",
                  "December",
                ],
              },
              in: {
                $arrayElemAt: [
                  "$$monthsInString",
                  { $subtract: ["$_id.month", 1] },
                ],
              },
            },
          },
          transactionCount: "$count",
          _id: 0,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: months,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

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
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

exports.getTransactionById = async (req, res) => {
  try {
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
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

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

    if (!type || !amount || !from_wallet_id) {
      return res.status(400).json({
        success: false,
        error: "Type, amount, and from wallet are required",
      });
    }

    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        error: "Amount must be greater than 0",
      });
    }

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
    let finalToWalletId = null;

    if (type === "transfer") {
      if (!to_wallet_id) {
        return res.status(400).json({
          success: false,
          error: "To wallet is required for transfers",
        });
      }

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

      if (from_wallet_id === to_wallet_id) {
        return res.status(400).json({
          success: false,
          error: "From wallet and To wallet cannot be the same",
        });
      }

      finalToWalletId = to_wallet_id;
    } else if (type === "income") {
      toWallet = fromWallet;
      finalToWalletId = from_wallet_id;
    }

    const transactionDate = new Date(date || Date.now());
    const transactionMonth = transactionDate.getMonth() + 1;
    const transactionYear = transactionDate.getFullYear();

    if (
      fromWallet.month !== transactionMonth ||
      fromWallet.year !== transactionYear
    ) {
      return res.status(400).json({
        success: false,
        error: `Transaction date must be in ${fromWallet.month}/${fromWallet.year}. Wallet is for this month/year only.`,
      });
    }

    if (type === "transfer" && toWallet) {
      if (
        toWallet.month !== transactionMonth ||
        toWallet.year !== transactionYear
      ) {
        return res.status(400).json({
          success: false,
          error: `Both wallets must be in the same month/year (${transactionMonth}/${transactionYear})`,
        });
      }
    }

    const transaction = await Transaction.create({
      type: type,
      amount: amount,
      from_wallet_id: from_wallet_id,
      to_wallet_id: finalToWalletId,
      category_id: type !== "transfer" ? category_id : null,
      date: date || Date.now(),
      notes: notes,
      userId: req.user._id,
    });

    if (type === "income") {
      fromWallet.closingBalance =
        (fromWallet.closingBalance || fromWallet.openingBalance || 0) + amount;
      await fromWallet.save();
    } else if (type === "expense") {
      fromWallet.closingBalance =
        (fromWallet.closingBalance || fromWallet.openingBalance || 0) - amount;
      await fromWallet.save();
    } else if (type === "transfer" && toWallet) {
      fromWallet.closingBalance =
        (fromWallet.closingBalance || fromWallet.openingBalance || 0) - amount;
      toWallet.closingBalance =
        (toWallet.closingBalance || toWallet.openingBalance || 0) + amount;
      await fromWallet.save();
      await toWallet.save();
    }

    const populatedTransaction = await Transaction.findById(transaction._id)
      .populate(
        "from_wallet_id",
        "name type icon color month year openingBalance closingBalance"
      )
      .populate(
        "to_wallet_id",
        "name type icon color month year openingBalance closingBalance"
      )
      .populate("category_id", "name type icon color");

    res.status(201).json({
      success: true,
      data: populatedTransaction,
    });
  } catch (error) {
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

exports.updateTransaction = async (req, res) => {
  try {
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

    if (amount && amount <= 0) {
      return res.status(400).json({
        success: false,
        error: "Amount must be greater than 0",
      });
    }

    const oldType = transaction.type;
    const oldAmount = transaction.amount;
    const oldFromWalletId = transaction.from_wallet_id;
    const oldToWalletId = transaction.to_wallet_id;

    const oldFromWallet = await Wallet.findById(oldFromWalletId);
    const oldToWallet = oldToWalletId
      ? await Wallet.findById(oldToWalletId)
      : null;

    if (oldFromWallet) {
      if (oldType === "income") {
        oldFromWallet.closingBalance =
          (oldFromWallet.closingBalance || oldFromWallet.openingBalance || 0) -
          oldAmount;
      } else if (oldType === "expense") {
        oldFromWallet.closingBalance =
          (oldFromWallet.closingBalance || oldFromWallet.openingBalance || 0) +
          oldAmount;
      } else if (oldType === "transfer" && oldToWallet) {
        oldFromWallet.closingBalance =
          (oldFromWallet.closingBalance || oldFromWallet.openingBalance || 0) +
          oldAmount;

        oldToWallet.closingBalance =
          (oldToWallet.closingBalance || oldToWallet.openingBalance || 0) -
          oldAmount;

        await oldToWallet.save();
      }
      await oldFromWallet.save();
    }

    const updateFields = {};
    if (type !== undefined) updateFields.type = type;
    if (amount !== undefined) updateFields.amount = amount;
    if (from_wallet_id !== undefined)
      updateFields.from_wallet_id = from_wallet_id;

    if (category_id !== undefined) {
      updateFields.category_id = category_id;
    }
    if (to_wallet_id !== undefined) {
      updateFields.to_wallet_id = to_wallet_id;
    }

    if (date !== undefined) updateFields.date = date;
    if (notes !== undefined) updateFields.notes = notes;

    transaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true, runValidators: true }
    )
      .populate("from_wallet_id", "name type icon color")
      .populate("to_wallet_id", "name type icon color")
      .populate("category_id", "name type icon color");

    const finalAmount = amount || transaction.amount;
    const finalType = type || transaction.type;
    const finalFromWalletId = from_wallet_id || transaction.from_wallet_id;
    const finalToWalletId = to_wallet_id || transaction.to_wallet_id;

    const finalFromWallet = await Wallet.findById(finalFromWalletId);
    const finalToWallet = finalToWalletId
      ? await Wallet.findById(finalToWalletId)
      : null;

    if (finalFromWallet) {
      if (finalType === "income") {
        finalFromWallet.closingBalance =
          (finalFromWallet.closingBalance ||
            finalFromWallet.openingBalance ||
            0) + finalAmount;
      } else if (finalType === "expense") {
        finalFromWallet.closingBalance =
          (finalFromWallet.closingBalance ||
            finalFromWallet.openingBalance ||
            0) - finalAmount;
      } else if (finalType === "transfer" && finalToWallet) {
        finalFromWallet.closingBalance =
          (finalFromWallet.closingBalance ||
            finalFromWallet.openingBalance ||
            0) - finalAmount;

        finalToWallet.closingBalance =
          (finalToWallet.closingBalance || finalToWallet.openingBalance || 0) +
          finalAmount;

        await finalToWallet.save();
      }
      await finalFromWallet.save();
    }

    res.status(200).json({
      success: true,
      data: transaction,
    });
  } catch (error) {
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

exports.deleteTransaction = async (req, res) => {
  try {
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

    const fromWallet = await Wallet.findById(transaction.from_wallet_id);
    const toWallet = transaction.to_wallet_id
      ? await Wallet.findById(transaction.to_wallet_id)
      : null;

    if (fromWallet) {
      if (transaction.type === "income") {
        fromWallet.closingBalance =
          (fromWallet.closingBalance || fromWallet.openingBalance || 0) -
          transaction.amount;
      } else if (transaction.type === "expense") {
        fromWallet.closingBalance =
          (fromWallet.closingBalance || fromWallet.openingBalance || 0) +
          transaction.amount;
      } else if (transaction.type === "transfer" && toWallet) {
        fromWallet.closingBalance =
          (fromWallet.closingBalance || fromWallet.openingBalance || 0) +
          transaction.amount;

        toWallet.closingBalance =
          (toWallet.closingBalance || toWallet.openingBalance || 0) -
          transaction.amount;

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
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

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
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

exports.getTransactionsByWallet = async (req, res) => {
  try {
    const { walletId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(walletId)) {
      return res.status(400).json({
        success: false,
        error: "Invalid wallet ID",
      });
    }

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
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

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
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};
