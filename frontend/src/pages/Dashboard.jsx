import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import BackgroundCircles from "../components/BackgroundCircles";
import {
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  ArrowLeftRight,
  Wallet as WalletIcon,
  Smartphone,
  Banknote,
  Building2,
  CreditCard,
  Landmark,
  PiggyBank,
  Coins,
  Calendar,
  Eye,
  EyeOff,
  ChevronDown,
  BarChart3,
  PieChart as PieChartIcon,
  DollarSign,
  AlertCircle,
  Plus,
  Download,
  Filter,
  RefreshCw,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Users,
  ShoppingBag,
  Coffee,
  Car,
  Home,
  Gift,
  Sun,
  Moon,
  Menu,
  X,
} from "lucide-react";

const MonthYearSelector = ({
  selectedMonth,
  selectedYear,
  onMonthChange,
  onYearChange,
  isLoading,
  isMobile = false,
}) => {
  const months = [
    { value: 1, label: "Jan" },
    { value: 2, label: "Feb" },
    { value: 3, label: "Mar" },
    { value: 4, label: "Apr" },
    { value: 5, label: "May" },
    { value: 6, label: "Jun" },
    { value: 7, label: "Jul" },
    { value: 8, label: "Aug" },
    { value: 9, label: "Sep" },
    { value: 10, label: "Oct" },
    { value: 11, label: "Nov" },
    { value: 12, label: "Dec" },
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  if (isMobile) {
    return (
      <div className="relative w-full">
        <select
          value={selectedMonth}
          onChange={(e) => onMonthChange(parseInt(e.target.value))}
          disabled={isLoading}
          className="w-full appearance-none rounded-lg border border-slate-200 bg-white py-2 pl-3 pr-8 text-sm text-slate-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 disabled:opacity-50"
        >
          {months.map((month) => (
            <option key={month.value} value={month.value}>
              {month.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
      </div>
    );
  }

  return (
    <div className="relative">
      <select
        value={selectedMonth}
        onChange={(e) => onMonthChange(parseInt(e.target.value))}
        disabled={isLoading}
        className="w-full appearance-none rounded-lg border border-slate-200 bg-white py-2 pl-4 pr-10 text-sm text-slate-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 disabled:opacity-50"
      >
        {months.map((month) => (
          <option key={month.value} value={month.value}>
            {month.label}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon, color, trend, isLoading }) => (
  <div className="bg-white rounded-xl p-4 sm:p-5 border-0 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between">
      <div className="flex-1 min-w-0">
        <p className="text-xs sm:text-sm text-slate-500 mb-1 sm:mb-2 truncate">
          {title}
        </p>
        {isLoading ? (
          <div className="h-7 sm:h-8 bg-slate-200 rounded animate-pulse w-3/4"></div>
        ) : (
          <p className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 truncate">
            {value}
          </p>
        )}
      </div>
      <div
        className={`p-2 sm:p-2.5 rounded-lg ${color} bg-opacity-10 flex-shrink-0 ml-2`}
      >
        <Icon
          className={`w-4 h-4 sm:w-5 sm:h-5 ${color.replace("text-", "")}`}
        />
      </div>
    </div>
    {trend && (
      <div className="mt-2 sm:mt-3 flex items-center gap-1 text-xs sm:text-sm">
        <div
          className={`flex items-center gap-0.5 sm:gap-1 ${
            trend.value >= 0 ? "text-green-600" : "text-red-600"
          }`}
        >
          {trend.value >= 0 ? (
            <TrendingUpIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          ) : (
            <TrendingDownIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          )}
          <span>{Math.abs(trend.value)}%</span>
        </div>
        <span className="text-slate-400 text-xs ml-1 sm:ml-2">
          vs last month
        </span>
      </div>
    )}
  </div>
);

const CustomTooltip = ({ active, payload, label, currency = "৳" }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-2 sm:p-3 rounded-lg shadow-lg border border-slate-200 max-w-[200px] sm:max-w-none">
        <p className="font-semibold text-slate-900 mb-1 sm:mb-2 text-xs sm:text-sm">
          {label}
        </p>
        {payload.map((entry, index) => (
          <p
            key={index}
            className="text-xs sm:text-sm"
            style={{ color: entry.color }}
          >
            {entry.name}: {currency}
            {entry.value.toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const Dashboard = () => {
  const navigate = useNavigate();
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login", { replace: true });
      return; // Stop component from continuing
    }
  }, [navigate]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [showBalance, setShowBalance] = useState(() => {
    const saved = localStorage.getItem("dashboard_showBalance");
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    monthlySummary: {
      income: 0,
      expense: 0,
      balance: 0,
      transactions: 0,
    },
    dailyIncome: {
      today: 0,
      yesterday: 0,
      change: 0,
    },
    budgetStats: {
      totalBudget: 0,
      totalSpent: 0,
      totalRemaining: 0,
    },
    wallets: [],
    categoryExpenses: [],
    monthlyTrend: [],
    weeklyData: [],
    topExpenses: [],
    walletDistribution: [],
  });

  const BASE_URL = import.meta.env.VITE_BASE_URL;

  const getAuthToken = () => {
    return localStorage.getItem("token");
  };

  const toggleBalanceVisibility = () => {
    const newValue = !showBalance;
    setShowBalance(newValue);
    // Save to localStorage
    localStorage.setItem("dashboard_showBalance", JSON.stringify(newValue));
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

  useEffect(() => {
    fetchDashboardData();
  }, [selectedMonth, selectedYear]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setRefreshing(true);
      setError(null);
      const token = getAuthToken();

      if (!token) {
        setError("No authentication token found. Please login again.");
        setLoading(false);
        setRefreshing(false);
        navigate("/login", { replace: true });
        return;
      }

      const [
        monthlyTransactionsRes,
        monthlyWalletsRes,
        allTransactionsRes,
        categoriesRes,
        transactionMonthsRes,
        budgetRes,
      ] = await Promise.all([
        fetch(
          `${BASE_URL}/transactions/monthly?month=${selectedMonth}&year=${selectedYear}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        ),
        fetch(
          `${BASE_URL}/wallets/monthly?month=${selectedMonth}&year=${selectedYear}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        ),
        fetch(`${BASE_URL}/transactions`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${BASE_URL}/categories`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${BASE_URL}/transactions/months`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        // Add budget fetch
        fetch(
          `${BASE_URL}/budgets/monthly?month=${selectedMonth}&year=${selectedYear}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        ),
      ]);

      const [
        monthlyTransactions,
        monthlyWallets,
        allTransactions,
        categories,
        transactionMonths,
        budgetData,
      ] = await Promise.all([
        monthlyTransactionsRes.json(),
        monthlyWalletsRes.json(),
        allTransactionsRes.json(),
        categoriesRes.json(),
        transactionMonthsRes.json(),
        budgetRes.json(),
      ]);

      if (!monthlyTransactions.success || !monthlyWallets.success) {
        throw new Error("Failed to fetch dashboard data");
      }

      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const todayStr = today.toISOString().split("T")[0];
      const yesterdayStr = yesterday.toISOString().split("T")[0];

      const todayIncome = calculateDailyIncome(
        monthlyTransactions.data?.transactions || [],
        todayStr
      );
      const yesterdayIncome = calculateDailyIncome(
        monthlyTransactions.data?.transactions || [],
        yesterdayStr
      );
      const dailyChange =
        yesterdayIncome > 0
          ? ((todayIncome - yesterdayIncome) / yesterdayIncome) * 100
          : 0;

      const categoryExpenses = calculateCategoryExpenses(
        monthlyTransactions.data?.transactions || [],
        categories.data || []
      );

      const monthlyTrend = calculateMonthlyTrend(
        allTransactions.data || [],
        selectedYear,
        selectedMonth
      );

      const weeklyData = calculateWeeklyData(
        monthlyTransactions.data?.transactions || []
      );

      const topExpenses = getTopExpenses(
        monthlyTransactions.data?.transactions || []
      );

      const walletDistribution = calculateWalletDistribution(
        monthlyWallets.data?.wallets || []
      );

      // Add budget stats calculation
      const budgetStats = {
        totalBudget: budgetData.success
          ? budgetData.data?.totals?.totalBudget || 0
          : 0,
        totalSpent: budgetData.success
          ? budgetData.data?.totals?.totalSpent || 0
          : 0,
        totalRemaining: budgetData.success
          ? budgetData.data?.totals?.totalRemaining || 0
          : 0,
      };

      setDashboardData({
        monthlySummary: {
          income: monthlyTransactions.data?.totals?.income || 0,
          expense: monthlyTransactions.data?.totals?.expense || 0,
          balance: monthlyTransactions.data?.totals?.netBalance || 0,
          transactions: monthlyTransactions.data?.count || 0,
        },
        dailyIncome: {
          today: todayIncome,
          yesterday: yesterdayIncome,
          change: dailyChange,
        },
        budgetStats,
        wallets: monthlyWallets.data?.wallets || [],
        categoryExpenses,
        monthlyTrend,
        weeklyData,
        topExpenses,
        walletDistribution,
      });
    } catch (error) {
      console.error("Dashboard error:", error);
      setError(error.message || "Failed to load dashboard data");
      toast.error(error.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const calculateDailyIncome = (transactions, dateStr) => {
    return transactions
      .filter(
        (t) =>
          t.type === "income" &&
          new Date(t.date).toISOString().split("T")[0] === dateStr
      )
      .reduce((sum, t) => sum + (t.amount || 0), 0);
  };

  const calculateCategoryExpenses = (transactions, categories) => {
    const expenseCategories = categories.filter((c) => c.type === "expense");
    const categoryMap = {};

    expenseCategories.forEach((cat) => {
      categoryMap[cat._id] = {
        name: cat.name,
        value: 0,
        color: cat.color || "#3b82f6",
        icon: cat.icon,
      };
    });

    transactions
      .filter((t) => t.type === "expense" && t.category_id)
      .forEach((t) => {
        const catId = t.category_id._id || t.category_id;
        if (categoryMap[catId]) {
          categoryMap[catId].value += t.amount || 0;
        }
      });

    return Object.values(categoryMap)
      .filter((cat) => cat.value > 0)
      .sort((a, b) => b.value - a.value);
  };

  const calculateMonthlyTrend = (
    allTransactions,
    currentYear,
    currentMonth
  ) => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentYear, currentMonth - 1 - i);
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      const monthName = getShortMonthName(month);

      const monthlyTransactions = allTransactions.filter((t) => {
        const tDate = new Date(t.date);
        return tDate.getMonth() + 1 === month && tDate.getFullYear() === year;
      });

      const income = monthlyTransactions
        .filter((t) => t.type === "income")
        .reduce((sum, t) => sum + (t.amount || 0), 0);

      const expense = monthlyTransactions
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + (t.amount || 0), 0);

      months.push({
        month: `${monthName} ${year.toString().slice(-2)}`,
        income,
        expense,
        balance: income - expense,
      });
    }
    return months;
  };

  const calculateWeeklyData = (transactions) => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const weekData = days.map((day) => ({
      day,
      income: 0,
      expense: 0,
    }));

    transactions.forEach((t) => {
      const date = new Date(t.date);
      const dayIndex = date.getDay();
      if (t.type === "income") {
        weekData[dayIndex].income += t.amount || 0;
      } else if (t.type === "expense") {
        weekData[dayIndex].expense += t.amount || 0;
      }
    });

    return weekData;
  };

  const getTopExpenses = (transactions, limit = 5) => {
    return transactions
      .filter((t) => t.type === "expense")
      .sort((a, b) => (b.amount || 0) - (a.amount || 0))
      .slice(0, limit)
      .map((t) => ({
        name: t.category_id?.name || "Uncategorized",
        amount: t.amount || 0,
        date: new Date(t.date).toLocaleDateString(),
        notes: t.notes,
      }));
  };

  const calculateWalletDistribution = (wallets) => {
    const totalBalance = wallets.reduce(
      (sum, w) => sum + (w.monthlyBalance || 0),
      0
    );

    return wallets
      .filter((w) => w.monthlyBalance > 0)
      .map((w) => ({
        name: w.name,
        value: w.monthlyBalance,
        percentage:
          totalBalance > 0 ? (w.monthlyBalance / totalBalance) * 100 : 0,
        color: w.color || "#3b82f6",
      }))
      .sort((a, b) => b.value - a.value);
  };

  const formatCurrency = (amount) => {
    if (!showBalance) return "৳••••";

    return new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "BDT",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
      .format(amount)
      .replace("BDT", "৳");
  };

  const formatCompactCurrency = (amount) => {
    if (!showBalance) return "৳••••";

    if (amount >= 1000000) {
      return `৳${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `৳${(amount / 1000).toFixed(1)}K`;
    }
    return formatCurrency(amount);
  };

  const getIconComponent = (iconName) => {
    const iconProps = { className: "w-4 h-4 sm:w-5 sm:h-5" };
    switch (iconName) {
      case "smartphone":
        return <Smartphone {...iconProps} />;
      case "wallet":
        return <WalletIcon {...iconProps} />;
      case "banknote":
        return <Banknote {...iconProps} />;
      case "building2":
        return <Building2 {...iconProps} />;
      case "credit-card":
        return <CreditCard {...iconProps} />;
      case "landmark":
        return <Landmark {...iconProps} />;
      case "piggy-bank":
        return <PiggyBank {...iconProps} />;
      case "coins":
        return <Coins {...iconProps} />;
      case "shopping-bag":
        return <ShoppingBag {...iconProps} />;
      case "coffee":
        return <Coffee {...iconProps} />;
      case "car":
        return <Car {...iconProps} />;
      case "home":
        return <Home {...iconProps} />;
      case "gift":
        return <Gift {...iconProps} />;
      case "users":
        return <Users {...iconProps} />;
      default:
        return <WalletIcon {...iconProps} />;
    }
  };

  const handleRefresh = () => {
    fetchDashboardData();
  };

  const handleExportData = () => {
    toast.info("Export feature coming soon!");
  };

  const clearError = () => {
    setError(null);
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

  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#8884D8",
    "#82CA9D",
  ];

  if (loading && !refreshing) {
    return (
      <div className="min-h-screen relative">
        <BackgroundCircles />
        <div className="flex items-center justify-center min-h-screen relative z-10 px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-slate-600">Loading dashboard...</p>
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

      <BackgroundCircles />

      <div className="w-full mx-auto relative z-10">
        <div className="space-y-3 sm:space-y-6 pb-16 sm:pb-20">
          {/* Mobile Header */}
          <div className="sm:hidden space-y-3 px-2">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-slate-900">Dashboard</h1>
                <p className="text-xs text-slate-600 mt-0.5">
                  {getMonthName(selectedMonth)} {selectedYear}
                </p>
              </div>
              <button
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className="p-2 rounded-lg bg-white border border-slate-200"
              >
                {showMobileFilters ? (
                  <X className="w-5 h-5 text-slate-600" />
                ) : (
                  <Menu className="w-5 h-5 text-slate-600" />
                )}
              </button>
            </div>

            {/* Mobile Quick Actions */}
            <div className="flex items-center justify-between gap-1">
              <button
                onClick={handlePreviousMonth}
                className="p-2 rounded-lg bg-white border border-slate-200 flex-1 flex items-center justify-center"
              >
                <ChevronLeft className="w-4 h-4 text-slate-600" />
              </button>
              <button
                onClick={toggleBalanceVisibility}
                className="p-2 rounded-lg bg-white border border-slate-200 flex-1 flex items-center justify-center"
              >
                {showBalance ? (
                  <EyeOff className="w-4 h-4 text-slate-600" />
                ) : (
                  <Eye className="w-4 h-4 text-slate-600" />
                )}
              </button>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-2 rounded-lg bg-white border border-slate-200 flex-1 flex items-center justify-center"
              >
                <RefreshCw
                  className={`w-4 h-4 ${
                    refreshing ? "animate-spin" : "text-slate-600"
                  }`}
                />
              </button>
              <button
                onClick={handleNextMonth}
                className="p-2 rounded-lg bg-white border border-slate-200 flex-1 flex items-center justify-center"
              >
                <ChevronRight className="w-4 h-4 text-slate-600" />
              </button>
            </div>

            {/* Mobile Filters Dropdown */}
            {showMobileFilters && (
              <div className="bg-white rounded-xl p-3 border-0 shadow-lg mx-2">
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">
                      Month
                    </label>
                    <MonthYearSelector
                      selectedMonth={selectedMonth}
                      selectedYear={selectedYear}
                      onMonthChange={setSelectedMonth}
                      onYearChange={setSelectedYear}
                      isLoading={loading}
                      isMobile={true}
                    />
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
          <div className="hidden sm:block px-4 lg:px-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                  Dashboard
                </h1>
                <p className="text-sm text-slate-600 mt-0.5">
                  Financial overview for {getMonthName(selectedMonth)}{" "}
                  {selectedYear}
                </p>
              </div>

              <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                <div className="w-28 sm:w-32">
                  <MonthYearSelector
                    selectedMonth={selectedMonth}
                    selectedYear={selectedYear}
                    onMonthChange={setSelectedMonth}
                    onYearChange={setSelectedYear}
                    isLoading={loading}
                  />
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
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-9 px-2.5 sm:px-3 py-2 bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 flex-shrink-0"
                  title="Refresh data"
                >
                  <RefreshCw
                    className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
                  />
                </button>

                <button
                  onClick={toggleBalanceVisibility}
                  className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-9 px-2.5 sm:px-3 py-2 bg-green-600 text-white hover:bg-green-700 shadow-sm flex-shrink-0"
                  title={showBalance ? "Hide balance" : "Show balance"}
                >
                  {showBalance ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg mx-2 sm:mx-4 lg:mx-6">
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

          {/* Main Financial Summary Card */}
          <div className="bg-white rounded-xl p-3 sm:p-5 border-0 shadow-sm mx-2 sm:mx-4 lg:mx-6">
            <div className="mb-3 sm:mb-4">
              <h3 className="text-base sm:text-lg font-semibold text-slate-900">
                Financial Summary
              </h3>
              <p className="text-xs sm:text-sm text-slate-500">
                Overview of your monthly finances
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 sm:gap-4">
              {/* Total Income */}
              <div className="border border-slate-200 rounded-lg p-3 sm:p-4 hover:border-green-300 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm text-slate-500 mb-1 sm:mb-2">
                      Total Income
                    </p>
                    {loading ? (
                      <div className="h-7 sm:h-8 bg-slate-200 rounded animate-pulse w-3/4"></div>
                    ) : (
                      <p className="text-xl sm:text-2xl font-bold text-green-600 truncate">
                        {formatCurrency(dashboardData.monthlySummary.income)}
                      </p>
                    )}
                  </div>
                  <div className="p-2 sm:p-2.5 rounded-lg text-green-600 bg-green-50 flex-shrink-0 ml-2">
                    <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                </div>
                <div className="mt-2 sm:mt-3">
                  <div className="flex items-center gap-1 text-xs sm:text-sm text-green-600">
                    <TrendingUpIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    <span>+12.5%</span>
                  </div>
                  <span className="text-xs text-slate-400">vs last month</span>
                </div>
              </div>

              {/* Total Expense */}
              <div className="border border-slate-200 rounded-lg p-3 sm:p-4 hover:border-red-300 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm text-slate-500 mb-1 sm:mb-2">
                      Total Expense
                    </p>
                    {loading ? (
                      <div className="h-7 sm:h-8 bg-slate-200 rounded animate-pulse w-3/4"></div>
                    ) : (
                      <p className="text-xl sm:text-2xl font-bold text-red-600 truncate">
                        {formatCurrency(dashboardData.monthlySummary.expense)}
                      </p>
                    )}
                  </div>
                  <div className="p-2 sm:p-2.5 rounded-lg text-red-600 bg-red-50 flex-shrink-0 ml-2">
                    <TrendingDown className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                </div>
                <div className="mt-2 sm:mt-3">
                  <div className="flex items-center gap-1 text-xs sm:text-sm text-red-600">
                    <TrendingDownIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    <span>-8.3%</span>
                  </div>
                  <span className="text-xs text-slate-400">vs last month</span>
                </div>
              </div>

              {/* Net Balance */}
              <div className="border border-slate-200 rounded-lg p-3 sm:p-4 hover:border-blue-300 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm text-slate-500 mb-1 sm:mb-2">
                      Net Balance
                    </p>
                    {loading ? (
                      <div className="h-7 sm:h-8 bg-slate-200 rounded animate-pulse w-3/4"></div>
                    ) : (
                      <p
                        className={`text-xl sm:text-2xl font-bold truncate ${
                          dashboardData.monthlySummary.balance >= 0
                            ? "text-blue-600"
                            : "text-red-600"
                        }`}
                      >
                        {formatCurrency(dashboardData.monthlySummary.balance)}
                      </p>
                    )}
                  </div>
                  <div className="p-2 sm:p-2.5 rounded-lg text-blue-600 bg-blue-50 flex-shrink-0 ml-2">
                    <ArrowLeftRight className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                </div>
                <div className="mt-2 sm:mt-3">
                  <div
                    className={`flex items-center gap-1 text-xs sm:text-sm ${
                      dashboardData.monthlySummary.balance >= 0
                        ? "text-blue-600"
                        : "text-red-600"
                    }`}
                  >
                    {dashboardData.monthlySummary.balance >= 0 ? (
                      <>
                        <TrendingUpIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        <span>
                          +
                          {Math.abs(
                            (dashboardData.monthlySummary.balance /
                              dashboardData.monthlySummary.income) *
                              100
                          ).toFixed(1)}
                          %
                        </span>
                      </>
                    ) : (
                      <>
                        <TrendingDownIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        <span>
                          -
                          {Math.abs(
                            (dashboardData.monthlySummary.balance /
                              dashboardData.monthlySummary.income) *
                              100
                          ).toFixed(1)}
                          %
                        </span>
                      </>
                    )}
                  </div>
                  <span className="text-xs text-slate-400">income ratio</span>
                </div>
              </div>
            </div>
          </div>

          {/* Other Stats Grid - 3 Cards per row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 sm:gap-4 mx-2 sm:mx-4 lg:mx-6">
            <StatCard
              title="Today's Income"
              value={formatCurrency(dashboardData.dailyIncome.today)}
              icon={Sun}
              color="text-amber-600"
              isLoading={loading}
            />
            <StatCard
              title="Yesterday's Income"
              value={formatCurrency(dashboardData.dailyIncome.yesterday)}
              icon={Moon}
              color="text-purple-600"
              isLoading={loading}
            />
            <StatCard
              title="Transactions"
              value={dashboardData.monthlySummary.transactions}
              icon={WalletIcon}
              color="text-indigo-600"
              isLoading={loading}
            />
          </div>

          {/* Budget Stats Grid - New Row for Budget Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 sm:gap-4 mx-2 sm:mx-4 lg:mx-6">
            <div className="bg-white rounded-xl p-4 sm:p-5 border-0 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm text-slate-500 mb-1 sm:mb-2 truncate">
                    Total Budget
                  </p>
                  {loading ? (
                    <div className="h-7 sm:h-8 bg-slate-200 rounded animate-pulse w-3/4"></div>
                  ) : (
                    <p className="text-lg sm:text-xl md:text-2xl font-bold text-green-900 truncate">
                      {formatCurrency(
                        dashboardData.budgetStats?.totalBudget || 0
                      )}
                    </p>
                  )}
                </div>
                <div className="p-2 sm:p-2.5 rounded-lg text-green-600 bg-green-50 flex-shrink-0 ml-2">
                  <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
              </div>
              <div className="mt-2 sm:mt-3 flex items-center gap-1 text-xs sm:text-sm">
                <span className="text-slate-400">Monthly limit</span>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 sm:p-5 border-0 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm text-slate-500 mb-1 sm:mb-2 truncate">
                    Total Spent
                  </p>
                  {loading ? (
                    <div className="h-7 sm:h-8 bg-slate-200 rounded animate-pulse w-3/4"></div>
                  ) : (
                    <p className="text-lg sm:text-xl md:text-2xl font-bold text-red-900 truncate">
                      {formatCurrency(
                        dashboardData.budgetStats?.totalSpent || 0
                      )}
                    </p>
                  )}
                </div>
                <div className="p-2 sm:p-2.5 rounded-lg text-red-600 bg-red-50 flex-shrink-0 ml-2">
                  <TrendingDown className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
              </div>
              <div className="mt-2 sm:mt-3 flex items-center gap-1 text-xs sm:text-sm">
                <span className="text-slate-400">This month</span>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 sm:p-5 border-0 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm text-slate-500 mb-1 sm:mb-2 truncate">
                    Budget Remaining
                  </p>
                  {loading ? (
                    <div className="h-7 sm:h-8 bg-slate-200 rounded animate-pulse w-3/4"></div>
                  ) : (
                    <p
                      className={`text-lg sm:text-xl md:text-2xl font-bold truncate ${
                        (dashboardData.budgetStats?.totalRemaining || 0) >= 0
                          ? "text-blue-600"
                          : "text-red-600"
                      }`}
                    >
                      {formatCurrency(
                        dashboardData.budgetStats?.totalRemaining || 0
                      )}
                    </p>
                  )}
                </div>
                <div className="p-2 sm:p-2.5 rounded-lg text-blue-600 bg-blue-50 flex-shrink-0 ml-2">
                  <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
              </div>
              <div className="mt-2 sm:mt-3 flex items-center gap-1 text-xs sm:text-sm">
                <span className="text-slate-400">Available balance</span>
              </div>
            </div>
          </div>

          {/* My Wallets Section */}
          {dashboardData.wallets.length > 0 && (
            <div className="bg-white rounded-xl p-3 sm:p-5 border-0 shadow-sm mx-2 sm:mx-4 lg:mx-6">
              <div className="flex items-center justify-between mb-4 sm:mb-5">
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-slate-900">
                    My Wallets
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500">
                    Balance overview
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
                {dashboardData.wallets.map((wallet) => (
                  <div
                    key={wallet._id}
                    className="border border-slate-200 rounded-lg p-3 sm:p-4 hover:border-slate-300 transition-colors hover:shadow-sm"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${wallet.color}20` }}
                      >
                        {getIconComponent(wallet.icon)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-slate-900 text-sm truncate">
                          {wallet.name}
                        </h4>
                        <p className="text-xs text-slate-500 capitalize truncate">
                          {wallet.type}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-500">
                          Current Balance
                        </span>
                        <span
                          className={`text-sm font-bold truncate ${
                            wallet.monthlyBalance >= 0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {formatCurrency(wallet.monthlyBalance)}
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5">
                        <div
                          className="h-1.5 rounded-full transition-all duration-300"
                          style={{
                            width: `${Math.min(
                              (wallet.monthlyBalance /
                                (wallet.monthlyBalance + 1000)) *
                                100,
                              100
                            )}%`,
                            backgroundColor: wallet.color || "#3b82f6",
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Expenses Section */}
          <div className="bg-white rounded-xl p-3 sm:p-5 border-0 shadow-sm mx-2 sm:mx-4 lg:mx-6">
            <div className="flex items-center justify-between mb-4 sm:mb-5">
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-slate-900">
                  Recent Expenses
                </h3>
                <p className="text-xs sm:text-sm text-slate-500">
                  Top expenses this month
                </p>
              </div>
              <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
            </div>
            <div className="space-y-2 sm:space-y-3">
              {dashboardData.topExpenses.length > 0 ? (
                dashboardData.topExpenses.map((expense, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 sm:p-3 hover:bg-slate-50 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                      <div className="w-6 h-6 sm:w-9 sm:h-9 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
                        <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4 text-red-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-slate-900 text-sm truncate">
                          {expense.name}
                        </h4>
                        <p className="text-xs text-slate-500 truncate">
                          {expense.date}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <span className="text-sm sm:text-base font-bold text-red-600">
                        {formatCurrency(expense.amount)}
                      </span>
                      {expense.notes && (
                        <p className="text-xs text-slate-400 mt-0.5 sm:mt-1 truncate max-w-[80px] sm:max-w-[150px]">
                          {expense.notes}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 sm:py-6 text-slate-400">
                  <p className="text-sm">No expense data available</p>
                </div>
              )}
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-6 mx-2 sm:mx-4 lg:mx-6">
            {/* Monthly Trend Chart */}
            <div className="bg-white rounded-xl p-3 sm:p-5 border-0 shadow-sm">
              <div className="flex items-center justify-between mb-4 sm:mb-5">
                <div className="flex-1 min-w-0">
                  <h3 className="text-base sm:text-lg font-semibold text-slate-900 truncate">
                    6-Month Trend
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 truncate">
                    Income vs Expense trend
                  </p>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 ml-2">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-green-500"></div>
                    <span className="text-xs text-slate-600">Income</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-red-500"></div>
                    <span className="text-xs text-slate-600">Expense</span>
                  </div>
                </div>
              </div>
              <div className="h-48 sm:h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dashboardData.monthlyTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis
                      dataKey="month"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#64748b", fontSize: 10 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#64748b", fontSize: 10 }}
                      tickFormatter={(value) => formatCompactCurrency(value)}
                    />
                    <Tooltip
                      content={<CustomTooltip />}
                      formatter={(value) => [formatCurrency(value), ""]}
                    />
                    <Area
                      type="monotone"
                      dataKey="income"
                      stroke="#10b981"
                      fill="#10b981"
                      fillOpacity={0.1}
                      strokeWidth={2}
                      name="Income"
                    />
                    <Area
                      type="monotone"
                      dataKey="expense"
                      stroke="#ef4444"
                      fill="#ef4444"
                      fillOpacity={0.1}
                      strokeWidth={2}
                      name="Expense"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Weekly Performance */}
            <div className="bg-white rounded-xl p-3 sm:p-5 border-0 shadow-sm">
              <div className="flex items-center justify-between mb-4 sm:mb-5">
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-slate-900">
                    Weekly Performance
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500">
                    This week's income & expense
                  </p>
                </div>
              </div>
              <div className="h-48 sm:h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dashboardData.weeklyData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#f1f5f9"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="day"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#64748b", fontSize: 10 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#64748b", fontSize: 10 }}
                      tickFormatter={(value) => formatCompactCurrency(value)}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar
                      dataKey="income"
                      fill="#10b981"
                      radius={[3, 3, 0, 0]}
                      name="Income"
                    />
                    <Bar
                      dataKey="expense"
                      fill="#ef4444"
                      radius={[3, 3, 0, 0]}
                      name="Expense"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Expenses by Category */}
            <div className="bg-white rounded-xl p-3 sm:p-5 border-0 shadow-sm">
              <div className="flex items-center justify-between mb-4 sm:mb-5">
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-slate-900">
                    Expenses by Category
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500">
                    Distribution of expenses
                  </p>
                </div>
                <PieChartIcon className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
              </div>
              <div className="h-48 sm:h-60">
                {dashboardData.categoryExpenses.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={dashboardData.categoryExpenses}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) =>
                          `${name}: ${(percent * 100).toFixed(0)}%`
                        }
                        outerRadius={60}
                        innerRadius={30}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                      >
                        {dashboardData.categoryExpenses.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => [formatCurrency(value), "Amount"]}
                        contentStyle={{
                          borderRadius: "8px",
                          border: "none",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-400">
                    <p className="text-sm">No expense data available</p>
                  </div>
                )}
              </div>
            </div>

            {/* Wallet Distribution */}
            <div className="bg-white rounded-xl p-3 sm:p-5 border-0 shadow-sm">
              <div className="flex items-center justify-between mb-4 sm:mb-5">
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-slate-900">
                    Wallet Distribution
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500">
                    Balance across wallets
                  </p>
                </div>
              </div>
              <div className="space-y-2 sm:space-y-4">
                {dashboardData.walletDistribution.length > 0 ? (
                  dashboardData.walletDistribution.map((wallet, index) => (
                    <div key={index} className="space-y-1.5 sm:space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <div
                            className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded flex-shrink-0"
                            style={{ backgroundColor: wallet.color }}
                          ></div>
                          <span className="text-xs sm:text-sm font-medium text-slate-700 truncate">
                            {wallet.name}
                          </span>
                        </div>
                        <div className="text-right flex-shrink-0 ml-2">
                          <span className="text-xs sm:text-sm font-semibold text-slate-900">
                            {formatCurrency(wallet.value)}
                          </span>
                          <span className="text-xs text-slate-500 ml-1">
                            ({wallet.percentage.toFixed(1)}%)
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-1.5 sm:h-2">
                        <div
                          className="h-1.5 sm:h-2 rounded-full transition-all duration-300"
                          style={{
                            width: `${wallet.percentage}%`,
                            backgroundColor: wallet.color,
                          }}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="h-32 flex items-center justify-center text-slate-400">
                    <p className="text-sm">No wallet data available</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Button for Mobile */}
      <button
        onClick={() => {
          sessionStorage.setItem("autoOpenTransactionForm", "true");
          navigate("/transactions");
        }}
        className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-40 w-12 h-12 sm:w-14 sm:h-14 bg-green-600 hover:bg-green-700 rounded-full flex items-center justify-center shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 cursor-pointer"
        title="Go to Transactions"
      >
        <Plus className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
      </button>
    </div>
  );
};

export default Dashboard;
