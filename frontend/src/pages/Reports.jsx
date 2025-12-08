import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import BackgroundCircles from "../components/BackgroundCircles";
import {
  Filter,
  RotateCcw,
  TrendingUp,
  TrendingDown,
  Wallet as WalletIcon,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
  AlertCircle,
  Calendar,
  ChevronDown,
} from "lucide-react";

// Chart components
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
} from "recharts";

const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [showFilters, setShowFilters] = useState(true);

  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(
    currentDate.getMonth() + 1
  );
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  const [reportData, setReportData] = useState({
    summary: {
      totalIncome: 0,
      totalExpense: 0,
      netAmount: 0,
      avgTransaction: 0,
      incomeTransactions: 0,
      expenseTransactions: 0,
      totalTransactions: 0,
    },
    categoriesData: [],
    walletActivity: [],
    expenseCategories: [],
    availableWallets: [],
    availableCategories: [],
    transactions: [],
  });

  const [filters, setFilters] = useState({
    dateRange: {
      startDate: "",
      endDate: "",
    },
    transactionTypes: [],
    selectedWallets: [],
    selectedCategories: [],
    amountRange: {
      min: "",
      max: "",
    },
  });

  const BASE_URL = import.meta.env.VITE_BASE_URL;

  const getAuthToken = () => {
    return localStorage.getItem("token");
  };

  const getMonthName = (monthNumber) => {
    const months = [
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
    ];
    return months[monthNumber - 1];
  };

  const getShortMonthName = (monthNumber) => {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    return months[monthNumber - 1] || "";
  };

  // Calculate report data from filtered transactions
  const calculateReportDataFromTransactions = (
    transactions,
    wallets = reportData.availableWallets,
    categories = reportData.availableCategories
  ) => {
    // Calculate summary data
    const incomeTransactions = transactions.filter((t) => t.type === "income");
    const expenseTransactions = transactions.filter(
      (t) => t.type === "expense"
    );

    const totalIncome = incomeTransactions.reduce(
      (sum, t) => sum + (t.amount || 0),
      0
    );
    const totalExpense = expenseTransactions.reduce(
      (sum, t) => sum + (t.amount || 0),
      0
    );
    const netAmount = totalIncome - totalExpense;
    const totalTransactions = transactions.length;
    const avgTransaction =
      totalTransactions > 0
        ? (totalIncome + totalExpense) / totalTransactions
        : 0;

    // Calculate categories data for chart
    const categoriesMap = {};
    categories.forEach((cat) => {
      if (cat.type === "expense") {
        categoriesMap[cat._id] = {
          name: cat.name,
          income: 0,
          expense: 0,
          color: cat.color || "#3b82f6",
        };
      }
    });

    // Add income categories as well
    categories.forEach((cat) => {
      if (cat.type === "income") {
        categoriesMap[cat._id] = {
          name: cat.name,
          income: 0,
          expense: 0,
          color: cat.color || "#10b981",
        };
      }
    });

    transactions.forEach((t) => {
      const catId = t.category_id?._id || t.category_id;
      if (categoriesMap[catId]) {
        if (t.type === "income") {
          categoriesMap[catId].income += t.amount || 0;
        } else if (t.type === "expense") {
          categoriesMap[catId].expense += t.amount || 0;
        }
      }
    });

    const categoriesData = Object.values(categoriesMap)
      .filter((cat) => cat.income > 0 || cat.expense > 0)
      .sort((a, b) => b.income + b.expense - (a.income + a.expense));

    // Calculate wallet activity
    const walletActivity = wallets
      .map((wallet) => {
        const walletTransactions = transactions.filter(
          (t) =>
            t.from_wallet_id?._id === wallet._id ||
            t.to_wallet_id?._id === wallet._id ||
            t.from_wallet_id === wallet._id ||
            t.to_wallet_id === wallet._id
        );

        let balance = 0;
        walletTransactions.forEach((t) => {
          const amount = t.amount || 0;
          if (
            t.type === "income" &&
            (t.to_wallet_id?._id === wallet._id ||
              t.to_wallet_id === wallet._id)
          ) {
            balance += amount;
          } else if (
            t.type === "expense" &&
            (t.from_wallet_id?._id === wallet._id ||
              t.from_wallet_id === wallet._id)
          ) {
            balance -= amount;
          } else if (t.type === "transfer") {
            if (
              t.from_wallet_id?._id === wallet._id ||
              t.from_wallet_id === wallet._id
            ) {
              balance -= amount;
            }
            if (
              t.to_wallet_id?._id === wallet._id ||
              t.to_wallet_id === wallet._id
            ) {
              balance += amount;
            }
          }
        });

        return {
          name: wallet.name,
          value: balance,
        };
      })
      .filter((wallet) => wallet.value !== 0)
      .sort((a, b) => Math.abs(b.value) - Math.abs(a.value));

    // Calculate top expense categories
    const expenseCategoriesData = [];
    const expenseByCategory = {};

    expenseTransactions.forEach((t) => {
      const catId = t.category_id?._id || t.category_id;
      const catName = t.category_id?.name || "Uncategorized";
      if (!expenseByCategory[catId]) {
        expenseByCategory[catId] = {
          name: catName,
          value: 0,
          color: t.category_id?.color || "#3b82f6",
        };
      }
      expenseByCategory[catId].value += t.amount || 0;
    });

    Object.values(expenseByCategory)
      .sort((a, b) => b.value - a.value)
      .slice(0, 5)
      .forEach((cat, index) => {
        const colors = ["#10b981", "#14b8a6", "#6366f1", "#3b82f6", "#f97316"];
        expenseCategoriesData.push({
          ...cat,
          color: colors[index] || cat.color,
        });
      });

    // Calculate percentages for pie chart
    const totalExpenses = expenseCategoriesData.reduce(
      (sum, cat) => sum + cat.value,
      0
    );
    const expenseCategoriesWithPercentage = expenseCategoriesData.map(
      (cat) => ({
        ...cat,
        percentage: totalExpenses > 0 ? (cat.value / totalExpenses) * 100 : 0,
      })
    );

    return {
      summary: {
        totalIncome,
        totalExpense,
        netAmount,
        avgTransaction,
        incomeTransactions: incomeTransactions.length,
        expenseTransactions: expenseTransactions.length,
        totalTransactions,
      },
      categoriesData,
      walletActivity,
      expenseCategories: expenseCategoriesWithPercentage,
      availableWallets: wallets,
      availableCategories: categories,
      transactions,
    };
  };

  useEffect(() => {
    fetchReportsData();
  }, [selectedMonth, selectedYear]);

  const fetchReportsData = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = getAuthToken();

      if (!token) {
        setError("No authentication token found. Please login again.");
        setLoading(false);
        return;
      }

      // Fetch all required data in parallel
      const [transactionsRes, walletsRes, categoriesRes] = await Promise.all([
        fetch(
          `${BASE_URL}/transactions/monthly?month=${selectedMonth}&year=${selectedYear}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        ),
        fetch(
          `${BASE_URL}/wallets/monthly?month=${selectedMonth}&year=${selectedYear}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        ),
        fetch(`${BASE_URL}/categories`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }),
      ]);

      const [transactionsResult, walletsResult, categoriesResult] =
        await Promise.all([
          transactionsRes.json(),
          walletsRes.json(),
          categoriesRes.json(),
        ]);

      if (
        !transactionsResult.success ||
        !walletsResult.success ||
        !categoriesResult.success
      ) {
        throw new Error("Failed to fetch report data");
      }

      const transactions = transactionsResult.data?.transactions || [];
      const wallets = walletsResult.data?.wallets || [];
      const categories = categoriesResult.data || [];

      // Calculate initial report data
      const initialReportData = calculateReportDataFromTransactions(
        transactions,
        wallets,
        categories
      );
      setReportData(initialReportData);

      // Reset filters when new month/year is selected
      setFilters({
        dateRange: {
          startDate: "",
          endDate: "",
        },
        transactionTypes: [],
        selectedWallets: [],
        selectedCategories: [],
        amountRange: {
          min: "",
          max: "",
        },
      });
    } catch (error) {
      console.error("Error fetching reports:", error);
      setError(error.message || "Failed to load report data");
      toast.error(error.message || "Failed to load report data");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return "৳0";

    return new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "BDT",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
      .format(amount)
      .replace("BDT", "৳");
  };

  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));
  };

  const handleDateChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      dateRange: {
        ...prev.dateRange,
        [field]: value,
      },
    }));
  };

  const handleAmountChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      amountRange: {
        ...prev.amountRange,
        [field]: value,
      },
    }));
  };

  const toggleWalletSelection = (walletId) => {
    setFilters((prev) => {
      const isSelected = prev.selectedWallets.includes(walletId);
      return {
        ...prev,
        selectedWallets: isSelected
          ? prev.selectedWallets.filter((w) => w !== walletId)
          : [...prev.selectedWallets, walletId],
      };
    });
  };

  const toggleCategorySelection = (categoryId) => {
    setFilters((prev) => {
      const isSelected = prev.selectedCategories.includes(categoryId);
      return {
        ...prev,
        selectedCategories: isSelected
          ? prev.selectedCategories.filter((c) => c !== categoryId)
          : [...prev.selectedCategories, categoryId],
      };
    });
  };

  const toggleTransactionType = (type) => {
    setFilters((prev) => {
      const isSelected = prev.transactionTypes.includes(type);
      return {
        ...prev,
        transactionTypes: isSelected
          ? prev.transactionTypes.filter((t) => t !== type)
          : [...prev.transactionTypes, type],
      };
    });
  };

  const handleResetFilters = () => {
    setFilters({
      dateRange: {
        startDate: "",
        endDate: "",
      },
      transactionTypes: [],
      selectedWallets: [],
      selectedCategories: [],
      amountRange: {
        min: "",
        max: "",
      },
    });

    // Reset to original data
    fetchReportsData();
    toast.success("Filters reset successfully");
  };

  const handleApplyFilters = () => {
    // Get all transactions from current month
    const allTransactions = [...reportData.transactions];

    // If no filters are applied, reset to original data
    const hasActiveFilters =
      filters.transactionTypes.length > 0 ||
      filters.selectedWallets.length > 0 ||
      filters.selectedCategories.length > 0 ||
      filters.amountRange.min ||
      filters.amountRange.max ||
      filters.dateRange.startDate ||
      filters.dateRange.endDate;

    if (!hasActiveFilters) {
      fetchReportsData();
      toast.info("No filters applied. Showing all transactions.");
      return;
    }

    // Apply filters one by one
    let filtered = allTransactions;

    // Filter by transaction type
    if (filters.transactionTypes.length > 0) {
      filtered = filtered.filter((t) =>
        filters.transactionTypes.includes(t.type)
      );
    }

    // Filter by wallets
    if (filters.selectedWallets.length > 0) {
      filtered = filtered.filter((t) => {
        const fromWallet = t.from_wallet_id?._id || t.from_wallet_id;
        const toWallet = t.to_wallet_id?._id || t.to_wallet_id;
        return (
          filters.selectedWallets.includes(fromWallet?.toString()) ||
          filters.selectedWallets.includes(toWallet?.toString())
        );
      });
    }

    // Filter by categories (only for income/expense, not transfers)
    if (filters.selectedCategories.length > 0) {
      filtered = filtered.filter((t) => {
        if (t.type === "transfer") return true; // Keep transfers
        const categoryId = t.category_id?._id || t.category_id;
        return (
          categoryId &&
          filters.selectedCategories.includes(categoryId.toString())
        );
      });
    }

    // Filter by amount range
    if (filters.amountRange.min) {
      const minAmount = parseFloat(filters.amountRange.min);
      filtered = filtered.filter((t) => t.amount >= minAmount);
    }
    if (filters.amountRange.max) {
      const maxAmount = parseFloat(filters.amountRange.max);
      filtered = filtered.filter((t) => t.amount <= maxAmount);
    }

    // Filter by date range
    if (filters.dateRange.startDate) {
      const startDate = new Date(filters.dateRange.startDate);
      startDate.setHours(0, 0, 0, 0);
      filtered = filtered.filter((t) => new Date(t.date) >= startDate);
    }
    if (filters.dateRange.endDate) {
      const endDate = new Date(filters.dateRange.endDate);
      endDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter((t) => new Date(t.date) <= endDate);
    }

    // Recalculate all report data from filtered transactions
    const newReportData = calculateReportDataFromTransactions(
      filtered,
      reportData.availableWallets,
      reportData.availableCategories
    );
    setReportData(newReportData);

    toast.success(`Filters applied: ${filtered.length} transactions found`);
  };

  const clearError = () => {
    setError(null);
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-slate-200 rounded-lg shadow-lg">
          <p className="font-semibold text-slate-900">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading && !reportData.summary.totalTransactions) {
    return (
      <div className="min-h-screen relative">
        <div className="fixed inset-0 z-0">
          <BackgroundCircles />
        </div>
        <div className="flex items-center justify-center min-h-screen relative z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-slate-600">Loading reports...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />

      <div className="fixed inset-0 z-0">
        <BackgroundCircles />
      </div>

      <div className="width-full mx-auto px-4 sm:px-6 lg:px-8 py-6 relative z-10">
        <div className="space-y-6 pb-20 lg:pb-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Advanced Reports
              </h1>
              <p className="text-slate-600 mt-1">
                Detailed financial insights and analytics
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Month Selector */}
              <div className="w-32">
                <div className="relative">
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                    disabled={loading}
                    className="w-full appearance-none rounded-lg border border-slate-200 bg-white py-2 pl-4 pr-10 text-sm text-slate-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 disabled:opacity-50"
                  >
                    {Array.from({ length: 12 }, (_, i) => {
                      const month = i + 1;
                      return (
                        <option key={month} value={month}>
                          {getMonthName(month)}
                        </option>
                      );
                    })}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Year Selector */}
              <div className="w-28">
                <div className="relative">
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                    disabled={loading}
                    className="w-full appearance-none rounded-lg border border-slate-200 bg-white py-2 pl-4 pr-10 text-sm text-slate-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 disabled:opacity-50"
                  >
                    {Array.from({ length: 5 }, (_, i) => {
                      const year = new Date().getFullYear() - 2 + i;
                      return (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      );
                    })}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Filter Toggle Button */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-9 px-4 py-2 shadow-lg bg-green-600 text-white hover:bg-green-700"
              >
                <Filter className="w-4 h-4 mr-2" />
                {showFilters ? "Hide Filters" : "Show Filters"}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm">{error}</span>
                <button
                  onClick={clearError}
                  className="text-red-500 hover:text-red-700 text-lg font-bold"
                >
                  ×
                </button>
              </div>
            </div>
          )}

          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rounded-xl text-card-foreground bg-white border-0 shadow-sm">
              <div className="p-4">
                <p className="text-xs text-green-700 mb-1">Total Income</p>
                <p className="text-2xl font-bold text-green-900">
                  {formatCurrency(reportData.summary.totalIncome)}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  {reportData.summary.incomeTransactions} transactions
                </p>
              </div>
            </div>

            <div className="rounded-xl text-card-foreground bg-white border-0 shadow-sm">
              <div className="p-4">
                <p className="text-xs text-red-700 mb-1">Total Expense</p>
                <p className="text-2xl font-bold text-red-900">
                  {formatCurrency(reportData.summary.totalExpense)}
                </p>
                <p className="text-xs text-red-600 mt-1">
                  {reportData.summary.expenseTransactions} transactions
                </p>
              </div>
            </div>

            <div className="rounded-xl text-card-foreground bg-white border-0 shadow-sm">
              <div className="p-4">
                <p className="text-xs text-blue-700 mb-1">Net Amount</p>
                <p className="text-2xl font-bold text-blue-900">
                  {formatCurrency(reportData.summary.netAmount)}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  {reportData.summary.netAmount >= 0 ? "Surplus" : "Deficit"}
                </p>
              </div>
            </div>

            <div className="rounded-xl text-card-foreground bg-white border-0 shadow-sm">
              <div className="p-4">
                <p className="text-xs text-purple-700 mb-1">Avg Transaction</p>
                <p className="text-2xl font-bold text-purple-900">
                  {formatCurrency(reportData.summary.avgTransaction)}
                </p>
                <p className="text-xs text-purple-600 mt-1">
                  {reportData.summary.totalTransactions} total
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Filters Panel */}
            {showFilters && (
              <div className="lg:col-span-1">
                <div className="rounded-xl border bg-card text-card-foreground shadow">
                  <div className="flex flex-col space-y-1.5 p-6 pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Filter className="w-5 h-5 text-blue-600" />
                        <div className="font-semibold leading-none tracking-tight">
                          Advanced Filters
                        </div>
                      </div>
                      <button
                        onClick={handleResetFilters}
                        className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-8 px-3 text-slate-700 hover:bg-slate-100"
                      >
                        <RotateCcw className="w-4 h-4 mr-1" />
                        Reset
                      </button>
                    </div>
                  </div>

                  <div className="p-6 pt-0 space-y-6">
                    {/* Date Range */}
                    <div>
                      <label className="peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-sm font-semibold text-slate-700 mb-3 block">
                        Date Range
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label
                            className="font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-xs text-slate-600"
                            htmlFor="startDate"
                          >
                            Start Date
                          </label>
                          <input
                            type="date"
                            className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm transition-colors focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
                            id="startDate"
                            value={filters.dateRange.startDate}
                            onChange={(e) =>
                              handleDateChange("startDate", e.target.value)
                            }
                          />
                        </div>
                        <div>
                          <label
                            className="font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-xs text-slate-600"
                            htmlFor="endDate"
                          >
                            End Date
                          </label>
                          <input
                            type="date"
                            className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm transition-colors focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
                            id="endDate"
                            value={filters.dateRange.endDate}
                            onChange={(e) =>
                              handleDateChange("endDate", e.target.value)
                            }
                          />
                        </div>
                      </div>
                    </div>

                    {/* Transaction Type */}
                    <div>
                      <label className="peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-sm font-semibold text-slate-700 mb-3 block">
                        Transaction Type
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {["income", "expense", "transfer"].map((type) => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => toggleTransactionType(type)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                              filters.transactionTypes.includes(type)
                                ? "bg-green-600 text-white"
                                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                            }`}
                          >
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Wallets */}
                    {reportData.availableWallets.length > 0 && (
                      <div>
                        <label className="peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-sm font-semibold text-slate-700 mb-3 block">
                          Wallets ({filters.selectedWallets.length} selected)
                        </label>
                        <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-1">
                          {reportData.availableWallets.map((wallet) => (
                            <button
                              key={wallet._id}
                              type="button"
                              onClick={() => toggleWalletSelection(wallet._id)}
                              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all border ${
                                filters.selectedWallets.includes(wallet._id)
                                  ? "border-green-600 bg-green-50 text-green-700"
                                  : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                              }`}
                            >
                              {wallet.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Categories */}
                    {reportData.availableCategories.length > 0 && (
                      <div>
                        <label className="peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-sm font-semibold text-slate-700 mb-3 block">
                          Categories ({filters.selectedCategories.length}{" "}
                          selected)
                        </label>
                        <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-1">
                          {reportData.availableCategories.map((category) => (
                            <button
                              key={category._id}
                              type="button"
                              onClick={() =>
                                toggleCategorySelection(category._id)
                              }
                              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all border ${
                                filters.selectedCategories.includes(
                                  category._id
                                )
                                  ? "border-green-600 bg-green-50 text-green-700"
                                  : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                              }`}
                            >
                              {category.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Amount Range */}
                    <div>
                      <label className="peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-sm font-semibold text-slate-700 mb-3 block">
                        Amount Range
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label
                            className="font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-xs text-slate-600"
                            htmlFor="minAmount"
                          >
                            Minimum Amount
                          </label>
                          <input
                            type="number"
                            className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm transition-colors focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
                            id="minAmount"
                            step="0.01"
                            placeholder="৳ 0.00"
                            value={filters.amountRange.min}
                            onChange={(e) =>
                              handleAmountChange("min", e.target.value)
                            }
                          />
                        </div>
                        <div>
                          <label
                            className="font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-xs text-slate-600"
                            htmlFor="maxAmount"
                          >
                            Maximum Amount
                          </label>
                          <input
                            type="number"
                            className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm transition-colors focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
                            id="maxAmount"
                            step="0.01"
                            placeholder="৳ 0.00"
                            value={filters.amountRange.max}
                            onChange={(e) =>
                              handleAmountChange("max", e.target.value)
                            }
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={handleApplyFilters}
                      className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-9 px-4 py-2 w-full shadow-lg bg-green-600 text-white hover:bg-green-700"
                    >
                      Apply Filters
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Charts and Reports */}
            <div
              className={`${showFilters ? "lg:col-span-3" : "lg:col-span-4"}`}
            >
              {/* Month Info */}
              <div className="bg-white rounded-xl p-4 border-0 shadow-sm mb-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">
                      {getMonthName(selectedMonth)} {selectedYear}
                    </h3>
                    <p className="text-sm text-slate-600">
                      {reportData.summary.totalTransactions > 0
                        ? `Showing insights from ${reportData.summary.totalTransactions} transactions`
                        : "No data available for this month"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {/* Tabs */}
                <div className="bg-white rounded-xl p-4 border-0 shadow-sm">
                  <div className="h-9 items-center justify-center rounded-lg p-1 text-muted-foreground grid w-full grid-cols-2">
                    <button
                      type="button"
                      onClick={() => setActiveTab("overview")}
                      className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer ${
                        activeTab === "overview"
                          ? "bg-green-500 text-white shadow"
                          : "hover:bg-slate-100"
                      }`}
                    >
                      Overview & Charts
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab("details")}
                      className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer ${
                        activeTab === "details"
                          ? "bg-green-500 text-white shadow"
                          : "hover:bg-slate-100"
                      }`}
                    >
                      Transaction Details
                    </button>
                  </div>
                </div>

                {/* Charts Content */}
                {activeTab === "overview" && (
                  <div className="space-y-6">
                    {/* Income vs Expense Chart */}
                    {reportData.categoriesData.length > 0 ? (
                      <div className="rounded-xl border bg-card text-card-foreground shadow">
                        <div className="flex flex-col space-y-1.5 p-6">
                          <div className="font-semibold leading-none tracking-tight">
                            Income vs Expense by Category
                          </div>
                          <p className="text-sm text-slate-600">
                            Comparison of income and expense for each category
                          </p>
                        </div>
                        <div className="p-6 pt-0">
                          <ResponsiveContainer width="100%" height={400}>
                            <RechartsBarChart
                              data={reportData.categoriesData}
                              margin={{
                                top: 20,
                                right: 30,
                                left: 20,
                                bottom: 80,
                              }}
                            >
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis
                                dataKey="name"
                                angle={-45}
                                textAnchor="end"
                                height={80}
                                interval={0}
                              />
                              <YAxis />
                              <Tooltip content={<CustomTooltip />} />
                              <Legend />
                              <Bar
                                dataKey="income"
                                name="Income"
                                fill="#10b981"
                                radius={[8, 8, 0, 0]}
                              />
                              <Bar
                                dataKey="expense"
                                name="Expense"
                                fill="#ef4444"
                                radius={[8, 8, 0, 0]}
                              />
                            </RechartsBarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-xl border bg-card text-card-foreground shadow">
                        <div className="p-6">
                          <div className="text-center py-12">
                            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                              <BarChartIcon className="w-8 h-8 text-slate-400" />
                            </div>
                            <p className="text-slate-500 text-lg mb-2">
                              No category data available
                            </p>
                            <p className="text-slate-400">
                              No transactions found for the selected filters
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Bottom Charts Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Wallet Activity */}
                      {reportData.walletActivity.length > 0 ? (
                        <div className="rounded-xl border bg-card text-card-foreground shadow">
                          <div className="flex flex-col space-y-1.5 p-6">
                            <div className="font-semibold leading-none tracking-tight">
                              Wallet Activity
                            </div>
                            <p className="text-sm text-slate-600">
                              Net balance per wallet
                            </p>
                          </div>
                          <div className="p-6 pt-0">
                            <ResponsiveContainer width="100%" height={300}>
                              <RechartsBarChart
                                data={reportData.walletActivity}
                                layout="vertical"
                                margin={{
                                  top: 5,
                                  right: 30,
                                  left: 20,
                                  bottom: 5,
                                }}
                              >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" />
                                <YAxis
                                  type="category"
                                  dataKey="name"
                                  width={100}
                                />
                                <Tooltip
                                  formatter={(value) => [
                                    formatCurrency(value),
                                    "Balance",
                                  ]}
                                />
                                <Bar
                                  dataKey="value"
                                  fill="#3b82f6"
                                  radius={[0, 4, 4, 0]}
                                />
                              </RechartsBarChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      ) : (
                        <div className="rounded-xl border bg-card text-card-foreground shadow">
                          <div className="p-6">
                            <div className="text-center py-12">
                              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <WalletIcon className="w-8 h-8 text-slate-400" />
                              </div>
                              <p className="text-slate-500 text-lg mb-2">
                                No wallet activity data
                              </p>
                              <p className="text-slate-400">
                                No transaction data available for wallets
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Top Expense Categories */}
                      {reportData.expenseCategories.length > 0 ? (
                        <div className="rounded-xl border bg-card text-card-foreground shadow">
                          <div className="flex flex-col space-y-1.5 p-6">
                            <div className="font-semibold leading-none tracking-tight">
                              Top Expense Categories
                            </div>
                            <p className="text-sm text-slate-600">
                              Highest spending categories
                            </p>
                          </div>
                          <div className="p-6 pt-0">
                            <div className="flex flex-col lg:flex-row items-center gap-6">
                              <ResponsiveContainer width="100%" height={250}>
                                <RechartsPieChart>
                                  <Pie
                                    data={reportData.expenseCategories}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={true}
                                    label={({ name, percentage }) =>
                                      `${name}: ${percentage.toFixed(1)}%`
                                    }
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                  >
                                    {reportData.expenseCategories.map(
                                      (entry, index) => (
                                        <Cell
                                          key={`cell-${index}`}
                                          fill={entry.color}
                                        />
                                      )
                                    )}
                                  </Pie>
                                  <Tooltip
                                    formatter={(value) => formatCurrency(value)}
                                  />
                                </RechartsPieChart>
                              </ResponsiveContainer>

                              <div className="grid grid-cols-1 gap-2 w-full lg:w-1/2">
                                {reportData.expenseCategories.map(
                                  (category) => (
                                    <div
                                      key={category.name}
                                      className="flex items-center gap-2 text-sm"
                                    >
                                      <div
                                        className="w-3 h-3 rounded-full"
                                        style={{
                                          backgroundColor: category.color,
                                        }}
                                      />
                                      <span className="text-slate-700 truncate flex-1">
                                        {category.name}
                                      </span>
                                      <span className="text-slate-500 ml-auto">
                                        {formatCurrency(category.value)}
                                      </span>
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="rounded-xl border bg-card text-card-foreground shadow">
                          <div className="p-6">
                            <div className="text-center py-12">
                              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <PieChartIcon className="w-8 h-8 text-slate-400" />
                              </div>
                              <p className="text-slate-500 text-lg mb-2">
                                No expense category data
                              </p>
                              <p className="text-slate-400">
                                No expense transactions found
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Transaction Details Tab */}
                {activeTab === "details" && (
                  <div className="rounded-xl border bg-card text-card-foreground shadow">
                    <div className="flex flex-col space-y-1.5 p-6">
                      <div className="font-semibold leading-none tracking-tight">
                        Transaction Details
                      </div>
                      <p className="text-sm text-slate-600">
                        Detailed view of filtered transactions
                      </p>
                    </div>
                    <div className="p-6 pt-0">
                      {reportData.transactions.length > 0 ? (
                        <div className="space-y-3">
                          {reportData.transactions.map((transaction) => (
                            <div
                              key={transaction._id}
                              className="p-4 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium text-slate-900">
                                    {transaction.category_id?.name ||
                                      "Uncategorized"}
                                  </p>
                                  <p className="text-sm text-slate-600">
                                    {new Date(
                                      transaction.date
                                    ).toLocaleDateString()}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p
                                    className={`font-bold ${
                                      transaction.type === "income"
                                        ? "text-green-600"
                                        : transaction.type === "expense"
                                        ? "text-red-600"
                                        : "text-blue-600"
                                    }`}
                                  >
                                    {transaction.type === "income"
                                      ? "+"
                                      : transaction.type === "expense"
                                      ? "-"
                                      : ""}
                                    {formatCurrency(transaction.amount)}
                                  </p>
                                  <p className="text-xs text-slate-500 capitalize">
                                    {transaction.type}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertCircle className="w-8 h-8 text-slate-400" />
                          </div>
                          <p className="text-slate-500 text-lg mb-2">
                            No transaction details available
                          </p>
                          <p className="text-slate-400">
                            No transactions found for{" "}
                            {getMonthName(selectedMonth)} {selectedYear}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
