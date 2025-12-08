import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { toast } from "react-toastify";

const BudgetForm = ({
  isOpen,
  onClose,
  onSubmit,
  editData,
  isEdit = false,
  categories = [],
}) => {
  const [formData, setFormData] = useState({
    category_id: "",
    monthly_limit: "",
    month: new Date().getMonth() + 1, // Current month (1-12)
    year: new Date().getFullYear(), // Current year
  });

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

  const years = Array.from({ length: 5 }, (_, i) => {
    const year = new Date().getFullYear() + i;
    return { value: year, label: year.toString() };
  });

  useEffect(() => {
    if (isEdit && editData) {
      setFormData({
        category_id: editData.category_id || editData.category_id?._id || "",
        monthly_limit: editData.monthly_limit || "",
        month: editData.month || new Date().getMonth() + 1,
        year: editData.year || new Date().getFullYear(),
      });
    } else {
      setFormData({
        category_id: "",
        monthly_limit: "",
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
      });
    }
  }, [isEdit, editData]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.category_id) {
      toast.error("Please select a category");
      return;
    }

    if (!formData.monthly_limit || parseFloat(formData.monthly_limit) <= 0) {
      toast.error("Please enter a valid monthly limit");
      return;
    }

    const submitData = {
      ...formData,
      monthly_limit: parseFloat(formData.monthly_limit),
    };

    onSubmit(submitData);
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleClose = () => {
    setFormData({
      category_id: "",
      monthly_limit: "",
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-3 sm:p-4">
      <div
        className="relative w-full max-w-md sm:max-w-lg bg-white rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6 animate-in fade-in-0 zoom-in-95 overflow-y-auto max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleClose}
          className="absolute right-3 top-3 sm:right-4 sm:top-4 rounded-full p-1.5 sm:p-1 bg-slate-100 hover:bg-slate-200 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-300"
          aria-label="Close"
        >
          <X className="h-4 w-4 sm:h-5 sm:w-5 text-slate-600" />
        </button>

        <div className="flex flex-col space-y-1 sm:space-y-1.5 text-center sm:text-left mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-semibold leading-none tracking-tight text-slate-900">
            {isEdit ? "Edit Budget" : "Set New Budget"}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            {isEdit
              ? "Update your budget details"
              : "Set a monthly spending limit for a category"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* Category Selection */}
          <div className="space-y-2">
            <label
              htmlFor="category_id"
              className="text-sm font-medium leading-none text-slate-700 block"
            >
              Category
              <span className="text-red-500 ml-1">*</span>
            </label>
            <select
              id="category_id"
              value={formData.category_id}
              onChange={(e) => handleInputChange("category_id", e.target.value)}
              className="flex h-10 sm:h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm sm:text-base shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              required
            >
              <option value="" disabled>
                Select a category
              </option>
              {categories.map((category) => (
                <option
                  key={category._id || category.id}
                  value={category._id || category.id}
                >
                  {category.name}
                </option>
              ))}
            </select>
            {categories.length === 0 && (
              <p className="text-xs text-red-500 mt-1">
                No categories available. Please create categories first.
              </p>
            )}
          </div>

          {/* Monthly Limit */}
          <div className="space-y-2">
            <label
              htmlFor="monthly_limit"
              className="text-sm font-medium leading-none text-slate-700 block"
            >
              Monthly Limit (৳)
              <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 font-medium">
                ৳
              </span>
              <input
                type="number"
                id="monthly_limit"
                step="0.01"
                min="0"
                placeholder="0.00"
                required
                value={formData.monthly_limit}
                onChange={(e) =>
                  handleInputChange("monthly_limit", e.target.value)
                }
                className="flex h-10 sm:h-11 w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 py-2 text-sm sm:text-base shadow-sm transition-colors placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>

          {/* Month and Year Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium leading-none text-slate-700 block">
              Month & Year
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-2">
                <label className="text-xs sm:text-sm text-slate-600">
                  Month
                </label>
                <select
                  value={formData.month}
                  onChange={(e) =>
                    handleInputChange("month", parseInt(e.target.value))
                  }
                  className="flex h-10 sm:h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm sm:text-base shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  {months.map((month) => (
                    <option key={month.value} value={month.value}>
                      {month.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs sm:text-sm text-slate-600">
                  Year
                </label>
                <select
                  value={formData.year}
                  onChange={(e) =>
                    handleInputChange("year", parseInt(e.target.value))
                  }
                  className="flex h-10 sm:h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm sm:text-base shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  {years.map((year) => (
                    <option key={year.value} value={year.value}>
                      {year.label}
                    </option>
                  ))}
                </select>
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
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 disabled:pointer-events-none disabled:opacity-50 bg-green-600 text-white shadow hover:bg-green-700 h-11 sm:h-10 px-4 py-3 sm:py-2 w-full sm:w-auto"
            >
              {isEdit ? "Update Budget" : "Create Budget"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BudgetForm;
