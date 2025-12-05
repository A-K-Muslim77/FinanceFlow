import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import BackgroundCircles from "../components/BackgroundCircles";
import WalletForm from "../components/froms/WalletForm";
import {
  Plus,
  SquarePen,
  Trash2,
  Eye,
  AlertTriangle,
  Wallet as WalletIcon,
  Banknote,
  Building2,
  Smartphone,
  CreditCard,
  Landmark,
  PiggyBank,
  Coins,
  Calendar,
  ChevronDown,
  X,
  TrendingUp,
  TrendingDown,
  ArrowLeftRight,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowRightLeft,
  Copy,
} from "lucide-react";

const WalletTransactionsModal = ({
  isOpen,
  onClose,
  walletId,
  month,
  year,
}) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [walletData, setWalletData] = useState(null);
  const [totals, setTotals] = useState(null);

  const BASE_URL = import.meta.env.VITE_BASE_URL;

  const getAuthToken = () => {
    return localStorage.getItem("token");
  };

  useEffect(() => {
    if (isOpen && walletId) {
      fetchWalletTransactions();
    }
  }, [isOpen, walletId, month, year]);

  const fetchWalletTransactions = async () => {
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
        `${BASE_URL}/wallets/${walletId}/transactions?month=${month}&year=${year}`,
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
        setWalletData(result.data.wallet);
        setTransactions(result.data.transactions);
        setTotals(result.data.totals);
      } else {
        throw new Error(result.error || "Failed to fetch wallet transactions");
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
      <div className="relative w-full max-w-4xl bg-white rounded-lg shadow-lg p-6 animate-in fade-in-0 zoom-in-95 max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between mb-6 pb-4 border-b">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              Wallet Transactions
            </h3>
            <p className="text-sm text-slate-500">
              {walletData?.name} - {getMonthName(month)} {year}
            </p>
          </div>
          <button
            onClick={onClose}
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-8 w-8"
          >
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        {walletData && (
          <div className="mb-6 p-4 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${walletData.color}20` }}
              >
                {walletData.icon === "wallet" && (
                  <WalletIcon
                    className="w-6 h-6"
                    style={{ color: walletData.color }}
                  />
                )}
                {walletData.icon === "banknote" && (
                  <Banknote
                    className="w-6 h-6"
                    style={{ color: walletData.color }}
                  />
                )}
                {walletData.icon === "building2" && (
                  <Building2
                    className="w-6 h-6"
                    style={{ color: walletData.color }}
                  />
                )}
                {walletData.icon === "smartphone" && (
                  <Smartphone
                    className="w-6 h-6"
                    style={{ color: walletData.color }}
                  />
                )}
                {walletData.icon === "credit-card" && (
                  <CreditCard
                    className="w-6 h-6"
                    style={{ color: walletData.color }}
                  />
                )}
                {walletData.icon === "landmark" && (
                  <Landmark
                    className="w-6 h-6"
                    style={{ color: walletData.color }}
                  />
                )}
                {walletData.icon === "piggy-bank" && (
                  <PiggyBank
                    className="w-6 h-6"
                    style={{ color: walletData.color }}
                  />
                )}
                {walletData.icon === "coins" && (
                  <Coins
                    className="w-6 h-6"
                    style={{ color: walletData.color }}
                  />
                )}
              </div>
              <div>
                <h4 className="font-semibold text-slate-900">
                  {walletData.name}
                </h4>
                <p className="text-sm text-slate-500 capitalize">
                  {walletData.type === "credit_card"
                    ? "Credit Card"
                    : walletData.type === "bank"
                    ? "Bank Account"
                    : walletData.type === "other"
                    ? "Other"
                    : walletData.type}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div>
                <p className="text-xs text-slate-500">Opening Balance</p>
                <p className="text-lg font-semibold text-slate-700">
                  {formatCurrency(walletData.openingBalance)}
                </p>
              </div>
              <div>
                <p className="text-xs text-blue-500">Monthly Balance</p>
                <p
                  className={`text-lg font-semibold ${
                    walletData.monthlyBalance >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {formatCurrency(walletData.monthlyBalance)}
                </p>
              </div>
              {totals && (
                <>
                  <div>
                    <p className="text-xs text-green-500">
                      Income (Incl. Transfers)
                    </p>
                    <p className="text-lg font-semibold text-green-600">
                      +{formatCurrency(totals.combinedIncome || totals.income)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-red-500">
                      Expense (Incl. Transfers)
                    </p>
                    <p className="text-lg font-semibold text-red-600">
                      -
                      {formatCurrency(totals.combinedExpense || totals.expense)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-blue-500">Net Change</p>
                    <p
                      className={`text-lg font-semibold ${
                        totals.netChange >= 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {totals.netChange >= 0 ? "+" : ""}
                      {formatCurrency(totals.netChange)}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            <div className="flex justify-between items-center">
              <span>{error}</span>
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
          <div className="flex-1 overflow-y-auto">
            <div className="space-y-3">
              {transactions.map((transaction) => {
                const category = transaction.category_id;
                const fromWallet = transaction.from_wallet_id;
                const toWallet = transaction.to_wallet_id;
                const isIncome = transaction.type === "income";
                const isExpense = transaction.type === "expense";
                const isTransfer = transaction.type === "transfer";
                const isIncoming = isTransfer && toWallet?._id === walletId;
                const isOutgoing = isTransfer && fromWallet?._id === walletId;

                const displayType = isTransfer
                  ? isIncoming
                    ? "income"
                    : "expense"
                  : transaction.type;

                return (
                  <div
                    key={transaction._id}
                    className="p-4 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{
                          backgroundColor: isTransfer
                            ? "rgb(241, 245, 249)"
                            : isIncome
                            ? "rgba(34, 197, 94, 0.1)"
                            : "rgba(239, 68, 68, 0.1)",
                        }}
                      >
                        {isTransfer ? (
                          <ArrowRightLeft
                            className={`w-5 h-5 ${
                              isIncoming ? "text-green-600" : "text-red-600"
                            }`}
                          />
                        ) : isIncome ? (
                          <ArrowDownLeft className="w-5 h-5 text-green-600" />
                        ) : (
                          <ArrowUpRight className="w-5 h-5 text-red-600" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-slate-900 truncate">
                            {isTransfer
                              ? `${fromWallet?.name || "Wallet"} → ${
                                  toWallet?.name || "Wallet"
                                }`
                              : category?.name || "Uncategorized"}
                          </h4>
                          <div
                            className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${
                              displayType === "income"
                                ? "text-green-600 bg-green-50 border-green-200"
                                : "text-red-600 bg-red-50 border-red-200"
                            }`}
                          >
                            {isTransfer
                              ? isIncoming
                                ? "Transfer In (Income)"
                                : "Transfer Out (Expense)"
                              : transaction.type === "income"
                              ? "Income"
                              : "Expense"}
                          </div>
                        </div>
                        {transaction.notes && (
                          <p className="text-sm text-slate-600 mb-1 line-clamp-1">
                            {transaction.notes}
                          </p>
                        )}
                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          <span>{formatDate(transaction.date)}</span>
                          {isTransfer ? (
                            <>
                              <span>From: {fromWallet?.name || "Wallet"}</span>
                              <span>To: {toWallet?.name || "Wallet"}</span>
                            </>
                          ) : (
                            <span>{fromWallet?.name || "Wallet"}</span>
                          )}
                        </div>
                      </div>

                      <div className="text-right">
                        <p
                          className={`text-lg font-bold ${
                            displayType === "income"
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {displayType === "income" ? "+" : "-"}
                          {formatCurrency(transaction.amount)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {!loading && transactions.length === 0 && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <WalletIcon className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-slate-500 text-lg mb-2">
                No transactions found
              </p>
              <p className="text-slate-400">
                No transactions for this wallet in {getMonthName(month)} {year}
              </p>
            </div>
          </div>
        )}

        <div className="mt-6 pt-4 border-t">
          <div className="flex justify-between items-center text-sm text-slate-600">
            <span>
              {transactions.length} transaction
              {transactions.length !== 1 ? "s" : ""}
            </span>
            <button
              onClick={onClose}
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 text-slate-700 hover:bg-slate-100"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

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

        <div className="mb-6">
          <p className="text-slate-700">
            Are you sure you want to delete the wallet{" "}
            <span className="font-semibold text-red-600">"{walletName}"</span>?
            This will remove the wallet and all its transactions permanently.
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
            Delete Wallet
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
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" },
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);

  return (
    <div className="flex flex-col sm:flex-row gap-4 bg-white rounded-xl p-4 border-0 shadow-sm">
      <div className="flex-1">
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Select Month
        </label>
        <div className="relative">
          <select
            value={selectedMonth}
            onChange={(e) => onMonthChange(parseInt(e.target.value))}
            disabled={isLoading}
            className="w-full appearance-none rounded-lg border border-slate-200 bg-white py-2.5 pl-4 pr-10 text-sm text-slate-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {months.map((month) => (
              <option key={month.value} value={month.value}>
                {month.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>
      </div>

      <div className="flex-1">
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Select Year
        </label>
        <div className="relative">
          <select
            value={selectedYear}
            onChange={(e) => onYearChange(parseInt(e.target.value))}
            disabled={isLoading}
            className="w-full appearance-none rounded-lg border border-slate-200 bg-white py-2.5 pl-4 pr-10 text-sm text-slate-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>
      </div>

      <div className="flex items-end gap-3">
        <div className="flex items-center gap-2 text-slate-600">
          <Calendar className="w-5 h-5" />
          <span className="text-sm font-medium">
            {months.find((m) => m.value === selectedMonth)?.label}{" "}
            {selectedYear}
          </span>
        </div>
      </div>
    </div>
  );
};

const Wallets = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isTransactionsModalOpen, setIsTransactionsModalOpen] = useState(false);
  const [editingWallet, setEditingWallet] = useState(null);
  const [deletingWallet, setDeletingWallet] = useState(null);
  const [selectedWalletForTransactions, setSelectedWalletForTransactions] =
    useState(null);
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [availableMonths, setAvailableMonths] = useState([]);
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [copying, setCopying] = useState(false);

  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(
    currentDate.getMonth() + 1
  );
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [monthlyData, setMonthlyData] = useState(null);

  const BASE_URL = import.meta.env.VITE_BASE_URL;

  const getAuthToken = () => {
    return localStorage.getItem("token");
  };

  const fetchMonthlyWallets = async () => {
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

      const response = await fetch(
        `${BASE_URL}/wallets/monthly?month=${selectedMonth}&year=${selectedYear}`,
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
        setWallets(result.data.wallets);
        setMonthlyData({
          totalMonthlyBalance: result.data.totalMonthlyBalance,
          month: result.data.month,
          year: result.data.year,
          monthName: result.data.monthName,
        });
      } else {
        throw new Error(result.error || "Failed to fetch monthly wallets");
      }
    } catch (error) {
      setError(error.message || "Failed to load wallets");
      toast.error(error.message || "Failed to load wallets");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchAvailableMonths = async () => {
    try {
      const token = getAuthToken();
      if (!token) return;

      const response = await fetch(`${BASE_URL}/wallets/months`, {
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

  useEffect(() => {
    fetchMonthlyWallets();
    fetchAvailableMonths();
  }, [selectedMonth, selectedYear]);

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

  const handleCreateWallet = async (walletData) => {
    try {
      const token = getAuthToken();

      if (!token) {
        toast.error("No authentication token found. Please login again.");
        return;
      }

      const walletWithMonth = {
        ...walletData,
        month: selectedMonth,
        year: selectedYear,
        openingBalance: walletData.balance || 0,
      };

      const response = await fetch(`${BASE_URL}/wallets`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(walletWithMonth),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        fetchMonthlyWallets();
        setIsCreateModalOpen(false);
        toast.success("Wallet created successfully");
      } else {
        throw new Error(result.error || "Failed to create wallet");
      }
    } catch (error) {
      toast.error(error.message || "Failed to create wallet");
    }
  };

  const handleEditWallet = (wallet) => {
    setEditingWallet({
      ...wallet,
      balance: wallet.openingBalance || 0,
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateWallet = async (walletData) => {
    try {
      const token = getAuthToken();

      if (!token) {
        toast.error("No authentication token found. Please login again.");
        return;
      }

      const updateData = {
        ...walletData,
        openingBalance: walletData.balance || 0,
      };

      const response = await fetch(`${BASE_URL}/wallets/${editingWallet._id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        fetchMonthlyWallets();
        setIsEditModalOpen(false);
        setEditingWallet(null);
        toast.success("Wallet updated successfully");
      } else {
        throw new Error(result.error || "Failed to update wallet");
      }
    } catch (error) {
      toast.error(error.message || "Failed to update wallet");
    }
  };

  const handleDeleteClick = (wallet) => {
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
        fetchMonthlyWallets();
        setIsDeleteModalOpen(false);
        setDeletingWallet(null);
        toast.success("Wallet deleted successfully");
      } else {
        throw new Error(result.error || "Failed to delete wallet");
      }
    } catch (error) {
      toast.error(error.message || "Failed to delete wallet");
    }
  };

  const handleViewTransactions = (wallet) => {
    setSelectedWalletForTransactions(wallet._id);
    setIsTransactionsModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeletingWallet(null);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingWallet(null);
  };

  const closeTransactionsModal = () => {
    setIsTransactionsModalOpen(false);
    setSelectedWalletForTransactions(null);
  };

  const clearError = () => {
    setError(null);
  };

  const handleMonthChange = (month) => {
    setSelectedMonth(month);
  };

  const handleYearChange = (year) => {
    setSelectedYear(year);
  };

  const handleCopyWalletsFromPreviousMonth = async () => {
    try {
      setCopying(true);
      const token = getAuthToken();

      if (!token) {
        toast.error("No authentication token found. Please login again.");
        return;
      }

      const response = await fetch(`${BASE_URL}/wallets/copy`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          month: selectedMonth,
          year: selectedYear,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        fetchMonthlyWallets();
        setShowCopyModal(false);
        toast.success(result.message || "Wallets copied successfully");
      } else {
        throw new Error(result.error || "Failed to copy wallets");
      }
    } catch (error) {
      toast.error(error.message || "Failed to copy wallets");
    } finally {
      setCopying(false);
    }
  };

  const handleShowCopyModal = () => {
    if (wallets.length > 0) {
      toast.info("Wallets already exist for this month");
      return;
    }

    // Add this check to ensure there's actually a previous month with data
    const currentYear = new Date().getFullYear();
    const hasPreviousMonth = selectedMonth > 1 || selectedYear > currentYear;

    if (!hasPreviousMonth) {
      toast.info("No previous month data available to copy");
      return;
    }

    setShowCopyModal(true);
  };

  if (loading && !refreshing) {
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

      <div className="space-y-6 pb-20 lg:pb-6 relative z-10">
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

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">My Wallets</h1>
            <p className="text-slate-600 mt-1">View wallet balances by month</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-9 px-4 py-2 shadow-lg bg-green-600 text-white hover:bg-white hover:text-green-600 border border-transparent hover:border-green-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Wallet
            </button>
          </div>
        </div>

        <MonthYearSelector
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          onMonthChange={handleMonthChange}
          onYearChange={handleYearChange}
          isLoading={refreshing}
        />

        {monthlyData && (
          <div className="bg-white rounded-xl p-4 border-0 shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  {monthlyData.monthName} {monthlyData.year}
                </h3>
                <p className="text-sm text-slate-600">
                  {wallets.length === 0
                    ? "No wallets created for this month"
                    : `Showing ${wallets.length} wallet${
                        wallets.length !== 1 ? "s" : ""
                      } for this month`}
                </p>
              </div>

              <div className="text-right">
                <p className="text-sm text-slate-500 mb-1">
                  Monthly Total Balance
                </p>
                <p
                  className={`text-2xl font-bold ${
                    monthlyData.totalMonthlyBalance < 0
                      ? "text-red-600"
                      : "text-green-900"
                  }`}
                >
                  {formatBalance(monthlyData.totalMonthlyBalance)}
                </p>
              </div>
            </div>
          </div>
        )}

        {availableMonths.length > 0 && (
          <div className="bg-white rounded-xl p-4 border-0 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900 mb-3">
              Available Months
            </h3>
            <div className="flex flex-wrap gap-2">
              {availableMonths
                .map((monthData) => {
                  let month, year, monthName, walletCount;

                  if (typeof monthData === "object" && monthData !== null) {
                    month = monthData.month;
                    year = monthData.year;
                    monthName =
                      monthData.monthName || getMonthName(monthData.month);
                    walletCount = monthData.walletCount || 0;
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
                      {walletCount > 0 && (
                        <span className="ml-2 text-xs bg-slate-200 px-1.5 py-0.5 rounded">
                          {walletCount}
                        </span>
                      )}
                    </button>
                  );
                })
                .filter(Boolean)}
            </div>
          </div>
        )}

        {wallets.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-white rounded-xl p-8 border-0 shadow-sm">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <WalletIcon className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-slate-500 text-lg mb-2">
                No wallets for {getMonthName(selectedMonth)} {selectedYear}
              </p>
              <p className="text-slate-400 mb-6">
                Start by creating wallets for this month
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-9 px-4 py-2 shadow-lg bg-green-600 text-white hover:bg-white hover:text-green-600 border border-transparent hover:border-green-600"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Wallet
                </button>
                {(selectedMonth > 1 ||
                  selectedYear > new Date().getFullYear()) && (
                  <button
                    onClick={handleShowCopyModal}
                    className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-9 px-4 py-2 shadow-lg bg-gray-600 text-white hover:bg-white hover:text-gray-600 border border-transparent hover:border-gray-600"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy from Previous Month
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {wallets.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {wallets.map((wallet) => (
              <div
                key={wallet._id}
                className="rounded-xl bg-white text-card-foreground shadow group hover:shadow-lg transition-all duration-200 border-0 overflow-hidden relative z-20"
              >
                <div
                  className="h-1.5 w-full"
                  style={{ backgroundColor: wallet.color }}
                />

                <div className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center shadow-md"
                        style={{ backgroundColor: `${wallet.color}20` }}
                      >
                        {getIconComponent(wallet.icon)}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-slate-900">
                            {wallet.name}
                          </h3>
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

                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleViewTransactions(wallet)}
                        className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-8 w-8"
                      >
                        <Eye className="w-4 h-4 text-slate-600" />
                      </button>
                      <button
                        onClick={() => handleEditWallet(wallet)}
                        className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-8 w-8"
                      >
                        <SquarePen className="w-4 h-4 text-slate-600" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(wallet)}
                        className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-8 w-8"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    <div className="flex items-baseline justify-between">
                      <span className="text-sm text-slate-500">
                        Opening Balance
                      </span>
                      <span className="text-lg font-semibold text-slate-700">
                        {formatBalance(wallet.openingBalance || 0)}
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between">
                      <span className="text-sm text-slate-500">
                        Monthly Balance
                      </span>
                      <span
                        className={`text-2xl font-bold ${
                          wallet.monthlyBalance < 0
                            ? "text-red-600"
                            : "text-slate-900"
                        }`}
                      >
                        {formatBalance(wallet.monthlyBalance)}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400">
                      For {getMonthName(selectedMonth)} {selectedYear}
                    </p>

                    {wallet.transactionCount > 0 && (
                      <p className="text-xs text-slate-400">
                        {wallet.transactionCount} transaction
                        {wallet.transactionCount !== 1 ? "s" : ""} this month
                      </p>
                    )}
                  </div>

                  {wallet.description && (
                    <p className="text-sm text-slate-500 mt-3 line-clamp-2">
                      {wallet.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <WalletForm
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateWallet}
        isEdit={false}
      />

      <WalletForm
        isOpen={isEditModalOpen}
        onClose={closeEditModal}
        onSubmit={handleUpdateWallet}
        editData={editingWallet}
        isEdit={true}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteConfirm}
        walletName={deletingWallet?.name || ""}
      />

      <WalletTransactionsModal
        isOpen={isTransactionsModalOpen}
        onClose={closeTransactionsModal}
        walletId={selectedWalletForTransactions}
        month={selectedMonth}
        year={selectedYear}
      />

      {showCopyModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-white rounded-lg shadow-lg p-6 animate-in fade-in-0 zoom-in-95">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Copy className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  Copy Wallets
                </h3>
                <p className="text-sm text-slate-500">
                  Copy wallets from previous month
                </p>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-slate-700">
                Do you want to copy wallets from{" "}
                {getMonthName(selectedMonth - 1 || 12)}? This will create new
                wallets with 0 opening balance for {getMonthName(selectedMonth)}{" "}
                {selectedYear}.
              </p>
            </div>

            <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-3">
              <button
                type="button"
                onClick={() => setShowCopyModal(false)}
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCopyWalletsFromPreviousMonth}
                disabled={copying}
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-blue-600 text-white shadow hover:bg-blue-700 h-9 px-4 py-2"
              >
                {copying ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Copying...</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-1" />
                    Copy Wallets
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Wallets;
