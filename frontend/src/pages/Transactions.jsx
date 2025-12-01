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
} from "lucide-react";

// Delete Confirmation Modal Component
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
        {/* Header */}
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

        {/* Message */}
        <div className="mb-6">
          <p className="text-slate-700">
            Are you sure you want to delete the transaction{" "}
            <span className="font-semibold text-red-600">
              "{transactionName}"
            </span>
            ? This will remove the transaction permanently.
          </p>
        </div>

        {/* Action Buttons */}
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

const Transactions = () => {
  const [activeTypeTab, setActiveTypeTab] = useState("all");
  const [activeTimeTab, setActiveTimeTab] = useState("all");
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

  const BASE_URL = import.meta.env.VITE_BASE_URL;

  // Get auth token from localStorage
  const getAuthToken = () => {
    return localStorage.getItem("token");
  };

  // Fetch data from API
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = getAuthToken();

      if (!token) {
        setError("No authentication token found. Please login again.");
        setLoading(false);
        return;
      }

      // Fetch transactions
      const transactionsResponse = await fetch(`${BASE_URL}/transactions`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const transactionsResult = await transactionsResponse.json();

      if (transactionsResponse.ok && transactionsResult.success) {
        setTransactions(transactionsResult.data);
      } else {
        throw new Error(
          transactionsResult.error || "Failed to fetch transactions"
        );
      }

      // Fetch wallets
      const walletsResponse = await fetch(`${BASE_URL}/wallets`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const walletsResult = await walletsResponse.json();

      if (walletsResponse.ok && walletsResult.success) {
        setWallets(walletsResult.data);
      } else {
        throw new Error(walletsResult.error || "Failed to fetch wallets");
      }

      // Fetch categories
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
        throw new Error(categoriesResult.error || "Failed to fetch categories");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      const errorMessage = error.message || "Failed to load data";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Calculate totals
  const incomeTotal = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const expenseTotal = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const netBalance = incomeTotal - expenseTotal;

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

  const filteredTransactions = transactions.filter((transaction) => {
    // Filter by type
    if (activeTypeTab !== "all" && transaction.type !== activeTypeTab) {
      return false;
    }

    // Filter by time (simplified - you can implement actual date filtering)
    if (activeTimeTab !== "all") {
      const transactionDate = new Date(transaction.date);
      const now = new Date();

      switch (activeTimeTab) {
        case "today":
          return transactionDate.toDateString() === now.toDateString();
        case "week":
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return transactionDate >= weekAgo;
        case "month":
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          return transactionDate >= monthAgo;
        default:
          return true;
      }
    }

    return true;
  });

  const handleCreateTransaction = async (transactionData) => {
    try {
      const token = getAuthToken();

      if (!token) {
        toast.error("No authentication token found. Please login again.");
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
        setTransactions((prev) => [result.data, ...prev]);
        setIsCreateModalOpen(false);
        toast.success("Transaction created successfully");
      } else {
        throw new Error(result.error || "Failed to create transaction");
      }
    } catch (error) {
      console.error("Error creating transaction:", error);
      const errorMessage = error.message || "Failed to create transaction";
      toast.error(errorMessage);
    }
  };

  const handleEditTransaction = (transaction) => {
    // Prepare edit data with proper IDs
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
        setTransactions((prev) =>
          prev.map((transaction) =>
            transaction._id === editingTransaction._id
              ? result.data
              : transaction
          )
        );
        setIsEditModalOpen(false);
        setEditingTransaction(null);
        toast.success("Transaction updated successfully");
      } else {
        throw new Error(result.error || "Failed to update transaction");
      }
    } catch (error) {
      console.error("Error updating transaction:", error);
      const errorMessage = error.message || "Failed to update transaction";
      toast.error(errorMessage);
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
        setTransactions((prev) =>
          prev.filter(
            (transaction) => transaction._id !== deletingTransaction._id
          )
        );
        setIsDeleteModalOpen(false);
        setDeletingTransaction(null);
        toast.success("Transaction deleted successfully");
      } else {
        throw new Error(result.error || "Failed to delete transaction");
      }
    } catch (error) {
      console.error("Error deleting transaction:", error);
      const errorMessage = error.message || "Failed to delete transaction";
      toast.error(errorMessage);
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
      {/* Toast Container */}
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

      {/* BackgroundCircles with lower z-index so it doesn't overlay text */}
      <div className="fixed inset-0 z-0">
        <BackgroundCircles />
      </div>

      <div className="space-y-6 pb-20 lg:pb-6 relative z-10">
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <div className="flex justify-between items-center">
              <span>{error}</span>
              <button
                onClick={clearError}
                className="text-red-500 hover:text-red-700 text-lg font-bold"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Transactions</h1>
            <p className="text-slate-600 mt-1">
              Track your income and expenses
            </p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-9 px-4 py-2 shadow-lg bg-green-600 text-white hover:bg-white hover:text-green-600 border border-transparent hover:border-green-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Transaction
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Income Card */}
          <div className="rounded-xl text-card-foreground bg-white border-0 shadow-sm">
            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-green-700">Income</p>
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-green-900">
                {formatCurrency(incomeTotal)}
              </p>
            </div>
          </div>

          {/* Expense Card */}
          <div className="rounded-xl text-card-foreground bg-white border-0 shadow-sm">
            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-red-700">Expense</p>
                <TrendingDown className="w-5 h-5 text-red-600" />
              </div>
              <p className="text-2xl font-bold text-red-900">
                {formatCurrency(expenseTotal)}
              </p>
            </div>
          </div>

          {/* Net Balance Card */}
          <div className="rounded-xl text-card-foreground bg-white border-0 shadow-sm">
            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-blue-700">Net Balance</p>
                <ArrowLeftRight className="w-5 h-5 text-blue-600" />
              </div>
              <p
                className={`text-2xl font-bold ${
                  netBalance >= 0 ? "text-blue-900" : "text-red-900"
                }`}
              >
                {formatCurrency(netBalance)}
              </p>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Type Tabs */}
          <div className="flex-1">
            <div className="h-9 items-center justify-center rounded-lg p-1 text-muted-foreground grid w-full grid-cols-4 bg-slate-100">
              <button
                type="button"
                onClick={() => setActiveTypeTab("all")}
                className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer ${
                  activeTypeTab === "all"
                    ? "bg-white text-foreground shadow"
                    : ""
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setActiveTypeTab("income")}
                className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer ${
                  activeTypeTab === "income"
                    ? "bg-white text-foreground shadow"
                    : ""
                }`}
              >
                Income
              </button>
              <button
                type="button"
                onClick={() => setActiveTypeTab("expense")}
                className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer ${
                  activeTypeTab === "expense"
                    ? "bg-white text-foreground shadow"
                    : ""
                }`}
              >
                Expense
              </button>
              <button
                type="button"
                onClick={() => setActiveTypeTab("transfer")}
                className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer ${
                  activeTypeTab === "transfer"
                    ? "bg-white text-foreground shadow"
                    : ""
                }`}
              >
                Transfer
              </button>
            </div>
          </div>

          {/* Time Tabs */}
          <div className="flex-1">
            <div className="h-9 items-center justify-center rounded-lg p-1 text-muted-foreground grid w-full grid-cols-4 bg-slate-100">
              <button
                type="button"
                onClick={() => setActiveTimeTab("all")}
                className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer ${
                  activeTimeTab === "all"
                    ? "bg-white text-foreground shadow"
                    : ""
                }`}
              >
                All Time
              </button>
              <button
                type="button"
                onClick={() => setActiveTimeTab("today")}
                className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer ${
                  activeTimeTab === "today"
                    ? "bg-white text-foreground shadow"
                    : ""
                }`}
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => setActiveTimeTab("week")}
                className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer ${
                  activeTimeTab === "week"
                    ? "bg-white text-foreground shadow"
                    : ""
                }`}
              >
                Week
              </button>
              <button
                type="button"
                onClick={() => setActiveTimeTab("month")}
                className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer ${
                  activeTimeTab === "month"
                    ? "bg-white text-foreground shadow"
                    : ""
                }`}
              >
                Month
              </button>
            </div>
          </div>
        </div>

        {/* Transactions List */}
        <div className="space-y-3">
          {filteredTransactions.map((transaction) => {
            const category = transaction.category_id;
            const fromWallet = transaction.from_wallet_id;
            const toWallet = transaction.to_wallet_id;

            const isIncome = transaction.type === "income";
            const isExpense = transaction.type === "expense";
            const isTransfer = transaction.type === "transfer";

            return (
              <div
                key={transaction._id}
                className="rounded-xl bg-white text-card-foreground shadow group hover:shadow-md transition-all duration-200 border-0"
              >
                <div className="p-4">
                  <div className="flex items-center gap-4">
                    {/* Icon */}
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

                    {/* Transaction Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-slate-900 truncate">
                          {/* Show category name for income/expense, show transfer description for transfers */}
                          {isTransfer
                            ? `${fromWallet?.name || "Wallet"} → ${
                                toWallet?.name || "Wallet"
                              }`
                            : category?.name || "Uncategorized"}
                        </h3>
                        {/* Type badge */}
                        <div
                          className={`inline-flex items-center rounded-md border px-2.5 py-0.5 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-xs ${
                            isIncome
                              ? "text-green-600 bg-green-50 border-green-200"
                              : isExpense
                              ? "text-red-600 bg-red-50 border-red-200"
                              : "text-blue-600 bg-blue-50 border-blue-200"
                          }`}
                        >
                          {isIncome ? (
                            <ArrowDownLeft className="w-4 h-4" />
                          ) : isExpense ? (
                            <ArrowUpRight className="w-4 h-4" />
                          ) : (
                            <ArrowRightLeft className="w-4 h-4" />
                          )}
                          <span className="ml-1 capitalize">
                            {transaction.type}
                          </span>
                        </div>
                      </div>
                      {/* Show notes if they exist */}
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

                    {/* Amount and Actions */}
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p
                          className={`text-lg font-bold ${
                            isIncome
                              ? "text-green-600"
                              : isExpense
                              ? "text-red-600"
                              : "text-blue-600"
                          }`}
                        >
                          {isIncome ? "+" : isExpense ? "-" : ""}
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

        {/* Empty State */}
        {filteredTransactions.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-white rounded-xl p-8 border-0 shadow-sm">
              <p className="text-slate-500 text-lg">No transactions found</p>
              <p className="text-slate-400 mt-2">
                {activeTypeTab === "all"
                  ? "Get started by creating your first transaction"
                  : `No ${activeTypeTab} transactions found`}
              </p>
              {activeTypeTab === "all" && (
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="mt-4 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-9 px-4 py-2 shadow-lg bg-green-600 text-white hover:bg-white hover:text-green-600 border border-transparent hover:border-green-600"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Transaction
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Create Transaction Modal */}
      <TransactionForm
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateTransaction}
        wallets={wallets}
        categories={categories}
        isEdit={false}
      />

      {/* Edit Transaction Modal */}
      {isEditModalOpen && (
        <TransactionForm
          isOpen={isEditModalOpen}
          onClose={closeEditModal}
          onSubmit={handleUpdateTransaction}
          editData={editingTransaction}
          wallets={wallets}
          categories={categories}
          isEdit={true}
        />
      )}

      {/* Delete Confirmation Modal */}
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
