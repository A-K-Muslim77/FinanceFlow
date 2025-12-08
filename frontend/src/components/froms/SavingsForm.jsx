import { useState, useEffect } from "react";
import { X } from "lucide-react";
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

  // Using Lucide React icons directly
  const icons = [
    {
      name: "piggy-bank",
      component: <LucideIcons.PiggyBank className="w-5 h-5 sm:w-6 sm:h-6" />,
    },
    {
      name: "wallet",
      component: <LucideIcons.Wallet className="w-5 h-5 sm:w-6 sm:h-6" />,
    },
    {
      name: "dollar-sign",
      component: <LucideIcons.DollarSign className="w-5 h-5 sm:w-6 sm:h-6" />,
    },
    {
      name: "trending-up",
      component: <LucideIcons.TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />,
    },
    {
      name: "house",
      component: <LucideIcons.House className="w-5 h-5 sm:w-6 sm:h-6" />,
    },
    {
      name: "car",
      component: <LucideIcons.Car className="w-5 h-5 sm:w-6 sm:h-6" />,
    },
    {
      name: "plane",
      component: <LucideIcons.Plane className="w-5 h-5 sm:w-6 sm:h-6" />,
    },
    {
      name: "graduation-cap",
      component: (
        <LucideIcons.GraduationCap className="w-5 h-5 sm:w-6 sm:h-6" />
      ),
    },
    {
      name: "gift",
      component: <LucideIcons.Gift className="w-5 h-5 sm:w-6 sm:h-6" />,
    },
    {
      name: "heart",
      component: <LucideIcons.Heart className="w-5 h-5 sm:w-6 sm:h-6" />,
    },
    {
      name: "briefcase",
      component: <LucideIcons.Briefcase className="w-5 h-5 sm:w-6 sm:h-6" />,
    },
    {
      name: "smartphone",
      component: <LucideIcons.Smartphone className="w-5 h-5 sm:w-6 sm:h-6" />,
    },
    {
      name: "gamepad",
      component: <LucideIcons.Gamepad2 className="w-5 h-5 sm:w-6 sm:h-6" />,
    },
    {
      name: "shirt",
      component: <LucideIcons.Shirt className="w-5 h-5 sm:w-6 sm:h-6" />,
    },
    {
      name: "coffee",
      component: <LucideIcons.Coffee className="w-5 h-5 sm:w-6 sm:h-6" />,
    },
    {
      name: "tag",
      component: <LucideIcons.Tag className="w-5 h-5 sm:w-6 sm:h-6" />,
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
  }, [isEdit, editData]);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate form data
    if (!formData.name.trim()) {
      toast.error("Please enter a goal name");
      return;
    }

    if (!formData.targetAmount || parseFloat(formData.targetAmount) <= 0) {
      toast.error("Please enter a valid target amount");
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
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-100">
              <LucideIcons.PiggyBank className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-semibold leading-none tracking-tight text-slate-900">
                {isEdit ? "Edit Savings Goal" : "Create Savings Goal"}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                {isEdit
                  ? "Update your savings goal details"
                  : "Set up a new savings target to track your progress"}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* Goal Name */}
          <div className="space-y-2">
            <label
              htmlFor="name"
              className="text-sm font-medium leading-none text-slate-700 block"
            >
              Goal Name
              <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="text"
              id="name"
              placeholder="e.g. Emergency Fund, Vacation, New Car"
              required
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className="flex h-10 sm:h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm sm:text-base shadow-sm transition-colors placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Target Amount */}
            <div className="space-y-2">
              <label
                htmlFor="targetAmount"
                className="text-sm font-medium leading-none text-slate-700 block"
              >
                Target Amount (৳)
                <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 font-medium">
                  ৳
                </span>
                <input
                  type="number"
                  id="targetAmount"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  required
                  value={formData.targetAmount}
                  onChange={(e) =>
                    handleInputChange("targetAmount", e.target.value)
                  }
                  className="flex h-10 sm:h-11 w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 py-2 text-sm sm:text-base shadow-sm transition-colors placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Monthly Target */}
            <div className="space-y-2">
              <label
                htmlFor="monthlyTarget"
                className="text-sm font-medium leading-none text-slate-700 block"
              >
                Monthly Target (Optional)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 font-medium">
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
                  className="flex h-10 sm:h-11 w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 py-2 text-sm sm:text-base shadow-sm transition-colors placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Time Estimate */}
          {formData.monthlyTarget &&
            parseFloat(formData.monthlyTarget) > 0 &&
            formData.targetAmount &&
            parseFloat(formData.targetAmount) > 0 && (
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                <p className="text-sm text-blue-800 font-medium">
                  Time Estimate:
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  You'll reach your goal in approximately{" "}
                  <span className="font-bold">
                    {Math.ceil(
                      parseFloat(formData.targetAmount) /
                        parseFloat(formData.monthlyTarget)
                    )}{" "}
                    months
                  </span>
                </p>
              </div>
            )}

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
              placeholder="What are you saving for? Why is this goal important to you?"
              rows="3"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              className="flex min-h-[100px] w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm sm:text-base shadow-sm transition-colors placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            />
            <p className="text-xs text-slate-500">
              Add details about your goal to stay motivated
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

          {/* Preview Section */}
          <div className="pt-4 border-t border-slate-200">
            <h3 className="text-sm font-medium text-slate-700 mb-3">
              Goal Preview
            </h3>
            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm"
                style={{ backgroundColor: `${formData.color}20` }}
              >
                {icons.find((i) => i.name === formData.icon)?.component}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-slate-900">
                    {formData.name || "Goal Name"}
                  </h4>
                </div>
                <div className="space-y-1">
                  {formData.targetAmount && (
                    <p className="text-sm text-slate-700">
                      Target:{" "}
                      <span className="font-bold">
                        ৳{parseFloat(formData.targetAmount).toLocaleString()}
                      </span>
                    </p>
                  )}
                  {formData.monthlyTarget &&
                    parseFloat(formData.monthlyTarget) > 0 && (
                      <p className="text-sm text-slate-700">
                        Monthly:{" "}
                        <span className="font-medium">
                          ৳{parseFloat(formData.monthlyTarget).toLocaleString()}
                        </span>
                      </p>
                    )}
                </div>
              </div>
            </div>
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
              {isEdit ? "Update Goal" : "Create Goal"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SavingsForm;
