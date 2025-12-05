import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
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
} from "lucide-react";

const MonthYearSelector = ({
  selectedMonth,
  selectedYear,
  onMonthChange,
  onYearChange,
  isLoading,
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
  <div className="bg-white rounded-xl p-5 border-0 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <p className="text-sm text-slate-500 mb-2">{title}</p>
        {isLoading ? (
          <div className="h-8 bg-slate-200 rounded animate-pulse w-3/4"></div>
        ) : (
          <p className="text-2xl font-bold text-slate-900">{value}</p>
        )}
      </div>
      <div className={`p-2.5 rounded-lg ${color} bg-opacity-10`}>
        <Icon className={`w-5 h-5 ${color.replace("text-", "")}`} />
      </div>
    </div>
    {trend && (
      <div className="mt-3 flex items-center gap-1 text-sm">
        <div
          className={`flex items-center gap-1 ${
            trend.value >= 0 ? "text-green-600" : "text-red-600"
          }`}
        >
          {trend.value >= 0 ? (
            <TrendingUpIcon className="w-3.5 h-3.5" />
          ) : (
            <TrendingDownIcon className="w-3.5 h-3.5" />
          )}
          <span>{Math.abs(trend.value)}%</span>
        </div>
        <span className="text-slate-400 text-xs ml-2">vs last month</span>
      </div>
    )}
  </div>
);

const CustomTooltip = ({ active, payload, label, currency = "৳" }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-slate-200">
        <p className="font-semibold text-slate-900 mb-2 text-sm">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
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
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [showBalance, setShowBalance] = useState(true);
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
    setShowBalance(!showBalance);
  };

  const getMonthName = (monthNumber) => {
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
        return;
      }

      // Fetch all required data in parallel
      const [
        monthlyTransactionsRes,
        monthlyWalletsRes,
        allTransactionsRes,
        categoriesRes,
        transactionMonthsRes,
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
      ]);

      const [
        monthlyTransactions,
        monthlyWallets,
        allTransactions,
        categories,
        transactionMonths,
      ] = await Promise.all([
        monthlyTransactionsRes.json(),
        monthlyWalletsRes.json(),
        allTransactionsRes.json(),
        categoriesRes.json(),
        transactionMonthsRes.json(),
      ]);

      if (!monthlyTransactions.success || !monthlyWallets.success) {
        throw new Error("Failed to fetch dashboard data");
      }

      // Calculate daily income
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

      // Calculate category expenses
      const categoryExpenses = calculateCategoryExpenses(
        monthlyTransactions.data?.transactions || [],
        categories.data || []
      );

      // Calculate 6-month trend
      const monthlyTrend = calculateMonthlyTrend(
        allTransactions.data || [],
        selectedYear,
        selectedMonth
      );

      // Calculate weekly data
      const weeklyData = calculateWeeklyData(
        monthlyTransactions.data?.transactions || []
      );

      // Get top expenses
      const topExpenses = getTopExpenses(
        monthlyTransactions.data?.transactions || []
      );

      // Calculate wallet distribution
      const walletDistribution = calculateWalletDistribution(
        monthlyWallets.data?.wallets || []
      );

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
    const iconProps = { className: "w-5 h-5" };
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
        <div className="flex items-center justify-center min-h-screen relative z-10">
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
      />

      <BackgroundCircles />

      <div className="width-full mx-auto px-4 sm:px-6 lg:px-8 py-6 relative z-10">
        <div className="space-y-6 pb-20">
          {/* Header with Controls in One Line */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
              <p className="text-sm text-slate-600 mt-0.5">
                Financial overview for {getMonthName(selectedMonth)}{" "}
                {selectedYear}
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Month Selector */}
              <div className="w-32">
                <MonthYearSelector
                  selectedMonth={selectedMonth}
                  selectedYear={selectedYear}
                  onMonthChange={setSelectedMonth}
                  onYearChange={setSelectedYear}
                  isLoading={loading}
                />
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

              {/* Refresh Button */}
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-9 px-3 py-2 bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
                title="Refresh data"
              >
                <RefreshCw
                  className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
                />
              </button>

              {/* Hide/Show Balance Button */}
              <button
                onClick={toggleBalanceVisibility}
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-9 px-3 py-2 bg-green-600 text-white hover:bg-green-700 shadow-sm"
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

          {/* Main Financial Summary Card */}
          <div className="bg-white rounded-xl p-5 border-0 shadow-sm">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-slate-900">
                Financial Summary
              </h3>
              <p className="text-sm text-slate-500">
                Overview of your monthly finances
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Total Income */}
              <div className="border border-slate-200 rounded-lg p-4 hover:border-green-300 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-slate-500 mb-2">Total Income</p>
                    {loading ? (
                      <div className="h-8 bg-slate-200 rounded animate-pulse w-3/4"></div>
                    ) : (
                      <p className="text-2xl font-bold text-green-600">
                        {formatCurrency(dashboardData.monthlySummary.income)}
                      </p>
                    )}
                  </div>
                  <div className="p-2.5 rounded-lg text-green-600 bg-green-50">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="flex items-center gap-1 text-sm text-green-600">
                    <TrendingUpIcon className="w-3.5 h-3.5" />
                    <span>+12.5%</span>
                  </div>
                  <span className="text-xs text-slate-400">vs last month</span>
                </div>
              </div>

              {/* Total Expense */}
              <div className="border border-slate-200 rounded-lg p-4 hover:border-red-300 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-slate-500 mb-2">Total Expense</p>
                    {loading ? (
                      <div className="h-8 bg-slate-200 rounded animate-pulse w-3/4"></div>
                    ) : (
                      <p className="text-2xl font-bold text-red-600">
                        {formatCurrency(dashboardData.monthlySummary.expense)}
                      </p>
                    )}
                  </div>
                  <div className="p-2.5 rounded-lg text-red-600 bg-red-50">
                    <TrendingDown className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="flex items-center gap-1 text-sm text-red-600">
                    <TrendingDownIcon className="w-3.5 h-3.5" />
                    <span>-8.3%</span>
                  </div>
                  <span className="text-xs text-slate-400">vs last month</span>
                </div>
              </div>

              {/* Net Balance */}
              <div className="border border-slate-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-slate-500 mb-2">Net Balance</p>
                    {loading ? (
                      <div className="h-8 bg-slate-200 rounded animate-pulse w-3/4"></div>
                    ) : (
                      <p
                        className={`text-2xl font-bold ${
                          dashboardData.monthlySummary.balance >= 0
                            ? "text-blue-600"
                            : "text-red-600"
                        }`}
                      >
                        {formatCurrency(dashboardData.monthlySummary.balance)}
                      </p>
                    )}
                  </div>
                  <div className="p-2.5 rounded-lg text-blue-600 bg-blue-50">
                    <ArrowLeftRight className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-3">
                  <div
                    className={`flex items-center gap-1 text-sm ${
                      dashboardData.monthlySummary.balance >= 0
                        ? "text-blue-600"
                        : "text-red-600"
                    }`}
                  >
                    {dashboardData.monthlySummary.balance >= 0 ? (
                      <>
                        <TrendingUpIcon className="w-3.5 h-3.5" />
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
                        <TrendingDownIcon className="w-3.5 h-3.5" />
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

          {/* My Wallets Section - 3 cards per row */}
          {dashboardData.wallets.length > 0 && (
            <div className="bg-white rounded-xl p-5 border-0 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    My Wallets
                  </h3>
                  <p className="text-sm text-slate-500">Balance overview</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {dashboardData.wallets.map((wallet) => (
                  <div
                    key={wallet._id}
                    className="border border-slate-200 rounded-lg p-4 hover:border-slate-300 transition-colors hover:shadow-sm"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${wallet.color}20` }}
                      >
                        {getIconComponent(wallet.icon)}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-slate-900 text-sm">
                          {wallet.name}
                        </h4>
                        <p className="text-xs text-slate-500 capitalize">
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
                          className={`text-sm font-bold ${
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
          <div className="bg-white rounded-xl p-5 border-0 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  Recent Expenses
                </h3>
                <p className="text-sm text-slate-500">
                  Top expenses this month
                </p>
              </div>
              <Filter className="w-5 h-5 text-slate-400" />
            </div>
            <div className="space-y-3">
              {dashboardData.topExpenses.length > 0 ? (
                dashboardData.topExpenses.map((expense, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center">
                        <TrendingDown className="w-4 h-4 text-red-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-slate-900 text-sm">
                          {expense.name}
                        </h4>
                        <p className="text-xs text-slate-500">{expense.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-base font-bold text-red-600">
                        {formatCurrency(expense.amount)}
                      </span>
                      {expense.notes && (
                        <p className="text-xs text-slate-400 mt-1 truncate max-w-[150px]">
                          {expense.notes}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-slate-400">
                  <p>No expense data available</p>
                </div>
              )}
            </div>
          </div>

          {/* Charts Grid - Below Expenses */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Trend Chart */}
            <div className="bg-white rounded-xl p-5 border-0 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    6-Month Trend
                  </h3>
                  <p className="text-sm text-slate-500">
                    Income vs Expense trend
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                    <span className="text-xs text-slate-600">Income</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                    <span className="text-xs text-slate-600">Expense</span>
                  </div>
                </div>
              </div>
              <div className="h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dashboardData.monthlyTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis
                      dataKey="month"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#64748b", fontSize: 11 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#64748b", fontSize: 11 }}
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
            <div className="bg-white rounded-xl p-5 border-0 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    Weekly Performance
                  </h3>
                  <p className="text-sm text-slate-500">
                    This week's income & expense
                  </p>
                </div>
              </div>
              <div className="h-60">
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
                      tick={{ fill: "#64748b", fontSize: 11 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#64748b", fontSize: 11 }}
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
            <div className="bg-white rounded-xl p-5 border-0 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    Expenses by Category
                  </h3>
                  <p className="text-sm text-slate-500">
                    Distribution of expenses
                  </p>
                </div>
                <PieChartIcon className="w-5 h-5 text-slate-400" />
              </div>
              <div className="h-60">
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
                        outerRadius={70}
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
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-400">
                    <p>No expense data available</p>
                  </div>
                )}
              </div>
            </div>

            {/* Wallet Distribution */}
            <div className="bg-white rounded-xl p-5 border-0 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    Wallet Distribution
                  </h3>
                  <p className="text-sm text-slate-500">
                    Balance across wallets
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                {dashboardData.walletDistribution.length > 0 ? (
                  dashboardData.walletDistribution.map((wallet, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded"
                            style={{ backgroundColor: wallet.color }}
                          ></div>
                          <span className="text-sm font-medium text-slate-700">
                            {wallet.name}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-semibold text-slate-900">
                            {formatCurrency(wallet.value)}
                          </span>
                          <span className="text-xs text-slate-500 ml-2">
                            ({wallet.percentage.toFixed(1)}%)
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full transition-all duration-300"
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
                    <p>No wallet data available</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Add Button */}
      <a
        className="fixed bottom-24 lg:bottom-8 right-6 z-40 w-14 h-14 bg-green-600 hover:bg-green-700 rounded-full flex items-center justify-center shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 active:scale-95"
        href="/transactions"
      >
        <Plus className="w-7 h-7 text-white" />
      </a>
    </div>
  );
};

export default Dashboard;
