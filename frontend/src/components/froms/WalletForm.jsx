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
  ChevronLeft,
  ChevronRight,
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
    { name: "wallet", component: <Wallet className="w-4 h-4" /> },
    { name: "banknote", component: <Banknote className="w-4 h-4" /> },
    { name: "building2", component: <Building className="w-4 h-4" /> },
    { name: "smartphone", component: <Smartphone className="w-4 h-4" /> },
    { name: "credit-card", component: <CreditCard className="w-4 h-4" /> },
    { name: "landmark", component: <Landmark className="w-4 h-4" /> },
    { name: "piggy-bank", component: <PiggyBank className="w-4 h-4" /> },
    { name: "coins", component: <Coins className="w-4 h-4" /> },
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

  const [iconStartIndex, setIconStartIndex] = useState(0);
  const [colorStartIndex, setColorStartIndex] = useState(0);

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

  const nextIcons = () => {
    if (iconStartIndex + 4 < icons.length) {
      setIconStartIndex(iconStartIndex + 4);
    }
  };

  const prevIcons = () => {
    if (iconStartIndex > 0) {
      setIconStartIndex(iconStartIndex - 4);
    }
  };

  const nextColors = () => {
    if (colorStartIndex + 6 < colors.length) {
      setColorStartIndex(colorStartIndex + 6);
    }
  };

  const prevColors = () => {
    if (colorStartIndex > 0) {
      setColorStartIndex(colorStartIndex - 6);
    }
  };

  if (!isOpen) return null;

  const visibleIcons = icons.slice(iconStartIndex, iconStartIndex + 4);
  const visibleColors = colors.slice(colorStartIndex, colorStartIndex + 6);

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-2 sm:p-4">
      <div
        className="relative w-full max-w-sm sm:max-w-md bg-white rounded-lg sm:rounded-xl shadow-lg p-3 sm:p-4 animate-in fade-in-0 zoom-in-95 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute right-2 top-2 sm:right-3 sm:top-3 rounded-full p-1 bg-slate-100 hover:bg-slate-200 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-300"
          aria-label="Close"
        >
          <X className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-600" />
        </button>

        {/* Header */}
        <div className="mb-3 sm:mb-4">
          <h2 className="text-sm sm:text-lg font-semibold text-slate-900">
            {isEdit ? "Edit Wallet" : "New Wallet"}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {isEdit ? "Update wallet details" : "Add a new wallet"}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-3 sm:space-y-4"
          noValidate
        >
          {/* Wallet Name */}
          <div className="space-y-1">
            <label
              htmlFor="name"
              className="text-xs sm:text-sm font-medium text-slate-700"
            >
              Wallet Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              placeholder="e.g. Main Cash, bKash"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className={`w-full rounded border px-3 py-2 text-xs sm:text-sm ${
                error ? "border-red-500" : "border-slate-300"
              } focus:outline-none focus:ring-1 focus:ring-blue-500`}
              autoFocus
            />
            {error && <p className="text-xs text-red-500">{error}</p>}
          </div>

          {/* Wallet Type */}
          <div className="space-y-1">
            <label className="text-xs sm:text-sm font-medium text-slate-700">
              Wallet Type
            </label>
            <select
              value={formData.type}
              onChange={(e) => handleInputChange("type", e.target.value)}
              className="w-full rounded border border-slate-300 px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {walletTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Initial Balance */}
          <div className="space-y-1">
            <label
              htmlFor="balance"
              className="text-xs sm:text-sm font-medium text-slate-700"
            >
              Initial Balance (৳)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 text-xs">
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
                className="w-full rounded border border-slate-300 pl-7 pr-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Icon Selection */}
          <div className="space-y-1">
            <label className="text-xs sm:text-sm font-medium text-slate-700">
              Icon
            </label>

            {/* Mobile - Single row with arrows */}
            <div className="sm:hidden flex items-center space-x-1">
              <button
                type="button"
                onClick={prevIcons}
                disabled={iconStartIndex === 0}
                className="h-9 w-6 flex items-center justify-center rounded border border-slate-300 bg-white disabled:opacity-30"
              >
                <ChevronLeft className="w-3 h-3 text-slate-600" />
              </button>

              <div className="flex-1 grid grid-cols-4 gap-1">
                {visibleIcons.map((icon) => (
                  <button
                    key={icon.name}
                    type="button"
                    onClick={() => handleInputChange("icon", icon.name)}
                    className={`h-9 w-9 flex items-center justify-center border rounded ${
                      formData.icon === icon.name
                        ? "border-blue-500 bg-blue-50"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
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

              <button
                type="button"
                onClick={nextIcons}
                disabled={iconStartIndex + 4 >= icons.length}
                className="h-9 w-6 flex items-center justify-center rounded border border-slate-300 bg-white disabled:opacity-30"
              >
                <ChevronRight className="w-3 h-3 text-slate-600" />
              </button>
            </div>

            {/* Desktop - 6 icons per row */}
            <div className="hidden sm:grid sm:grid-cols-6 gap-2">
              {icons.map((icon) => (
                <button
                  key={icon.name}
                  type="button"
                  onClick={() => handleInputChange("icon", icon.name)}
                  className={`h-9 w-9 flex items-center justify-center border rounded ${
                    formData.icon === icon.name
                      ? "border-blue-500 bg-blue-50"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
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
          <div className="space-y-1">
            <label className="text-xs sm:text-sm font-medium text-slate-700">
              Color
            </label>

            {/* Mobile - Single row with arrows */}
            <div className="sm:hidden flex items-center space-x-1">
              <button
                type="button"
                onClick={prevColors}
                disabled={colorStartIndex === 0}
                className="h-9 w-6 flex items-center justify-center rounded border border-slate-300 bg-white disabled:opacity-30"
              >
                <ChevronLeft className="w-3 h-3 text-slate-600" />
              </button>

              <div className="flex-1 grid grid-cols-6 gap-1">
                {visibleColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => handleInputChange("color", color)}
                    className={`h-9 w-9 rounded ${
                      formData.color === color
                        ? "ring-2 ring-blue-500 ring-offset-1"
                        : ""
                    }`}
                    style={{ backgroundColor: color }}
                  >
                    {formData.color === color && (
                      <div className="flex items-center justify-center h-full">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="white"
                          strokeWidth="3"
                          className="w-3 h-3"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={nextColors}
                disabled={colorStartIndex + 6 >= colors.length}
                className="h-9 w-6 flex items-center justify-center rounded border border-slate-300 bg-white disabled:opacity-30"
              >
                <ChevronRight className="w-3 h-3 text-slate-600" />
              </button>
            </div>

            {/* Desktop - 6 colors per row */}
            <div className="hidden sm:block">
              <div className="grid grid-cols-6 gap-2">
                {colors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => handleInputChange("color", color)}
                    className={`h-9 w-9 rounded ${
                      formData.color === color
                        ? "ring-2 ring-blue-500 ring-offset-1"
                        : ""
                    }`}
                    style={{ backgroundColor: color }}
                  >
                    {formData.color === color && (
                      <div className="flex items-center justify-center h-full">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="white"
                          strokeWidth="3"
                          className="w-3 h-3"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label
              htmlFor="description"
              className="text-xs sm:text-sm font-medium text-slate-700"
            >
              Description (Optional)
            </label>
            <textarea
              id="description"
              placeholder="Account number, bank name, purpose..."
              rows="2"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              className="w-full rounded border border-slate-300 px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 py-2 text-xs sm:text-sm font-medium rounded border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2 text-xs sm:text-sm font-medium rounded bg-green-600 text-white hover:bg-green-700"
            >
              {isEdit ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WalletForm;
