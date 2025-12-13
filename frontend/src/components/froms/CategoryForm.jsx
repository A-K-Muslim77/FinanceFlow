import { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "react-toastify";
import * as LucideIcons from "lucide-react";

const CategoryForm = ({
  isOpen,
  onClose,
  onSubmit,
  editData,
  isEdit = false,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    type: "expense",
    icon: "tag",
    color: "#f59e0b",
  });

  const [error, setError] = useState("");

  // Using Lucide React icons directly
  const icons = [
    {
      name: "tag",
      component: <LucideIcons.Tag className="w-4 h-4" />,
      desktopComponent: <LucideIcons.Tag className="w-5 h-5 sm:w-6 sm:h-6" />,
    },
    {
      name: "shopping-cart",
      component: <LucideIcons.ShoppingCart className="w-4 h-4" />,
      desktopComponent: (
        <LucideIcons.ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" />
      ),
    },
    {
      name: "house",
      component: <LucideIcons.House className="w-4 h-4" />,
      desktopComponent: <LucideIcons.House className="w-5 h-5 sm:w-6 sm:h-6" />,
    },
    {
      name: "car",
      component: <LucideIcons.Car className="w-4 h-4" />,
      desktopComponent: <LucideIcons.Car className="w-5 h-5 sm:w-6 sm:h-6" />,
    },
    {
      name: "utensils",
      component: <LucideIcons.Utensils className="w-4 h-4" />,
      desktopComponent: (
        <LucideIcons.Utensils className="w-5 h-5 sm:w-6 sm:h-6" />
      ),
    },
    {
      name: "heart",
      component: <LucideIcons.Heart className="w-4 h-4" />,
      desktopComponent: <LucideIcons.Heart className="w-5 h-5 sm:w-6 sm:h-6" />,
    },
    {
      name: "shirt",
      component: <LucideIcons.Shirt className="w-4 h-4" />,
      desktopComponent: <LucideIcons.Shirt className="w-5 h-5 sm:w-6 sm:h-6" />,
    },
    {
      name: "smartphone",
      component: <LucideIcons.Smartphone className="w-4 h-4" />,
      desktopComponent: (
        <LucideIcons.Smartphone className="w-5 h-5 sm:w-6 sm:h-6" />
      ),
    },
    {
      name: "gamepad",
      component: <LucideIcons.Gamepad className="w-4 h-4" />,
      desktopComponent: (
        <LucideIcons.Gamepad className="w-5 h-5 sm:w-6 sm:h-6" />
      ),
    },
    {
      name: "graduation-cap",
      component: <LucideIcons.GraduationCap className="w-4 h-4" />,
      desktopComponent: (
        <LucideIcons.GraduationCap className="w-5 h-5 sm:w-6 sm:h-6" />
      ),
    },
    {
      name: "plane",
      component: <LucideIcons.Plane className="w-4 h-4" />,
      desktopComponent: <LucideIcons.Plane className="w-5 h-5 sm:w-6 sm:h-6" />,
    },
    {
      name: "coffee",
      component: <LucideIcons.Coffee className="w-4 h-4" />,
      desktopComponent: (
        <LucideIcons.Coffee className="w-5 h-5 sm:w-6 sm:h-6" />
      ),
    },
    {
      name: "gift",
      component: <LucideIcons.Gift className="w-4 h-4" />,
      desktopComponent: <LucideIcons.Gift className="w-5 h-5 sm:w-6 sm:h-6" />,
    },
    {
      name: "briefcase",
      component: <LucideIcons.Briefcase className="w-4 h-4" />,
      desktopComponent: (
        <LucideIcons.Briefcase className="w-5 h-5 sm:w-6 sm:h-6" />
      ),
    },
    {
      name: "dollar-sign",
      component: <LucideIcons.DollarSign className="w-4 h-4" />,
      desktopComponent: (
        <LucideIcons.DollarSign className="w-5 h-5 sm:w-6 sm:h-6" />
      ),
    },
    {
      name: "trending-up",
      component: <LucideIcons.TrendingUp className="w-4 h-4" />,
      desktopComponent: (
        <LucideIcons.TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />
      ),
    },
    {
      name: "wallet",
      component: <LucideIcons.Wallet className="w-4 h-4" />,
      desktopComponent: (
        <LucideIcons.Wallet className="w-5 h-5 sm:w-6 sm:h-6" />
      ),
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
        type: editData.type || "expense",
        icon: editData.icon || "tag",
        color: editData.color || "#f59e0b",
      });
    } else {
      // Reset form for create mode
      setFormData({
        name: "",
        type: "expense",
        icon: "tag",
        color: "#f59e0b",
      });
    }
    // Clear error when opening form
    setError("");
  }, [isEdit, editData]);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate form data
    if (!formData.name.trim()) {
      setError("Please enter a category name");
      return;
    }

    // Clear error if validation passes
    setError("");

    onSubmit(formData);
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
      type: "expense",
      icon: "tag",
      color: "#f59e0b",
    });
    setError("");
    onClose();
  };

  const nextIcons = () => {
    if (iconStartIndex + 5 < icons.length) {
      setIconStartIndex(iconStartIndex + 5);
    }
  };

  const prevIcons = () => {
    if (iconStartIndex > 0) {
      setIconStartIndex(iconStartIndex - 5);
    }
  };

  const nextColors = () => {
    if (colorStartIndex + 5 < colors.length) {
      setColorStartIndex(colorStartIndex + 5);
    }
  };

  const prevColors = () => {
    if (colorStartIndex > 0) {
      setColorStartIndex(colorStartIndex - 5);
    }
  };

  if (!isOpen) return null;

  const visibleIcons = icons.slice(iconStartIndex, iconStartIndex + 5);
  const visibleColors = colors.slice(colorStartIndex, colorStartIndex + 5);

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-2 sm:p-4">
      <div
        className="relative w-full max-w-sm sm:max-w-md bg-white rounded-lg sm:rounded-xl shadow-lg p-3 sm:p-4 animate-in fade-in-0 zoom-in-95 overflow-y-auto max-h-[90vh]"
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
            {isEdit ? "Edit Category" : "New Category"}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {isEdit ? "Update category details" : "Create a new category"}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-3 sm:space-y-4"
          noValidate
        >
          {/* Category Name */}
          <div className="space-y-1">
            <label
              htmlFor="name"
              className="text-xs sm:text-sm font-medium text-slate-700"
            >
              Category Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              placeholder="e.g. Groceries, Salary, Entertainment"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className={`w-full rounded border px-3 py-2 text-xs sm:text-sm ${
                error ? "border-red-500" : "border-slate-300"
              } focus:outline-none focus:ring-1 focus:ring-green-500`}
              autoFocus
            />
            {error && <p className="text-xs text-red-500">{error}</p>}
          </div>

          {/* Type Selection */}
          <div className="space-y-1">
            <label className="text-xs sm:text-sm font-medium text-slate-700">
              Type
            </label>
            <select
              value={formData.type}
              onChange={(e) => handleInputChange("type", e.target.value)}
              className="w-full rounded border border-slate-300 px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
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

              <div className="flex-1 grid grid-cols-5 gap-1">
                {visibleIcons.map((icon) => (
                  <button
                    key={icon.name}
                    type="button"
                    onClick={() => handleInputChange("icon", icon.name)}
                    className={`h-9 w-9 flex items-center justify-center border rounded ${
                      formData.icon === icon.name
                        ? "border-green-500 bg-green-50"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <span
                      className={
                        formData.icon === icon.name
                          ? "text-green-600"
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
                disabled={iconStartIndex + 5 >= icons.length}
                className="h-9 w-6 flex items-center justify-center rounded border border-slate-300 bg-white disabled:opacity-30"
              >
                <ChevronRight className="w-3 h-3 text-slate-600" />
              </button>
            </div>

            {/* Desktop - Original grid (8 per row) */}
            <div className="hidden sm:grid sm:grid-cols-8 gap-2 sm:gap-3">
              {icons.map((icon) => (
                <button
                  key={icon.name}
                  type="button"
                  onClick={() => handleInputChange("icon", icon.name)}
                  className={`flex items-center justify-center p-2.5 sm:p-3 rounded-lg border-2 transition-all hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    formData.icon === icon.name
                      ? "border-green-500 bg-green-50 scale-105"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <span
                    className={
                      formData.icon === icon.name
                        ? "text-green-600"
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

              <div className="flex-1 grid grid-cols-5 gap-1">
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
                disabled={colorStartIndex + 5 >= colors.length}
                className="h-9 w-6 flex items-center justify-center rounded border border-slate-300 bg-white disabled:opacity-30"
              >
                <ChevronRight className="w-3 h-3 text-slate-600" />
              </button>
            </div>

            {/* Desktop - Original grid (8 per row) */}
            <div className="hidden sm:grid sm:grid-cols-8 gap-2 sm:gap-3">
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

export default CategoryForm;
