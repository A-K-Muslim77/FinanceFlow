import { useState, useEffect } from "react";
import {
  X,
  Wallet,
  Calendar,
  FileText,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowRightLeft,
} from "lucide-react";
import { toast } from "react-toastify";

const TransactionForm = ({
  isOpen,
  onClose,
  onSubmit,
  editData,
  isEdit = false,
  wallets = [],
  categories = [],
  selectedMonth,
  selectedYear,
}) => {
  const [formData, setFormData] = useState({
    type: "income",
    amount: "",
    from_wallet_id: "",
    to_wallet_id: "",
    category_id: "",
    date: new Date().toISOString().slice(0, 16),
    notes: "",
  });

  useEffect(() => {
    if (isEdit && editData) {
      setFormData({
        type: editData.type || "income",
        amount: editData.amount || "",
        from_wallet_id:
          editData.from_wallet_id?._id || editData.from_wallet_id || "",
        to_wallet_id: editData.to_wallet_id?._id || editData.to_wallet_id || "",
        category_id: editData.category_id?._id || editData.category_id || "",
        date: editData.date
          ? new Date(editData.date).toISOString().slice(0, 16)
          : new Date().toISOString().slice(0, 16),
        notes: editData.notes || "",
      });
    } else {
      setFormData({
        type: "income",
        amount: "",
        from_wallet_id: "",
        to_wallet_id: "",
        category_id: "",
        date: new Date().toISOString().slice(0, 16),
        notes: "",
      });
    }
  }, [isEdit, editData]);

  const filteredCategories = categories.filter(
    (category) => category.type === formData.type
  );

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (!formData.from_wallet_id) {
      toast.error("Please select a wallet");
      return;
    }

    if (formData.type !== "transfer" && !formData.category_id) {
      toast.error("Please select a category");
      return;
    }

    const submitData = {
      type: formData.type,
      amount: parseFloat(formData.amount),
      from_wallet_id: formData.from_wallet_id,
      date: formData.date,
      notes: formData.notes || "",
    };

    if (formData.type !== "transfer") {
      submitData.category_id = formData.category_id;
    }

    if (formData.type === "transfer") {
      if (!formData.to_wallet_id) {
        toast.error("Please select a to wallet for transfer");
        return;
      }
      if (formData.from_wallet_id === formData.to_wallet_id) {
        toast.error("From wallet and To wallet cannot be the same");
        return;
      }
      submitData.to_wallet_id = formData.to_wallet_id;
    } else if (formData.type === "income") {
      submitData.to_wallet_id = formData.from_wallet_id;
    }

    onSubmit(submitData);
  };

  const handleInputChange = (field, value) => {
    if (field === "type") {
      setFormData((prev) => ({
        ...prev,
        type: value,
        category_id: value === "transfer" ? "" : prev.category_id,
        to_wallet_id: value !== "transfer" ? "" : prev.to_wallet_id,
      }));
    } else if (field === "from_wallet_id") {
      setFormData((prev) => ({
        ...prev,
        from_wallet_id: value,
        to_wallet_id:
          prev.type === "transfer" && value === prev.to_wallet_id
            ? ""
            : prev.to_wallet_id,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleClose = () => {
    setFormData({
      type: "income",
      amount: "",
      from_wallet_id: "",
      to_wallet_id: "",
      category_id: "",
      date: new Date().toISOString().slice(0, 16),
      notes: "",
    });
    onClose();
  };

  if (!isOpen) return null;

  if (wallets.length === 0) {
    return (
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
        <div className="relative w-full max-w-md bg-white rounded-lg shadow-lg p-6 animate-in fade-in-0 zoom-in-95">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              No Wallets Found
            </h3>
            <p className="text-slate-600 mb-4">
              You need to create wallets for {selectedMonth}/{selectedYear}{" "}
              before adding transactions.
            </p>
            <button
              onClick={onClose}
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-400 disabled:pointer-events-none disabled:opacity-50 border border-input bg-red-600 text-white shadow hover:bg-red-700 h-11 px-4 py-2 w-full"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  const getTypeColor = (type) => {
    switch (type) {
      case "income":
        return "green";
      case "expense":
        return "red";
      case "transfer":
        return "blue";
      default:
        return "green";
    }
  };

  const typeColor = getTypeColor(formData.type);

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-3 sm:p-4">
      <div
        className="relative w-full max-w-md sm:max-w-lg bg-white rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6 animate-in fade-in-0 zoom-in-95 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute right-3 top-3 sm:right-4 sm:top-4 rounded-full p-1.5 sm:p-1 bg-slate-100 hover:bg-slate-200 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-300"
          aria-label="Close"
        >
          <X className="h-4 w-4 sm:h-5 sm:w-5 text-slate-600" />
        </button>

        {/* Header */}
        <div className="flex flex-col space-y-2 sm:space-y-1.5 text-center sm:text-left mb-4 sm:mb-6">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                formData.type === "income"
                  ? "bg-green-100"
                  : formData.type === "expense"
                  ? "bg-red-100"
                  : "bg-blue-100"
              }`}
            >
              {formData.type === "income" && (
                <ArrowDownLeft className="w-5 h-5 text-green-600" />
              )}
              {formData.type === "expense" && (
                <ArrowUpRight className="w-5 h-5 text-red-600" />
              )}
              {formData.type === "transfer" && (
                <ArrowRightLeft className="w-5 h-5 text-blue-600" />
              )}
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-semibold leading-none tracking-tight text-slate-900">
                {isEdit ? "Edit Transaction" : "Add Transaction"}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                {isEdit
                  ? "Update transaction details"
                  : "Record a new financial transaction"}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* Type Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium leading-none text-slate-700 block">
              Transaction Type
              <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="h-12 sm:h-10 items-center justify-center rounded-xl bg-slate-100 p-1 text-slate-600 grid w-full grid-cols-3 gap-1">
              <button
                type="button"
                onClick={() => handleInputChange("type", "income")}
                className={`inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg px-2 sm:px-3 py-2 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  formData.type === "income"
                    ? "bg-white text-green-600 shadow-sm font-semibold"
                    : "text-slate-600 hover:text-green-600"
                }`}
              >
                <ArrowDownLeft className="w-4 h-4" />
                <span>Income</span>
              </button>
              <button
                type="button"
                onClick={() => handleInputChange("type", "expense")}
                className={`inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg px-2 sm:px-3 py-2 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-red-500 ${
                  formData.type === "expense"
                    ? "bg-white text-red-600 shadow-sm font-semibold"
                    : "text-slate-600 hover:text-red-600"
                }`}
              >
                <ArrowUpRight className="w-4 h-4" />
                <span>Expense</span>
              </button>
              <button
                type="button"
                onClick={() => handleInputChange("type", "transfer")}
                className={`inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg px-2 sm:px-3 py-2 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  formData.type === "transfer"
                    ? "bg-white text-blue-600 shadow-sm font-semibold"
                    : "text-slate-600 hover:text-blue-600"
                }`}
              >
                <ArrowRightLeft className="w-4 h-4" />
                <span>Transfer</span>
              </button>
            </div>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <label
              htmlFor="amount"
              className="text-sm font-medium leading-none text-slate-700 block"
            >
              Amount (৳)
              <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 font-medium">
                ৳
              </span>
              <input
                type="number"
                id="amount"
                step="0.01"
                min="0"
                placeholder="0.00"
                required
                value={formData.amount}
                onChange={(e) => handleInputChange("amount", e.target.value)}
                className="flex h-10 sm:h-11 w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 py-2 text-sm sm:text-base shadow-sm transition-colors placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>

          {/* From Wallet */}
          <div className="space-y-2">
            <label
              htmlFor="from_wallet_id"
              className="text-sm font-medium leading-none text-slate-700 block"
            >
              {formData.type === "income" ? "Receiving Wallet" : "From Wallet"}
              <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="relative">
              <Wallet className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
              <select
                id="from_wallet_id"
                value={formData.from_wallet_id}
                onChange={(e) =>
                  handleInputChange("from_wallet_id", e.target.value)
                }
                className="flex h-10 sm:h-11 w-full rounded-lg border border-slate-300 bg-white pl-10 pr-10 py-2 text-sm sm:text-base shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 appearance-none"
                required
              >
                <option value="">Select wallet</option>
                {wallets.map((wallet) => (
                  <option key={wallet._id} value={wallet._id}>
                    {wallet.name} (Balance: ৳
                    {wallet.monthlyBalance?.toLocaleString() || "0"})
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-slate-500"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </div>
            </div>
          </div>

          {/* To Wallet or Category */}
          {formData.type === "transfer" ? (
            <div className="space-y-2">
              <label
                htmlFor="to_wallet_id"
                className="text-sm font-medium leading-none text-slate-700 block"
              >
                To Wallet
                <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="relative">
                <Wallet className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
                <select
                  id="to_wallet_id"
                  value={formData.to_wallet_id}
                  onChange={(e) =>
                    handleInputChange("to_wallet_id", e.target.value)
                  }
                  className="flex h-10 sm:h-11 w-full rounded-lg border border-slate-300 bg-white pl-10 pr-10 py-2 text-sm sm:text-base shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                  required={formData.type === "transfer"}
                >
                  <option value="">Select to wallet</option>
                  {wallets
                    .filter((wallet) => wallet._id !== formData.from_wallet_id)
                    .map((wallet) => (
                      <option key={wallet._id} value={wallet._id}>
                        {wallet.name} (Balance: ৳
                        {wallet.monthlyBalance?.toLocaleString() || "0"})
                      </option>
                    ))}
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-slate-500"
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <label
                htmlFor="category_id"
                className="text-sm font-medium leading-none text-slate-700 block"
              >
                Category
                <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="relative">
                <select
                  id="category_id"
                  value={formData.category_id}
                  onChange={(e) =>
                    handleInputChange("category_id", e.target.value)
                  }
                  className="flex h-10 sm:h-11 w-full rounded-lg border border-slate-300 bg-white px-3 pr-10 py-2 text-sm sm:text-base shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 appearance-none"
                  required={formData.type !== "transfer"}
                >
                  <option value="">Select category</option>
                  {filteredCategories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-slate-500"
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </div>
              </div>
            </div>
          )}

          {/* Date & Time */}
          <div className="space-y-2">
            <label
              htmlFor="date"
              className="text-sm font-medium leading-none text-slate-700 block"
            >
              Date & Time
              <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="datetime-local"
                id="date"
                required
                value={formData.date}
                onChange={(e) => handleInputChange("date", e.target.value)}
                className="flex h-10 sm:h-11 w-full rounded-lg border border-slate-300 bg-white pl-10 pr-3 py-2 text-sm sm:text-base shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <label
              htmlFor="notes"
              className="text-sm font-medium leading-none text-slate-700 block"
            >
              Notes (Optional)
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
              <textarea
                id="notes"
                placeholder="Add description about this transaction..."
                rows="3"
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                className="flex min-h-[100px] w-full rounded-lg border border-slate-300 bg-white pl-10 pr-3 py-3 text-sm sm:text-base shadow-sm transition-colors placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
              />
            </div>
            <p className="text-xs text-slate-500">
              Add details like purpose, location, or any relevant information
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4 sm:pt-6 border-t border-slate-200">
            <button
              type="button"
              onClick={handleClose}
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 disabled:pointer-events-none disabled:opacity-50 border border-slate-300 bg-white text-slate-700 shadow-sm hover:bg-slate-50 h-11 sm:h-10 px-4 py-3 sm:py-2 w-full sm:w-auto"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-${typeColor}-600 disabled:pointer-events-none disabled:opacity-50 bg-${typeColor}-600 text-white shadow hover:bg-${typeColor}-700 h-11 sm:h-10 px-4 py-3 sm:py-2 w-full sm:w-auto`}
            >
              {isEdit ? "Update Transaction" : "Add Transaction"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionForm;
