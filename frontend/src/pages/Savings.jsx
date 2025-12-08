import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import BackgroundCircles from "../components/BackgroundCircles";
import SavingsForm from "../components/froms/SavingsForm";
import DepositWithdrawModal from "../components/froms/DepositWithdrawModal";
import {
  Plus,
  SquarePen,
  Trash2,
  AlertTriangle,
  TrendingUp,
  Target,
  CircleArrowDown,
  CircleArrowUp,
  PiggyBank,
  Wallet as WalletIcon,
  DollarSign,
  House,
  Car,
  Plane,
  GraduationCap,
  Gift,
  Heart,
  Briefcase,
  Smartphone,
  Gamepad,
  Shirt,
  Coffee,
  Tag,
  AlertCircle,
  Trophy,
  Eye,
  X,
  ArrowDownLeft,
  ArrowUpRight,
  Calendar,
  Clock,
  TrendingDown,
} from "lucide-react";

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, goalName }) => {
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
              Delete Savings Goal
            </h3>
            <p className="text-sm text-slate-500">
              This action cannot be undone
            </p>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-slate-700">
            Are you sure you want to delete the savings goal{" "}
            <span className="font-semibold text-red-600">"{goalName}"</span>?
            This will remove the goal and all its transaction history
            permanently.
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
            Delete Goal
          </button>
        </div>
      </div>
    </div>
  );
};

