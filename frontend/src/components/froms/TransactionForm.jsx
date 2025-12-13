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
  // Helper function to format date for datetime-local input
  const formatDateForInput = (dateString) => {
    const date = new Date(dateString);

    // Get local date components
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    // Get local time components
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // Helper function to get current date in correct format
  const getCurrentDateTime = () => {
    return formatDateForInput(new Date().toISOString());
  };

  const [formData, setFormData] = useState({
    type: "income",
    amount: "",
    from_wallet_id: "",
    to_wallet_id: "",
    category_id: "",
    date: getCurrentDateTime(),
    notes: "",
  });

  const [errors, setErrors] = useState({
    amount: "",
    from_wallet_id: "",
    to_wallet_id: "",
    category_id: "",
    date: "",
  });

  // Reset form when opening/closing
  useEffect(() => {
    if (isOpen) {
      if (isEdit && editData) {
        setFormData({
          type: editData.type || "income",
          amount: editData.amount || "",
          from_wallet_id:
            editData.from_wallet_id?._id || editData.from_wallet_id || "",
          to_wallet_id:
            editData.to_wallet_id?._id || editData.to_wallet_id || "",
          category_id: editData.category_id?._id || editData.category_id || "",
          date: editData.date
            ? formatDateForInput(editData.date)
            : getCurrentDateTime(),
          notes: editData.notes || "",
        });
      } else {
        // Reset form for new transaction
        setFormData({
          type: "income",
          amount: "",
          from_wallet_id: "",
          to_wallet_id: "",
          category_id: "",
          date: getCurrentDateTime(),
          notes: "",
        });
      }
      // Clear errors when opening form
      setErrors({
        amount: "",
        from_wallet_id: "",
        to_wallet_id: "",
        category_id: "",
        date: "",
      });
    }
  }, [isOpen, isEdit, editData]);

  const filteredCategories = categories.filter(
    (category) => category.type === formData.type
  );

  const validateForm = () => {
    const newErrors = {
      amount: "",
      from_wallet_id: "",
      to_wallet_id: "",
      category_id: "",
      date: "",
    };
    let isValid = true;

    if (!formData.amount) {
      newErrors.amount = "Please enter an amount";
      isValid = false;
    } else if (
      parseFloat(formData.amount) <= 0 ||
      isNaN(parseFloat(formData.amount))
    ) {
      newErrors.amount = "Please enter a valid amount";
      isValid = false;
    }

    if (!formData.from_wallet_id) {
      newErrors.from_wallet_id = "Please select a wallet";
      isValid = false;
    }

    if (!formData.date) {
      newErrors.date = "Please select a date and time";
      isValid = false;
    }

    if (formData.type !== "transfer") {
      if (!formData.category_id) {
        newErrors.category_id = "Please select a category";
        isValid = false;
      }
    } else {
      if (!formData.to_wallet_id) {
        newErrors.to_wallet_id = "Please select a to wallet";
        isValid = false;
      } else if (formData.from_wallet_id === formData.to_wallet_id) {
        newErrors.to_wallet_id = "From wallet and To wallet cannot be the same";
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
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
      submitData.to_wallet_id = formData.to_wallet_id;
    } else if (formData.type === "income") {
      submitData.to_wallet_id = formData.from_wallet_id;
    }

    onSubmit(submitData);

    // Reset form after successful submission
    setFormData({
      type: "income",
      amount: "",
      from_wallet_id: "",
      to_wallet_id: "",
      category_id: "",
      date: getCurrentDateTime(),
      notes: "",
    });
  };

  const handleInputChange = (field, value) => {
    if (field === "type") {
      setFormData((prev) => ({
        ...prev,
        type: value,
        category_id: value === "transfer" ? "" : prev.category_id,
        to_wallet_id: value !== "transfer" ? "" : prev.to_wallet_id,
      }));
      // Clear relevant errors when type changes
      setErrors((prev) => ({
        ...prev,
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
      // Clear from_wallet error and potentially to_wallet error
      if (errors.from_wallet_id) {
        setErrors((prev) => ({
          ...prev,
          from_wallet_id: "",
        }));
      }
      if (
        formData.type === "transfer" &&
        errors.to_wallet_id &&
        value === formData.to_wallet_id
      ) {
        setErrors((prev) => ({
          ...prev,
          to_wallet_id: "From wallet and To wallet cannot be the same",
        }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
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
      date: getCurrentDateTime(),
      notes: "",
    });
    setErrors({
      amount: "",
      from_wallet_id: "",
      to_wallet_id: "",
      category_id: "",
      date: "",
    });
    onClose();
  };

  if (!isOpen) return null;

  if (wallets.length === 0) {
    return (
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
        <div className="relative w-full max-w-md bg-white rounded-lg shadow-lg p-4 sm:p-6 animate-in fade-in-0 zoom-in-95">
          <div className="text-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <X className="w-6 h-6 sm:w-8 sm:h-8 text-red-600" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-1 sm:mb-2">
              No Wallets Found
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mb-3 sm:mb-4">
              You need to create wallets for {selectedMonth}/{selectedYear}{" "}
              before adding transactions.
            </p>
            <button
              onClick={onClose}
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-xs sm:text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-400 disabled:pointer-events-none disabled:opacity-50 border border-input bg-red-600 text-white shadow hover:bg-red-700 h-9 sm:h-11 px-3 sm:px-4 py-2 w-full"
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
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-2 sm:p-4">
      <div
        className="relative w-full max-w-md sm:max-w-lg bg-white rounded-lg sm:rounded-xl shadow-lg p-3 sm:p-6 animate-in fade-in-0 zoom-in-95 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute right-2 top-2 sm:right-4 sm:top-4 rounded-full p-1 sm:p-1.5 bg-slate-100 hover:bg-slate-200 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-300"
          aria-label="Close"
        >
          <X className="h-3.5 w-3.5 sm:h-5 sm:w-5 text-slate-600" />
        </button>

        {/* Header */}
        <div className="flex flex-col space-y-1.5 sm:space-y-1.5 text-center sm:text-left mb-3 sm:mb-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <div
              className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center ${
                formData.type === "income"
                  ? "bg-green-100"
                  : formData.type === "expense"
                  ? "bg-red-100"
                  : "bg-blue-100"
              }`}
            >
              {formData.type === "income" && (
                <ArrowDownLeft className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
              )}
              {formData.type === "expense" && (
                <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
              )}
              {formData.type === "transfer" && (
                <ArrowRightLeft className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              )}
            </div>
            <div>
              <h2 className="text-sm sm:text-xl font-semibold leading-none tracking-tight text-slate-900">
                {isEdit ? "Edit Transaction" : "Add Transaction"}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {isEdit
                  ? "Update transaction details"
                  : "Record a new financial transaction"}
              </p>
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-3 sm:space-y-6"
          noValidate
        >
          {/* Type Selection */}
          <div className="space-y-2">
            <label className="text-xs sm:text-sm font-medium leading-none text-slate-700 block">
              Transaction Type
              <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="h-10 sm:h-10 items-center justify-center rounded-lg sm:rounded-xl bg-slate-100 p-0.5 sm:p-1 text-slate-600 grid w-full grid-cols-3 gap-0.5 sm:gap-1">
              <button
                type="button"
                onClick={() => handleInputChange("type", "income")}
                className={`inline-flex items-center justify-center gap-1 sm:gap-2 whitespace-nowrap rounded-md sm:rounded-lg px-1 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium transition-all focus:outline-none focus:ring-1 sm:focus:ring-2 focus:ring-green-500 ${
                  formData.type === "income"
                    ? "bg-white text-green-600 shadow-sm font-semibold"
                    : "text-slate-600 hover:text-green-600"
                }`}
              >
                <ArrowDownLeft className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>Income</span>
              </button>
              <button
                type="button"
                onClick={() => handleInputChange("type", "expense")}
                className={`inline-flex items-center justify-center gap-1 sm:gap-2 whitespace-nowrap rounded-md sm:rounded-lg px-1 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium transition-all focus:outline-none focus:ring-1 sm:focus:ring-2 focus:ring-red-500 ${
                  formData.type === "expense"
                    ? "bg-white text-red-600 shadow-sm font-semibold"
                    : "text-slate-600 hover:text-red-600"
                }`}
              >
                <ArrowUpRight className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>Expense</span>
              </button>
              <button
                type="button"
                onClick={() => handleInputChange("type", "transfer")}
                className={`inline-flex items-center justify-center gap-1 sm:gap-2 whitespace-nowrap rounded-md sm:rounded-lg px-1 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium transition-all focus:outline-none focus:ring-1 sm:focus:ring-2 focus:ring-blue-500 ${
                  formData.type === "transfer"
                    ? "bg-white text-blue-600 shadow-sm font-semibold"
                    : "text-slate-600 hover:text-blue-600"
                }`}
              >
                <ArrowRightLeft className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>Transfer</span>
              </button>
            </div>
          </div>

          {/* Amount */}
          <div className="space-y-1.5">
            <label
              htmlFor="amount"
              className="text-xs sm:text-sm font-medium leading-none text-slate-700 block"
            >
              Amount (৳)
              <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-2.5 sm:left-3 top-1/2 transform -translate-y-1/2 text-slate-500 text-xs sm:text-sm font-medium">
                ৳
              </span>
              <input
                type="number"
                id="amount"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => handleInputChange("amount", e.target.value)}
                className={`flex h-8 sm:h-11 w-full rounded-md sm:rounded-lg border ${
                  errors.amount ? "border-red-500" : "border-slate-300"
                } bg-white pl-7 sm:pl-9 pr-2.5 sm:pr-3 py-1.5 sm:py-2 text-xs sm:text-base shadow-sm transition-colors placeholder:text-slate-400 focus:outline-none focus:ring-1 sm:focus:ring-2 focus:ring-green-500 focus:border-green-500`}
              />
            </div>
            {errors.amount && (
              <p className="text-xs text-red-500 mt-0.5">{errors.amount}</p>
            )}
          </div>

          {/* From Wallet */}
          <div className="space-y-1.5">
            <label
              htmlFor="from_wallet_id"
              className="text-xs sm:text-sm font-medium leading-none text-slate-700 block"
            >
              {formData.type === "income" ? "Receiving Wallet" : "From Wallet"}
              <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="relative">
              <Wallet className="absolute left-2.5 sm:left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-slate-500" />
              <select
                id="from_wallet_id"
                value={formData.from_wallet_id}
                onChange={(e) =>
                  handleInputChange("from_wallet_id", e.target.value)
                }
                className={`flex h-8 sm:h-11 w-full rounded-md sm:rounded-lg border ${
                  errors.from_wallet_id ? "border-red-500" : "border-slate-300"
                } bg-white pl-8 sm:pl-10 pr-7 sm:pr-10 py-1.5 sm:py-2 text-xs sm:text-base shadow-sm transition-colors focus:outline-none focus:ring-1 sm:focus:ring-2 focus:ring-green-500 focus:border-green-500 appearance-none`}
              >
                <option value="">Select wallet</option>
                {wallets.map((wallet) => (
                  <option key={wallet._id} value={wallet._id}>
                    {wallet.name} (৳
                    {wallet.monthlyBalance?.toLocaleString() || "0"})
                  </option>
                ))}
              </select>
              <div className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="12"
                  height="12"
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
            {errors.from_wallet_id && (
              <p className="text-xs text-red-500 mt-0.5">
                {errors.from_wallet_id}
              </p>
            )}
          </div>

          {/* To Wallet or Category */}
          {formData.type === "transfer" ? (
            <div className="space-y-1.5">
              <label
                htmlFor="to_wallet_id"
                className="text-xs sm:text-sm font-medium leading-none text-slate-700 block"
              >
                To Wallet
                <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="relative">
                <Wallet className="absolute left-2.5 sm:left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-slate-500" />
                <select
                  id="to_wallet_id"
                  value={formData.to_wallet_id}
                  onChange={(e) =>
                    handleInputChange("to_wallet_id", e.target.value)
                  }
                  className={`flex h-8 sm:h-11 w-full rounded-md sm:rounded-lg border ${
                    errors.to_wallet_id ? "border-red-500" : "border-slate-300"
                  } bg-white pl-8 sm:pl-10 pr-7 sm:pr-10 py-1.5 sm:py-2 text-xs sm:text-base shadow-sm transition-colors focus:outline-none focus:ring-1 sm:focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none`}
                >
                  <option value="">Select to wallet</option>
                  {wallets
                    .filter((wallet) => wallet._id !== formData.from_wallet_id)
                    .map((wallet) => (
                      <option key={wallet._id} value={wallet._id}>
                        {wallet.name} (৳
                        {wallet.monthlyBalance?.toLocaleString() || "0"})
                      </option>
                    ))}
                </select>
                <div className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="12"
                    height="12"
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
              {errors.to_wallet_id && (
                <p className="text-xs text-red-500 mt-0.5">
                  {errors.to_wallet_id}
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-1.5">
              <label
                htmlFor="category_id"
                className="text-xs sm:text-sm font-medium leading-none text-slate-700 block"
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
                  className={`flex h-8 sm:h-11 w-full rounded-md sm:rounded-lg border ${
                    errors.category_id ? "border-red-500" : "border-slate-300"
                  } bg-white px-2.5 sm:px-3 pr-7 sm:pr-10 py-1.5 sm:py-2 text-xs sm:text-base shadow-sm transition-colors focus:outline-none focus:ring-1 sm:focus:ring-2 focus:ring-green-500 focus:border-green-500 appearance-none`}
                >
                  <option value="">Select category</option>
                  {filteredCategories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <div className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="12"
                    height="12"
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
              {errors.category_id && (
                <p className="text-xs text-red-500 mt-0.5">
                  {errors.category_id}
                </p>
              )}
            </div>
          )}

          {/* Date & Time */}
          <div className="space-y-1.5">
            <label
              htmlFor="date"
              className="text-xs sm:text-sm font-medium leading-none text-slate-700 block"
            >
              Date & Time
              <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="relative">
              <Calendar className="absolute left-2.5 sm:left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-slate-500" />
              <input
                type="datetime-local"
                id="date"
                value={formData.date}
                onChange={(e) => handleInputChange("date", e.target.value)}
                className={`flex h-8 sm:h-11 w-full rounded-md sm:rounded-lg border ${
                  errors.date ? "border-red-500" : "border-slate-300"
                } bg-white pl-8 sm:pl-10 pr-2.5 sm:pr-3 py-1.5 sm:py-2 text-xs sm:text-base shadow-sm transition-colors focus:outline-none focus:ring-1 sm:focus:ring-2 focus:ring-green-500 focus:border-green-500`}
              />
            </div>
            {errors.date && (
              <p className="text-xs text-red-500 mt-0.5">{errors.date}</p>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label
              htmlFor="notes"
              className="text-xs sm:text-sm font-medium leading-none text-slate-700 block"
            >
              Notes (Optional)
            </label>
            <div className="relative">
              <FileText className="absolute left-2.5 sm:left-3 top-2 sm:top-3 w-3 h-3 sm:w-4 sm:h-4 text-slate-500" />
              <textarea
                id="notes"
                placeholder="Add description about this transaction..."
                rows="2"
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                className="flex min-h-[70px] sm:min-h-[100px] w-full rounded-md sm:rounded-lg border border-slate-300 bg-white pl-8 sm:pl-10 pr-2.5 sm:pr-3 py-2 sm:py-3 text-xs sm:text-base shadow-sm transition-colors placeholder:text-slate-400 focus:outline-none focus:ring-1 sm:focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
              />
            </div>
            <p className="text-xs text-slate-500">
              Add details like purpose, location, or any relevant information
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-row justify-end gap-2 sm:gap-3 pt-3 sm:pt-6 border-t border-slate-200">
            <button
              type="button"
              onClick={handleClose}
              className="inline-flex items-center justify-center gap-1.5 sm:gap-2 whitespace-nowrap rounded-md sm:rounded-lg text-xs sm:text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 sm:focus-visible:ring-2 focus-visible:ring-slate-400 disabled:pointer-events-none disabled:opacity-50 border border-slate-300 bg-white text-slate-700 shadow-sm hover:bg-slate-50 active:bg-slate-100 h-8 sm:h-10 px-3 sm:px-4 py-1.5 sm:py-2 w-full sm:w-auto"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`inline-flex items-center justify-center gap-1.5 sm:gap-2 whitespace-nowrap rounded-md sm:rounded-lg text-xs sm:text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 sm:focus-visible:ring-2 focus-visible:ring-${typeColor}-600 disabled:pointer-events-none disabled:opacity-50 bg-${typeColor}-600 text-white shadow hover:bg-${typeColor}-700 active:bg-${typeColor}-800 h-8 sm:h-10 px-3 sm:px-4 py-1.5 sm:py-2 w-full sm:w-auto`}
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
