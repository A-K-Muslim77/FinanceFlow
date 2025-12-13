import { useState, useEffect } from "react";
import { X } from "lucide-react";

const DueReceivablesForm = ({
  isOpen,
  onClose,
  onSubmit,
  editData,
  isEdit = false,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    date: "",
    status: "Due",
    description: "",
  });

  const [errors, setErrors] = useState({
    name: "",
    amount: "",
    date: "",
  });

  // Status options
  const statusOptions = [
    { value: "Due", label: "Due" },
    { value: "Received", label: "Received" },
  ];

  // Prefill form when editData changes
  useEffect(() => {
    if (isEdit && editData) {
      setFormData({
        name: editData.name || "",
        amount: editData.amount || "",
        date: editData.date || "",
        status: editData.status || "Due",
        description: editData.description || "",
      });
    } else {
      // Set default date to today for new entries
      const today = new Date().toISOString().split("T")[0];
      setFormData({
        name: "",
        amount: "",
        date: today,
        status: "Due",
        description: "",
      });
    }
    // Clear errors when opening form
    setErrors({
      name: "",
      amount: "",
      date: "",
    });
  }, [isEdit, editData]);

  const validateForm = () => {
    const newErrors = {
      name: "",
      amount: "",
      date: "",
    };
    let isValid = true;

    if (!formData.name.trim()) {
      newErrors.name = "Please enter a name";
      isValid = false;
    }

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

    if (!formData.date) {
      newErrors.date = "Please select a date";
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
      amount: parseFloat(formData.amount),
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
    const today = new Date().toISOString().split("T")[0];
    setFormData({
      name: "",
      amount: "",
      date: today,
      status: "Due",
      description: "",
    });
    setErrors({
      name: "",
      amount: "",
      date: "",
    });
    onClose();
  };

  if (!isOpen) return null;

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
            {isEdit ? "Edit Due/Receivable" : "New Due/Receivable"}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {isEdit
              ? "Update due/receivable details"
              : "Add a new due or receivable"}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-3 sm:space-y-4"
          noValidate
        >
          {/* Name/Title */}
          <div className="space-y-1">
            <label
              htmlFor="name"
              className="text-xs sm:text-sm font-medium text-slate-700"
            >
              Name/Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              placeholder="e.g. Client Payment, Loan, Rent"
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
            {/* Amount */}
            <div className="space-y-1">
              <label
                htmlFor="amount"
                className="text-xs sm:text-sm font-medium text-slate-700"
              >
                Amount (৳) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 text-xs">
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
                  className={`w-full rounded border px-3 py-2 pl-7 text-xs sm:text-sm ${
                    errors.amount ? "border-red-500" : "border-slate-300"
                  } focus:outline-none focus:ring-1 focus:ring-blue-500`}
                />
              </div>
              {errors.amount && (
                <p className="text-xs text-red-500">{errors.amount}</p>
              )}
            </div>

            {/* Date */}
            <div className="space-y-1">
              <label
                htmlFor="date"
                className="text-xs sm:text-sm font-medium text-slate-700"
              >
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="date"
                value={formData.date}
                onChange={(e) => handleInputChange("date", e.target.value)}
                className={`w-full rounded border px-3 py-2 text-xs sm:text-sm ${
                  errors.date ? "border-red-500" : "border-slate-300"
                } focus:outline-none focus:ring-1 focus:ring-blue-500`}
              />
              {errors.date && (
                <p className="text-xs text-red-500">{errors.date}</p>
              )}
            </div>
          </div>

          {/* Status */}
          <div className="space-y-1">
            <label
              htmlFor="status"
              className="text-xs sm:text-sm font-medium text-slate-700"
            >
              Status
            </label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) => handleInputChange("status", e.target.value)}
              className="w-full rounded border border-slate-300 px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
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
              placeholder="Additional notes about this due/receivable..."
              rows="2"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              className="w-full rounded border border-slate-300 px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Status Indicator */}
          {formData.status === "Received" && (
            <div className="p-3 bg-green-50 rounded border border-green-100">
              <p className="text-xs text-green-800 font-medium">
                Marked as Received
              </p>
              <p className="text-xs text-green-600 mt-0.5">
                This amount has been received
              </p>
            </div>
          )}

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

export default DueReceivablesForm;
