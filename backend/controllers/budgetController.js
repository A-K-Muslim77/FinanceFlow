// controllers/budgetController.js
const Budget = require("../models/Budget");
const Transaction = require("../models/Transaction");
const Category = require("../models/Category");
const mongoose = require("mongoose");

exports.getMonthlyBudgets = async (req, res) => {
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

    // Get budgets for the selected month/year
    const budgets = await Budget.find({
      userId: req.user._id,
      month: selectedMonth,
      year: selectedYear,
    })
      .populate("category_id", "name type icon color")
      .lean();

    // Get start and end dates for the month
    const startDate = new Date(selectedYear, selectedMonth - 1, 1);
    const endDate = new Date(selectedYear, selectedMonth, 0);
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    // Calculate spent amounts for each budget
    const budgetMap = {};
    const categoryIds = budgets.map((budget) => budget.category_id._id);

    if (categoryIds.length > 0) {
      const expenses = await Transaction.aggregate([
        {
          $match: {
            userId: new mongoose.Types.ObjectId(req.user._id),
            type: "expense",
            date: { $gte: startDate, $lte: endDate },
            category_id: { $in: categoryIds },
          },
        },
        {
          $group: {
            _id: "$category_id",
            totalSpent: { $sum: "$amount" },
          },
        },
      ]);

      // Create a map of category_id to total spent
      const spentMap = {};
      expenses.forEach((expense) => {
        spentMap[expense._id.toString()] = expense.totalSpent;
      });

      // Combine budget data with spent amounts
      budgets.forEach((budget) => {
        const categoryId = budget.category_id._id.toString();
        const spent = spentMap[categoryId] || 0;
        const remaining = Math.max(0, budget.monthly_limit - spent);
        const percentage =
          budget.monthly_limit > 0
            ? Math.min(100, (spent / budget.monthly_limit) * 100)
            : 0;

        budgetMap[budget._id] = {
          ...budget,
          spent: spent,
          remaining: remaining,
          percentage: percentage,
          isOverBudget: spent > budget.monthly_limit,
          overBy: Math.max(0, spent - budget.monthly_limit),
        };
      });
    }

    // Calculate totals
    const totals = {
      totalBudget: budgets.reduce(
        (sum, budget) => sum + budget.monthly_limit,
        0
      ),
      totalSpent: Object.values(budgetMap).reduce(
        (sum, budget) => sum + budget.spent,
        0
      ),
      totalRemaining: Object.values(budgetMap).reduce(
        (sum, budget) => sum + budget.remaining,
        0
      ),
    };

    res.status(200).json({
      success: true,
      data: {
        budgets: Object.values(budgetMap),
        totals,
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

exports.getBudgetById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid budget ID",
      });
    }

    const budget = await Budget.findOne({
      _id: req.params.id,
      userId: req.user._id,
    }).populate("category_id", "name type icon color");

    if (!budget) {
      return res.status(404).json({
        success: false,
        error: "Budget not found",
      });
    }

    // Calculate spent amount
    const startDate = new Date(budget.year, budget.month - 1, 1);
    const endDate = new Date(budget.year, budget.month, 0);
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    const expenses = await Transaction.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(req.user._id),
          type: "expense",
          date: { $gte: startDate, $lte: endDate },
          category_id: budget.category_id._id,
        },
      },
      {
        $group: {
          _id: null,
          totalSpent: { $sum: "$amount" },
        },
      },
    ]);

    const spent = expenses.length > 0 ? expenses[0].totalSpent : 0;
    const remaining = Math.max(0, budget.monthly_limit - spent);
    const percentage =
      budget.monthly_limit > 0
        ? Math.min(100, (spent / budget.monthly_limit) * 100)
        : 0;

    res.status(200).json({
      success: true,
      data: {
        ...budget.toObject(),
        spent,
        remaining,
        percentage,
        isOverBudget: spent > budget.monthly_limit,
        overBy: Math.max(0, spent - budget.monthly_limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

exports.createBudget = async (req, res) => {
  try {
    const { category_id, monthly_limit, month, year } = req.body;

    // Validate required fields
    if (!category_id || !monthly_limit || !month || !year) {
      return res.status(400).json({
        success: false,
        error: "Category, monthly limit, month, and year are required",
      });
    }

    if (monthly_limit < 0) {
      return res.status(400).json({
        success: false,
        error: "Monthly limit must be greater than or equal to 0",
      });
    }

    // Check if category exists and belongs to user
    const category = await Category.findOne({
      _id: category_id,
      userId: req.user._id,
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        error: "Category not found or you don't have permission to use it",
      });
    }

    // Check if budget already exists for this category in this month/year
    const existingBudget = await Budget.findOne({
      category_id,
      month,
      year,
      userId: req.user._id,
    });

    if (existingBudget) {
      return res.status(400).json({
        success: false,
        error: "Budget already exists for this category in this month/year",
      });
    }

    // Create new budget
    const budget = await Budget.create({
      category_id,
      monthly_limit,
      month,
      year,
      userId: req.user._id,
    });

    const populatedBudget = await Budget.findById(budget._id).populate(
      "category_id",
      "name type icon color"
    );

    res.status(201).json({
      success: true,
      data: populatedBudget,
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
        error: "Budget already exists for this category in this month/year",
      });
    }

    res.status(500).json({
      success: false,
      error: "Server Error: " + error.message,
    });
  }
};

exports.updateBudget = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid budget ID",
      });
    }

    const budget = await Budget.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!budget) {
      return res.status(404).json({
        success: false,
        error: "Budget not found or you don't have permission to update it",
      });
    }

    const { monthly_limit, category_id, month, year } = req.body;

    if (monthly_limit !== undefined && monthly_limit < 0) {
      return res.status(400).json({
        success: false,
        error: "Monthly limit must be greater than or equal to 0",
      });
    }

    const updateFields = {};
    if (monthly_limit !== undefined) updateFields.monthly_limit = monthly_limit;
    if (category_id !== undefined) updateFields.category_id = category_id;
    if (month !== undefined) updateFields.month = month;
    if (year !== undefined) updateFields.year = year;

    // If category, month, or year is being updated, check for duplicates
    if (category_id || month || year) {
      const finalCategoryId = category_id || budget.category_id;
      const finalMonth = month || budget.month;
      const finalYear = year || budget.year;

      const existingBudget = await Budget.findOne({
        category_id: finalCategoryId,
        month: finalMonth,
        year: finalYear,
        userId: req.user._id,
        _id: { $ne: req.params.id },
      });

      if (existingBudget) {
        return res.status(400).json({
          success: false,
          error: "Budget already exists for this category in this month/year",
        });
      }
    }

    const updatedBudget = await Budget.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).populate("category_id", "name type icon color");

    res.status(200).json({
      success: true,
      data: updatedBudget,
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
        error: "Budget already exists for this category in this month/year",
      });
    }

    res.status(500).json({
      success: false,
      error: "Server Error: " + error.message,
    });
  }
};

exports.deleteBudget = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid budget ID",
      });
    }

    const budget = await Budget.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!budget) {
      return res.status(404).json({
        success: false,
        error: "Budget not found or you don't have permission to delete it",
      });
    }

    await Budget.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      data: {},
      message: "Budget deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

exports.getBudgetMonths = async (req, res) => {
  try {
    const months = await Budget.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(req.user._id),
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
          budgetCount: "$count",
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

exports.checkBudgetsExist = async (req, res) => {
  try {
    const { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({
        success: false,
        error: "Month and year are required",
      });
    }

    const budgetCount = await Budget.countDocuments({
      userId: req.user._id,
      month: parseInt(month),
      year: parseInt(year),
    });

    res.status(200).json({
      success: true,
      data: {
        exists: budgetCount > 0,
        count: budgetCount,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};
