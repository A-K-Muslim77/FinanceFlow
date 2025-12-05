const Wallet = require("../models/Wallet");
const Transaction = require("../models/Transaction");
const mongoose = require("mongoose");

exports.getMonthlyWallets = async (req, res) => {
  try {
    const { month, year } = req.query;

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

    const wallets = await Wallet.find({
      userId: req.user._id,
      month: selectedMonth,
      year: selectedYear,
    }).lean();

    if (wallets.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          wallets: [],
          totalMonthlyBalance: 0,
          month: selectedMonth,
          year: selectedYear,
          monthName: new Date(
            selectedYear,
            selectedMonth - 1,
            1
          ).toLocaleString("default", { month: "long" }),
        },
      });
    }

    const startDate = new Date(selectedYear, selectedMonth - 1, 1);
    const endDate = new Date(selectedYear, selectedMonth, 0);
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    const walletMap = {};
    wallets.forEach((wallet) => {
      walletMap[wallet._id.toString()] = {
        ...wallet,
        monthlyBalance: wallet.openingBalance || 0,
        transactionCount: 0,
      };
    });

    const transactions = await Transaction.find({
      userId: req.user._id,
      date: {
        $gte: startDate,
        $lte: endDate,
      },
      $or: [
        {
          from_wallet_id: {
            $in: Object.keys(walletMap).map(
              (id) => new mongoose.Types.ObjectId(id)
            ),
          },
        },
        {
          to_wallet_id: {
            $in: Object.keys(walletMap).map(
              (id) => new mongoose.Types.ObjectId(id)
            ),
          },
        },
      ],
    }).lean();

    transactions.forEach((transaction) => {
      const amount = transaction.amount || 0;

      const fromWalletId = transaction.from_wallet_id?.toString();
      const toWalletId = transaction.to_wallet_id?.toString();

      if (transaction.type === "income") {
        if (toWalletId && walletMap[toWalletId]) {
          walletMap[toWalletId].monthlyBalance += amount;
          walletMap[toWalletId].transactionCount++;
        }
      } else if (transaction.type === "expense") {
        if (fromWalletId && walletMap[fromWalletId]) {
          walletMap[fromWalletId].monthlyBalance -= amount;
          walletMap[fromWalletId].transactionCount++;
        }
      } else if (transaction.type === "transfer") {
        if (fromWalletId && walletMap[fromWalletId]) {
          walletMap[fromWalletId].monthlyBalance -= amount;
          walletMap[fromWalletId].transactionCount++;
        }
        if (toWalletId && walletMap[toWalletId]) {
          walletMap[toWalletId].monthlyBalance += amount;
          walletMap[toWalletId].transactionCount++;
        }
      }
    });

    const walletsWithBalance = Object.values(walletMap);
    let totalMonthlyBalance = 0;

    walletsWithBalance.forEach((wallet) => {
      totalMonthlyBalance += wallet.monthlyBalance;
    });

    res.status(200).json({
      success: true,
      data: {
        wallets: walletsWithBalance.map((wallet) => ({
          _id: wallet._id,
          name: wallet.name,
          type: wallet.type,
          icon: wallet.icon || "wallet",
          color: wallet.color || "#3b82f6",
          description: wallet.description || "",
          month: wallet.month,
          year: wallet.year,
          openingBalance: wallet.openingBalance || 0,
          monthlyBalance: wallet.monthlyBalance,
          transactionCount: wallet.transactionCount,
          userId: wallet.userId,
          createdAt: wallet.createdAt,
          updatedAt: wallet.updatedAt,
        })),
        totalMonthlyBalance,
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

exports.getWalletTransactions = async (req, res) => {
  try {
    const { walletId } = req.params;
    const { month, year } = req.query;

    if (!mongoose.Types.ObjectId.isValid(walletId)) {
      return res.status(400).json({
        success: false,
        error: "Invalid wallet ID",
      });
    }

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

    const wallet = await Wallet.findOne({
      _id: walletId,
      userId: req.user._id,
    });

    if (!wallet) {
      return res.status(404).json({
        success: false,
        error: "Wallet not found or you don't have permission to view it",
      });
    }

    const startDate = new Date(selectedYear, selectedMonth - 1, 1);
    const endDate = new Date(selectedYear, selectedMonth, 0);
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    const transactions = await Transaction.find({
      userId: req.user._id,
      date: {
        $gte: startDate,
        $lte: endDate,
      },
      $or: [{ from_wallet_id: walletId }, { to_wallet_id: walletId }],
    })
      .populate("from_wallet_id", "name type icon color month year")
      .populate("to_wallet_id", "name type icon color month year")
      .populate("category_id", "name type icon color")
      .sort({ date: -1 })
      .lean();

    const openingBalance = wallet.openingBalance || 0;
    let monthlyBalance = openingBalance;

    let incomeTotal = 0;
    let expenseTotal = 0;
    let transferInTotal = 0;
    let transferOutTotal = 0;

    transactions.forEach((transaction) => {
      const amount = transaction.amount || 0;
      const walletIdStr = walletId.toString();

      if (transaction.type === "income") {
        if (
          transaction.to_wallet_id &&
          transaction.to_wallet_id._id.toString() === walletIdStr
        ) {
          incomeTotal += amount;
          monthlyBalance += amount;
        }
      } else if (transaction.type === "expense") {
        if (
          transaction.from_wallet_id &&
          transaction.from_wallet_id._id.toString() === walletIdStr
        ) {
          expenseTotal += amount;
          monthlyBalance -= amount;
        }
      } else if (transaction.type === "transfer") {
        if (
          transaction.from_wallet_id &&
          transaction.from_wallet_id._id.toString() === walletIdStr
        ) {
          transferOutTotal += amount;
          monthlyBalance -= amount;
        }
        if (
          transaction.to_wallet_id &&
          transaction.to_wallet_id._id.toString() === walletIdStr
        ) {
          transferInTotal += amount;
          monthlyBalance += amount;
        }
      }
    });

    const netChange = monthlyBalance - openingBalance;
    const combinedIncome = incomeTotal + transferInTotal;
    const combinedExpense = expenseTotal + transferOutTotal;

    res.status(200).json({
      success: true,
      data: {
        wallet: {
          _id: wallet._id,
          name: wallet.name,
          type: wallet.type,
          icon: wallet.icon,
          color: wallet.color,
          openingBalance: openingBalance,
          monthlyBalance: monthlyBalance,
          month: selectedMonth,
          year: selectedYear,
          monthName: new Date(
            selectedYear,
            selectedMonth - 1,
            1
          ).toLocaleString("default", { month: "long" }),
        },
        transactions,
        totals: {
          income: incomeTotal,
          expense: expenseTotal,
          transferIn: transferInTotal,
          transferOut: transferOutTotal,
          combinedIncome,
          combinedExpense,
          netChange: netChange,
        },
        count: transactions.length,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Server Error: " + error.message,
    });
  }
};

exports.createWallet = async (req, res) => {
  try {
    const {
      name,
      type,
      icon,
      color,
      description,
      month,
      year,
      openingBalance,
    } = req.body;

    if (!name || !type) {
      return res.status(400).json({
        success: false,
        error: "Name and type are required",
      });
    }

    const currentDate = new Date();
    const selectedMonth = month || currentDate.getMonth() + 1;
    const selectedYear = year || currentDate.getFullYear();

    if (selectedMonth < 1 || selectedMonth > 12) {
      return res.status(400).json({
        success: false,
        error: "Invalid month",
      });
    }

    if (selectedYear < 2000 || selectedYear > 2100) {
      return res.status(400).json({
        success: false,
        error: "Invalid year",
      });
    }

    const existingWallet = await Wallet.findOne({
      name: name.trim(),
      userId: req.user._id,
      month: selectedMonth,
      year: selectedYear,
    });

    if (existingWallet) {
      return res.status(400).json({
        success: false,
        error: "Wallet with this name already exists for this month",
      });
    }

    const wallet = await Wallet.create({
      name: name.trim(),
      type,
      icon: icon || "wallet",
      color: color || "#3b82f6",
      description: description || "",
      openingBalance: openingBalance || 0,
      closingBalance: openingBalance || 0,
      month: selectedMonth,
      year: selectedYear,
      userId: req.user._id,
    });

    res.status(201).json({
      success: true,
      data: wallet,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        error: messages.join(", "),
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: "Wallet with this name already exists for this month",
      });
    }

    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

exports.updateWallet = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid wallet ID",
      });
    }

    const wallet = await Wallet.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!wallet) {
      return res.status(404).json({
        success: false,
        error: "Wallet not found",
      });
    }

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    if (
      wallet.year < currentYear ||
      (wallet.year === currentYear && wallet.month < currentMonth)
    ) {
      return res.status(400).json({
        success: false,
        error: "Cannot update wallets from previous months",
      });
    }

    const { name, type, icon, color, description, openingBalance } = req.body;

    if (name && name.trim() !== wallet.name) {
      const existingWallet = await Wallet.findOne({
        name: name.trim(),
        userId: req.user._id,
        month: wallet.month,
        year: wallet.year,
        _id: { $ne: req.params.id },
      });

      if (existingWallet) {
        return res.status(400).json({
          success: false,
          error: "Wallet with this name already exists for this month",
        });
      }
    }

    const updateFields = {};
    if (name) updateFields.name = name.trim();
    if (type) updateFields.type = type;
    if (icon) updateFields.icon = icon;
    if (color) updateFields.color = color;
    if (description !== undefined) updateFields.description = description;
    if (openingBalance !== undefined) {
      updateFields.openingBalance = openingBalance;
      const balanceDifference = openingBalance - (wallet.openingBalance || 0);
      updateFields.closingBalance =
        (wallet.closingBalance || 0) + balanceDifference;
    }

    const updatedWallet = await Wallet.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: updatedWallet,
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
      error: "Server Error",
    });
  }
};

