import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import BackgroundCircles from "../components/BackgroundCircles";
import TransactionForm from "../components/froms/TransactionForm";
import {
  Plus,
  SquarePen,
  Trash2,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  ArrowLeftRight,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowRightLeft,
  Wallet as WalletIcon,
  Briefcase,
  Car,
  Utensils,
  Paperclip,
  ChevronDown,
  Calendar,
  AlertCircle,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Clock,
} from "lucide-react";

const DeleteConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  transactionName,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="relative w-full max-w-md bg-white rounded-lg shadow-lg p-6 animate-in fade-in-0 zoom-in-95">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              Delete Transaction
            </h3>
            <p className="text-sm text-slate-500">
              This action cannot be undone
            </p>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-slate-700">
            Are you sure you want to delete the transaction{" "}
            <span className="font-semibold text-red-600">
              "{transactionName}"
            </span>
            ? This will remove the transaction permanently.
          </p>
        </div>

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 text-slate-700 hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-red-600 text-white shadow hover:bg-red-700 h-9 px-4 py-2"
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Delete Transaction
          </button>
        </div>
      </div>
    </div>
  );
};

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

const TimeFilterDropdown = ({ timeFilter, setTimeFilter, isLoading }) => {
  return (
    <div className="relative">
      <select
        value={timeFilter}
        onChange={(e) => setTimeFilter(e.target.value)}
        disabled={isLoading}
        className="w-full appearance-none rounded-lg border border-slate-200 bg-white py-2 pl-4 pr-10 text-sm text-slate-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 disabled:opacity-50"
      >
        <option value="all">All Time</option>
        <option value="today">Today</option>
        <option value="yesterday">Yesterday</option>
      </select>
      <Clock className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
    </div>
  );
};

