import { useState, useEffect } from "react";
import {
  X,
  Wallet,
  Building,
  CreditCard,
  Smartphone,
  Landmark,
  PiggyBank,
  Coins,
  Banknote,
  Tag,
} from "lucide-react";
import { toast } from "react-toastify";

const WalletForm = ({
  isOpen,
  onClose,
  onSubmit,
  editData,
  isEdit = false,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    type: "cash",
    icon: "wallet",
    color: "#3b82f6",
    balance: 0,
    description: "",
  });

  const [error, setError] = useState("");

  const walletTypes = [
    { value: "cash", label: "Cash", icon: <Wallet className="w-4 h-4" /> },
    {
      value: "bank",
      label: "Bank Account",
      icon: <Building className="w-4 h-4" />,
    },
    {
      value: "bkash",
      label: "bKash",
      icon: <Smartphone className="w-4 h-4" />,
    },
    {
      value: "nagad",
      label: "Nagad",
      icon: <Smartphone className="w-4 h-4" />,
    },
    {
      value: "rocket",
      label: "Rocket",
      icon: <Smartphone className="w-4 h-4" />,
    },
    {
      value: "credit_card",
      label: "Credit Card",
      icon: <CreditCard className="w-4 h-4" />,
    },
    { value: "other", label: "Other", icon: <Tag className="w-4 h-4" /> },
  ];

  const icons = [
    { name: "wallet", component: <Wallet className="w-5 h-5 sm:w-6 sm:h-6" /> },
    {
      name: "banknote",
      component: <Banknote className="w-5 h-5 sm:w-6 sm:h-6" />,
    },
    {
      name: "building2",
      component: <Building className="w-5 h-5 sm:w-6 sm:h-6" />,
    },
    {
      name: "smartphone",
      component: <Smartphone className="w-5 h-5 sm:w-6 sm:h-6" />,
    },
    {
      name: "credit-card",
      component: <CreditCard className="w-5 h-5 sm:w-6 sm:h-6" />,
    },
    {
      name: "landmark",
      component: <Landmark className="w-5 h-5 sm:w-6 sm:h-6" />,
    },
    {
      name: "piggy-bank",
      component: <PiggyBank className="w-5 h-5 sm:w-6 sm:h-6" />,
    },
    { name: "coins", component: <Coins className="w-5 h-5 sm:w-6 sm:h-6" /> },
  ];

  const colors = [
    "#3b82f6", // blue-500
    "#10b981", // emerald-500
    "#f59e0b", // amber-500
    "#ef4444", // red-500
    "#8b5cf6", // violet-500
    "#ec4899", // pink-500
    "#14b8a6", // teal-500
    "#f97316", // orange-500
    "#6366f1", // indigo-500
    "#84cc16", // lime-500
    "#06b6d4", // cyan-500
    "#d946ef", // fuchsia-500
    "#f43f5e", // rose-500
  ];

  useEffect(() => {
    if (isEdit && editData) {
      setFormData({
        name: editData.name || "",
        type: editData.type || "cash",
        icon: editData.icon || "wallet",
        color: editData.color || "#3b82f6",
        balance: editData.balance || editData.openingBalance || 0,
        description: editData.description || "",
      });
    } else {
      setFormData({
        name: "",
        type: "cash",
        icon: "wallet",
        color: "#3b82f6",
        balance: 0,
        description: "",
      });
    }
    // Clear error when opening form
    setError("");
  }, [isEdit, editData]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError("Please enter a wallet name");
      return;
    }

    // Clear error if validation passes
    setError("");

    const submitData = {
      ...formData,
      balance: parseFloat(formData.balance) || 0,
    };

    onSubmit(submitData);
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (error && field === "name") {
      setError("");
    }
  };

  const handleClose = () => {
    setFormData({
      name: "",
      type: "cash",
      icon: "wallet",
      color: "#3b82f6",
      balance: 0,
      description: "",
    });
    setError("");
    onClose();
  };

  if (!isOpen) return null;

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
          <h2 className="text-lg sm:text-xl font-semibold leading-none tracking-tight text-slate-900">
            {isEdit ? "Edit Wallet" : "Create New Wallet"}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            {isEdit
              ? "Update your wallet details"
              : "Add a new wallet to track your finances"}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 sm:space-y-6"
          noValidate
        >
          {/* Wallet Name */}
          <div className="space-y-2">
            <label
              htmlFor="name"
              className="text-sm font-medium leading-none text-slate-700 block"
            >
              Wallet Name
              <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="text"
              id="name"
              placeholder="e.g. Main Cash, Salary Account, Personal bKash"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className={`flex h-10 sm:h-11 w-full rounded-lg border ${
                error ? "border-red-500" : "border-slate-300"
              } bg-white px-3 py-2 text-sm sm:text-base shadow-sm transition-colors placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
              autoFocus
            />
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
          </div>

          {/* Wallet Type */}
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none text-slate-700 block">
              Wallet Type
            </label>
            <div className="relative">
              <select
                value={formData.type}
                onChange={(e) => handleInputChange("type", e.target.value)}
                className="flex h-10 sm:h-11 w-full rounded-lg border border-slate-300 bg-white px-3 pr-10 py-2 text-sm sm:text-base shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
              >
                {walletTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
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

          {/* Initial Balance */}
          <div className="space-y-2">
            <label
              htmlFor="balance"
              className="text-sm font-medium leading-none text-slate-700 block"
            >
              Initial Balance (৳)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 font-medium">
                ৳
              </span>
              <input
                type="number"
                id="balance"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={formData.balance}
                onChange={(e) => handleInputChange("balance", e.target.value)}
                className="flex h-10 sm:h-11 w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 py-2 text-sm sm:text-base shadow-sm transition-colors placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <p className="text-xs text-slate-500">
              Starting balance for this wallet
            </p>
          </div>

          {/* Icon Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium leading-none text-slate-700 block">
              Icon
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 sm:gap-3">
              {icons.map((icon) => (
                <button
                  key={icon.name}
                  type="button"
                  onClick={() => handleInputChange("icon", icon.name)}
                  className={`flex items-center justify-center p-2.5 sm:p-3 rounded-lg border-2 transition-all hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    formData.icon === icon.name
                      ? "border-blue-500 bg-blue-50 scale-105"
                      : "border-slate-200 bg-white"
                  }`}
                  title={icon.name.replace("-", " ")}
                  aria-label={`Select ${icon.name} icon`}
                >
                  <span
                    className={
                      formData.icon === icon.name
                        ? "text-blue-600"
                        : "text-slate-700"
                    }
                  >
                    {icon.component}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Color Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium leading-none text-slate-700 block">
              Color
            </label>
            <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 sm:gap-3">
              {colors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => handleInputChange("color", color)}
                  className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-slate-400 ${
                    formData.color === color
                      ? "ring-2 ring-offset-2 ring-blue-500 scale-110 shadow-md"
                      : ""
                  }`}
                  style={{ backgroundColor: color }}
                  title={`Color ${color}`}
                  aria-label={`Select ${color} color`}
                >
                  {formData.color === color && (
                    <div className="flex items-center justify-center h-full">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="white"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="w-3 h-3 sm:w-4 sm:h-4"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label
              htmlFor="description"
              className="text-sm font-medium leading-none text-slate-700 block"
            >
              Description (Optional)
            </label>
            <textarea
              id="description"
              placeholder="Add notes about this wallet (e.g., account number, bank name, purpose)"
              rows="3"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              className="flex min-h-[100px] w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm sm:text-base shadow-sm transition-colors placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            />
            <p className="text-xs text-slate-500">
              Additional information to help you identify this wallet
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
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 disabled:pointer-events-none disabled:opacity-50 bg-blue-600 text-white shadow hover:bg-blue-700 h-11 sm:h-10 px-4 py-3 sm:py-2 w-full sm:w-auto"
            >
              {isEdit ? "Update Wallet" : "Create Wallet"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WalletForm;