exports.deleteWallet = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid wallet ID",
      });
    }

    const wallet = await Wallet.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!wallet) {
      return res.status(404).json({
        success: false,
        error: "Wallet not found",
      });
    }

    const startDate = new Date(wallet.year, wallet.month - 1, 1);
    const endDate = new Date(wallet.year, wallet.month, 0);
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    const transactionCount = await Transaction.countDocuments({
      userId: req.user._id,
      date: { $gte: startDate, $lte: endDate },
      $or: [{ from_wallet_id: wallet._id }, { to_wallet_id: wallet._id }],
    });

    if (transactionCount > 0) {
      return res.status(400).json({
        success: false,
        error:
          "Cannot delete wallet with transactions. Delete transactions first.",
      });
    }

    await Wallet.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      data: {},
      message: "Wallet deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

exports.getWalletById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid wallet ID",
      });
    }

    const wallet = await Wallet.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!wallet) {
      return res.status(404).json({
        success: false,
        error: "Wallet not found",
      });
    }

    res.status(200).json({
      success: true,
      data: wallet,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

exports.getWalletMonths = async (req, res) => {
  try {
    const months = await Wallet.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(req.user._id),
          month: { $gte: 1, $lte: 12 },
          year: { $gte: 2000, $lte: 2100 },
        },
      },
      {
        $group: {
          _id: {
            year: "$year",
            month: "$month",
          },
          count: { $sum: 1 },
        },
      },
      {
        $match: {
          "_id.year": { $ne: null },
          "_id.month": { $ne: null },
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
          walletCount: "$count",
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

exports.copyFromPreviousMonth = async (req, res) => {
  try {
    const { month, year } = req.body;

    if (!month || !year) {
      return res.status(400).json({
        success: false,
        error: "Month and year are required",
      });
    }

    let prevMonth = month - 1;
    let prevYear = year;

    if (prevMonth < 1) {
      prevMonth = 12;
      prevYear = year - 1;
    }

    const previousWallets = await Wallet.find({
      userId: req.user._id,
      month: prevMonth,
      year: prevYear,
    });

    if (previousWallets.length === 0) {
      return res.status(400).json({
        success: false,
        error: "No wallets found in previous month to copy",
      });
    }

    const existingWallets = await Wallet.find({
      userId: req.user._id,
      month: month,
      year: year,
    });

    if (existingWallets.length > 0) {
      return res.status(400).json({
        success: false,
        error: "Wallets already exist for this month",
      });
    }

    const newWallets = previousWallets.map((wallet) => ({
      name: wallet.name,
      type: wallet.type,
      icon: wallet.icon,
      color: wallet.color,
      description: wallet.description,
      openingBalance: 0,
      closingBalance: 0,
      month: month,
      year: year,
      userId: req.user._id,
    }));

    const createdWallets = await Wallet.insertMany(newWallets);

    res.status(201).json({
      success: true,
      data: createdWallets,
      message: `Copied ${createdWallets.length} wallets from ${prevMonth}/${prevYear} to ${month}/${year}`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

exports.checkWalletsExist = async (req, res) => {
  try {
    const { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({
        success: false,
        error: "Month and year are required",
      });
    }

    const walletCount = await Wallet.countDocuments({
      userId: req.user._id,
      month: parseInt(month),
      year: parseInt(year),
    });

    res.status(200).json({
      success: true,
      data: {
        exists: walletCount > 0,
        count: walletCount,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};
