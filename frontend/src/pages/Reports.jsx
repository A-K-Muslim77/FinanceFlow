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
  ChevronRight,
  ChevronLeft,
  Menu,
  X,
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
  const [showFilters, setShowFilters] = useState(false); // Changed to false for mobile
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(
    currentDate.getMonth() + 1
  );
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  // Store original transactions separately
  const [originalTransactions, setOriginalTransactions] = useState([]);
  const [originalWallets, setOriginalWallets] = useState([]);
  const [originalCategories, setOriginalCategories] = useState([]);

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

  const [dateInputs, setDateInputs] = useState({
    startDate: "",
    endDate: "",
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
    return months[monthNumber - 1];
  };

  // Format date to dd/mm/yyyy
  const formatDateToDDMMYYYY = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;

      const day = date.getDate().toString().padStart(2, "0");
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return dateString;
    }
  };

  // Convert dd/mm/yyyy to Date object
  const parseDDMMYYYY = (dateString) => {
    if (!dateString) return null;
    try {
      const parts = dateString.split("/");
      if (parts.length !== 3) return null;

      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const year = parseInt(parts[2], 10);

      if (day < 1 || day > 31 || month < 0 || month > 11) return null;

      const date = new Date(year, month, day);
      if (isNaN(date.getTime())) return null;
      if (
        date.getDate() !== day ||
        date.getMonth() !== month ||
        date.getFullYear() !== year
      ) {
        return null;
      }

      return date;
    } catch {
      return null;
    }
  };

  // Validate dd/mm/yyyy format
  const isValidDDMMYYYY = (dateString) => {
    return parseDDMMYYYY(dateString) !== null;
  };

  // Calculate report data from filtered transactions
  const calculateReportDataFromTransactions = (
    transactions,
    wallets = originalWallets,
    categories = originalCategories
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

      // Store original data
      setOriginalTransactions(transactions);
      setOriginalWallets(wallets);
      setOriginalCategories(categories);

      // Calculate initial report data with all transactions
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

      // Reset date inputs
      setDateInputs({
        startDate: "",
        endDate: "",
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

  const handleDateInputChange = (field, value) => {
    setDateInputs((prev) => ({
      ...prev,
      [field]: value,
    }));

    const date = parseDDMMYYYY(value);
    if (date) {
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, "0");
      const dd = String(date.getDate()).padStart(2, "0");
      const yyyyMmDd = `${yyyy}-${mm}-${dd}`;

      setFilters((prev) => ({
        ...prev,
        dateRange: {
          ...prev.dateRange,
          [field]: yyyyMmDd,
        },
      }));
    } else if (value === "") {
      setFilters((prev) => ({
        ...prev,
        dateRange: {
          ...prev.dateRange,
          [field]: "",
        },
      }));
    }
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

    setDateInputs({
      startDate: "",
      endDate: "",
    });

    const resetReportData = calculateReportDataFromTransactions(
      originalTransactions,
      originalWallets,
      originalCategories
    );
    setReportData(resetReportData);

    toast.success("Filters reset successfully");
  };

  const handleApplyFilters = () => {
    const allTransactions = [...originalTransactions];

    const hasActiveFilters =
      filters.transactionTypes.length > 0 ||
      filters.selectedWallets.length > 0 ||
      filters.selectedCategories.length > 0 ||
      filters.amountRange.min ||
      filters.amountRange.max ||
      filters.dateRange.startDate ||
      filters.dateRange.endDate;

    if (!hasActiveFilters) {
      const resetReportData = calculateReportDataFromTransactions(
        originalTransactions,
        originalWallets,
        originalCategories
      );
      setReportData(resetReportData);
      toast.info("No filters applied. Showing all transactions.");
      return;
    }

    let filtered = allTransactions;

    if (filters.transactionTypes.length > 0) {
      filtered = filtered.filter((t) =>
        filters.transactionTypes.includes(t.type)
      );
    }

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

    if (filters.selectedCategories.length > 0) {
      filtered = filtered.filter((t) => {
        if (t.type === "transfer") return true;
        const categoryId = t.category_id?._id || t.category_id;
        return (
          categoryId &&
          filters.selectedCategories.includes(categoryId.toString())
        );
      });
    }

    if (filters.amountRange.min) {
      const minAmount = parseFloat(filters.amountRange.min);
      filtered = filtered.filter((t) => t.amount >= minAmount);
    }
    if (filters.amountRange.max) {
      const maxAmount = parseFloat(filters.amountRange.max);
      filtered = filtered.filter((t) => t.amount <= maxAmount);
    }

    if (filters.dateRange.startDate) {
      const startDate = new Date(filters.dateRange.startDate);
      startDate.setHours(0, 0, 0, 0);
      filtered = filtered.filter((t) => {
        const transactionDate = new Date(t.date);
        transactionDate.setHours(0, 0, 0, 0);
        return transactionDate >= startDate;
      });
    }
    if (filters.dateRange.endDate) {
      const endDate = new Date(filters.dateRange.endDate);
      endDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter((t) => {
        const transactionDate = new Date(t.date);
        transactionDate.setHours(23, 59, 59, 999);
        return transactionDate <= endDate;
      });
    }

    const newReportData = calculateReportDataFromTransactions(
      filtered,
      originalWallets,
      originalCategories
    );
    setReportData(newReportData);

    toast.success(`Filters applied: ${filtered.length} transactions found`);

    // Close filters on mobile after applying
    if (window.innerWidth < 1024) {
      setShowFilters(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 sm:p-3 border border-slate-200 rounded-lg shadow-lg max-w-[200px] sm:max-w-none">
          <p className="font-semibold text-slate-900 text-xs sm:text-sm mb-1 sm:mb-2">
            {label}
          </p>
          {payload.map((entry, index) => (
            <p
              key={index}
              className="text-xs sm:text-sm"
              style={{ color: entry.color }}
            >
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const handlePreviousMonth = () => {
    let newMonth = selectedMonth - 1;
    let newYear = selectedYear;

    if (newMonth < 1) {
      newMonth = 12;
      newYear = selectedYear - 1;
    }

    setSelectedMonth(newMonth);
    setSelectedYear(newYear);
  };

  const handleNextMonth = () => {
    let newMonth = selectedMonth + 1;
    let newYear = selectedYear;

    if (newMonth > 12) {
      newMonth = 1;
      newYear = selectedYear + 1;
    }

    setSelectedMonth(newMonth);
    setSelectedYear(newYear);
  };

  if (loading && !reportData.summary.totalTransactions) {
    return (
      <div className="min-h-screen relative">
        <div className="fixed inset-0 z-0">
          <BackgroundCircles />
        </div>
        <div className="flex items-center justify-center min-h-screen relative z-10 px-4">
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
        className="!z-50"
      />

      <div className="fixed inset-0 z-0">
        <BackgroundCircles />
      </div>

      <div className="w-full mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 relative z-10">
        <div className="space-y-4 sm:space-y-6 pb-16 sm:pb-20">
          {/* Mobile Header */}
          <div className="lg:hidden space-y-3 px-2 sm:px-0">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-slate-900">Reports</h1>
                <p className="text-xs text-slate-600 mt-0.5">
                  Financial insights & analytics
                </p>
              </div>
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="p-2 rounded-lg bg-white border border-slate-200"
              >
                {showMobileMenu ? (
                  <X className="w-5 h-5 text-slate-600" />
                ) : (
                  <Menu className="w-5 h-5 text-slate-600" />
                )}
              </button>
            </div>

            {/* Mobile Month Navigation */}
            <div className="bg-white rounded-xl p-3 border-0 shadow-sm">
              <div className="flex items-center justify-between">
                <button
                  onClick={handlePreviousMonth}
                  className="p-2 rounded-lg hover:bg-slate-100"
                >
                  <ChevronLeft className="w-5 h-5 text-slate-600" />
                </button>

                <div className="text-center">
                  <p className="font-semibold text-slate-900 text-sm">
                    {getShortMonthName(selectedMonth)} {selectedYear}
                  </p>
                  <p className="text-xs text-slate-500">
                    Tap filters to change
                  </p>
                </div>

                <button
                  onClick={handleNextMonth}
                  className="p-2 rounded-lg hover:bg-slate-100"
                >
                  <ChevronRight className="w-5 h-5 text-slate-600" />
                </button>
              </div>
            </div>

            {/* Mobile Quick Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex-1 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-9 px-3 py-2 shadow-lg bg-green-600 text-white hover:bg-green-700"
              >
                <Filter className="w-4 h-4" />
                <span>{showFilters ? "Hide Filters" : "Show Filters"}</span>
              </button>
            </div>

            {/* Mobile Menu Dropdown */}
            {showMobileMenu && (
              <div className="bg-white rounded-xl p-4 border-0 shadow-lg">
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">
                      Month
                    </label>
                    <select
                      value={selectedMonth}
                      onChange={(e) =>
                        setSelectedMonth(parseInt(e.target.value))
                      }
                      disabled={loading}
                      className="w-full appearance-none rounded-lg border border-slate-200 bg-white py-2 pl-3 pr-8 text-sm text-slate-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 disabled:opacity-50"
                    >
                      {Array.from({ length: 12 }, (_, i) => {
                        const month = i + 1;
                        return (
                          <option key={month} value={month}>
                            {getShortMonthName(month)}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">
                      Year
                    </label>
                    <select
                      value={selectedYear}
                      onChange={(e) =>
                        setSelectedYear(parseInt(e.target.value))
                      }
                      disabled={loading}
                      className="w-full appearance-none rounded-lg border border-slate-200 bg-white py-2 pl-3 pr-8 text-sm text-slate-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 disabled:opacity-50"
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
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Desktop Header */}
          <div className="hidden lg:block px-2 sm:px-0">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900">
                  Advanced Reports
                </h1>
                <p className="text-sm text-slate-600 mt-0.5 sm:mt-1">
                  Detailed financial insights and analytics
                </p>
              </div>

              <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                <div className="w-28 sm:w-32">
                  <div className="relative">
                    <select
                      value={selectedMonth}
                      onChange={(e) =>
                        setSelectedMonth(parseInt(e.target.value))
                      }
                      disabled={loading}
                      className="w-full appearance-none rounded-lg border border-slate-200 bg-white py-2 pl-3 sm:pl-4 pr-8 sm:pr-10 text-sm text-slate-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 disabled:opacity-50"
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
                    <ChevronDown className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 w-3 sm:w-4 h-3 sm:h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                <div className="w-24 sm:w-28">
                  <div className="relative">
                    <select
                      value={selectedYear}
                      onChange={(e) =>
                        setSelectedYear(parseInt(e.target.value))
                      }
                      disabled={loading}
                      className="w-full appearance-none rounded-lg border border-slate-200 bg-white py-2 pl-3 sm:pl-4 pr-8 sm:pr-10 text-sm text-slate-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 disabled:opacity-50"
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
                    <ChevronDown className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 w-3 sm:w-4 h-3 sm:h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-9 px-3 sm:px-4 py-2 shadow-lg bg-green-600 text-white hover:bg-green-700"
                >
                  <Filter className="w-4 h-4" />
                  {showFilters ? "Hide Filters" : "Show Filters"}
                </button>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mx-2 sm:mx-0">
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

          {/* Summary Cards - Mobile Optimized */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 px-2 sm:px-0">
            <div className="rounded-xl text-card-foreground bg-white border-0 shadow-sm">
              <div className="p-3 sm:p-4">
                <p className="text-xs text-green-700 mb-1">Total Income</p>
                <p className="text-lg sm:text-xl md:text-2xl font-bold text-green-900 truncate">
                  {formatCurrency(reportData.summary.totalIncome)}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  {reportData.summary.incomeTransactions} txns
                </p>
              </div>
            </div>

            <div className="rounded-xl text-card-foreground bg-white border-0 shadow-sm">
              <div className="p-3 sm:p-4">
                <p className="text-xs text-red-700 mb-1">Total Expense</p>
                <p className="text-lg sm:text-xl md:text-2xl font-bold text-red-900 truncate">
                  {formatCurrency(reportData.summary.totalExpense)}
                </p>
                <p className="text-xs text-red-600 mt-1">
                  {reportData.summary.expenseTransactions} txns
                </p>
              </div>
            </div>

            <div className="rounded-xl text-card-foreground bg-white border-0 shadow-sm">
              <div className="p-3 sm:p-4">
                <p className="text-xs text-blue-700 mb-1">Net Amount</p>
                <p className="text-lg sm:text-xl md:text-2xl font-bold text-blue-900 truncate">
                  {formatCurrency(reportData.summary.netAmount)}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  {reportData.summary.netAmount >= 0 ? "Surplus" : "Deficit"}
                </p>
              </div>
            </div>

            <div className="rounded-xl text-card-foreground bg-white border-0 shadow-sm">
              <div className="p-3 sm:p-4">
                <p className="text-xs text-purple-700 mb-1">Avg Transaction</p>
                <p className="text-lg sm:text-xl md:text-2xl font-bold text-purple-900 truncate">
                  {formatCurrency(reportData.summary.avgTransaction)}
                </p>
                <p className="text-xs text-purple-600 mt-1">
                  {reportData.summary.totalTransactions} total
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* Filters Panel - Mobile Overlay */}
            {showFilters && (
              <div className="lg:col-span-1">
                <div className="fixed inset-0 z-40 bg-black/50 lg:bg-transparent lg:relative lg:inset-auto lg:z-auto">
                  <div className="fixed inset-y-0 left-0 z-50 w-full max-w-xs bg-white shadow-xl lg:relative lg:inset-auto lg:shadow-none lg:w-full lg:max-w-none lg:bg-transparent">
                    <div className="h-full overflow-y-auto">
                      <div className="rounded-xl border bg-card text-card-foreground shadow lg:shadow-none lg:border lg:bg-white">
                        {/* Mobile Header */}
                        <div className="flex items-center justify-between p-4 border-b lg:hidden">
                          <h2 className="text-lg font-semibold">Filters</h2>
                          <button
                            onClick={() => setShowFilters(false)}
                            className="p-2 rounded-lg hover:bg-slate-100"
                          >
                            <X className="w-5 h-5 text-slate-600" />
                          </button>
                        </div>

                        <div className="flex flex-col space-y-1.5 p-4 sm:p-6 sm:pb-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Filter className="w-5 h-5 text-blue-600" />
                              <div className="font-semibold leading-none tracking-tight text-sm sm:text-base">
                                Advanced Filters
                              </div>
                            </div>
                            <button
                              onClick={handleResetFilters}
                              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-8 px-2 sm:px-3 text-slate-700 hover:bg-slate-100"
                            >
                              <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" />
                              <span className="hidden sm:inline">Reset</span>
                            </button>
                          </div>
                        </div>

                        <div className="p-4 sm:p-6 sm:pt-0 space-y-4 sm:space-y-6">
                          {/* Date Range */}
                          <div>
                            <label className="peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-xs sm:text-sm font-semibold text-slate-700 mb-2 sm:mb-3 block">
                              Date Range
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                              <div>
                                <label
                                  className="font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-xs text-slate-600"
                                  htmlFor="startDate"
                                >
                                  Start Date
                                </label>
                                <input
                                  type="text"
                                  className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm transition-colors focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
                                  id="startDate"
                                  placeholder="dd/mm/yyyy"
                                  value={dateInputs.startDate}
                                  onChange={(e) =>
                                    handleDateInputChange(
                                      "startDate",
                                      e.target.value
                                    )
                                  }
                                />
                                {dateInputs.startDate &&
                                  !isValidDDMMYYYY(dateInputs.startDate) && (
                                    <p className="text-xs text-red-500 mt-1">
                                      Invalid format
                                    </p>
                                  )}
                              </div>
                              <div>
                                <label
                                  className="font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-xs text-slate-600"
                                  htmlFor="endDate"
                                >
                                  End Date
                                </label>
                                <input
                                  type="text"
                                  className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm transition-colors focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
                                  id="endDate"
                                  placeholder="dd/mm/yyyy"
                                  value={dateInputs.endDate}
                                  onChange={(e) =>
                                    handleDateInputChange(
                                      "endDate",
                                      e.target.value
                                    )
                                  }
                                />
                                {dateInputs.endDate &&
                                  !isValidDDMMYYYY(dateInputs.endDate) && (
                                    <p className="text-xs text-red-500 mt-1">
                                      Invalid format
                                    </p>
                                  )}
                              </div>
                            </div>
                          </div>

                          {/* Transaction Type */}
                          <div>
                            <label className="peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-xs sm:text-sm font-semibold text-slate-700 mb-2 sm:mb-3 block">
                              Transaction Type
                            </label>
                            <div className="flex flex-wrap gap-1.5 sm:gap-2">
                              {["income", "expense", "transfer"].map((type) => (
                                <button
                                  key={type}
                                  type="button"
                                  onClick={() => toggleTransactionType(type)}
                                  className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all flex-1 sm:flex-none ${
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
                          {originalWallets.length > 0 && (
                            <div>
                              <label className="peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-xs sm:text-sm font-semibold text-slate-700 mb-2 sm:mb-3 block">
                                Wallets ({filters.selectedWallets.length})
                              </label>
                              <div className="flex flex-wrap gap-1.5 sm:gap-2 max-h-32 overflow-y-auto p-1">
                                {originalWallets.map((wallet) => (
                                  <button
                                    key={wallet._id}
                                    type="button"
                                    onClick={() =>
                                      toggleWalletSelection(wallet._id)
                                    }
                                    className={`px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all border ${
                                      filters.selectedWallets.includes(
                                        wallet._id
                                      )
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
                          {originalCategories.length > 0 && (
                            <div>
                              <label className="peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-xs sm:text-sm font-semibold text-slate-700 mb-2 sm:mb-3 block">
                                Categories ({filters.selectedCategories.length})
                              </label>
                              <div className="flex flex-wrap gap-1.5 sm:gap-2 max-h-32 overflow-y-auto p-1">
                                {originalCategories.map((category) => (
                                  <button
                                    key={category._id}
                                    type="button"
                                    onClick={() =>
                                      toggleCategorySelection(category._id)
                                    }
                                    className={`px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all border truncate ${
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
                            <label className="peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-xs sm:text-sm font-semibold text-slate-700 mb-2 sm:mb-3 block">
                              Amount Range
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                              <div>
                                <label
                                  className="font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-xs text-slate-600"
                                  htmlFor="minAmount"
                                >
                                  Min Amount
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
                                  Max Amount
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
                  </div>
                </div>
              </div>
            )}

            {/* Charts and Reports */}
            <div
              className={`${showFilters ? "lg:col-span-3" : "lg:col-span-4"}`}
            >
              {/* Month Info - Mobile Optimized */}
              <div className="bg-white rounded-xl p-3 sm:p-4 border-0 shadow-sm mb-4 sm:mb-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg font-semibold text-slate-900 truncate">
                      {getMonthName(selectedMonth)} {selectedYear}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600">
                      {reportData.summary.totalTransactions > 0
                        ? `Showing ${reportData.summary.totalTransactions} transactions`
                        : "No data available"}
                    </p>
                    {(dateInputs.startDate || dateInputs.endDate) && (
                      <p className="text-xs sm:text-sm text-blue-600 mt-1 truncate">
                        Date filter: {dateInputs.startDate || "Any start"} to{" "}
                        {dateInputs.endDate || "Any end"}
                      </p>
                    )}
                  </div>
                  {!showFilters && (
                    <button
                      onClick={() => setShowFilters(true)}
                      className="lg:hidden inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-8 px-3 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 w-full sm:w-auto"
                    >
                      <Filter className="w-4 h-4" />
                      Show Filters
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-4 sm:space-y-6">
                {/* Tabs - Mobile Optimized */}
                <div className="bg-white rounded-xl p-3 sm:p-4 border-0 shadow-sm">
                  <div className="h-8 sm:h-9 items-center justify-center rounded-lg p-1 text-muted-foreground grid w-full grid-cols-2">
                    <button
                      type="button"
                      onClick={() => setActiveTab("overview")}
                      className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer ${
                        activeTab === "overview"
                          ? "bg-green-500 text-white shadow"
                          : "hover:bg-slate-100"
                      }`}
                    >
                      <span className="truncate">Charts</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab("details")}
                      className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer ${
                        activeTab === "details"
                          ? "bg-green-500 text-white shadow"
                          : "hover:bg-slate-100"
                      }`}
                    >
                      <span className="truncate">Details</span>
                    </button>
                  </div>
                </div>

                {/* Charts Content */}
                {activeTab === "overview" && (
                  <div className="space-y-4 sm:space-y-6">
                    {/* Income vs Expense Chart */}
                    {reportData.categoriesData.length > 0 ? (
                      <div className="rounded-xl border bg-card text-card-foreground shadow">
                        <div className="flex flex-col space-y-1.5 p-4 sm:p-6">
                          <div className="font-semibold leading-none tracking-tight text-sm sm:text-base">
                            Income vs Expense by Category
                          </div>
                          <p className="text-xs sm:text-sm text-slate-600">
                            Comparison of income and expense per category
                          </p>
                        </div>
                        <div className="p-3 sm:p-6 sm:pt-0">
                          <div className="h-64 sm:h-72 md:h-80 lg:h-96">
                            <ResponsiveContainer width="100%" height="100%">
                              <RechartsBarChart
                                data={reportData.categoriesData}
                                margin={{
                                  top: 20,
                                  right: 10,
                                  left: 0,
                                  bottom: 60,
                                }}
                              >
                                <CartesianGrid
                                  strokeDasharray="3 3"
                                  stroke="#f1f5f9"
                                />
                                <XAxis
                                  dataKey="name"
                                  angle={-45}
                                  textAnchor="end"
                                  height={60}
                                  interval={0}
                                  tick={{ fontSize: 10 }}
                                />
                                <YAxis tick={{ fontSize: 10 }} />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend />
                                <Bar
                                  dataKey="income"
                                  name="Income"
                                  fill="#10b981"
                                  radius={[4, 4, 0, 0]}
                                />
                                <Bar
                                  dataKey="expense"
                                  name="Expense"
                                  fill="#ef4444"
                                  radius={[4, 4, 0, 0]}
                                />
                              </RechartsBarChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-xl border bg-card text-card-foreground shadow">
                        <div className="p-4 sm:p-6">
                          <div className="text-center py-8 sm:py-12">
                            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                              <BarChartIcon className="w-6 h-6 sm:w-8 sm:h-8 text-slate-400" />
                            </div>
                            <p className="text-slate-500 text-sm sm:text-lg mb-2">
                              No category data available
                            </p>
                            <p className="text-slate-400 text-xs sm:text-sm">
                              No transactions found for selected filters
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Bottom Charts Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                      {/* Wallet Activity */}
                      {reportData.walletActivity.length > 0 ? (
                        <div className="rounded-xl border bg-card text-card-foreground shadow">
                          <div className="flex flex-col space-y-1.5 p-4 sm:p-6">
                            <div className="font-semibold leading-none tracking-tight text-sm sm:text-base">
                              Wallet Activity
                            </div>
                            <p className="text-xs sm:text-sm text-slate-600">
                              Net balance per wallet
                            </p>
                          </div>
                          <div className="p-3 sm:p-6 sm:pt-0">
                            <div className="h-56 sm:h-64">
                              <ResponsiveContainer width="100%" height="100%">
                                <RechartsBarChart
                                  data={reportData.walletActivity}
                                  layout="vertical"
                                  margin={{
                                    top: 5,
                                    right: 20,
                                    left: 60,
                                    bottom: 5,
                                  }}
                                >
                                  <CartesianGrid
                                    strokeDasharray="3 3"
                                    stroke="#f1f5f9"
                                  />
                                  <XAxis
                                    type="number"
                                    tick={{ fontSize: 10 }}
                                  />
                                  <YAxis
                                    type="category"
                                    dataKey="name"
                                    width={80}
                                    tick={{ fontSize: 10 }}
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
                        </div>
                      ) : (
                        <div className="rounded-xl border bg-card text-card-foreground shadow">
                          <div className="p-4 sm:p-6">
                            <div className="text-center py-8 sm:py-12">
                              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                                <WalletIcon className="w-6 h-6 sm:w-8 sm:h-8 text-slate-400" />
                              </div>
                              <p className="text-slate-500 text-sm sm:text-lg mb-2">
                                No wallet activity data
                              </p>
                              <p className="text-slate-400 text-xs sm:text-sm">
                                No transaction data available for wallets
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Top Expense Categories */}
                      {reportData.expenseCategories.length > 0 ? (
                        <div className="rounded-xl border bg-card text-card-foreground shadow">
                          <div className="flex flex-col space-y-1.5 p-4 sm:p-6">
                            <div className="font-semibold leading-none tracking-tight text-sm sm:text-base">
                              Top Expense Categories
                            </div>
                            <p className="text-xs sm:text-sm text-slate-600">
                              Highest spending categories
                            </p>
                          </div>
                          <div className="p-3 sm:p-6 sm:pt-0">
                            <div className="flex flex-col lg:flex-row items-center gap-4 sm:gap-6">
                              <div className="w-full lg:w-1/2 h-48 sm:h-56">
                                <ResponsiveContainer width="100%" height="100%">
                                  <RechartsPieChart>
                                    <Pie
                                      data={reportData.expenseCategories}
                                      cx="50%"
                                      cy="50%"
                                      labelLine={true}
                                      label={({ name, percentage }) =>
                                        `${name}: ${percentage.toFixed(1)}%`
                                      }
                                      outerRadius={60}
                                      innerRadius={20}
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
                                      formatter={(value) =>
                                        formatCurrency(value)
                                      }
                                    />
                                  </RechartsPieChart>
                                </ResponsiveContainer>
                              </div>

                              <div className="grid grid-cols-1 gap-1.5 sm:gap-2 w-full lg:w-1/2">
                                {reportData.expenseCategories.map(
                                  (category) => (
                                    <div
                                      key={category.name}
                                      className="flex items-center gap-2 text-xs sm:text-sm p-2 bg-slate-50 rounded"
                                    >
                                      <div
                                        className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full flex-shrink-0"
                                        style={{
                                          backgroundColor: category.color,
                                        }}
                                      />
                                      <span className="text-slate-700 truncate flex-1">
                                        {category.name}
                                      </span>
                                      <span className="text-slate-500 ml-2 font-medium flex-shrink-0">
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
                          <div className="p-4 sm:p-6">
                            <div className="text-center py-8 sm:py-12">
                              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                                <PieChartIcon className="w-6 h-6 sm:w-8 sm:h-8 text-slate-400" />
                              </div>
                              <p className="text-slate-500 text-sm sm:text-lg mb-2">
                                No expense category data
                              </p>
                              <p className="text-slate-400 text-xs sm:text-sm">
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
                    <div className="flex flex-col space-y-1.5 p-4 sm:p-6">
                      <div className="font-semibold leading-none tracking-tight text-sm sm:text-base">
                        Transaction Details
                      </div>
                      <p className="text-xs sm:text-sm text-slate-600">
                        Detailed view of filtered transactions
                      </p>
                    </div>
                    <div className="p-3 sm:p-6 sm:pt-0">
                      {reportData.transactions.length > 0 ? (
                        <div className="space-y-2 sm:space-y-3">
                          {reportData.transactions.map((transaction) => (
                            <div
                              key={transaction._id}
                              className="p-3 sm:p-4 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-slate-900 text-sm sm:text-base truncate">
                                    {transaction.category_id?.name ||
                                      "Uncategorized"}
                                  </p>
                                  <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                                    {formatDateToDDMMYYYY(transaction.date)}
                                  </p>
                                </div>
                                <div className="text-right flex-shrink-0 ml-2">
                                  <p
                                    className={`font-bold text-sm sm:text-base ${
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
                        <div className="text-center py-8 sm:py-12">
                          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                            <AlertCircle className="w-6 h-6 sm:w-8 sm:h-8 text-slate-400" />
                          </div>
                          <p className="text-slate-500 text-sm sm:text-lg mb-2">
                            No transaction details available
                          </p>
                          <p className="text-slate-400 text-xs sm:text-sm">
                            No transactions found for selected filters
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

      {/* Mobile Filter Toggle Button */}
      {!showFilters && (
        <button
          onClick={() => setShowFilters(true)}
          className="lg:hidden fixed bottom-6 right-6 w-12 h-12 rounded-full bg-green-600 text-white shadow-lg flex items-center justify-center z-40 hover:bg-green-700 transition-colors"
        >
          <Filter className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};

export default Reports;
