import { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "react-toastify";
import * as LucideIcons from "lucide-react";

const SavingsForm = ({
  isOpen,
  onClose,
  onSubmit,
  editData,
  isEdit = false,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    targetAmount: "",
    monthlyTarget: "",
    description: "",
    icon: "piggy-bank",
    color: "#3b82f6",
  });

  const [errors, setErrors] = useState({
    name: "",
    targetAmount: "",
  });

  // Using Lucide React icons directly
  const icons = [
    {
      name: "piggy-bank",
      component: <LucideIcons.PiggyBank className="w-4 h-4" />,
      desktopComponent: <LucideIcons.PiggyBank className="w-5 h-5" />,
    },
    {
      name: "wallet",
      component: <LucideIcons.Wallet className="w-4 h-4" />,
      desktopComponent: <LucideIcons.Wallet className="w-5 h-5" />,
    },
    {
      name: "dollar-sign",
      component: <LucideIcons.DollarSign className="w-4 h-4" />,
      desktopComponent: <LucideIcons.DollarSign className="w-5 h-5" />,
    },
    {
      name: "trending-up",
      component: <LucideIcons.TrendingUp className="w-4 h-4" />,
      desktopComponent: <LucideIcons.TrendingUp className="w-5 h-5" />,
    },
    {
      name: "house",
      component: <LucideIcons.House className="w-4 h-4" />,
      desktopComponent: <LucideIcons.House className="w-5 h-5" />,
    },
    {
      name: "car",
      component: <LucideIcons.Car className="w-4 h-4" />,
      desktopComponent: <LucideIcons.Car className="w-5 h-5" />,
    },
    {
      name: "plane",
      component: <LucideIcons.Plane className="w-4 h-4" />,
      desktopComponent: <LucideIcons.Plane className="w-5 h-5" />,
    },
    {
      name: "graduation-cap",
      component: <LucideIcons.GraduationCap className="w-4 h-4" />,
      desktopComponent: <LucideIcons.GraduationCap className="w-5 h-5" />,
    },
    {
      name: "gift",
      component: <LucideIcons.Gift className="w-4 h-4" />,
      desktopComponent: <LucideIcons.Gift className="w-5 h-5" />,
    },
    {
      name: "heart",
      component: <LucideIcons.Heart className="w-4 h-4" />,
      desktopComponent: <LucideIcons.Heart className="w-5 h-5" />,
    },
    {
      name: "briefcase",
      component: <LucideIcons.Briefcase className="w-4 h-4" />,
      desktopComponent: <LucideIcons.Briefcase className="w-5 h-5" />,
    },
    {
      name: "smartphone",
      component: <LucideIcons.Smartphone className="w-4 h-4" />,
      desktopComponent: <LucideIcons.Smartphone className="w-5 h-5" />,
    },
    {
      name: "gamepad",
      component: <LucideIcons.Gamepad2 className="w-4 h-4" />,
      desktopComponent: <LucideIcons.Gamepad2 className="w-5 h-5" />,
    },
    {
      name: "shirt",
      component: <LucideIcons.Shirt className="w-4 h-4" />,
      desktopComponent: <LucideIcons.Shirt className="w-5 h-5" />,
    },
    {
      name: "coffee",
      component: <LucideIcons.Coffee className="w-4 h-4" />,
      desktopComponent: <LucideIcons.Coffee className="w-5 h-5" />,
    },
    {
      name: "tag",
      component: <LucideIcons.Tag className="w-4 h-4" />,
      desktopComponent: <LucideIcons.Tag className="w-5 h-5" />,
    },
  ];

  const colors = [
    "#ef4444", // red-500
    "#f97316", // orange-500
    "#f59e0b", // amber-500
    "#84cc16", // lime-500
    "#10b981", // emerald-500
    "#14b8a6", // teal-500
    "#06b6d4", // cyan-500
    "#3b82f6", // blue-500
    "#6366f1", // indigo-500
    "#8b5cf6", // violet-500
    "#d946ef", // fuchsia-500
    "#ec4899", // pink-500
    "#f43f5e", // rose-500
  ];

  const [iconStartIndex, setIconStartIndex] = useState(0);
  const [colorStartIndex, setColorStartIndex] = useState(0);

  // Prefill form when editData changes
  useEffect(() => {
    if (isEdit && editData) {
      setFormData({
        name: editData.name || "",
        targetAmount: editData.targetAmount || "",
        monthlyTarget: editData.monthlyTarget || "",
        description: editData.description || "",
        icon: editData.icon || "piggy-bank",
        color: editData.color || "#3b82f6",
      });
    } else {
      // Reset form for create mode
      setFormData({
        name: "",
        targetAmount: "",
        monthlyTarget: "",
        description: "",
        icon: "piggy-bank",
        color: "#3b82f6",
      });
    }
    // Clear errors when opening form
    setErrors({
      name: "",
      targetAmount: "",
    });
  }, [isEdit, editData]);

  const validateForm = () => {
    const newErrors = {
      name: "",
      targetAmount: "",
    };
    let isValid = true;

    if (!formData.name.trim()) {
      newErrors.name = "Please enter a goal name";
      isValid = false;
    }

    if (!formData.targetAmount) {
      newErrors.targetAmount = "Please enter a target amount";
      isValid = false;
    } else if (
      parseFloat(formData.targetAmount) <= 0 ||
      isNaN(parseFloat(formData.targetAmount))
    ) {
      newErrors.targetAmount = "Please enter a valid target amount";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    onSubmit({
      ...formData,
      targetAmount: parseFloat(formData.targetAmount),
      monthlyTarget: formData.monthlyTarget
        ? parseFloat(formData.monthlyTarget)
        : null,
    });
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

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
      name: "",
      targetAmount: "",
      monthlyTarget: "",
      description: "",
      icon: "piggy-bank",
      color: "#3b82f6",
    });
    setErrors({
      name: "",
      targetAmount: "",
    });
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
            {isEdit ? "Edit Goal" : "New Goal"}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {isEdit ? "Update goal details" : "Set up a new savings goal"}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-3 sm:space-y-4"
          noValidate
        >
          {/* Goal Name */}
          <div className="space-y-1">
            <label
              htmlFor="name"
              className="text-xs sm:text-sm font-medium text-slate-700"
            >
              Goal Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              placeholder="e.g. Emergency Fund, Vacation, New Car"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className={`w-full rounded border px-3 py-2 text-xs sm:text-sm ${
                errors.name ? "border-red-500" : "border-slate-300"
              } focus:outline-none focus:ring-1 focus:ring-blue-500`}
              autoFocus
            />
            {errors.name && (
              <p className="text-xs text-red-500">{errors.name}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Target Amount */}
            <div className="space-y-1">
              <label
                htmlFor="targetAmount"
                className="text-xs sm:text-sm font-medium text-slate-700"
              >
                Target Amount (৳) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 text-xs">
                  ৳
                </span>
                <input
                  type="number"
                  id="targetAmount"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={formData.targetAmount}
                  onChange={(e) =>
                    handleInputChange("targetAmount", e.target.value)
                  }
                  className={`w-full rounded border px-3 py-2 pl-7 text-xs sm:text-sm ${
                    errors.targetAmount ? "border-red-500" : "border-slate-300"
                  } focus:outline-none focus:ring-1 focus:ring-blue-500`}
                />
              </div>
              {errors.targetAmount && (
                <p className="text-xs text-red-500">{errors.targetAmount}</p>
              )}
            </div>

            {/* Monthly Target */}
            <div className="space-y-1">
              <label
                htmlFor="monthlyTarget"
                className="text-xs sm:text-sm font-medium text-slate-700"
              >
                Monthly Target (Optional)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 text-xs">
                  ৳
                </span>
                <input
                  type="number"
                  id="monthlyTarget"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={formData.monthlyTarget}
                  onChange={(e) =>
                    handleInputChange("monthlyTarget", e.target.value)
                  }
                  className="w-full rounded border border-slate-300 px-3 py-2 pl-7 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Time Estimate */}
          {formData.monthlyTarget &&
            parseFloat(formData.monthlyTarget) > 0 &&
            formData.targetAmount &&
            parseFloat(formData.targetAmount) > 0 &&
            !errors.targetAmount && (
              <div className="p-3 bg-blue-50 rounded border border-blue-100">
                <p className="text-xs text-blue-800 font-medium">
                  Time Estimate:
                </p>
                <p className="text-xs text-blue-600 mt-0.5">
                  Approx.{" "}
                  <span className="font-bold">
                    {Math.ceil(
                      parseFloat(formData.targetAmount) /
                        parseFloat(formData.monthlyTarget)
                    )}{" "}
                    months
                  </span>{" "}
                  to reach goal
                </p>
              </div>
            )}

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
              placeholder="What are you saving for? Why is this goal important?"
              rows="2"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              className="w-full rounded border border-slate-300 px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
            />
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

            {/* Desktop - Original grid but smaller */}
            <div className="hidden sm:grid sm:grid-cols-8 gap-2">
              {icons.map((icon) => (
                <button
                  key={icon.name}
                  type="button"
                  onClick={() => handleInputChange("icon", icon.name)}
                  className={`flex items-center justify-center p-2 rounded border-2 transition-all hover:border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                    formData.icon === icon.name
                      ? "border-blue-500 bg-blue-50"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <span
                    className={
                      formData.icon === icon.name
                        ? "text-blue-600"
                        : "text-slate-700"
                    }
                  >
                    {icon.desktopComponent}
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

            {/* Desktop - Original grid but smaller */}
            <div className="hidden sm:grid sm:grid-cols-8 gap-2">
              {colors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => handleInputChange("color", color)}
                  className={`h-7 w-7 sm:h-8 sm:w-8 rounded transition-all hover:scale-105 focus:outline-none focus:ring-1 focus:ring-slate-400 ${
                    formData.color === color
                      ? "ring-2 ring-offset-1 ring-blue-500 scale-110 shadow"
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
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
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

export default SavingsForm;