const Transactions = () => {
  const [activeTypeTab, setActiveTypeTab] = useState("all");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [deletingTransaction, setDeletingTransaction] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [wallets, setWallets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [availableMonths, setAvailableMonths] = useState([]);
  const [monthlyData, setMonthlyData] = useState(null);
  const [showNoWalletWarning, setShowNoWalletWarning] = useState(false);
  const [autoOpenChecked, setAutoOpenChecked] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [timeFilter, setTimeFilter] = useState("all");

  const BASE_URL = import.meta.env.VITE_BASE_URL;

  const getAuthToken = () => {
    return localStorage.getItem("token");
  };

  useEffect(() => {
    fetchMonthlyTransactions();
    fetchAvailableMonths();
    fetchWalletsAndCategories();
  }, [selectedMonth, selectedYear, activeTypeTab]);

  // Check if we should auto-open the form (when coming from Dashboard plus button)
  useEffect(() => {
    if (!loading && !autoOpenChecked && wallets.length > 0) {
      const shouldOpenForm =
        sessionStorage.getItem("autoOpenTransactionForm") === "true";
      if (shouldOpenForm) {
        setIsCreateModalOpen(true);
        sessionStorage.removeItem("autoOpenTransactionForm");
        setAutoOpenChecked(true);
      }
    }
  }, [loading, wallets, autoOpenChecked]);

  const fetchMonthlyTransactions = async () => {
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

      let url = `${BASE_URL}/transactions/monthly?month=${selectedMonth}&year=${selectedYear}`;
      if (activeTypeTab !== "all") {
        url += `&type=${activeTypeTab}`;
      }

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setTransactions(result.data.transactions);
        setMonthlyData({
          totals: result.data.totals,
          month: result.data.month,
          year: result.data.year,
          monthName: result.data.monthName,
          count: result.data.count,
        });
      } else {
        throw new Error(result.error || "Failed to fetch transactions");
      }
    } catch (error) {
      setError(error.message || "Failed to load transactions");
      toast.error(error.message || "Failed to load transactions");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchAvailableMonths = async () => {
    try {
      const token = getAuthToken();
      if (!token) return;

      const response = await fetch(`${BASE_URL}/transactions/months`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();
      if (response.ok && result.success) {
        setAvailableMonths(result.data);
      }
    } catch (error) {
      // Silently fail for this endpoint
    }
  };

  const fetchWalletsAndCategories = async () => {
    try {
      const token = getAuthToken();
      if (!token) return;

      const walletsResponse = await fetch(
        `${BASE_URL}/wallets/monthly?month=${selectedMonth}&year=${selectedYear}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const walletsResult = await walletsResponse.json();
      if (walletsResponse.ok && walletsResult.success) {
        setWallets(walletsResult.data.wallets || []);
        if (walletsResult.data.wallets.length === 0) {
          setShowNoWalletWarning(true);
        } else {
          setShowNoWalletWarning(false);
        }
      } else {
        setWallets([]);
        setShowNoWalletWarning(true);
      }

      const categoriesResponse = await fetch(`${BASE_URL}/categories`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const categoriesResult = await categoriesResponse.json();
      if (categoriesResponse.ok && categoriesResult.success) {
        setCategories(categoriesResult.data);
      } else {
        setCategories([]);
      }
    } catch (error) {
      setWallets([]);
      setCategories([]);
      setShowNoWalletWarning(true);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "BDT",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
      .format(amount)
      .replace("BDT", "৳");
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return (
      date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }) +
      " • " +
      date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
    );
  };

  const formatDateMobile = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);

    // Check if it's today
    if (date.toDateString() === now.toDateString()) {
      return `Today • ${date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })}`;
    }

    // Check if it's yesterday
    if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday • ${date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })}`;
    }

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const getIconComponent = (category) => {
    if (!category) return <WalletIcon className="w-6 h-6" />;

    const iconProps = { className: "w-6 h-6" };
    switch (category.icon) {
      case "trending-up":
        return <TrendingUp {...iconProps} />;
      case "briefcase":
        return <Briefcase {...iconProps} />;
      case "car":
        return <Car {...iconProps} />;
      case "utensils":
        return <Utensils {...iconProps} />;
      case "wallet":
        return <WalletIcon {...iconProps} />;
      default:
        return <WalletIcon {...iconProps} />;
    }
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

  const getFilteredTransactions = () => {
    if (timeFilter === "all") {
      return transactions;
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    return transactions.filter((transaction) => {
      const transactionDate = new Date(transaction.date);
      const transactionDay = new Date(
        transactionDate.getFullYear(),
        transactionDate.getMonth(),
        transactionDate.getDate()
      );

      if (timeFilter === "today") {
        return transactionDay.getTime() === today.getTime();
      } else if (timeFilter === "yesterday") {
        return transactionDay.getTime() === yesterday.getTime();
      }

      return true;
    });
  };

  const handleCreateTransaction = async (transactionData) => {
    try {
      const token = getAuthToken();

      if (!token) {
        toast.error("No authentication token found. Please login again.");
        return;
      }

      if (wallets.length === 0) {
        toast.error(
          "No wallets found for this month. Please create wallets first."
        );
        setIsCreateModalOpen(false);
        return;
      }

      const response = await fetch(`${BASE_URL}/transactions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(transactionData),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        fetchMonthlyTransactions();
        fetchWalletsAndCategories();
        setIsCreateModalOpen(false);
        toast.success("Transaction created successfully");
      } else {
        throw new Error(result.error || "Failed to create transaction");
      }
    } catch (error) {
      toast.error(error.message || "Failed to create transaction");
    }
  };

  const handleEditTransaction = (transaction) => {
    const editData = {
      ...transaction,
      from_wallet_id:
        transaction.from_wallet_id?._id || transaction.from_wallet_id,
      to_wallet_id: transaction.to_wallet_id?._id || transaction.to_wallet_id,
      category_id: transaction.category_id?._id || transaction.category_id,
    };
    setEditingTransaction(editData);
    setIsEditModalOpen(true);
  };

  const handleUpdateTransaction = async (transactionData) => {
    try {
      const token = getAuthToken();

      if (!token) {
        toast.error("No authentication token found. Please login again.");
        return;
      }

      const response = await fetch(
        `${BASE_URL}/transactions/${editingTransaction._id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(transactionData),
        }
      );

      const result = await response.json();

      if (response.ok && result.success) {
        fetchMonthlyTransactions();
        fetchWalletsAndCategories();
        setIsEditModalOpen(false);
        setEditingTransaction(null);
        toast.success("Transaction updated successfully");
      } else {
        throw new Error(result.error || "Failed to update transaction");
      }
    } catch (error) {
      toast.error(error.message || "Failed to update transaction");
    }
  };

  const handleDeleteClick = (transaction) => {
    setDeletingTransaction(transaction);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingTransaction) return;

    try {
      const token = getAuthToken();

      if (!token) {
        toast.error("No authentication token found. Please login again.");
        return;
      }

      const response = await fetch(
        `${BASE_URL}/transactions/${deletingTransaction._id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const result = await response.json();

      if (response.ok && result.success) {
        fetchMonthlyTransactions();
        fetchWalletsAndCategories();
        setIsDeleteModalOpen(false);
        setDeletingTransaction(null);
        toast.success("Transaction deleted successfully");
      } else {
        throw new Error(result.error || "Failed to delete transaction");
      }
    } catch (error) {
      toast.error(error.message || "Failed to delete transaction");
    }
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeletingTransaction(null);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingTransaction(null);
  };

  const clearError = () => {
    setError(null);
  };

  const handleTypeTabClick = (type) => {
    setActiveTypeTab(type);
  };

  const handleMonthChange = (month) => {
    setSelectedMonth(month);
  };

  const handleYearChange = (year) => {
    setSelectedYear(year);
  };

  const handleCreateTransactionClick = () => {
    if (wallets.length === 0) {
      toast.error(
        "No wallets found for this month. Please create wallets first."
      );
      return;
    }
    setIsCreateModalOpen(true);
  };

  const handleRefresh = () => {
    fetchMonthlyTransactions();
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

  if (loading && !refreshing) {
    return (
      <div className="min-h-screen relative">
        <BackgroundCircles />
        <div className="flex items-center justify-center min-h-screen relative z-10 px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-slate-600">Loading transactions...</p>
          </div>
        </div>
      </div>
    );
  }

  const filteredTransactions = getFilteredTransactions();

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

      <div className="w-full mx-auto py-3 sm:py-6 relative z-10">
        <div className="space-y-3 sm:space-y-6 pb-16 sm:pb-20">
          {/* Mobile Header */}
          <div className="sm:hidden space-y-3 px-2 sm:px-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-slate-900">
                  Transactions
                </h1>
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
                onClick={handleCreateTransactionClick}
                disabled={wallets.length === 0}
                className={`p-2 rounded-lg flex-1 flex items-center justify-center ${
                  wallets.length === 0
                    ? "bg-gray-400 text-white cursor-not-allowed border-gray-400"
                    : "bg-green-600 text-white hover:bg-green-700 border-green-600"
                }`}
              >
                <Plus className="w-4 h-4" />
              </button>
              <button
                onClick={handleNextMonth}
                className="p-2 rounded-lg bg-white border border-slate-200 flex-1 flex items-center justify-center"
              >
                <ChevronRight className="w-4 h-4 text-slate-600" />
              </button>
            </div>

            {/* Mobile Type Tabs - Now at top like in image */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => handleTypeTabClick("all")}
                className={`flex items-center justify-center gap-2 whitespace-nowrap rounded-md px-3 py-2 text-xs font-medium transition-all duration-200 flex-1 ${
                  activeTypeTab === "all"
                    ? "bg-green-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                <span>All</span>
              </button>
              <button
                type="button"
                onClick={() => handleTypeTabClick("income")}
                className={`flex items-center justify-center gap-2 whitespace-nowrap rounded-md px-3 py-2 text-xs font-medium transition-all duration-200 flex-1 ${
                  activeTypeTab === "income"
                    ? "bg-green-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                <span>Income</span>
              </button>
              <button
                type="button"
                onClick={() => handleTypeTabClick("expense")}
                className={`flex items-center justify-center gap-2 whitespace-nowrap rounded-md px-3 py-2 text-xs font-medium transition-all duration-200 flex-1 ${
                  activeTypeTab === "expense"
                    ? "bg-green-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                <span>Expense</span>
              </button>
              <button
                type="button"
                onClick={() => handleTypeTabClick("transfer")}
                className={`flex items-center justify-center gap-2 whitespace-nowrap rounded-md px-3 py-2 text-xs font-medium transition-all duration-200 flex-1 ${
                  activeTypeTab === "transfer"
                    ? "bg-green-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                <span>Transfer</span>
              </button>
            </div>

            {/* Time Filter for Mobile */}
            <div className="relative">
              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
                disabled={loading}
                className="w-full appearance-none rounded-lg border border-slate-200 bg-white py-2 pl-3 pr-8 text-sm text-slate-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 disabled:opacity-50"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
              </select>
              <Clock className="absolute right-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
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
                      onMonthChange={handleMonthChange}
                      onYearChange={handleYearChange}
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
                  Transactions
                </h1>
                <p className="text-sm text-slate-600 mt-0.5">
                  Financial transactions for {getMonthName(selectedMonth)}{" "}
                  {selectedYear}
                </p>
              </div>

              <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                <div className="w-28 sm:w-32">
                  <MonthYearSelector
                    selectedMonth={selectedMonth}
                    selectedYear={selectedYear}
                    onMonthChange={handleMonthChange}
                    onYearChange={handleYearChange}
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

                <div className="w-28 sm:w-36">
                  <TimeFilterDropdown
                    timeFilter={timeFilter}
                    setTimeFilter={setTimeFilter}
                    isLoading={loading}
                  />
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
                  onClick={handleCreateTransactionClick}
                  disabled={wallets.length === 0}
                  className={`inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-9 px-2.5 sm:px-3 py-2 shadow-sm ${
                    wallets.length === 0
                      ? "bg-gray-400 text-white cursor-not-allowed"
                      : "bg-green-600 text-white hover:bg-green-700"
                  } flex-shrink-0`}
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Add Transaction</span>
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

          {/* No Wallet Warning */}
          {showNoWalletWarning && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-3 py-2 sm:px-4 sm:py-3 rounded-lg mx-2 sm:mx-4 lg:mx-6">
              <div className="flex items-start gap-2 sm:gap-3">
                <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm sm:text-base font-medium">
                    No wallets found for {getMonthName(selectedMonth)}{" "}
                    {selectedYear}
                  </p>
                  <p className="text-xs sm:text-sm mt-1">
                    You need to create wallets for this month before adding
                    transactions.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Available Months - Mobile */}
          {availableMonths.length > 0 && (
            <div className="bg-white rounded-xl p-3 sm:p-5 border-0 shadow-sm mx-2 sm:mx-4 lg:mx-6">
              <h3 className="text-sm font-semibold text-slate-900 mb-3">
                Available Months
              </h3>
              <div className="flex flex-wrap gap-2">
                {availableMonths
                  .map((monthData) => {
                    let month, year, monthName, transactionCount;

                    if (typeof monthData === "object" && monthData !== null) {
                      month = monthData.month;
                      year = monthData.year;
                      monthName =
                        monthData.monthName || getMonthName(monthData.month);
                      transactionCount = monthData.transactionCount || 0;
                    } else {
                      return null;
                    }

                    if (!month || isNaN(month) || month < 1 || month > 12) {
                      return null;
                    }

                    if (!year || isNaN(year) || year < 2000 || year > 2100) {
                      return null;
                    }

                    return (
                      <button
                        key={`${year}-${month}`}
                        onClick={() => {
                          setSelectedMonth(month);
                          setSelectedYear(year);
                        }}
                        className={`px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg text-xs sm:text-sm border transition-colors ${
                          selectedMonth === month && selectedYear === year
                            ? "bg-green-100 text-green-800 border-green-300"
                            : "bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200"
                        }`}
                      >
                        {monthName} {year}
                        {transactionCount > 0 && (
                          <span className="ml-1 sm:ml-2 text-xs bg-slate-200 px-1 sm:px-1.5 py-0.5 rounded">
                            {transactionCount}
                          </span>
                        )}
                      </button>
                    );
                  })
                  .filter(Boolean)}
              </div>
            </div>
          )}

          {/* Monthly Summary Cards */}
          {monthlyData && (
            <div className="bg-white rounded-xl p-3 sm:p-5 border-0 shadow-sm mx-2 sm:mx-4 lg:mx-6">
              <div className="mb-3 sm:mb-4">
                <h3 className="text-base sm:text-lg font-semibold text-slate-900">
                  Monthly Summary
                </h3>
                <p className="text-xs sm:text-sm text-slate-500">
                  {getMonthName(selectedMonth)} {selectedYear}
                  {timeFilter !== "all" && (
                    <span className="ml-2 text-green-600 font-medium">
                      • Filtered:{" "}
                      {timeFilter === "today" ? "Today" : "Yesterday"}
                    </span>
                  )}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 sm:gap-4">
                {/* Income Card */}
                <div className="border border-slate-200 rounded-lg p-3 sm:p-4 hover:border-green-300 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm text-slate-500 mb-1 sm:mb-2">
                        Income
                      </p>
                      {loading ? (
                        <div className="h-7 sm:h-8 bg-slate-200 rounded animate-pulse w-3/4"></div>
                      ) : (
                        <p className="text-xl sm:text-2xl font-bold text-green-600 truncate">
                          {formatCurrency(monthlyData.totals?.income || 0)}
                        </p>
                      )}
                    </div>
                    <div className="p-2 sm:p-2.5 rounded-lg text-green-600 bg-green-50 flex-shrink-0 ml-2">
                      <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                  </div>
                </div>

                {/* Expense Card */}
                <div className="border border-slate-200 rounded-lg p-3 sm:p-4 hover:border-red-300 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm text-slate-500 mb-1 sm:mb-2">
                        Expense
                      </p>
                      {loading ? (
                        <div className="h-7 sm:h-8 bg-slate-200 rounded animate-pulse w-3/4"></div>
                      ) : (
                        <p className="text-xl sm:text-2xl font-bold text-red-600 truncate">
                          {formatCurrency(monthlyData.totals?.expense || 0)}
                        </p>
                      )}
                    </div>
                    <div className="p-2 sm:p-2.5 rounded-lg text-red-600 bg-red-50 flex-shrink-0 ml-2">
                      <TrendingDown className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                  </div>
                </div>

                {/* Net Balance Card */}
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
                            (monthlyData.totals?.netBalance || 0) >= 0
                              ? "text-blue-600"
                              : "text-red-600"
                          }`}
                        >
                          {formatCurrency(monthlyData.totals?.netBalance || 0)}
                        </p>
                      )}
                    </div>
                    <div className="p-2 sm:p-2.5 rounded-lg text-blue-600 bg-blue-50 flex-shrink-0 ml-2">
                      <ArrowLeftRight className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-slate-200">
                <p className="text-xs sm:text-sm text-slate-500">
                  {filteredTransactions.length === 0
                    ? "No transactions found"
                    : `Showing ${filteredTransactions.length} transaction${
                        filteredTransactions.length !== 1 ? "s" : ""
                      }`}
                  {timeFilter !== "all" &&
                    transactions.length > filteredTransactions.length && (
                      <span className="text-slate-400">
                        {" "}
                        (filtered from {transactions.length})
                      </span>
                    )}
                </p>
              </div>
            </div>
          )}

          {/* Type Tabs - Desktop Only */}
          <div className="bg-white rounded-xl p-2 sm:p-3 border-0 shadow-sm mx-2 sm:mx-4 lg:mx-6">
            {/* Only show on desktop */}
            <div className="hidden sm:block">
              <div
                role="tablist"
                className="h-9 items-center justify-center rounded-lg p-1 text-muted-foreground grid w-full grid-cols-4 bg-slate-100"
              >
                <button
                  type="button"
                  role="tab"
                  onClick={() => handleTypeTabClick("all")}
                  className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer ${
                    activeTypeTab === "all"
                      ? "bg-green-500 text-white shadow"
                      : "hover:bg-slate-200"
                  }`}
                >
                  All
                </button>
                <button
                  type="button"
                  role="tab"
                  onClick={() => handleTypeTabClick("income")}
                  className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer ${
                    activeTypeTab === "income"
                      ? "bg-green-500 text-white shadow"
                      : "hover:bg-slate-200"
                  }`}
                >
                  Income
                </button>
                <button
                  type="button"
                  role="tab"
                  onClick={() => handleTypeTabClick("expense")}
                  className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer ${
                    activeTypeTab === "expense"
                      ? "bg-green-500 text-white shadow"
                      : "hover:bg-slate-200"
                  }`}
                >
                  Expense
                </button>
                <button
                  type="button"
                  role="tab"
                  onClick={() => handleTypeTabClick("transfer")}
                  className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer ${
                    activeTypeTab === "transfer"
                      ? "bg-green-500 text-white shadow"
                      : "hover:bg-slate-200"
                  }`}
                >
                  Transfer
                </button>
              </div>
            </div>
          </div>

          {/* Transactions List */}
          <div className="space-y-2 sm:space-y-3 mx-2 sm:mx-4 lg:mx-6">
            {filteredTransactions.map((transaction) => {
              const category = transaction.category_id;
              const fromWallet = transaction.from_wallet_id;
              const toWallet = transaction.to_wallet_id;

              const isIncome = transaction.type === "income";
              const isExpense = transaction.type === "expense";
              const isTransfer = transaction.type === "transfer";

              const displayType = transaction.type;

              return (
                <div
                  key={transaction._id}
                  className="rounded-xl bg-white text-card-foreground shadow-sm group hover:shadow-md transition-all duration-200 border-0"
                >
                  <div className="p-3 sm:p-4">
                    <div className="flex items-start gap-3">
                      <div
                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shadow-sm flex-shrink-0"
                        style={{
                          backgroundColor: isTransfer
                            ? "rgb(241, 245, 249)"
                            : category?.color
                            ? `${category.color}20`
                            : "rgba(132, 204, 22, 0.082)",
                        }}
                      >
                        {isTransfer ? (
                          <ArrowRightLeft className="w-4 h-4 sm:w-5 sm:h-5 text-slate-500" />
                        ) : (
                          getIconComponent(category)
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                          <h3 className="font-semibold text-slate-900 text-sm sm:text-base truncate">
                            {isTransfer
                              ? `${fromWallet?.name || "Wallet"} → ${
                                  toWallet?.name || "Wallet"
                                }`
                              : category?.name || "Uncategorized"}
                          </h3>
                          <div
                            className={`inline-flex items-center rounded-md border px-2 py-0.5 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-xs w-fit ${
                              displayType === "income"
                                ? "text-green-600 bg-green-50 border-green-200"
                                : displayType === "expense"
                                ? "text-red-600 bg-red-50 border-red-200"
                                : "text-blue-600 bg-blue-50 border-blue-200"
                            }`}
                          >
                            {displayType === "income" ? (
                              <ArrowDownLeft className="w-3 h-3" />
                            ) : displayType === "expense" ? (
                              <ArrowUpRight className="w-3 h-3" />
                            ) : (
                              <ArrowRightLeft className="w-3 h-3" />
                            )}
                            <span className="ml-1 capitalize text-xs">
                              {displayType}
                            </span>
                          </div>
                        </div>
                        {transaction.notes && (
                          <p className="text-xs text-slate-600 mt-1.5 line-clamp-1 sm:line-clamp-2">
                            {transaction.notes}
                          </p>
                        )}

                        {/* Desktop Info */}
                        <div className="hidden sm:flex items-center gap-3 text-xs text-slate-500 py-2">
                          <span>{formatDate(transaction.date)}</span>
                          {isTransfer ? (
                            <>
                              <span className="flex items-center gap-1">
                                <WalletIcon className="w-3 h-3" />
                                From: {fromWallet?.name || "Wallet"}
                              </span>
                              <span className="flex items-center gap-1">
                                <WalletIcon className="w-3 h-3" />
                                To: {toWallet?.name || "Wallet"}
                              </span>
                            </>
                          ) : (
                            <span className="flex items-center gap-1">
                              <WalletIcon className="w-3 h-3" />
                              {fromWallet?.name || "Wallet"}
                            </span>
                          )}
                          {transaction.attachment && (
                            <span className="flex items-center gap-1 text-blue-600">
                              <Paperclip className="w-3 h-3" />
                              Attached
                            </span>
                          )}
                        </div>

                        {/* Mobile Info */}
                        <div className="sm:hidden flex flex-col gap-1 text-xs text-slate-500 py-2">
                          <span>{formatDateMobile(transaction.date)}</span>
                          <div className="flex items-center gap-2">
                            {isTransfer ? (
                              <>
                                <span className="flex items-center gap-1 truncate">
                                  <WalletIcon className="w-3 h-3 flex-shrink-0" />
                                  <span className="truncate">
                                    {fromWallet?.name || "Wallet"}
                                  </span>
                                </span>
                                <span>→</span>
                                <span className="flex items-center gap-1 truncate">
                                  <WalletIcon className="w-3 h-3 flex-shrink-0" />
                                  <span className="truncate">
                                    {toWallet?.name || "Wallet"}
                                  </span>
                                </span>
                              </>
                            ) : (
                              <span className="flex items-center gap-1 truncate">
                                <WalletIcon className="w-3 h-3 flex-shrink-0" />
                                <span className="truncate">
                                  {fromWallet?.name || "Wallet"}
                                </span>
                              </span>
                            )}
                            {transaction.attachment && (
                              <Paperclip className="w-3 h-3 text-blue-600 flex-shrink-0" />
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <div className="text-right">
                          <p
                            className={`text-sm sm:text-base font-bold ${
                              displayType === "income"
                                ? "text-green-600"
                                : displayType === "expense"
                                ? "text-red-600"
                                : "text-blue-600"
                            }`}
                          >
                            {displayType === "income"
                              ? "+"
                              : displayType === "expense"
                              ? "-"
                              : ""}
                            {formatCurrency(transaction.amount)}
                          </p>
                        </div>
                        <div className="flex gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleEditTransaction(transaction)}
                            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-7 w-7 sm:h-8 sm:w-8"
                          >
                            <SquarePen className="w-3 h-3 sm:w-4 sm:h-4 text-slate-600" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(transaction)}
                            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-7 w-7 sm:h-8 sm:w-8"
                          >
                            <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 text-red-500" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredTransactions.length === 0 && (
            <div className="text-center py-6 sm:py-8 mx-2 sm:mx-4 lg:mx-6">
              <div className="bg-white rounded-xl p-4 sm:p-6 border-0 shadow-sm">
                <p className="text-slate-500 text-base sm:text-lg">
                  {timeFilter !== "all"
                    ? `No ${timeFilter} transactions found`
                    : "No transactions found"}
                </p>
                <p className="text-slate-400 mt-1 text-sm">
                  {activeTypeTab === "all"
                    ? timeFilter !== "all"
                      ? `No ${timeFilter} transactions for ${getMonthName(
                          selectedMonth
                        )} ${selectedYear}`
                      : `No transactions for ${getMonthName(
                          selectedMonth
                        )} ${selectedYear}`
                    : timeFilter !== "all"
                    ? `No ${activeTypeTab} ${timeFilter} transactions found for ${getMonthName(
                        selectedMonth
                      )} ${selectedYear}`
                    : `No ${activeTypeTab} transactions found for ${getMonthName(
                        selectedMonth
                      )} ${selectedYear}`}
                </p>
                <button
                  onClick={handleCreateTransactionClick}
                  disabled={wallets.length === 0}
                  className={`mt-3 sm:mt-4 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-9 sm:h-10 px-3 sm:px-4 py-2 shadow ${
                    wallets.length === 0
                      ? "bg-gray-400 text-white cursor-not-allowed"
                      : "bg-green-600 text-white hover:bg-green-700"
                  }`}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Transaction
                </button>
                {wallets.length === 0 && (
                  <p className="text-xs sm:text-sm text-red-600 mt-2">
                    You need to create wallets for this month first
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Floating Action Button for Mobile */}
      <button
        onClick={handleCreateTransactionClick}
        disabled={wallets.length === 0}
        className={`fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-40 w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 cursor-pointer ${
          wallets.length === 0
            ? "bg-gray-400 text-white cursor-not-allowed"
            : "bg-green-600 hover:bg-green-700 text-white"
        }`}
        title="Add Transaction"
      >
        <Plus className="w-5 h-5 sm:w-7 sm:h-7" />
      </button>

      <TransactionForm
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setAutoOpenChecked(true); // Prevent auto-opening again
        }}
        onSubmit={handleCreateTransaction}
        wallets={wallets}
        categories={categories}
        isEdit={false}
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
      />

      {isEditModalOpen && (
        <TransactionForm
          isOpen={isEditModalOpen}
          onClose={closeEditModal}
          onSubmit={handleUpdateTransaction}
          editData={editingTransaction}
          wallets={wallets}
          categories={categories}
          isEdit={true}
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
        />
      )}

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteConfirm}
        transactionName={
          deletingTransaction?.notes ||
          (deletingTransaction?.type === "transfer"
            ? `Transfer from ${
                deletingTransaction?.from_wallet_id?.name || "Wallet"
              } to ${deletingTransaction?.to_wallet_id?.name || "Wallet"}`
            : deletingTransaction?.category_id?.name || "Transaction")
        }
      />
    </div>
  );
};

export default Transactions;
