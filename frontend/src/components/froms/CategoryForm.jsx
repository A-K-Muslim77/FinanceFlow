import { useState, useEffect } from "react";
import { X } from "lucide-react";
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
      component: <LucideIcons.Tag className="w-5 h-5 sm:w-6 sm:h-6" />,
    },
    {
      name: "shopping-cart",
      component: <LucideIcons.ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" />,
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
      name: "utensils",
      component: <LucideIcons.Utensils className="w-5 h-5 sm:w-6 sm:h-6" />,
    },
    {
      name: "heart",
      component: <LucideIcons.Heart className="w-5 h-5 sm:w-6 sm:h-6" />,
    },
    {
      name: "shirt",
      component: <LucideIcons.Shirt className="w-5 h-5 sm:w-6 sm:h-6" />,
    },
    {
      name: "smartphone",
      component: <LucideIcons.Smartphone className="w-5 h-5 sm:w-6 sm:h-6" />,
    },
    {
      name: "gamepad",
      component: <LucideIcons.Gamepad className="w-5 h-5 sm:w-6 sm:h-6" />,
    },
    {
      name: "graduation-cap",
      component: (
        <LucideIcons.GraduationCap className="w-5 h-5 sm:w-6 sm:h-6" />
      ),
    },
    {
      name: "plane",
      component: <LucideIcons.Plane className="w-5 h-5 sm:w-6 sm:h-6" />,
    },
    {
      name: "coffee",
      component: <LucideIcons.Coffee className="w-5 h-5 sm:w-6 sm:h-6" />,
    },
    {
      name: "gift",
      component: <LucideIcons.Gift className="w-5 h-5 sm:w-6 sm:h-6" />,
    },
    {
      name: "briefcase",
      component: <LucideIcons.Briefcase className="w-5 h-5 sm:w-6 sm:h-6" />,
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
      name: "wallet",
      component: <LucideIcons.Wallet className="w-5 h-5 sm:w-6 sm:h-6" />,
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-3 sm:p-4">
      <div
        className="relative w-full max-w-md sm:max-w-lg bg-white rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6 animate-in fade-in-0 zoom-in-95 overflow-y-auto max-h-[90vh]"
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
        <div className="flex flex-col space-y-1 sm:space-y-1.5 text-center sm:text-left mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-semibold leading-none tracking-tight text-slate-900">
            {isEdit ? "Edit Category" : "Create New Category"}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            {isEdit
              ? "Update your category details"
              : "Create a new category for your transactions"}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 sm:space-y-6"
          noValidate
        >
          {/* Category Name */}
          <div className="space-y-2">
            <label
              htmlFor="name"
              className="text-sm font-medium leading-none text-slate-700 block"
            >
              Category Name
              <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="text"
              id="name"
              placeholder="e.g. Groceries, Salary, Entertainment"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className={`flex h-10 sm:h-11 w-full rounded-lg border ${
                error ? "border-red-500" : "border-slate-300"
              } bg-white px-3 py-2 text-sm sm:text-base shadow-sm transition-colors placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500`}
              autoFocus
            />
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
          </div>

          {/* Type Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none text-slate-700 block">
              Type
            </label>
            <select
              value={formData.type}
              onChange={(e) => handleInputChange("type", e.target.value)}
              className="flex h-10 sm:h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm sm:text-base shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </div>

          {/* Icon Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium leading-none text-slate-700 block">
              Icon
            </label>
            <div className="grid grid-cols-5 sm:grid-cols-8 gap-2 sm:gap-3">
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
                  title={icon.name.replace("-", " ")}
                  aria-label={`Select ${icon.name} icon`}
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
          </div>

          {/* Color Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium leading-none text-slate-700 block">
              Color
            </label>
            <div className="grid grid-cols-7 sm:grid-cols-8 gap-2 sm:gap-3">
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
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 disabled:pointer-events-none disabled:opacity-50 bg-green-600 text-white shadow hover:bg-green-700 h-11 sm:h-10 px-4 py-3 sm:py-2 w-full sm:w-auto"
            >
              {isEdit ? "Update Category" : "Create Category"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryForm;
