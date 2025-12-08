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
  TrendingUp,
  TrendingDown,
  Users,
  Calendar,
  Clock,
  Eye,
  X,
  ArrowDownLeft,
  ArrowUpRight,
  CircleUser,
  Search,
  DollarSign,
  CheckCircle,
  CheckCheck,
  Filter,
  ChevronDown,
} from "lucide-react";

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, entryName }) => {
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
              Delete Entry
            </h3>
            <p className="text-sm text-slate-500">
              This action cannot be undone
            </p>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-slate-700">
            Are you sure you want to delete the entry for{" "}
            <span className="font-semibold text-red-600">"{entryName}"</span>?
            This will remove the entry permanently.
          </p>
        </div>

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 disabled:pointer-events-none disabled:opacity-50 border border-slate-200 bg-white shadow-sm hover:bg-slate-50 text-slate-700 h-9 px-4 py-2 mt-2 sm:mt-0"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 disabled:pointer-events-none disabled:opacity-50 text-white shadow h-9 px-4 py-2 bg-red-600 hover:bg-red-700"
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Delete Entry
          </button>
        </div>
      </div>
    </div>
  );
};

const DetailsModal = ({ isOpen, onClose, entry }) => {
  if (!isOpen || !entry) return null;

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
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-700 border-green-200";
      default:
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "paid":
        return "Paid";
      default:
        return "Pending";
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="relative w-full max-w-md bg-white rounded-lg shadow-lg p-4 sm:p-6 animate-in fade-in-0 zoom-in-95 mx-2 sm:mx-0">
        <button
          onClick={onClose}
          className="absolute right-3 top-3 sm:right-4 sm:top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>

        <div className="flex flex-col space-y-1.5 text-center sm:text-left mb-4 sm:mb-6">
          <h2 className="text-base sm:text-lg font-semibold leading-none tracking-tight">
            Entry Details
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Complete information about this entry
          </p>
        </div>

        <div className="space-y-4 sm:space-y-6">
          {/* Person/Entity */}
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                entry.type === "due"
                  ? "bg-red-50 text-red-600"
                  : "bg-green-50 text-green-600"
              }`}
            >
              <CircleUser className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base sm:text-lg font-semibold text-slate-900 truncate">
                {entry.person}
              </h3>
              <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-1">
                <span
                  className={`text-xs sm:text-sm font-medium px-2 py-0.5 rounded-full border ${getStatusColor(
                    entry.status
                  )}`}
                >
                  {getStatusLabel(entry.status)}
                </span>
                <span
                  className={`text-xs sm:text-sm font-medium px-2 py-0.5 rounded-full border ${
                    entry.type === "due"
                      ? "bg-red-50 text-red-700 border-red-200"
                      : "bg-green-50 text-green-700 border-green-200"
                  }`}
                >
                  {entry.type === "due" ? "Due" : "Receivable"}
                </span>
              </div>
            </div>
          </div>

          {/* Amount */}
          <div className="bg-slate-50 rounded-lg p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-slate-600 mb-1">Amount</p>
                <p
                  className={`text-xl sm:text-2xl font-bold ${
                    entry.type === "due" ? "text-red-600" : "text-green-600"
                  }`}
                >
                  {formatCurrency(entry.amount)}
                </p>
              </div>
              <div
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  entry.type === "due"
                    ? "bg-red-100 text-red-600"
                    : "bg-green-100 text-green-600"
                }`}
              >
                <DollarSign className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <p className="text-xs sm:text-sm text-slate-600 mb-1">Due Date</p>
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400" />
                <p className="font-medium text-slate-900 text-sm sm:text-base">
                  {formatDate(entry.due_date)}
                </p>
              </div>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-slate-600 mb-1">Status</p>
              <div className="flex items-center gap-2">
                {entry.status === "paid" ? (
                  <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-500" />
                ) : (
                  <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-500" />
                )}
                <p className="font-medium text-slate-900 text-sm sm:text-base">
                  {getStatusLabel(entry.status)}
                </p>
              </div>
            </div>
          </div>

          {/* Notes */}
          {entry.notes && (
            <div>
              <p className="text-xs sm:text-sm text-slate-600 mb-2">Notes</p>
              <div className="bg-slate-50 rounded-lg p-3 sm:p-4">
                <p className="text-slate-700 text-sm sm:text-base">
                  {entry.notes}
                </p>
              </div>
            </div>
          )}

          {/* Action Button */}
          <div className="pt-3 sm:pt-4 border-t border-slate-200">
            <button
              onClick={onClose}
              className="w-full inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 disabled:pointer-events-none disabled:opacity-50 border border-slate-200 bg-white shadow-sm hover:bg-slate-50 text-slate-700 h-9 px-4 py-2"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Due = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [deletingEntry, setDeletingEntry] = useState(null);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totals, setTotals] = useState({
    receivables: 0,
    dues: 0,
    totalPeople: 0,
    duePaid: 0,
    receivablePaid: 0,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:5000/api";

  const getAuthToken = () => {
    return localStorage.getItem("token");
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = getAuthToken();

      if (!token) {
        setError("No authentication token found. Please login again.");
        setLoading(false);
        return;
      }

      const response = await fetch(`${BASE_URL}/due-receivables`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setEntries(result.data);

        const calculatedTotals = {
          receivables: 0,
          dues: 0,
          totalPeople: 0,
          duePaid: 0,
          receivablePaid: 0,
        };

        const uniquePeople = new Set();

        result.data.forEach((entry) => {
          uniquePeople.add(entry.person.toLowerCase());

          if (entry.type === "due") {
            if (entry.status === "pending") {
              calculatedTotals.dues += entry.amount;
            } else if (entry.status === "paid") {
              calculatedTotals.duePaid += entry.amount;
            }
          } else if (entry.type === "receivable") {
            if (entry.status === "pending") {
              calculatedTotals.receivables += entry.amount;
            } else if (entry.status === "paid") {
              calculatedTotals.receivablePaid += entry.amount;
            }
          }
        });

        calculatedTotals.totalPeople = uniquePeople.size;
        setTotals(calculatedTotals);
      } else {
        throw new Error(result.error || "Failed to fetch entries");
      }
    } catch (error) {
      console.error("Error fetching entries:", error);
      setError(error.message || "Failed to load entries");
      toast.error(error.message || "Failed to load entries");
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

  const handleCreateEntry = async (entryData) => {
    try {
      const token = getAuthToken();

      if (!token) {
        toast.error("No authentication token found. Please login again.");
        return;
      }

      const response = await fetch(`${BASE_URL}/due-receivables`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(entryData),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        fetchEntries();
        setIsCreateModalOpen(false);
        toast.success("Entry created successfully");
      } else {
        throw new Error(result.error || "Failed to create entry");
      }
    } catch (error) {
      toast.error(error.message || "Failed to create entry");
    }
  };

  const handleEditEntry = (entry) => {
    setEditingEntry(entry);
    setIsEditModalOpen(true);
  };

  const handleUpdateEntry = async (entryData) => {
    try {
      const token = getAuthToken();

      if (!token) {
        toast.error("No authentication token found. Please login again.");
        return;
      }

      const response = await fetch(
        `${BASE_URL}/due-receivables/${editingEntry._id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(entryData),
        }
      );

      const result = await response.json();

      if (response.ok && result.success) {
        fetchEntries();
        setIsEditModalOpen(false);
        setEditingEntry(null);
        toast.success("Entry updated successfully");
      } else {
        throw new Error(result.error || "Failed to update entry");
      }
    } catch (error) {
      toast.error(error.message || "Failed to update entry");
    }
  };

  const handleDeleteClick = (entry) => {
    setDeletingEntry(entry);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingEntry) return;

    try {
      const token = getAuthToken();

      if (!token) {
        toast.error("No authentication token found. Please login again.");
        return;
      }

      const response = await fetch(
        `${BASE_URL}/due-receivables/${deletingEntry._id}`,
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
        fetchEntries();
        setIsDeleteModalOpen(false);
        setDeletingEntry(null);
        toast.success("Entry deleted successfully");
      } else {
        throw new Error(result.error || "Failed to delete entry");
      }
    } catch (error) {
      toast.error(error.message || "Failed to delete entry");
    }
  };

  const handleViewDetails = (entry) => {
    setSelectedEntry(entry);
    setIsDetailsModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeletingEntry(null);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingEntry(null);
  };

  const closeDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedEntry(null);
  };

  const clearError = () => {
    setError(null);
  };

  const filteredEntries = entries.filter((entry) => {
    const matchesSearch = entry.person
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesFilter =
      filter === "all" ||
      (filter === "due" && entry.type === "due") ||
      (filter === "receivable" && entry.type === "receivable");
    return matchesSearch && matchesFilter;
  });

  const getStatusLabel = (status) => {
    switch (status) {
      case "paid":
        return "Paid";
      default:
        return "Pending";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-700";
      default:
        return "bg-yellow-100 text-yellow-700";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen relative">
        <div className="fixed inset-0 z-0">
          <BackgroundCircles />
        </div>
        <div className="flex items-center justify-center min-h-screen relative z-10 px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-slate-600">Loading entries...</p>
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
                Due & Receivables
              </h1>
              <p className="text-slate-600 text-xs sm:text-sm sm:mt-0.5 sm:mt-1">
                Track money you owe and are owed
              </p>
            </div>

            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-9 px-3 sm:px-4 py-2 shadow-lg bg-green-600 text-white hover:bg-white hover:text-green-600 border border-transparent hover:border-green-600 w-full sm:w-auto"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Entry</span>
              <span className="sm:hidden">Add New Entry</span>
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

          {/* Summary Cards - Responsive grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 px-2 sm:px-0">
            {/* Receivables (Pending) Card */}
            <div className="rounded-xl text-card-foreground bg-white border-0 shadow-sm">
              <div className="p-4 sm:p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-slate-600 mb-1 flex items-center gap-1">
                      <ArrowDownLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600" />
                      <span className="truncate">Receivables</span>
                    </p>
                    <p className="text-lg sm:text-xl md:text-2xl font-bold text-green-600 truncate">
                      {formatCurrency(totals.receivables)}
                    </p>
                  </div>
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-50 rounded-full flex items-center justify-center flex-shrink-0 ml-2">
                    <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Due (Pending) Card */}
            <div className="rounded-xl text-card-foreground bg-white border-0 shadow-sm">
              <div className="p-4 sm:p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-slate-600 mb-1 flex items-center gap-1">
                      <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-500" />
                      <span className="truncate">Due</span>
                    </p>
                    <p className="text-lg sm:text-xl md:text-2xl font-bold text-red-500 truncate">
                      {formatCurrency(totals.dues)}
                    </p>
                  </div>
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-50 rounded-full flex items-center justify-center flex-shrink-0 ml-2">
                    <TrendingDown className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
                  </div>
                </div>
              </div>
            </div>

            {/* Due Paid Card */}
            <div className="rounded-xl text-card-foreground bg-white border-0 shadow-sm">
              <div className="p-4 sm:p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-slate-600 mb-1 flex items-center gap-1">
                      <CheckCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600" />
                      <span className="truncate">Due Paid</span>
                    </p>
                    <p className="text-lg sm:text-xl md:text-2xl font-bold text-green-600 truncate">
                      {formatCurrency(totals.duePaid)}
                    </p>
                  </div>
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-50 rounded-full flex items-center justify-center flex-shrink-0 ml-2">
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Receivable Paid Card */}
            <div className="rounded-xl text-card-foreground bg-white border-0 shadow-sm">
              <div className="p-4 sm:p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-slate-600 mb-1 flex items-center gap-1">
                      <CheckCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600" />
                      <span className="truncate">Receivable Paid</span>
                    </p>
                    <p className="text-lg sm:text-xl md:text-2xl font-bold text-blue-600 truncate">
                      {formatCurrency(totals.receivablePaid)}
                    </p>
                  </div>
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0 ml-2">
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Total People Card */}
            <div className="rounded-xl text-card-foreground bg-white border-0 shadow-sm col-span-1 sm:col-span-2 lg:col-span-1">
              <div className="p-4 sm:p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-slate-600 mb-1 flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-500" />
                      <span className="truncate">Total People</span>
                    </p>
                    <p className="text-lg sm:text-xl md:text-2xl font-bold text-purple-500">
                      {totals.totalPeople}
                    </p>
                  </div>
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-50 rounded-full flex items-center justify-center flex-shrink-0 ml-2">
                    <Users className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filter - Mobile Optimized */}
          <div className="space-y-3 px-2 sm:px-0">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name..."
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 pl-9 sm:pl-10 pr-4 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Mobile Filter Toggle */}
            <div className="sm:hidden">
              <button
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className="w-full flex items-center justify-between p-3 border border-slate-200 rounded-lg bg-white"
              >
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-slate-500" />
                  <span className="text-sm font-medium text-slate-700">
                    {filter === "all"
                      ? "All Entries"
                      : filter === "due"
                      ? "Due Only"
                      : "Receivable Only"}
                  </span>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-slate-500 transition-transform ${
                    showMobileFilters ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Mobile Filter Dropdown */}
              {showMobileFilters && (
                <div className="mt-2 bg-white border border-slate-200 rounded-lg p-2">
                  <div className="space-y-1">
                    <button
                      onClick={() => {
                        setFilter("all");
                        setShowMobileFilters(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded text-sm ${
                        filter === "all"
                          ? "bg-green-50 text-green-700 font-medium"
                          : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      All Entries
                    </button>
                    <button
                      onClick={() => {
                        setFilter("due");
                        setShowMobileFilters(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded text-sm ${
                        filter === "due"
                          ? "bg-green-50 text-green-700 font-medium"
                          : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      Due Only
                    </button>
                    <button
                      onClick={() => {
                        setFilter("receivable");
                        setShowMobileFilters(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded text-sm ${
                        filter === "receivable"
                          ? "bg-green-50 text-green-700 font-medium"
                          : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      Receivable Only
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Desktop Filter Buttons */}
            <div className="hidden sm:flex gap-2">
              <button
                onClick={() => setFilter("all")}
                className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors border text-sm ${
                  filter === "all"
                    ? "bg-green-500 text-white hover:bg-white hover:text-green-600"
                    : "bg-white text-green-600 hover:bg-green-500 hover:text-white"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter("due")}
                className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors border text-sm ${
                  filter === "due"
                    ? "bg-green-500 text-white hover:bg-white hover:text-green-600"
                    : "bg-white text-green-600 hover:bg-green-500 hover:text-white"
                }`}
              >
                Due
              </button>
              <button
                onClick={() => setFilter("receivable")}
                className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors border text-sm ${
                  filter === "receivable"
                    ? "bg-green-500 text-white hover:bg-white hover:text-green-600"
                    : "bg-white text-green-600 hover:bg-green-500 hover:text-white"
                }`}
              >
                Receivable
              </button>
            </div>
          </div>

          {/* Entries List */}
          <div className="space-y-2 sm:space-y-3 px-2 sm:px-0">
            {filteredEntries.map((entry) => (
              <div
                key={entry._id}
                className="rounded-xl bg-white text-card-foreground border-0 shadow-sm hover:shadow-md transition-all duration-200"
              >
                <div className="p-3 sm:p-4">
                  <div className="flex items-start gap-3 sm:gap-3">
                    <div
                      className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                        entry.type === "due" ? "bg-red-50" : "bg-green-50"
                      }`}
                    >
                      <CircleUser
                        className={`w-5 h-5 sm:w-7 sm:h-7 ${
                          entry.type === "due"
                            ? "text-red-500"
                            : "text-green-600"
                        }`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                        <div className="flex-1 min-w-0 mb-2 sm:mb-0">
                          <h3 className="font-medium text-slate-900 text-sm sm:text-base truncate">
                            {entry.person}
                          </h3>
                          <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-1">
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(
                                entry.status
                              )}`}
                            >
                              {getStatusLabel(entry.status)}
                            </span>
                            <span className="text-xs text-slate-500 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(entry.due_date).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                }
                              )}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3">
                          <p
                            className={`text-base sm:text-lg font-bold ${
                              entry.type === "due"
                                ? "text-red-500"
                                : "text-green-600"
                            }`}
                          >
                            {formatCurrency(entry.amount)}
                          </p>
                          <div className="flex items-center gap-0.5 sm:gap-1">
                            <button
                              onClick={() => handleViewDetails(entry)}
                              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 disabled:pointer-events-none disabled:opacity-50 hover:bg-slate-100 hover:text-accent-foreground h-7 w-7 sm:h-8 sm:w-8"
                              title="View Details"
                            >
                              <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-500" />
                            </button>
                            <button
                              onClick={() => handleEditEntry(entry)}
                              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 disabled:pointer-events-none disabled:opacity-50 hover:bg-slate-100 hover:text-accent-foreground h-7 w-7 sm:h-8 sm:w-8"
                              title="Edit"
                            >
                              <SquarePen className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-600" />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(entry)}
                              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 disabled:pointer-events-none disabled:opacity-50 hover:bg-slate-100 hover:text-accent-foreground h-7 w-7 sm:h-8 sm:w-8"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-500" />
                            </button>
                          </div>
                        </div>
                      </div>
                      {entry.notes && (
                        <p className="text-xs sm:text-sm text-slate-600 mt-2 truncate">
                          {entry.notes}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty state */}
          {filteredEntries.length === 0 && (
            <div className="text-center py-8 sm:py-12 px-4">
              <div className="bg-white rounded-xl p-6 sm:p-8 border-0 shadow-sm">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <Users className="w-6 h-6 sm:w-8 sm:h-8 text-green-500" />
                </div>
                <p className="text-slate-500 text-base sm:text-lg mb-2">
                  No entries found
                </p>
                <p className="text-slate-400 text-sm sm:text-base">
                  {searchTerm || filter !== "all"
                    ? "Try changing your search or filter"
                    : "Start by adding your first due/receivable entry"}
                </p>
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-9 px-4 py-2 shadow-lg bg-green-600 text-white hover:bg-white hover:text-green-600 border border-transparent hover:border-green-600 mt-4 sm:mt-5 w-full sm:w-auto"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Entry
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
        onSubmit={handleCreateEntry}
        isEdit={false}
      />

      {isEditModalOpen && (
        <DueReceivablesForm
          isOpen={isEditModalOpen}
          onClose={closeEditModal}
          onSubmit={handleUpdateEntry}
          editData={editingEntry}
          isEdit={true}
        />
      )}

      <DetailsModal
        isOpen={isDetailsModalOpen}
        onClose={closeDetailsModal}
        entry={selectedEntry}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteConfirm}
        entryName={deletingEntry?.person}
      />

      {/* Floating Action Button for Mobile */}
      <button
        onClick={() => setIsCreateModalOpen(true)}
        className="sm:hidden fixed bottom-20 right-4 w-12 h-12 rounded-full bg-green-600 text-white shadow-lg flex items-center justify-center z-40 hover:bg-green-700 transition-colors"
      >
        <Plus className="w-5 h-5" />
      </button>
    </div>
  );
};

export default Due;
