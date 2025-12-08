import { useState, useEffect } from "react";
import {
  X,
  Calendar,
  User,
  DollarSign,
  FileText,
  CheckCircle,
  Clock,
} from "lucide-react";
import { toast } from "react-toastify";

const DueReceivablesForm = ({
  isOpen,
  onClose,
  onSubmit,
  editData,
  isEdit = false,
}) => {
  const [type, setType] = useState("due"); // "due" or "receivable"
  const [formData, setFormData] = useState({
    amount: "",
    person: "",
    due_date: "",
    status: "pending",
    notes: "",
  });

  const statusOptions = [
    { value: "pending", label: "Pending", icon: <Clock className="w-4 h-4" /> },
    { value: "paid", label: "Paid", icon: <CheckCircle className="w-4 h-4" /> },
  ];

  // Prefill form when editData changes
  useEffect(() => {
    if (isEdit && editData) {
      setFormData({
        amount: editData.amount || "",
        person: editData.person || "",
        due_date: editData.due_date ? editData.due_date.split("T")[0] : "",
        status: editData.status || "pending",
        notes: editData.notes || "",
      });
      setType(editData.type || "due");
    } else {
      // Reset form for create mode
      setFormData({
        amount: "",
        person: "",
        due_date: "",
        status: "pending",
        notes: "",
      });
      setType("due");
    }
  }, [isEdit, editData]);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate form data
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (!formData.person.trim()) {
      toast.error("Please enter a person/entity name");
      return;
    }

    if (!formData.due_date) {
      toast.error("Please select a due date");
      return;
    }

    onSubmit({
      ...formData,
      type,
      amount: parseFloat(formData.amount),
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
      amount: "",
      person: "",
      due_date: "",
      status: "pending",
      notes: "",
    });
    setType("due");
    onClose();
  };

  if (!isOpen) return null;

  const isDue = type === "due";
  const typeColor = isDue ? "red" : "blue";

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
                isDue ? "bg-red-100" : "bg-blue-100"
              }`}
            >
              {isDue ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-red-600"
                >
                  <path d="M12 2v20" />
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-blue-600"
                >
                  <path d="M12 2v20" />
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              )}
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-semibold leading-none tracking-tight text-slate-900">
                {isEdit ? "Edit Transaction" : "Add New Transaction"}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                {isDue ? "Money you owe to others" : "Money others owe to you"}
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
            <div
              className={`h-12 sm:h-10 items-center justify-center rounded-xl bg-slate-100 p-1 text-slate-600 grid w-full grid-cols-2 gap-1`}
            >
              <button
                type="button"
                onClick={() => setType("due")}
                className={`inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-red-500 ${
                  type === "due"
                    ? "bg-white text-red-600 shadow-sm font-semibold"
                    : "text-slate-600 hover:text-red-600"
                }`}
              >
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
                  className={type === "due" ? "text-red-600" : "text-slate-500"}
                >
                  <path d="M12 2v20" />
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
                <span>Due</span>
              </button>
              <button
                type="button"
                onClick={() => setType("receivable")}
                className={`inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  type === "receivable"
                    ? "bg-white text-blue-600 shadow-sm font-semibold"
                    : "text-slate-600 hover:text-blue-600"
                }`}
              >
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
                  className={
                    type === "receivable" ? "text-blue-600" : "text-slate-500"
                  }
                >
                  <path d="M12 2v20" />
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
                <span>Receivable</span>
              </button>
            </div>
            <p className="text-xs text-slate-500">
              {isDue
                ? "Money you need to pay to someone"
                : "Money someone needs to pay to you"}
            </p>
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
                className="flex h-10 sm:h-11 w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 py-2 text-sm sm:text-base shadow-sm transition-colors placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Person/Entity Name */}
          <div className="space-y-2">
            <label
              htmlFor="person"
              className="text-sm font-medium leading-none text-slate-700 block"
            >
              Person/Entity Name
              <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                id="person"
                placeholder="e.g. John Doe, ABC Company"
                required
                value={formData.person}
                onChange={(e) => handleInputChange("person", e.target.value)}
                className="flex h-10 sm:h-11 w-full rounded-lg border border-slate-300 bg-white pl-10 pr-3 py-2 text-sm sm:text-base shadow-sm transition-colors placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Due Date */}
            <div className="space-y-2">
              <label
                htmlFor="due_date"
                className="text-sm font-medium leading-none text-slate-700 block"
              >
                Due Date
                <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="date"
                  id="due_date"
                  required
                  value={formData.due_date}
                  onChange={(e) =>
                    handleInputChange("due_date", e.target.value)
                  }
                  className="flex h-10 sm:h-11 w-full rounded-lg border border-slate-300 bg-white pl-10 pr-3 py-2 text-sm sm:text-base shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <label
                htmlFor="status"
                className="text-sm font-medium leading-none text-slate-700 block"
              >
                Status
              </label>
              <div className="relative">
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => handleInputChange("status", e.target.value)}
                  className="flex h-10 sm:h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm sm:text-base shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                >
                  {statusOptions.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
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
                placeholder="Add any additional details about this transaction..."
                rows="3"
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                className="flex min-h-[100px] w-full rounded-lg border border-slate-300 bg-white pl-10 pr-3 py-3 text-sm sm:text-base shadow-sm transition-colors placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              />
            </div>
            <p className="text-xs text-slate-500">
              Add description, purpose, or any other relevant information
            </p>
          </div>

          {/* Summary Preview */}
          {formData.amount && formData.person && formData.due_date && (
            <div className="p-3 sm:p-4 bg-slate-50 rounded-lg border border-slate-200">
              <h3 className="text-sm font-medium text-slate-700 mb-2">
                Transaction Summary
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Type:</span>
                  <span
                    className={`font-medium ${
                      isDue ? "text-red-600" : "text-blue-600"
                    }`}
                  >
                    {isDue ? "Due (You Owe)" : "Receivable (Owed to You)"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Amount:</span>
                  <span className="font-semibold text-slate-900">
                    ৳{parseFloat(formData.amount).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">To/From:</span>
                  <span className="font-medium text-slate-900">
                    {formData.person}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Due Date:</span>
                  <span className="font-medium text-slate-900">
                    {new Date(formData.due_date).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </div>
          )}

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

export default DueReceivablesForm;
