import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import BackgroundCircles from "../components/BackgroundCircles";
import BudgetForm from "../components/froms/BudgetForm";
import {
  Plus,
  SquarePen,
  Trash2,
  Eye,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Calendar,
  ChevronDown,
  X,
  TriangleAlert,
  Copy,
  Wallet as WalletIcon,
  ArrowUpRight,
  Paperclip,
  Menu,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const DeleteConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  budgetName,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="relative w-full max-w-md bg-white rounded-lg shadow-lg p-6 animate-in fade-in-0 zoom-in-95 mx-2">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              Delete Budget
            </h3>
            <p className="text-sm text-slate-500">
              This action cannot be undone
            </p>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-slate-700">
            Are you sure you want to delete the budget for{" "}
            <span className="font-semibold text-red-600">"{budgetName}"</span>?
            This will remove the budget permanently.
          </p>
        </div>

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 text-slate-700 hover:bg-slate-100 mt-2 sm:mt-0"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-red-600 text-white shadow hover:bg-red-700 h-9 px-4 py-2"
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Delete Budget
          </button>
        </div>
      </div>
    </div>
  );
};

const BudgetTransactionsModal = ({
  isOpen,
  onClose,
  budgetId,
  categoryId,
  month,
  year,
  categoryName,
  budgetLimit,
}) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totals, setTotals] = useState({
    spent: 0,
    limit: budgetLimit || 0,
    remaining: budgetLimit || 0,
    percentage: 0,
    isOverBudget: false,
    overBy: 0,
    transactionCount: 0,
  });

  const BASE_URL = import.meta.env.VITE_BASE_URL;

  const getAuthToken = () => {
    return localStorage.getItem("token");
  };

  useEffect(() => {
    if (isOpen && categoryId) {
      fetchBudgetTransactions();
    }
  }, [isOpen, categoryId, month, year, budgetLimit]);

  const fetchBudgetTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = getAuthToken();

      if (!token) {
        setError("No authentication token found. Please login again.");
        setLoading(false);
        return;
      }

      // Fetch all transactions for this month/year
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);

      const response = await fetch(
        `${BASE_URL}/transactions/monthly?month=${month}&year=${year}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const result = await response.json();

      if (response.ok && result.success) {
        // Filter transactions for this category (expense only)
        const categoryTransactions = result.data.transactions.filter(
          (t) =>
            t.type === "expense" &&
            (t.category_id?._id === categoryId || t.category_id === categoryId)
        );

        setTransactions(categoryTransactions);

        // Calculate totals
        const spent = categoryTransactions.reduce(
          (sum, t) => sum + (t.amount || 0),
          0
        );
        const limit = budgetLimit || 0;
        const remaining = Math.max(0, limit - spent);
        const percentage = limit > 0 ? Math.min(100, (spent / limit) * 100) : 0;

        setTotals({
          spent,
          limit,
          remaining,
          percentage,
          isOverBudget: spent > limit,
          overBy: Math.max(0, spent - limit),
          transactionCount: categoryTransactions.length,
        });
      } else {
        throw new Error(result.error || "Failed to fetch transactions");
      }
    } catch (error) {
      setError(error.message || "Failed to load transactions");
    } finally {
      setLoading(false);
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="relative w-full max-w-4xl bg-white rounded-lg shadow-lg p-4 sm:p-6 animate-in fade-in-0 zoom-in-95 max-h-[90vh] overflow-hidden flex flex-col mx-2 sm:mx-0">
        {/* Header - Fixed at top */}
        <div className="flex items-center justify-between mb-4 sm:mb-6 pb-3 sm:pb-4 border-b sticky top-0 bg-white z-10">
          <div className="flex-1 min-w-0">
            <h3 className="text-base sm:text-lg font-semibold text-slate-900 truncate">
              Budget Transactions
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 truncate">
              {categoryName} - {getMonthName(month)} {year}
            </p>
          </div>
          <button
            onClick={onClose}
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-8 w-8 flex-shrink-0 ml-2"
          >
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        {/* Summary Card - Scrollable content starts here */}
        <div className="flex-1 overflow-y-auto">
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-slate-50 rounded-lg">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-slate-900 truncate text-sm sm:text-base">
                  {categoryName}
                </h4>
                <p className="text-xs sm:text-sm text-slate-500 truncate">
                  {getMonthName(month)} {year}
                </p>
              </div>
              {totals.isOverBudget && (
                <div className="flex items-center gap-1 text-red-600 flex-shrink-0 ml-2">
                  <TriangleAlert className="w-4 h-4" />
                  <span className="text-xs sm:text-sm font-medium hidden sm:inline">
                    Over Budget
                  </span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <div className="text-center sm:text-left">
                <p className="text-xs text-slate-500">Budget</p>
                <p className="text-base sm:text-lg font-semibold text-slate-700 truncate">
                  {formatCurrency(totals.limit)}
                </p>
              </div>
              <div className="text-center sm:text-left">
                <p className="text-xs text-red-500">Spent</p>
                <p className="text-base sm:text-lg font-semibold text-red-600 truncate">
                  {formatCurrency(totals.spent)}
                </p>
              </div>
              <div className="text-center sm:text-left">
                <p className="text-xs text-blue-500">Remaining</p>
                <p
                  className={`text-base sm:text-lg font-semibold truncate ${
                    totals.remaining >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {formatCurrency(totals.remaining)}
                </p>
              </div>
              <div className="text-center sm:text-left">
                <p className="text-xs text-slate-500">Usage</p>
                <p
                  className={`text-base sm:text-lg font-semibold truncate ${
                    totals.isOverBudget ? "text-red-600" : "text-green-600"
                  }`}
                >
                  {Math.round(totals.percentage)}%
                </p>
              </div>
            </div>

            <div className="mt-3 sm:mt-4 relative w-full overflow-hidden rounded-full bg-slate-200 h-2 sm:h-3">
              <div
                className={`h-full transition-all ${
                  totals.isOverBudget
                    ? "bg-red-600"
                    : totals.percentage > 80
                    ? "bg-orange-500"
                    : totals.percentage > 50
                    ? "bg-yellow-500"
                    : "bg-green-600"
                }`}
                style={{
                  width: totals.isOverBudget
                    ? "100%"
                    : `${Math.min(100, totals.percentage)}%`,
                }}
              />
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm">{error}</span>
                <button
                  onClick={() => setError(null)}
                  className="text-red-500 hover:text-red-700 text-lg font-bold"
                >
                  ×
                </button>
              </div>
            </div>
          )}

          {loading && (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                <p className="mt-2 text-slate-600">Loading transactions...</p>
              </div>
            </div>
          )}

          {!loading && transactions.length > 0 && (
            <div className="space-y-2 sm:space-y-3">
              {transactions.map((transaction) => {
                const category = transaction.category_id;
                const fromWallet = transaction.from_wallet_id;

                return (
                  <div
                    key={transaction._id}
                    className="p-3 sm:p-4 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div
                        className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{
                          backgroundColor: "rgba(239, 68, 68, 0.1)",
                        }}
                      >
                        <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5 sm:mb-1">
                          <h4 className="font-medium text-slate-900 truncate text-sm sm:text-base">
                            {category?.name || "Uncategorized"}
                          </h4>
                          <div className="inline-flex items-center rounded-md border px-1.5 py-0.5 text-xs font-medium text-red-600 bg-red-50 border-red-200 flex-shrink-0">
                            Expense
                          </div>
                        </div>
                        {transaction.notes && (
                          <p className="text-xs sm:text-sm text-slate-600 mb-1 line-clamp-1">
                            {transaction.notes}
                          </p>
                        )}
                        <div className="flex items-center flex-wrap gap-1 sm:gap-2 text-xs text-slate-500">
                          <span>{formatDate(transaction.date)}</span>
                          <span className="hidden sm:inline">•</span>
                          <span className="flex items-center gap-1">
                            <WalletIcon className="w-3 h-3" />
                            <span className="truncate max-w-[100px]">
                              {fromWallet?.name || "Wallet"}
                            </span>
                          </span>
                          {transaction.attachment && (
                            <>
                              <span className="hidden sm:inline">•</span>
                              <span className="flex items-center gap-1 text-blue-600">
                                <Paperclip className="w-3 h-3" />
                                <span className="hidden sm:inline">
                                  Attached
                                </span>
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0 ml-2">
                        <p className="text-sm sm:text-lg font-bold text-red-600">
                          -{formatCurrency(transaction.amount)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {!loading && transactions.length === 0 && (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <WalletIcon className="w-6 h-6 sm:w-8 sm:h-8 text-slate-400" />
                </div>
                <p className="text-slate-500 text-sm sm:text-lg mb-1 sm:mb-2">
                  No transactions found
                </p>
                <p className="text-slate-400 text-xs sm:text-sm">
                  No expense transactions for this budget in{" "}
                  {getMonthName(month)} {year}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer - Fixed at bottom */}
        <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t bg-white sticky bottom-0">
          <div className="flex justify-between items-center text-xs sm:text-sm text-slate-600">
            <span>
              {totals.transactionCount} transaction
              {totals.transactionCount !== 1 ? "s" : ""}
            </span>
            <button
              onClick={onClose}
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-3 sm:px-4 py-2 text-slate-700 hover:bg-slate-100"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const CopyBudgetModal = ({
  isOpen,
  onClose,
  onConfirm,
  copying,
  month,
  year,
}) => {
  if (!isOpen) return null;

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
    return months[monthNumber - 1] || "";
  };

  let prevMonth = month - 1;
  let prevYear = year;

  if (prevMonth < 1) {
    prevMonth = 12;
    prevYear = year - 1;
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="relative w-full max-w-md bg-white rounded-lg shadow-lg p-6 animate-in fade-in-0 zoom-in-95 mx-2">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <Copy className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              Copy Budgets
            </h3>
            <p className="text-sm text-slate-500">
              Copy budgets from previous month
            </p>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-slate-700">
            Do you want to copy budgets from{" "}
            <span className="font-semibold">
              {getMonthName(prevMonth)} {prevYear}
            </span>
            ? This will create new budgets with the same monthly limits for{" "}
            <span className="font-semibold">
              {getMonthName(month)} {year}
            </span>
            .
          </p>
        </div>

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 bg-red-600 text-white hover:bg-white hover:text-red-600 mt-2 sm:mt-0"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={copying}
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background text-primary-foreground shadow h-9 px-4 py-2 bg-green-600 text-white hover:bg-white hover:text-green-600"
          >
            {copying ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Copying...</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-1" />
                Copy Budgets
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const Budgets = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isCopyModalOpen, setIsCopyModalOpen] = useState(false);
  const [isTransactionsModalOpen, setIsTransactionsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [deletingBudget, setDeletingBudget] = useState(null);
  const [selectedBudgetForTransactions, setSelectedBudgetForTransactions] =
    useState(null);
  const [selectedCategoryForTransactions, setSelectedCategoryForTransactions] =
    useState(null);
  const [selectedCategoryName, setSelectedCategoryName] = useState("");
  const [selectedBudgetLimit, setSelectedBudgetLimit] = useState(0);
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [availableMonths, setAvailableMonths] = useState([]);
  const [monthlyData, setMonthlyData] = useState(null);
  const [copying, setCopying] = useState(false);
  const [showMonthSelector, setShowMonthSelector] = useState(false);

  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(
    currentDate.getMonth() + 1
  );
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  const BASE_URL = import.meta.env.VITE_BASE_URL;

  const getAuthToken = () => {
    return localStorage.getItem("token");
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

  const fetchMonthlyBudgets = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = getAuthToken();

      if (!token) {
        setError("No authentication token found. Please login again.");
        setLoading(false);
        return;
      }

      const response = await fetch(
        `${BASE_URL}/budgets/monthly?month=${selectedMonth}&year=${selectedYear}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const result = await response.json();

      if (response.ok && result.success) {
        setBudgets(result.data.budgets);
        setMonthlyData({
          totals: result.data.totals,
          month: result.data.month,
          year: result.data.year,
          monthName: result.data.monthName,
        });
      } else {
        throw new Error(result.error || "Failed to fetch budgets");
      }
    } catch (error) {
      setError(error.message || "Failed to load budgets");
      toast.error(error.message || "Failed to load budgets");
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableMonths = async () => {
    try {
      const token = getAuthToken();
      if (!token) return;

      const response = await fetch(`${BASE_URL}/budgets/months`, {
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

  const fetchCategories = async () => {
    try {
      const token = getAuthToken();
      if (!token) return;

      const response = await fetch(`${BASE_URL}/categories`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();
      if (response.ok && result.success) {
        setCategories(result.data);
      }
    } catch (error) {
      setCategories([]);
    }
  };

  useEffect(() => {
    fetchMonthlyBudgets();
    fetchAvailableMonths();
    fetchCategories();
  }, [selectedMonth, selectedYear]);

  const handleCreateBudget = async (budgetData) => {
    try {
      const token = getAuthToken();

      if (!token) {
        toast.error("No authentication token found. Please login again.");
        return;
      }

      const response = await fetch(`${BASE_URL}/budgets`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(budgetData),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        fetchMonthlyBudgets();
        setIsCreateModalOpen(false);
        toast.success("Budget created successfully");
      } else {
        throw new Error(result.error || "Failed to create budget");
      }
    } catch (error) {
      toast.error(error.message || "Failed to create budget");
    }
  };

  const handleEditBudget = (budget) => {
    setEditingBudget(budget);
    setIsEditModalOpen(true);
  };

  const handleUpdateBudget = async (budgetData) => {
    try {
      const token = getAuthToken();

      if (!token) {
        toast.error("No authentication token found. Please login again.");
        return;
      }

      const response = await fetch(`${BASE_URL}/budgets/${editingBudget._id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(budgetData),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        fetchMonthlyBudgets();
        setIsEditModalOpen(false);
        setEditingBudget(null);
        toast.success("Budget updated successfully");
      } else {
        throw new Error(result.error || "Failed to update budget");
      }
    } catch (error) {
      toast.error(error.message || "Failed to update budget");
    }
  };

  const handleDeleteClick = (budget) => {
    setDeletingBudget(budget);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingBudget) return;

    try {
      const token = getAuthToken();

      if (!token) {
        toast.error("No authentication token found. Please login again.");
        return;
      }

      const response = await fetch(
        `${BASE_URL}/budgets/${deletingBudget._id}`,
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
        fetchMonthlyBudgets();
        setIsDeleteModalOpen(false);
        setDeletingBudget(null);
        toast.success("Budget deleted successfully");
      } else {
        throw new Error(result.error || "Failed to delete budget");
      }
    } catch (error) {
      toast.error(error.message || "Failed to delete budget");
    }
  };

  const handleViewTransactions = (budget) => {
    const categoryId = budget.category_id?._id || budget.category_id;
    const categoryName = budget.category_id?.name || "Uncategorized";
    const budgetLimit = budget.monthly_limit || 0;

    setSelectedBudgetForTransactions(budget._id);
    setSelectedCategoryForTransactions(categoryId);
    setSelectedCategoryName(categoryName);
    setSelectedBudgetLimit(budgetLimit);
    setIsTransactionsModalOpen(true);
  };

  const handleCopyBudgetsFromPreviousMonth = async () => {
    try {
      setCopying(true);
      const token = getAuthToken();

      if (!token) {
        toast.error("No authentication token found. Please login again.");
        return;
      }

      // First check if budgets already exist for this month
      const checkResponse = await fetch(
        `${BASE_URL}/budgets/check?month=${selectedMonth}&year=${selectedYear}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const checkResult = await checkResponse.json();

      if (checkResponse.ok && checkResult.success && checkResult.data.exists) {
        toast.info("Budgets already exist for this month");
        setIsCopyModalOpen(false);
        return;
      }

      // Get budgets from previous month
      let prevMonth = selectedMonth - 1;
      let prevYear = selectedYear;

      if (prevMonth < 1) {
        prevMonth = 12;
        prevYear = selectedYear - 1;
      }

      const prevBudgetsResponse = await fetch(
        `${BASE_URL}/budgets/monthly?month=${prevMonth}&year=${prevYear}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const prevBudgetsResult = await prevBudgetsResponse.json();

      if (
        !prevBudgetsResponse.ok ||
        !prevBudgetsResult.success ||
        prevBudgetsResult.data.budgets.length === 0
      ) {
        throw new Error("No budgets found in previous month to copy");
      }

      // Copy each budget from previous month
      let createdCount = 0;
      const prevBudgets = prevBudgetsResult.data.budgets;

      for (const prevBudget of prevBudgets) {
        const newBudgetData = {
          category_id: prevBudget.category_id._id || prevBudget.category_id,
          monthly_limit: prevBudget.monthly_limit,
          month: selectedMonth,
          year: selectedYear,
        };

        const response = await fetch(`${BASE_URL}/budgets`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newBudgetData),
        });

        if (response.ok) {
          createdCount++;
        }
      }

      if (createdCount > 0) {
        fetchMonthlyBudgets();
        setIsCopyModalOpen(false);
        toast.success(`Copied ${createdCount} budgets from previous month`);
      } else {
        throw new Error("Failed to copy any budgets");
      }
    } catch (error) {
      toast.error(error.message || "Failed to copy budgets");
    } finally {
      setCopying(false);
    }
  };

  const handleShowCopyModal = () => {
    setIsCopyModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeletingBudget(null);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingBudget(null);
  };

  const closeCopyModal = () => {
    setIsCopyModalOpen(false);
  };

  const closeTransactionsModal = () => {
    setIsTransactionsModalOpen(false);
    setSelectedBudgetForTransactions(null);
    setSelectedCategoryForTransactions(null);
    setSelectedCategoryName("");
    setSelectedBudgetLimit(0);
  };

  const clearError = () => {
    setError(null);
  };

  const handleMonthChange = (month) => {
    setSelectedMonth(month);
    setShowMonthSelector(false);
  };

  const handleYearChange = (year) => {
    setSelectedYear(year);
  };

  const getProgressBarColor = (percentage, isOverBudget) => {
    if (isOverBudget) return "bg-red-600";
    if (percentage > 80) return "bg-orange-500";
    if (percentage > 50) return "bg-yellow-500";
    return "bg-green-600";
  };

  const getCardBorderColor = (isOverBudget) => {
    return isOverBudget
      ? "border-red-300 bg-red-50"
      : "border-slate-200 bg-white";
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

  if (loading) {
    return (
      <div className="min-h-screen relative">
        <div className="fixed inset-0 z-0">
          <BackgroundCircles />
        </div>
        <div className="flex items-center justify-center min-h-screen relative z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-slate-600">Loading budgets...</p>
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
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mx-2 sm:mx-0">
              <div className="flex justify-between items-center">
                <span className="text-sm">{error}</span>
                <button
                  onClick={clearError}
                  className="text-red-500 hover:text-red-700 text-lg font-bold ml-2"
                >
                  ×
                </button>
              </div>
            </div>
          )}

          {/* Header Section */}
          <div className="px-2 sm:px-0">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900">
                  Monthly Budgets
                </h1>
                <p className="text-slate-600 text-sm sm:text-base mt-0.5 sm:mt-1">
                  Track your spending limits
                </p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-9 px-3 sm:px-4 py-2 shadow-lg bg-green-600 text-white hover:bg-white hover:text-green-600 border border-input"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Set Budget</span>
                <span className="sm:hidden">Set</span>
              </button>
            </div>

            {/* Mobile Month Selector */}
            <div className="sm:hidden mb-4">
              <div className="bg-white rounded-xl p-3 border-0 shadow-sm">
                <div className="flex items-center justify-between">
                  <button
                    onClick={handlePreviousMonth}
                    className="p-2 rounded-lg hover:bg-slate-100"
                  >
                    <ChevronLeft className="w-5 h-5 text-slate-600" />
                  </button>

                  <button
                    onClick={() => setShowMonthSelector(!showMonthSelector)}
                    className="flex-1 mx-4 text-center"
                  >
                    <p className="font-semibold text-slate-900">
                      {getMonthName(selectedMonth)} {selectedYear}
                    </p>
                    <p className="text-xs text-slate-500">Tap to change</p>
                  </button>

                  <button
                    onClick={handleNextMonth}
                    className="p-2 rounded-lg hover:bg-slate-100"
                  >
                    <ChevronRight className="w-5 h-5 text-slate-600" />
                  </button>
                </div>

                {/* Mobile Month Dropdown */}
                {showMonthSelector && (
                  <div className="mt-3 p-2 bg-slate-50 rounded-lg">
                    <div className="grid grid-cols-3 gap-2">
                      {Array.from({ length: 12 }, (_, i) => {
                        const month = i + 1;
                        return (
                          <button
                            key={month}
                            onClick={() => handleMonthChange(month)}
                            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                              selectedMonth === month
                                ? "bg-green-500 text-white"
                                : "bg-white text-slate-700 hover:bg-slate-100"
                            }`}
                          >
                            {getMonthName(month).substring(0, 3)}
                          </button>
                        );
                      })}
                    </div>
                    <div className="mt-3">
                      <select
                        value={selectedYear}
                        onChange={(e) =>
                          handleYearChange(parseInt(e.target.value))
                        }
                        className="w-full appearance-none rounded-lg border border-slate-200 bg-white py-2 px-3 text-sm text-slate-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
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
                )}
              </div>
            </div>

            {/* Desktop Month/Year Selector */}
            <div className="hidden sm:flex items-center gap-3 mb-4">
              {/* Month Selector */}
              <div className="w-32">
                <div className="relative">
                  <select
                    value={selectedMonth}
                    onChange={(e) =>
                      handleMonthChange(parseInt(e.target.value))
                    }
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
                    onChange={(e) => handleYearChange(parseInt(e.target.value))}
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
            </div>
          </div>

          {/* Available Months */}
          {availableMonths.length > 0 && (
            <div className="bg-white rounded-xl p-3 sm:p-4 border-0 shadow-sm mx-2 sm:mx-0">
              <h3 className="text-xs sm:text-sm font-semibold text-slate-900 mb-2 sm:mb-3">
                Available Months
              </h3>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {availableMonths
                  .map((monthData) => {
                    let month, year, monthName, budgetCount;

                    if (typeof monthData === "object" && monthData !== null) {
                      month = monthData.month;
                      year = monthData.year;
                      monthName =
                        monthData.monthName || getMonthName(monthData.month);
                      budgetCount = monthData.budgetCount || 0;
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
                        className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg text-xs sm:text-sm border transition-colors flex items-center gap-1 ${
                          selectedMonth === month && selectedYear === year
                            ? "bg-green-100 text-green-800 border-green-300"
                            : "bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200"
                        }`}
                      >
                        <span className="truncate max-w-[80px] sm:max-w-none">
                          {monthName.substring(0, 3)} {year}
                        </span>
                        {budgetCount > 0 && (
                          <span className="text-xs bg-slate-200 px-1 py-0.5 rounded flex-shrink-0">
                            {budgetCount}
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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 px-2 sm:px-0">
              <div className="rounded-xl text-card-foreground bg-white border-0 shadow-sm">
                <div className="p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs sm:text-sm font-medium text-green-700">
                      Total Budget
                    </p>
                    <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                  </div>
                  <p className="text-xl sm:text-2xl md:text-3xl font-bold text-green-900 truncate">
                    {formatCurrency(monthlyData.totals?.totalBudget || 0)}
                  </p>
                </div>
              </div>

              <div className="rounded-xl text-card-foreground bg-white border-0 shadow-sm">
                <div className="p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs sm:text-sm font-medium text-red-700">
                      Total Spent
                    </p>
                    <TrendingDown className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
                  </div>
                  <p className="text-xl sm:text-2xl md:text-3xl font-bold text-red-900 truncate">
                    {formatCurrency(monthlyData.totals?.totalSpent || 0)}
                  </p>
                </div>
              </div>

              <div className="rounded-xl text-card-foreground bg-white border-0 shadow-sm">
                <div className="p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs sm:text-sm font-medium text-blue-700">
                      Remaining
                    </p>
                    <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                  </div>
                  <p className="text-xl sm:text-2xl md:text-3xl font-bold text-blue-900 truncate">
                    {formatCurrency(monthlyData.totals?.totalRemaining || 0)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Empty State */}
          {budgets.length === 0 && (
            <div className="text-center py-8 sm:py-12 px-4">
              <div className="bg-white rounded-xl p-6 sm:p-8 border-0 shadow-sm">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-slate-400" />
                </div>
                <p className="text-slate-500 text-base sm:text-lg mb-2">
                  No budgets for {getMonthName(selectedMonth)} {selectedYear}
                </p>
                <p className="text-slate-400 text-sm sm:text-base mb-6">
                  Start by setting budgets for your categories
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-9 px-4 py-2 shadow-lg bg-green-600 text-white hover:bg-white hover:text-green-600 border border-input w-full sm:w-auto"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Budget
                  </button>
                  {(selectedMonth > 1 ||
                    selectedYear > new Date().getFullYear()) && (
                    <button
                      onClick={handleShowCopyModal}
                      className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-9 px-4 py-2 shadow-lg bg-gray-600 text-white hover:bg-white hover:text-gray-600 border border-input w-full sm:w-auto"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy from Previous Month
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Budgets Grid */}
          {budgets.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 px-2 sm:px-0">
              {budgets.map((budget) => {
                const category = budget.category_id;
                const spent = budget.spent || 0;
                const limit = budget.monthly_limit || 0;
                const remaining = budget.remaining || 0;
                const percentage = budget.percentage || 0;
                const isOverBudget = budget.isOverBudget || false;
                const overBy = budget.overBy || 0;

                return (
                  <div
                    key={budget._id}
                    className={`rounded-xl border text-card-foreground shadow group hover:shadow-lg transition-all duration-200 ${getCardBorderColor(
                      isOverBudget
                    )}`}
                  >
                    <div className="p-4 sm:p-6">
                      {/* Card Header */}
                      <div className="flex items-start justify-between mb-3 sm:mb-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5 sm:mb-1">
                            <h3 className="font-semibold text-slate-900 truncate text-sm sm:text-base">
                              {category?.name || "Uncategorized"}
                            </h3>
                            {isOverBudget && (
                              <TriangleAlert className="w-4 h-4 text-red-600 flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-xs sm:text-sm text-slate-600 truncate">
                            {getMonthName(selectedMonth)} {selectedYear}
                          </p>
                        </div>
                        <div className="flex gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity ml-2">
                          <button
                            onClick={() => handleViewTransactions(budget)}
                            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-7 w-7 sm:h-8 sm:w-8"
                            title="View transactions"
                          >
                            <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-600" />
                          </button>
                          <button
                            onClick={() => handleEditBudget(budget)}
                            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-7 w-7 sm:h-8 sm:w-8"
                            title="Edit budget"
                          >
                            <SquarePen className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-600" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(budget)}
                            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-7 w-7 sm:h-8 sm:w-8"
                            title="Delete budget"
                          >
                            <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-500" />
                          </button>
                        </div>
                      </div>

                      {/* Budget Details */}
                      <div className="space-y-2.5 sm:space-y-3">
                        <div className="flex items-center justify-between text-xs sm:text-sm">
                          <span className="text-slate-600">Spent</span>
                          <span className="font-bold text-slate-900 truncate ml-2">
                            {formatCurrency(spent)}
                          </span>
                        </div>

                        <div className="relative w-full overflow-hidden rounded-full bg-slate-200 h-2 sm:h-3">
                          <div
                            className={`h-full transition-all ${getProgressBarColor(
                              percentage,
                              isOverBudget
                            )}`}
                            style={{
                              width: isOverBudget
                                ? "100%"
                                : `${Math.min(100, percentage)}%`,
                            }}
                          />
                        </div>

                        <div className="flex items-center justify-between text-xs sm:text-sm">
                          <span className="text-slate-600">Budget</span>
                          <span className="font-bold text-slate-900 truncate ml-2">
                            {formatCurrency(limit)}
                          </span>
                        </div>

                        <div className="text-center pt-2 sm:pt-3 border-t border-slate-200">
                          <p
                            className={`text-xl sm:text-2xl font-bold ${
                              isOverBudget ? "text-red-600" : "text-green-600"
                            }`}
                          >
                            {isOverBudget
                              ? "133%"
                              : `${Math.round(percentage)}%`}
                          </p>
                          <p className="text-xs text-slate-600 mt-0.5 sm:mt-1">
                            {isOverBudget
                              ? `Over by ${formatCurrency(overBy)}`
                              : `${formatCurrency(remaining)} remaining`}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Budget Form Modals */}
      <BudgetForm
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateBudget}
        categories={categories}
        isEdit={false}
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
      />

      {isEditModalOpen && (
        <BudgetForm
          isOpen={isEditModalOpen}
          onClose={closeEditModal}
          onSubmit={handleUpdateBudget}
          editData={editingBudget}
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
        budgetName={
          deletingBudget?.category_id?.name ||
          deletingBudget?.categoryName ||
          ""
        }
      />

      <CopyBudgetModal
        isOpen={isCopyModalOpen}
        onClose={closeCopyModal}
        onConfirm={handleCopyBudgetsFromPreviousMonth}
        copying={copying}
        month={selectedMonth}
        year={selectedYear}
      />

      <BudgetTransactionsModal
        isOpen={isTransactionsModalOpen}
        onClose={closeTransactionsModal}
        budgetId={selectedBudgetForTransactions}
        categoryId={selectedCategoryForTransactions}
        month={selectedMonth}
        year={selectedYear}
        categoryName={selectedCategoryName}
        budgetLimit={selectedBudgetLimit}
      />

      {/* Floating Action Button for Mobile */}
      <button
        onClick={() => setIsCreateModalOpen(true)}
        className="sm:hidden fixed bottom-6 right-6 w-14 h-14 rounded-full bg-green-600 text-white shadow-lg flex items-center justify-center z-40 hover:bg-green-700 transition-colors"
      >
        <Plus className="w-6 h-6" />
      </button>
    </div>
  );
};

export default Budgets;
