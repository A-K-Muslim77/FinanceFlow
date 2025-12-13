import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import BackgroundCircles from "../components/BackgroundCircles";
import DueReceivablesForm from "../components/froms/DueReceivablesForm";
import {
  Plus,
  SquarePen,
  Trash2,
  AlertTriangle,
  Users,
  Calendar,
  RefreshCw,
  Menu,
  X,
  Eye,
  ArrowDownLeft,
  ArrowUpRight,
  CheckCircle,
  AlertCircle,
  Filter,
  Search,
  Receipt,
} from "lucide-react";

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, itemName }) => {
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
              Delete Record
            </h3>
            <p className="text-sm text-slate-500">
              This action cannot be undone
            </p>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-slate-700">
            Are you sure you want to delete the record for{" "}
            <span className="font-semibold text-red-600">"{itemName}"</span>?
            This will remove the record permanently.
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
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

const TransactionModal = ({ isOpen, onClose, onSubmit, type, item }) => {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      // Set default amount to remaining amount for payments
      if (type === "payment" && item) {
        setAmount(
          item.remainingAmount?.toString() ||
            item.currentAmount?.toString() ||
            item.amount?.toString() ||
            ""
        );
      } else {
        setAmount("");
      }
      setDescription("");
      setError("");
    }
  }, [isOpen, type, item]);

  const validateForm = () => {
    if (!amount) {
      setError("Please enter amount");
      return false;
    }
    if (parseFloat(amount) <= 0) {
      setError("Amount must be greater than 0");
      return false;
    }
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    onSubmit({
      amount: parseFloat(amount),
      description,
      type: type === "receive" ? "payment" : "due",
      date: new Date().toISOString().split("T")[0],
    });

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="relative w-full max-w-md bg-white rounded-lg shadow-lg p-4 sm:p-6 animate-in fade-in-0 zoom-in-95 mx-2">
        <button
          onClick={onClose}
          className="absolute right-3 top-3 sm:right-4 sm:top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>

        <div className="flex flex-col space-y-1.5 text-center sm:text-left mb-4 sm:mb-6">
          <h2 className="text-base sm:text-lg font-semibold leading-none tracking-tight">
            {type === "due" ? "Add Due" : "Mark as Paid"}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            {item?.name} - {type === "due" ? "Add new due" : "Record payment"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Amount */}
          <div className="space-y-1">
            <label className="text-xs sm:text-sm font-medium text-slate-700">
              Amount (৳) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 text-xs">
                ৳
              </span>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className={`w-full rounded border px-3 py-2 pl-7 text-xs sm:text-sm ${
                  error ? "border-red-500" : "border-slate-300"
                } focus:outline-none focus:ring-1 focus:ring-blue-500`}
                autoFocus
              />
            </div>
            {error && <p className="text-xs text-red-500">{error}</p>}
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-xs sm:text-sm font-medium text-slate-700">
              Description (Optional)
            </label>
            <textarea
              placeholder="Add notes about this transaction..."
              rows="3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded border border-slate-300 px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Current Status Info for Payments */}
          {type === "receive" && item && (
            <div className="p-3 bg-blue-50 rounded border border-blue-100">
              <div className="flex justify-between text-sm">
                <span className="text-blue-700 font-medium">Current Due:</span>
                <span className="text-blue-900 font-bold">
                  ৳{item.currentAmount || item.amount}
                </span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-blue-700 font-medium">Remaining:</span>
                <span className="text-blue-900 font-bold">
                  ৳{item.remainingAmount || item.currentAmount || item.amount}
                </span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 text-xs sm:text-sm font-medium rounded border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`flex-1 py-2 text-xs sm:text-sm font-medium rounded text-white ${
                type === "due"
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {type === "due" ? "Add Due" : "Mark as Paid"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const TransactionHistoryModal = ({ isOpen, onClose, item, fetchDues }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const BASE_URL = import.meta.env.VITE_BASE_URL;

  const getAuthToken = () => {
    return localStorage.getItem("token");
  };

  useEffect(() => {
    if (isOpen && item) {
      fetchTransactions();
    }
  }, [isOpen, item]);

  const fetchTransactions = async () => {
    if (!item?._id) return;

    try {
      setLoading(true);
      setError("");
      const token = getAuthToken();

      if (!token) {
        setError("No authentication token found");
        return;
      }

      const response = await fetch(
        `${BASE_URL}/dues/${item._id}/transactions`,
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
        setTransactions(result.data);
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
    if (!dateString) return "No date";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleRefresh = () => {
    fetchTransactions();
    fetchDues();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-white rounded-lg shadow-lg p-4 sm:p-6 animate-in fade-in-0 zoom-in-95 mx-2 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between mb-4 sm:mb-6">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-slate-900">
              Transaction History
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              {item?.name} - {formatCurrency(item?.amount || 0)}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  item?.status === "Received"
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {item?.status}
              </span>
              {item?.description && (
                <span className="text-xs text-slate-500">
                  {item.description}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-9 px-2.5 py-2 bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
              title="Refresh"
              disabled={loading}
            >
              <RefreshCw
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              />
            </button>
            <button
              onClick={onClose}
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-9 px-2.5 py-2 bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm">{error}</span>
              <button
                onClick={() => setError("")}
                className="text-red-500 hover:text-red-700 text-lg font-bold"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Transactions List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Receipt className="w-6 h-6 text-slate-400" />
              </div>
              <p className="text-slate-500">No transactions yet</p>
              <p className="text-slate-400 text-sm mt-1">
                Add dues or payments to see transaction history
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((transaction, index) => (
                <div
                  key={transaction._id || index}
                  className={`p-3 sm:p-4 rounded-lg border ${
                    transaction.type === "payment"
                      ? "bg-green-50 border-green-200"
                      : "bg-red-50 border-red-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          transaction.type === "payment"
                            ? "bg-green-100 text-green-600"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {transaction.type === "payment" ? (
                          <ArrowUpRight className="w-4 h-4" />
                        ) : (
                          <ArrowDownLeft className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">
                          {transaction.type === "payment"
                            ? "Payment Received"
                            : "Due Added"}
                        </p>
                        <p className="text-xs text-slate-500">
                          {formatDate(transaction.date)}
                        </p>
                        {transaction.description && (
                          <p className="text-sm text-slate-600 mt-1">
                            {transaction.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`font-bold ${
                          transaction.type === "payment"
                            ? "text-green-700"
                            : "text-red-700"
                        }`}
                      >
                        {transaction.type === "payment" ? "+" : "-"}
                        {formatCurrency(transaction.amount)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 mt-4 border-t border-slate-200">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-slate-600">
                Total Transactions: {transactions.length}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-9 px-4 py-2 bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Due = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [transactionType, setTransactionType] = useState("due");
  const [dues, setDues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const BASE_URL = import.meta.env.VITE_BASE_URL;

  const getAuthToken = () => {
    return localStorage.getItem("token");
  };

  useEffect(() => {
    fetchDues();
  }, []);

  const fetchDues = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = getAuthToken();

      if (!token) {
        setError("No authentication token found. Please login again.");
        setLoading(false);
        return;
      }

      const response = await fetch(`${BASE_URL}/dues`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setDues(result.data);
      } else {
        throw new Error(result.error || "Failed to fetch dues");
      }
    } catch (error) {
      setError(error.message || "Failed to load dues");
      toast.error(error.message || "Failed to load dues");
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
    if (!dateString) return "No date";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleCreateDue = async (dueData) => {
    try {
      const token = getAuthToken();

      if (!token) {
        toast.error("No authentication token found. Please login again.");
        return;
      }

      const response = await fetch(`${BASE_URL}/dues`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dueData),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        fetchDues();
        setIsCreateModalOpen(false);
        toast.success("Record created successfully");
      } else {
        throw new Error(result.error || "Failed to create record");
      }
    } catch (error) {
      toast.error(error.message || "Failed to create record");
    }
  };

  const handleEditDue = (item) => {
    setEditingItem(item);
    setIsEditModalOpen(true);
  };

  const handleUpdateDue = async (dueData) => {
    try {
      const token = getAuthToken();

      if (!token) {
        toast.error("No authentication token found. Please login again.");
        return;
      }

      const response = await fetch(`${BASE_URL}/dues/${editingItem._id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dueData),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        fetchDues();
        setIsEditModalOpen(false);
        setEditingItem(null);
        toast.success("Record updated successfully");
      } else {
        throw new Error(result.error || "Failed to update record");
      }
    } catch (error) {
      toast.error(error.message || "Failed to update record");
    }
  };

  const handleDeleteClick = (item) => {
    setDeletingItem(item);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingItem) return;

    try {
      const token = getAuthToken();

      if (!token) {
        toast.error("No authentication token found. Please login again.");
        return;
      }

      const response = await fetch(`${BASE_URL}/dues/${deletingItem._id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();

      if (response.ok && result.success) {
        fetchDues();
        setIsDeleteModalOpen(false);
        setDeletingItem(null);
        toast.success("Record deleted successfully");
      } else {
        throw new Error(result.error || "Failed to delete record");
      }
    } catch (error) {
      toast.error(error.message || "Failed to delete record");
    }
  };

  const handleTransactionClick = (item, type) => {
    setSelectedItem(item);
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
        `${BASE_URL}/dues/${selectedItem._id}/transactions`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(transactionData),
        }
      );

      const result = await response.json();

      if (response.ok && result.success) {
        fetchDues();
        setIsTransactionModalOpen(false);
        setSelectedItem(null);
        toast.success(
          transactionData.type === "due"
            ? "Due added successfully"
            : "Payment recorded successfully"
        );
      } else {
        throw new Error(result.error || "Transaction failed");
      }
    } catch (error) {
      toast.error(error.message || "Transaction failed");
    }
  };

  const handleViewHistory = (item) => {
    setSelectedItem(item);
    setIsHistoryModalOpen(true);
  };

  const filteredDues = dues.filter((item) => {
    const matchesFilter =
      filter === "all" ||
      (filter === "due" &&
        (item.status === "Due" || item.status === "Partially Paid")) ||
      (filter === "received" && item.status === "Received");

    const matchesSearch =
      !search ||
      item.name?.toLowerCase().includes(search.toLowerCase()) ||
      item.description?.toLowerCase().includes(search.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeletingItem(null);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingItem(null);
  };

  const closeTransactionModal = () => {
    setIsTransactionModalOpen(false);
    setSelectedItem(null);
  };

  const closeHistoryModal = () => {
    setIsHistoryModalOpen(false);
    setSelectedItem(null);
  };

  const handleRefresh = () => {
    fetchDues();
  };

  const clearError = () => {
    setError(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen relative">
        <BackgroundCircles />
        <div className="flex items-center justify-center min-h-screen relative z-10 px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-slate-600">Loading dues...</p>
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

      <div className="w-full mx-auto py-3 sm:py-6 relative z-10">
        <div className="space-y-3 sm:space-y-6 pb-16 sm:pb-20">
          {/* Mobile Header */}
          <div className="sm:hidden space-y-3 px-2 sm:px-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-slate-900">
                  Dues & Receivables
                </h1>
                <p className="text-xs text-slate-600 mt-0.5">
                  Track money owed and received
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
            {showMobileFilters && (
              <div className="space-y-2 bg-white p-3 rounded-lg border border-slate-200">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div className="flex gap-2">
                  {["all", "due", "received"].map((f) => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`flex-1 py-1.5 text-xs font-medium rounded ${
                        filter === f
                          ? "bg-blue-600 text-white"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      {f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between gap-1">
              <button
                onClick={handleRefresh}
                className="p-2 rounded-lg bg-white border border-slate-200 flex-1 flex items-center justify-center"
              >
                <RefreshCw className="w-4 h-4 text-slate-600" />
              </button>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="p-2 rounded-lg bg-green-600 text-white hover:bg-green-700 border-green-600 flex-1 flex items-center justify-center"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Desktop Header */}
          <div className="hidden sm:block px-4 lg:px-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                  Dues & Receivables
                </h1>
                <p className="text-sm text-slate-600 mt-0.5">
                  Track money owed and received
                </p>
              </div>

              <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                {/* Search */}
                <div className="relative flex-1 sm:flex-none">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full sm:w-64 pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                {/* Filter */}
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                  {["all", "due", "received"].map((f) => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`px-3 py-1 text-sm font-medium rounded ${
                        filter === f
                          ? "bg-white text-blue-600 shadow-sm"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      {f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleRefresh}
                  className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-9 px-2.5 sm:px-3 py-2 bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 flex-shrink-0"
                  title="Refresh data"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-9 px-2.5 sm:px-3 py-2 shadow-sm bg-green-600 text-white hover:bg-green-700 flex-shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">New Record</span>
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

          {/* Dues Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mx-2 sm:mx-4 lg:mx-6">
            {filteredDues.map((item) => (
              <div
                key={item._id}
                className={`rounded-xl bg-white text-card-foreground shadow-sm group hover:shadow-md transition-all duration-200 ${
                  item.status === "Received"
                    ? "border-green-200 border-2"
                    : "border-red-200 border-2"
                }`}
              >
                <div className="p-4 sm:p-5">
                  {/* Header with actions */}
                  <div className="flex items-start justify-between mb-3 sm:mb-4">
                    <div className="flex-1 flex items-start gap-2 sm:gap-3">
                      <div
                        className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shadow-sm flex-shrink-0 ${
                          item.status === "Received"
                            ? "bg-green-100 text-green-600"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {item.status === "Received" ? (
                          <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                        ) : (
                          <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm sm:text-base font-semibold text-slate-900 mb-0.5 sm:mb-1 truncate">
                              {item.name}
                            </h3>
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                              <Calendar className="w-3 h-3" />
                              {formatDate(item.date)}
                            </div>
                          </div>
                          <div className="flex gap-0.5 sm:gap-1 flex-shrink-0">
                            <button
                              onClick={() => handleViewHistory(item)}
                              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-7 w-7 sm:h-8 sm:w-8"
                              title="View History"
                            >
                              <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600" />
                            </button>
                            <button
                              onClick={() => handleEditDue(item)}
                              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-7 w-7 sm:h-8 sm:w-8"
                              title="Edit"
                            >
                              <SquarePen className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-600" />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(item)}
                              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-7 w-7 sm:h-8 sm:w-8"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-500" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Amount and Status */}
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-slate-500">Amount</p>
                        <p className="text-lg sm:text-xl font-bold text-slate-900 truncate">
                          {formatCurrency(item.amount)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Status</p>
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            item.status === "Received"
                              ? "bg-green-100 text-green-800"
                              : item.status === "Partially Paid"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>
                    </div>

                    {/* Current Amount and Remaining Amount */}
                    {(item.currentAmount !== undefined ||
                      item.remainingAmount !== undefined) && (
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200">
                        <div>
                          <p className="text-xs text-slate-500">Current</p>
                          <p className="text-sm font-medium text-slate-900">
                            {formatCurrency(item.currentAmount || item.amount)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Remaining</p>
                          <p
                            className={`text-sm font-medium ${
                              item.status === "Received"
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {formatCurrency(
                              item.remainingAmount ||
                                item.currentAmount ||
                                item.amount
                            )}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Description */}
                    {item.description && (
                      <div className="pt-2 border-t border-slate-200">
                        <p className="text-xs sm:text-sm text-slate-600 line-clamp-2">
                          {item.description}
                        </p>
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex gap-1.5 sm:gap-2 pt-2">
                      <button
                        onClick={() => handleTransactionClick(item, "due")}
                        className="inline-flex items-center justify-center gap-1 sm:gap-2 whitespace-nowrap rounded-md text-xs sm:text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 shadow h-8 sm:h-9 px-2.5 sm:px-4 py-1.5 sm:py-2 flex-1 bg-red-600 hover:bg-red-700 text-white"
                      >
                        <ArrowDownLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        <span className="truncate">Add Due</span>
                      </button>
                      <button
                        onClick={() => handleTransactionClick(item, "receive")}
                        className="inline-flex items-center justify-center gap-1 sm:gap-2 whitespace-nowrap rounded-md text-xs sm:text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 shadow h-8 sm:h-9 px-2.5 sm:px-4 py-1.5 sm:py-2 flex-1 bg-green-600 hover:bg-green-700 text-white"
                      >
                        <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        <span className="truncate">Mark Paid</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty state */}
          {filteredDues.length === 0 && (
            <div className="text-center py-6 sm:py-8 mx-2 sm:mx-4 lg:mx-6">
              <div className="bg-white rounded-xl p-4 sm:p-6 border-0 shadow-sm">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500" />
                </div>
                <p className="text-slate-500 text-base sm:text-lg mb-2">
                  No dues found
                </p>
                <p className="text-slate-400 text-sm sm:text-base">
                  {search
                    ? "No results match your search"
                    : "Start by adding your first due/receivable"}
                </p>
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="mt-3 sm:mt-4 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-9 sm:h-10 px-3 sm:px-4 py-2 shadow bg-green-600 text-white hover:bg-green-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Record
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <DueReceivablesForm
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateDue}
        isEdit={false}
      />

      {isEditModalOpen && (
        <DueReceivablesForm
          isOpen={isEditModalOpen}
          onClose={closeEditModal}
          onSubmit={handleUpdateDue}
          editData={editingItem}
          isEdit={true}
        />
      )}

      <TransactionModal
        isOpen={isTransactionModalOpen}
        onClose={closeTransactionModal}
        onSubmit={handleTransactionSubmit}
        type={transactionType}
        item={selectedItem}
      />

      <TransactionHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={closeHistoryModal}
        item={selectedItem}
        fetchDues={fetchDues}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteConfirm}
        itemName={deletingItem?.name}
      />

      {/* Floating Action Button for Mobile */}
      <button
        onClick={() => setIsCreateModalOpen(true)}
        className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-40 w-12 h-12 sm:w-14 sm:h-14 bg-green-600 hover:bg-green-700 rounded-full flex items-center justify-center shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 cursor-pointer"
        title="New Record"
      >
        <Plus className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
      </button>
    </div>
  );
};

export default Due;
