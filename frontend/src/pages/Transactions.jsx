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
  const [error, setError] = useState(null);
  const [availableMonths, setAvailableMonths] = useState([]);
  const [monthlyData, setMonthlyData] = useState(null);
  const [showNoWalletWarning, setShowNoWalletWarning] = useState(false);
  const [autoOpenChecked, setAutoOpenChecked] = useState(false);

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
      setError(null);
      const token = getAuthToken();

      if (!token) {
        setError("No authentication token found. Please login again.");
        setLoading(false);
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
      })
    );
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

  if (loading) {
    return (
      <div className="min-h-screen relative">
        <div className="fixed inset-0 z-0">
          <BackgroundCircles />
        </div>
        <div className="flex items-center justify-center min-h-screen relative z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-slate-600">Loading transactions...</p>
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
        <div className="space-y-6 pb-20">
          {/* Header with Controls in One Line */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Transactions
              </h1>
              <p className="text-sm text-slate-600 mt-0.5">
                Financial transactions for {getMonthName(selectedMonth)}{" "}
                {selectedYear}
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Month Selector */}
              <div className="w-32">
                <MonthYearSelector
                  selectedMonth={selectedMonth}
                  selectedYear={selectedYear}
                  onMonthChange={handleMonthChange}
                  onYearChange={handleYearChange}
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

              {/* Add Transaction Button */}
              <button
                onClick={handleCreateTransactionClick}
                disabled={wallets.length === 0}
                className={`inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-9 px-4 py-2 shadow-lg ${
                  wallets.length === 0
                    ? "bg-gray-400 text-white cursor-not-allowed"
                    : "bg-green-600 text-white hover:bg-green-700"
                }`}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Transaction
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

          {showNoWalletWarning && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-medium">
                    No wallets found for {getMonthName(selectedMonth)}{" "}
                    {selectedYear}
                  </p>
                  <p className="text-sm mt-1">
                    You need to create wallets for this month before adding
                    transactions. Go to the{" "}
                    <a
                      href="/wallets"
                      className="text-blue-600 hover:underline font-medium"
                    >
                      Wallets page
                    </a>{" "}
                    to create wallets first.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Available Months */}
          {availableMonths.length > 0 && (
            <div className="bg-white rounded-xl p-4 border-0 shadow-sm">
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
                        className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                          selectedMonth === month && selectedYear === year
                            ? "bg-green-100 text-green-800 border-green-300"
                            : "bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200"
                        }`}
                      >
                        {monthName} {year}
                        {transactionCount > 0 && (
                          <span className="ml-2 text-xs bg-slate-200 px-1.5 py-0.5 rounded">
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-xl text-card-foreground bg-white border-0 shadow-sm">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-green-700">Income</p>
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                  <p className="text-2xl font-bold text-green-900">
                    {formatCurrency(monthlyData.totals?.income || 0)}
                  </p>
                </div>
              </div>

              <div className="rounded-xl text-card-foreground bg-white border-0 shadow-sm">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-red-700">Expense</p>
                    <TrendingDown className="w-5 h-5 text-red-600" />
                  </div>
                  <p className="text-2xl font-bold text-red-900">
                    {formatCurrency(monthlyData.totals?.expense || 0)}
                  </p>
                </div>
              </div>

              <div className="rounded-xl text-card-foreground bg-white border-0 shadow-sm">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-blue-700">
                      Net Balance
                    </p>
                    <ArrowLeftRight className="w-5 h-5 text-blue-600" />
                  </div>
                  <p
                    className={`text-2xl font-bold ${
                      (monthlyData.totals?.netBalance || 0) >= 0
                        ? "text-blue-900"
                        : "text-red-900"
                    }`}
                  >
                    {formatCurrency(monthlyData.totals?.netBalance || 0)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Month Info */}
          {monthlyData && (
            <div className="bg-white rounded-xl p-4 border-0 shadow-sm">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    {monthlyData.monthName} {monthlyData.year}
                  </h3>
                  <p className="text-sm text-slate-600">
                    {transactions.length === 0
                      ? "No transactions for this month"
                      : `Showing ${transactions.length} transaction${
                          transactions.length !== 1 ? "s" : ""
                        } for this month`}
                  </p>
                </div>
                {wallets.length === 0 && (
                  <div className="text-sm text-yellow-600">
                    <AlertCircle className="w-4 h-4 inline mr-1" />
                    No wallets for this month
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Type Tabs */}
          <div className="bg-white rounded-xl p-4 border-0 shadow-sm">
            <div className="h-9 items-center justify-center rounded-lg p-1 text-muted-foreground grid w-full grid-cols-4">
              <button
                type="button"
                onClick={() => handleTypeTabClick("all")}
                className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer ${
                  activeTypeTab === "all"
                    ? "bg-green-500 text-white shadow"
                    : "hover:bg-slate-100"
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => handleTypeTabClick("income")}
                className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer ${
                  activeTypeTab === "income"
                    ? "bg-green-500 text-white shadow"
                    : "hover:bg-slate-100"
                }`}
              >
                Income
              </button>
              <button
                type="button"
                onClick={() => handleTypeTabClick("expense")}
                className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer ${
                  activeTypeTab === "expense"
                    ? "bg-green-500 text-white shadow"
                    : "hover:bg-slate-100"
                }`}
              >
                Expense
              </button>
              <button
                type="button"
                onClick={() => handleTypeTabClick("transfer")}
                className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer ${
                  activeTypeTab === "transfer"
                    ? "bg-green-500 text-white shadow"
                    : "hover:bg-slate-100"
                }`}
              >
                Transfer
              </button>
            </div>
          </div>

          {/* Transactions List */}
          <div className="space-y-3">
            {transactions.map((transaction) => {
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
                  className="rounded-xl bg-white text-card-foreground shadow group hover:shadow-md transition-all duration-200 border-0"
                >
                  <div className="p-4">
                    <div className="flex items-center gap-4">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm"
                        style={{
                          backgroundColor: isTransfer
                            ? "rgb(241, 245, 249)"
                            : category?.color
                            ? `${category.color}20`
                            : "rgba(132, 204, 22, 0.082)",
                        }}
                      >
                        {isTransfer ? (
                          <ArrowRightLeft className="w-6 h-6 text-slate-500" />
                        ) : (
                          getIconComponent(category)
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-slate-900 truncate">
                            {isTransfer
                              ? `${fromWallet?.name || "Wallet"} → ${
                                  toWallet?.name || "Wallet"
                                }`
                              : category?.name || "Uncategorized"}
                          </h3>
                          <div
                            className={`inline-flex items-center rounded-md border px-2.5 py-0.5 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-xs ${
                              displayType === "income"
                                ? "text-green-600 bg-green-50 border-green-200"
                                : displayType === "expense"
                                ? "text-red-600 bg-red-50 border-red-200"
                                : "text-blue-600 bg-blue-50 border-blue-200"
                            }`}
                          >
                            {displayType === "income" ? (
                              <ArrowDownLeft className="w-4 h-4" />
                            ) : displayType === "expense" ? (
                              <ArrowUpRight className="w-4 h-4" />
                            ) : (
                              <ArrowRightLeft className="w-4 h-4" />
                            )}
                            <span className="ml-1 capitalize">
                              {displayType}
                            </span>
                          </div>
                        </div>
                        {transaction.notes && (
                          <p className="text-xs text-slate-600 mt-1.5 line-clamp-1">
                            {transaction.notes}
                          </p>
                        )}

                        <div className="flex items-center gap-3 text-xs text-slate-500 py-2">
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
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p
                            className={`text-lg font-bold ${
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
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleEditTransaction(transaction)}
                            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-8 w-8"
                          >
                            <SquarePen className="w-4 h-4 text-slate-600" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(transaction)}
                            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-8 w-8"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {transactions.length === 0 && (
            <div className="text-center py-12">
              <div className="bg-white rounded-xl p-8 border-0 shadow-sm">
                <p className="text-slate-500 text-lg">No transactions found</p>
                <p className="text-slate-400 mt-2">
                  {activeTypeTab === "all"
                    ? `No transactions for ${getMonthName(
                        selectedMonth
                      )} ${selectedYear}`
                    : `No ${activeTypeTab} transactions found for ${getMonthName(
                        selectedMonth
                      )} ${selectedYear}`}
                </p>
                <button
                  onClick={handleCreateTransactionClick}
                  disabled={wallets.length === 0}
                  className={`mt-4 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-9 px-4 py-2 shadow-lg ${
                    wallets.length === 0
                      ? "bg-gray-400 text-white cursor-not-allowed"
                      : "bg-green-600 text-white hover:bg-green-700"
                  }`}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Transaction
                </button>
                {wallets.length === 0 && (
                  <p className="text-sm text-red-600 mt-2">
                    You need to create wallets for this month first
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

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
