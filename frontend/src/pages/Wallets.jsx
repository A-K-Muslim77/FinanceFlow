import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import BackgroundCircles from "../components/BackgroundCircles";
import WalletForm from "../components/froms/WalletForm";
import {
  Plus,
  SquarePen,
  Trash2,
  AlertTriangle,
  Wallet as WalletIcon,
  Banknote,
  Building2,
  Smartphone,
  CreditCard,
  Landmark,
  PiggyBank,
  Coins,
} from "lucide-react";

// Delete Confirmation Modal Component
const DeleteConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  walletName,
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
              Delete Wallet
            </h3>
            <p className="text-sm text-slate-500">
              This action cannot be undone
            </p>
          </div>
        </div>

        {/* Message */}
        <div className="mb-6">
          <p className="text-slate-700">
            Are you sure you want to delete the wallet{" "}
            <span className="font-semibold text-red-600">"{walletName}"</span>?
            This will remove the wallet and all its transactions permanently.
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
            Delete Wallet
          </button>
        </div>
      </div>
    </div>
  );
};

const Wallets = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingWallet, setEditingWallet] = useState(null);
  const [deletingWallet, setDeletingWallet] = useState(null);
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const BASE_URL = import.meta.env.VITE_BASE_URL;

  // Get auth token from localStorage
  const getAuthToken = () => {
    return localStorage.getItem("token");
  };

  // Fetch wallets from API
  useEffect(() => {
    fetchWallets();
  }, []);

  const fetchWallets = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = getAuthToken();

      if (!token) {
        setError("No authentication token found. Please login again.");
        setLoading(false);
        return;
      }

      const response = await fetch(`${BASE_URL}/wallets`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setWallets(result.data);
        //toast.success("Wallets loaded successfully");
      } else {
        throw new Error(result.error || "Failed to fetch wallets");
      }
    } catch (error) {
      console.error("Error fetching wallets:", error);
      const errorMessage = error.message || "Failed to load wallets";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Calculate total balance
  const totalBalance = wallets.reduce(
    (sum, wallet) => sum + (wallet.balance || 0),
    0
  );

  const getIconComponent = (iconName) => {
    const iconProps = { className: "w-6 h-6" };
    switch (iconName) {
      case "wallet":
        return <WalletIcon {...iconProps} />;
      case "banknote":
        return <Banknote {...iconProps} />;
      case "building2":
        return <Building2 {...iconProps} />;
      case "smartphone":
        return <Smartphone {...iconProps} />;
      case "credit-card":
        return <CreditCard {...iconProps} />;
      case "landmark":
        return <Landmark {...iconProps} />;
      case "piggy-bank":
        return <PiggyBank {...iconProps} />;
      case "coins":
        return <Coins {...iconProps} />;
      default:
        return <WalletIcon {...iconProps} />;
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

  const formatBalance = (amount) => {
    if (amount < 0) {
      return `-${formatCurrency(Math.abs(amount))}`;
    }
    return formatCurrency(amount);
  };

  const handleCreateWallet = async (walletData) => {
    try {
      const token = getAuthToken();

      if (!token) {
        toast.error("No authentication token found. Please login again.");
        return;
      }

      const response = await fetch(`${BASE_URL}/wallets`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(walletData),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setWallets((prev) => [...prev, result.data]);
        setIsCreateModalOpen(false);
        toast.success("Wallet created successfully");
      } else {
        throw new Error(result.error || "Failed to create wallet");
      }
    } catch (error) {
      console.error("Error creating wallet:", error);
      const errorMessage = error.message || "Failed to create wallet";
      toast.error(errorMessage);
    }
  };

  const handleEditWallet = (wallet) => {
    setEditingWallet(wallet);
    setIsEditModalOpen(true);
  };

  const handleUpdateWallet = async (walletData) => {
    try {
      const token = getAuthToken();

      if (!token) {
        toast.error("No authentication token found. Please login again.");
        return;
      }

      const response = await fetch(`${BASE_URL}/wallets/${editingWallet._id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(walletData),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setWallets((prev) =>
          prev.map((wallet) =>
            wallet._id === editingWallet._id ? result.data : wallet
          )
        );
        setIsEditModalOpen(false);
        setEditingWallet(null);
        toast.success("Wallet updated successfully");
      } else {
        throw new Error(result.error || "Failed to update wallet");
      }
    } catch (error) {
      console.error("Error updating wallet:", error);
      const errorMessage = error.message || "Failed to update wallet";
      toast.error(errorMessage);
    }
  };

  const handleDeleteClick = (wallet) => {
    if (wallet.isDefault) {
      toast.warning("Default wallets cannot be deleted");
      return;
    }
    setDeletingWallet(wallet);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingWallet) return;

    try {
      const token = getAuthToken();

      if (!token) {
        toast.error("No authentication token found. Please login again.");
        return;
      }

      const response = await fetch(
        `${BASE_URL}/wallets/${deletingWallet._id}`,
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
        setWallets((prev) =>
          prev.filter((wallet) => wallet._id !== deletingWallet._id)
        );
        setIsDeleteModalOpen(false);
        setDeletingWallet(null);
        toast.success("Wallet deleted successfully");
      } else {
        throw new Error(result.error || "Failed to delete wallet");
      }
    } catch (error) {
      console.error("Error deleting wallet:", error);
      const errorMessage = error.message || "Failed to delete wallet";
      toast.error(errorMessage);
    }
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeletingWallet(null);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingWallet(null);
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
            <p className="mt-4 text-slate-600">Loading wallets...</p>
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
            <h1 className="text-3xl font-bold text-slate-900">My Wallets</h1>
            <p className="text-slate-600 mt-1">Manage your payment methods</p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-9 px-4 py-2 shadow-lg bg-green-600 text-white hover:bg-white hover:text-green-600 border border-transparent hover:border-green-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Wallet
          </button>
        </div>

        {/* Total Balance Card */}
        <div className="bg-white rounded-xl p-6 border-0 shadow-sm">
          <p className="text-slate-700 text-sm font-medium mb-1">
            Total Balance
          </p>
          <p
            className={`text-4xl font-bold ${
              totalBalance < 0 ? "text-red-600" : "text-green-900"
            }`}
          >
            {formatBalance(totalBalance)}
          </p>
          <p className="text-slate-500 text-sm mt-1">
            Across {wallets.length} wallets
          </p>
        </div>

        {/* Wallets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {wallets.map((wallet) => (
            <div
              key={wallet._id}
              className="rounded-xl bg-white text-card-foreground shadow group hover:shadow-lg transition-all duration-200 border-0 overflow-hidden relative z-20"
            >
              {/* Color bar */}
              <div
                className="h-1.5 w-full"
                style={{ backgroundColor: wallet.color }}
              />

              <div className="p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    {/* Icon */}
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center shadow-md"
                      style={{ backgroundColor: `${wallet.color}20` }}
                    >
                      {getIconComponent(wallet.icon)}
                    </div>

                    {/* Wallet Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-slate-900">
                          {wallet.name}
                        </h3>
                        {wallet.isDefault && (
                          <div className="inline-flex items-center rounded-md border px-2.5 py-0.5 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 text-xs">
                            Default
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-slate-500 capitalize">
                        {wallet.type === "credit_card"
                          ? "Credit Card"
                          : wallet.type === "bank"
                          ? "Bank Account"
                          : wallet.type === "other"
                          ? "Other"
                          : wallet.type}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEditWallet(wallet)}
                      className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-8 w-8"
                    >
                      <SquarePen className="w-4 h-4 text-slate-600" />
                    </button>
                    {!wallet.isDefault && (
                      <button
                        onClick={() => handleDeleteClick(wallet)}
                        className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-8 w-8"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Balance */}
                <div className="mt-4 flex items-baseline gap-2">
                  <span
                    className={`text-2xl font-bold ${
                      wallet.balance < 0 ? "text-red-600" : "text-slate-900"
                    }`}
                  >
                    {formatBalance(wallet.balance)}
                  </span>
                </div>

                {/* Description */}
                {wallet.description && (
                  <p className="text-sm text-slate-500 mt-3 line-clamp-2">
                    {wallet.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {wallets.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-white rounded-xl p-8 border-0 shadow-sm">
              <p className="text-slate-500 text-lg">No wallets found</p>
              <p className="text-slate-400 mt-2">
                Get started by creating your first wallet
              </p>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="mt-4 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-9 px-4 py-2 shadow-lg bg-green-600 text-white hover:bg-white hover:text-green-600 border border-transparent hover:border-green-600"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Wallet
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create Wallet Modal */}
      <WalletForm
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateWallet}
        isEdit={false}
      />

      {/* Edit Wallet Modal */}
      <WalletForm
        isOpen={isEditModalOpen}
        onClose={closeEditModal}
        onSubmit={handleUpdateWallet}
        editData={editingWallet}
        isEdit={true}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteConfirm}
        walletName={deletingWallet?.name || ""}
      />
    </div>
  );
};

export default Wallets;