const TransactionsModal = ({
  isOpen,
  onClose,
  goal,
  transactions,
  loading,
  onRefresh,
}) => {
  if (!isOpen) return null;

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

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-white rounded-lg shadow-lg p-4 sm:p-6 animate-in fade-in-0 zoom-in-95 max-h-[90vh] overflow-y-auto mx-2">
        <button
          onClick={onClose}
          className="absolute right-3 top-3 sm:right-4 sm:top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>

        <div className="flex flex-col space-y-1.5 text-center sm:text-left mb-4 sm:mb-6">
          <h2 className="text-base sm:text-lg font-semibold leading-none tracking-tight">
            Transaction History
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            {goal.name} - All deposits and withdrawals
          </p>
          <div className="flex flex-wrap gap-3 sm:gap-4 mt-2">
            <div className="flex items-center gap-1 text-xs sm:text-sm text-green-600">
              <ArrowDownLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>
                Total Deposits:{" "}
                {formatCurrency(
                  transactions
                    .filter((t) => t.type === "deposit")
                    .reduce((sum, t) => sum + t.amount, 0)
                )}
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs sm:text-sm text-red-600">
              <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>
                Total Withdrawals:{" "}
                {formatCurrency(
                  transactions
                    .filter((t) => t.type === "withdrawal")
                    .reduce((sum, t) => sum + t.amount, 0)
                )}
              </span>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8 sm:py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            <p className="ml-3 text-slate-600">Loading transactions...</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-slate-400" />
            </div>
            <p className="text-slate-500 text-sm sm:text-lg">
              No transactions yet
            </p>
            <p className="text-slate-400 text-xs sm:text-sm mt-1 sm:mt-2">
              Make your first deposit to start tracking
            </p>
          </div>
        ) : (
          <div className="space-y-2 sm:space-y-3">
            {transactions.map((transaction, index) => (
              <div
                key={index}
                className="rounded-lg border border-slate-200 p-3 sm:p-4 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-2 sm:gap-3 flex-1">
                    <div
                      className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        transaction.type === "deposit"
                          ? "bg-green-100 text-green-600"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {transaction.type === "deposit" ? (
                        <ArrowDownLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                      ) : (
                        <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1">
                        <span
                          className={`text-xs sm:text-sm font-medium px-2 py-0.5 rounded-full ${
                            transaction.type === "deposit"
                              ? "bg-green-50 text-green-700 border border-green-200"
                              : "bg-red-50 text-red-700 border border-red-200"
                          }`}
                        >
                          {transaction.type === "deposit"
                            ? "Deposit"
                            : "Withdrawal"}
                        </span>
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(transaction.date)}
                        </span>
                      </div>
                      {transaction.notes && (
                        <p className="text-xs sm:text-sm text-slate-600 mt-0.5 sm:mt-1 line-clamp-2">
                          {transaction.notes}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-2">
                    <p
                      className={`text-base sm:text-lg font-bold ${
                        transaction.type === "deposit"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {transaction.type === "deposit" ? "+" : "-"}
                      {formatCurrency(transaction.amount)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-0 mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-slate-200">
          <div className="text-xs sm:text-sm text-slate-500">
            Showing {transactions.length} transaction
            {transactions.length !== 1 ? "s" : ""}
          </div>
          <button
            onClick={onRefresh}
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-8 px-3 w-full sm:w-auto"
          >
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
};

const Savings = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [viewingGoal, setViewingGoal] = useState(null);
  const [deletingGoal, setDeletingGoal] = useState(null);
  const [savingsGoals, setSavingsGoals] = useState([]);
  const [goalTransactions, setGoalTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totals, setTotals] = useState({
    totalBalance: 0,
    totalTarget: 0,
    activeGoals: 0,
  });
  const [transactionType, setTransactionType] = useState("deposit");

  const BASE_URL = import.meta.env.VITE_BASE_URL;

  const getAuthToken = () => {
    return localStorage.getItem("token");
  };

  useEffect(() => {
    fetchSavingsGoals();
  }, []);

  const fetchSavingsGoals = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = getAuthToken();

      if (!token) {
        setError("No authentication token found. Please login again.");
        setLoading(false);
        return;
      }

      const response = await fetch(`${BASE_URL}/savings`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setSavingsGoals(result.data);
        setTotals(result.totals);
      } else {
        throw new Error(result.error || "Failed to fetch savings goals");
      }
    } catch (error) {
      setError(error.message || "Failed to load savings goals");
      toast.error(error.message || "Failed to load savings goals");
    } finally {
      setLoading(false);
    }
  };

  const fetchGoalTransactions = async (goalId) => {
    try {
      setTransactionsLoading(true);
      const token = getAuthToken();

      if (!token) {
        toast.error("No authentication token found. Please login again.");
        return;
      }

      const response = await fetch(
        `${BASE_URL}/savings/${goalId}/transactions`,
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
        setGoalTransactions(result.data);
      } else {
        throw new Error(result.error || "Failed to fetch transactions");
      }
    } catch (error) {
      toast.error(error.message || "Failed to load transactions");
      setGoalTransactions([]);
    } finally {
      setTransactionsLoading(false);
    }
  };

  const handleViewHistory = async (goal) => {
    setViewingGoal(goal);
    await fetchGoalTransactions(goal._id);
    setIsHistoryModalOpen(true);
  };

  const refreshTransactions = async () => {
    if (viewingGoal) {
      await fetchGoalTransactions(viewingGoal._id);
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

  const getIconComponent = (iconName) => {
    const iconProps = { className: "w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" };
    switch (iconName) {
      case "piggy-bank":
        return <PiggyBank {...iconProps} />;
      case "wallet":
        return <WalletIcon {...iconProps} />;
      case "dollar-sign":
        return <DollarSign {...iconProps} />;
      case "trending-up":
        return <TrendingUp {...iconProps} />;
      case "house":
        return <House {...iconProps} />;
      case "car":
        return <Car {...iconProps} />;
      case "plane":
        return <Plane {...iconProps} />;
      case "graduation-cap":
        return <GraduationCap {...iconProps} />;
      case "gift":
        return <Gift {...iconProps} />;
      case "heart":
        return <Heart {...iconProps} />;
      case "briefcase":
        return <Briefcase {...iconProps} />;
      case "smartphone":
        return <Smartphone {...iconProps} />;
      case "gamepad":
        return <Gamepad {...iconProps} />;
      case "shirt":
        return <Shirt {...iconProps} />;
      case "coffee":
        return <Coffee {...iconProps} />;
      case "tag":
        return <Tag {...iconProps} />;
      default:
        return <PiggyBank {...iconProps} />;
    }
  };

  const handleCreateGoal = async (goalData) => {
    try {
      const token = getAuthToken();

      if (!token) {
        toast.error("No authentication token found. Please login again.");
        return;
      }

      const response = await fetch(`${BASE_URL}/savings`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(goalData),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        fetchSavingsGoals();
        setIsCreateModalOpen(false);
        toast.success("Savings goal created successfully");
      } else {
        throw new Error(result.error || "Failed to create savings goal");
      }
    } catch (error) {
      toast.error(error.message || "Failed to create savings goal");
    }
  };

  const handleEditGoal = (goal) => {
    setEditingGoal(goal);
    setIsEditModalOpen(true);
  };

  const handleUpdateGoal = async (goalData) => {
    try {
      const token = getAuthToken();

      if (!token) {
        toast.error("No authentication token found. Please login again.");
        return;
      }

      const response = await fetch(`${BASE_URL}/savings/${editingGoal._id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(goalData),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        fetchSavingsGoals();
        setIsEditModalOpen(false);
        setEditingGoal(null);
        toast.success("Savings goal updated successfully");
      } else {
        throw new Error(result.error || "Failed to update savings goal");
      }
    } catch (error) {
      toast.error(error.message || "Failed to update savings goal");
    }
  };

  const handleDeleteClick = (goal) => {
    setDeletingGoal(goal);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingGoal) return;

    try {
      const token = getAuthToken();

      if (!token) {
        toast.error("No authentication token found. Please login again.");
        return;
      }

      const response = await fetch(`${BASE_URL}/savings/${deletingGoal._id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();

      if (response.ok && result.success) {
        fetchSavingsGoals();
        setIsDeleteModalOpen(false);
        setDeletingGoal(null);
        toast.success("Savings goal deleted successfully");
      } else {
        throw new Error(result.error || "Failed to delete savings goal");
      }
    } catch (error) {
      toast.error(error.message || "Failed to delete savings goal");
    }
  };

  const handleTransactionClick = (goal, type) => {
    setSelectedGoal(goal);
    setTransactionType(type);
    setIsTransactionModalOpen(true);
  };

  const handleTransactionSubmit = async (transactionData) => {
    try {
      const token = getAuthToken();

      if (!token) {
        toast.error("No authentication token found. Please login again.");
        return;
      }

      const response = await fetch(
        `${BASE_URL}/savings/${selectedGoal._id}/transactions`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...transactionData,
            type: transactionType,
          }),
        }
      );

      const result = await response.json();

      if (response.ok && result.success) {
        fetchSavingsGoals();
        setIsTransactionModalOpen(false);
        setSelectedGoal(null);
        toast.success(
          transactionType === "deposit"
            ? "Deposit successful"
            : "Withdrawal successful"
        );

        if (viewingGoal && viewingGoal._id === selectedGoal._id) {
          refreshTransactions();
        }
      } else {
        throw new Error(result.error || "Transaction failed");
      }
    } catch (error) {
      toast.error(error.message || "Transaction failed");
    }
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeletingGoal(null);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingGoal(null);
  };

  const closeTransactionModal = () => {
    setIsTransactionModalOpen(false);
    setSelectedGoal(null);
  };

  const closeHistoryModal = () => {
    setIsHistoryModalOpen(false);
    setViewingGoal(null);
    setGoalTransactions([]);
  };

  const clearError = () => {
    setError(null);
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 100) return "bg-green-500";
    if (percentage >= 75) return "bg-blue-500";
    if (percentage >= 50) return "bg-yellow-500";
    if (percentage >= 25) return "bg-orange-500";
    return "bg-red-500";
  };

  if (loading) {
    return (
      <div className="min-h-screen relative">
        <div className="fixed inset-0 z-0">
          <BackgroundCircles />
        </div>
        <div className="flex items-center justify-center min-h-screen relative z-10 px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-slate-600">Loading savings goals...</p>
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
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 px-2 sm:px-0">
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900">
                Savings Goals
              </h1>
              <p className="text-slate-600 text-xs sm:text-sm mt-0.5 sm:mt-1">
                Track and achieve your financial goals
              </p>
            </div>

            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-9 px-3 sm:px-4 py-2 shadow-lg bg-green-600 text-white hover:bg-white hover:text-green-600 border border-transparent hover:border-green-600 w-full sm:w-auto"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New Goal</span>
              <span className="sm:hidden">New Goal</span>
            </button>
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 px-2 sm:px-0">
            {/* Total Savings Card */}
            <div className="rounded-xl text-card-foreground bg-white border-0 shadow-sm">
              <div className="p-4 sm:p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-slate-600 mb-1">
                      Total Savings
                    </p>
                    <p className="text-lg sm:text-xl md:text-2xl font-bold text-green-600 truncate">
                      {formatCurrency(totals.totalBalance)}
                    </p>
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-50 rounded-full flex items-center justify-center flex-shrink-0 ml-2">
                    <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-green-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Total Target Card */}
            <div className="rounded-xl text-card-foreground bg-white border-0 shadow-sm">
              <div className="p-4 sm:p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-slate-600 mb-1">
                      Total Target
                    </p>
                    <p className="text-lg sm:text-xl md:text-2xl font-bold text-blue-500 truncate">
                      {formatCurrency(totals.totalTarget)}
                    </p>
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0 ml-2">
                    <Target className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-blue-500" />
                  </div>
                </div>
              </div>
            </div>

            {/* Active Goals Card */}
            <div className="rounded-xl text-card-foreground bg-white border-0 shadow-sm">
              <div className="p-4 sm:p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-slate-600 mb-1">
                      Active Goals
                    </p>
                    <p className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900">
                      {totals.activeGoals}
                    </p>
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-50 rounded-full flex items-center justify-center flex-shrink-0 ml-2">
                    <Target className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-slate-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Savings Goals Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 px-2 sm:px-0">
            {savingsGoals.map((goal) => {
              const progress = goal.progressPercentage || 0;
              const remaining =
                goal.remainingAmount ||
                goal.targetAmount - (goal.currentBalance || 0);
              const isCompleted =
                goal.isCompleted || goal.status === "completed";
              const progressWidth = Math.min(100, progress);

              return (
                <div
                  key={goal._id}
                  className={`rounded-xl bg-white text-card-foreground border-0 shadow-sm group hover:shadow-md transition-all duration-200 ${
                    isCompleted ? "border-green-200 border-2" : ""
                  }`}
                >
                  <div className="p-4 sm:p-5">
                    {/* Header with actions */}
                    <div className="flex items-start justify-between mb-3 sm:mb-4">
                      <div className="flex-1 flex items-start gap-2 sm:gap-3">
                        <div
                          className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center shadow-sm flex-shrink-0"
                          style={{ backgroundColor: `${goal.color}20` }}
                        >
                          {getIconComponent(goal.icon)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <h3 className="text-sm sm:text-base md:text-lg font-semibold text-slate-900 mb-0.5 sm:mb-1 truncate">
                                {goal.name}
                              </h3>
                              {goal.description && (
                                <p className="text-xs text-slate-500 truncate">
                                  {goal.description}
                                </p>
                              )}
                            </div>
                            <div className="flex gap-0.5 sm:gap-1 flex-shrink-0">
                              <button
                                onClick={() => handleViewHistory(goal)}
                                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-7 w-7 sm:h-8 sm:w-8"
                                title="View History"
                              >
                                <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-500" />
                              </button>
                              <button
                                onClick={() => handleEditGoal(goal)}
                                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-7 w-7 sm:h-8 sm:w-8"
                                title="Edit Goal"
                              >
                                <SquarePen className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-600" />
                              </button>
                              <button
                                onClick={() => handleDeleteClick(goal)}
                                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-7 w-7 sm:h-8 sm:w-8"
                                title="Delete Goal"
                              >
                                <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-500" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="space-y-2.5 sm:space-y-3">
                      <div className="flex items-center justify-between text-xs sm:text-sm">
                        <span className="text-slate-600">Progress</span>
                        <span className="font-bold text-blue-600">
                          {progress.toFixed(1)}%
                        </span>
                      </div>
                      <div className="relative w-full overflow-hidden rounded-full bg-slate-200 h-1.5 sm:h-2">
                        <div
                          className={`h-full transition-all duration-500 ${getProgressColor(
                            progress
                          )}`}
                          style={{ width: `${progressWidth}%` }}
                        />
                      </div>

                      {/* Current vs Target */}
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-slate-500">Current</p>
                          <p className="text-base sm:text-lg md:text-xl font-bold text-slate-900 truncate">
                            {formatCurrency(goal.currentBalance || 0)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-slate-500">Target</p>
                          <p className="text-base sm:text-lg md:text-xl font-bold text-slate-900 truncate">
                            {formatCurrency(goal.targetAmount)}
                          </p>
                        </div>
                      </div>

                      {/* Remaining and monthly target */}
                      <div className="pt-2 sm:pt-3 border-t border-slate-200">
                        <p className="text-xs sm:text-sm text-slate-600">
                          {remaining > 0
                            ? `${formatCurrency(
                                remaining
                              )} remaining to reach goal`
                            : "Goal completed! 🎉"}
                        </p>
                        {goal.monthlyTarget && remaining > 0 && (
                          <p className="text-xs text-slate-500 mt-0.5 sm:mt-1">
                            Monthly target: {formatCurrency(goal.monthlyTarget)}
                          </p>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="flex gap-1.5 sm:gap-2 pt-2">
                        <button
                          onClick={() =>
                            handleTransactionClick(goal, "deposit")
                          }
                          className="inline-flex items-center justify-center gap-1 sm:gap-2 whitespace-nowrap rounded-md text-xs sm:text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 shadow h-8 sm:h-9 px-2.5 sm:px-4 py-1.5 sm:py-2 flex-1 bg-green-600 hover:bg-green-700 text-white"
                        >
                          <CircleArrowDown className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          <span className="truncate">Deposit</span>
                        </button>
                        <button
                          onClick={() =>
                            handleTransactionClick(goal, "withdrawal")
                          }
                          disabled={(goal.currentBalance || 0) <= 0}
                          className="inline-flex items-center justify-center gap-1 sm:gap-2 whitespace-nowrap rounded-md text-xs sm:text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-8 sm:h-9 px-2.5 sm:px-4 py-1.5 sm:py-2 flex-1 disabled:opacity-50"
                        >
                          <CircleArrowUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          <span className="truncate">Withdraw</span>
                        </button>
                      </div>
                    </div>

                    {/* Completed badge */}
                    {isCompleted && (
                      <div className="pt-2 sm:pt-3 border-t border-green-200 bg-green-50 -mx-4 sm:-mx-5 -mb-4 sm:-mb-5 px-4 sm:px-5 py-2 sm:py-3 rounded-b-lg mt-3 sm:mt-4">
                        <p className="text-xs sm:text-sm font-medium text-green-700 text-center flex items-center justify-center gap-1.5 sm:gap-2">
                          <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          <span>Goal Completed!</span>
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Empty state */}
          {savingsGoals.length === 0 && (
            <div className="text-center py-8 sm:py-12 px-4">
              <div className="bg-white rounded-xl p-6 sm:p-8 border-0 shadow-sm">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <PiggyBank className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500" />
                </div>
                <p className="text-slate-500 text-base sm:text-lg mb-2">
                  No savings goals found
                </p>
                <p className="text-slate-400 text-sm sm:text-base">
                  Start by creating your first savings goal
                </p>
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-9 px-4 py-2 shadow-lg bg-green-600 text-white hover:bg-white hover:text-green-600 border border-transparent hover:border-green-600 mt-4 sm:mt-5 w-full sm:w-auto"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Goal
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <SavingsForm
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateGoal}
        isEdit={false}
      />

      {isEditModalOpen && (
        <SavingsForm
          isOpen={isEditModalOpen}
          onClose={closeEditModal}
          onSubmit={handleUpdateGoal}
          editData={editingGoal}
          isEdit={true}
        />
      )}

      {isTransactionModalOpen && (
        <DepositWithdrawModal
          isOpen={isTransactionModalOpen}
          onClose={closeTransactionModal}
          onSubmit={handleTransactionSubmit}
          goal={selectedGoal}
          type={transactionType}
        />
      )}

      <TransactionsModal
        isOpen={isHistoryModalOpen}
        onClose={closeHistoryModal}
        goal={viewingGoal}
        transactions={goalTransactions}
        loading={transactionsLoading}
        onRefresh={refreshTransactions}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteConfirm}
        goalName={deletingGoal?.name}
      />

      {/* Floating Action Button for Mobile */}
      <button
        onClick={() => setIsCreateModalOpen(true)}
        className="sm:hidden fixed bottom-6 right-6 w-12 h-12 rounded-full bg-green-600 text-white shadow-lg flex items-center justify-center z-40 hover:bg-green-700 transition-colors"
      >
        <Plus className="w-5 h-5" />
      </button>
    </div>
  );
};

export default Savings;
