import { useState, useEffect } from "react";
import { X } from "lucide-react";
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
    { value: "pending", label: "Pending" },
    { value: "paid", label: "Paid" },
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

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div
        className="relative w-full max-w-lg bg-white rounded-lg shadow-lg p-6 animate-in fade-in-0 zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>

        {/* Header */}
        <div className="flex flex-col space-y-1.5 text-center sm:text-left mb-4">
          <h2 className="text-lg font-semibold leading-none tracking-tight">
            {isEdit ? "Edit Due/Receivable" : "Add Due/Receivable"}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type Selection */}
          <div>
            <label className="text-sm font-medium leading-none text-slate-700">
              Type
            </label>
            <div className="h-9 items-center justify-center rounded-lg bg-slate-100 p-1 text-slate-600 grid w-full grid-cols-2 mt-1">
              <button
                type="button"
                onClick={() => setType("due")}
                className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium transition-all ${
                  type === "due"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Due
              </button>
              <button
                type="button"
                onClick={() => setType("receivable")}
                className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium transition-all ${
                  type === "receivable"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Receivable
              </button>
            </div>
          </div>

          {/* Amount */}
          <div>
            <label
              htmlFor="amount"
              className="text-sm font-medium leading-none text-slate-700"
            >
              Amount (৳)
            </label>
            <input
              type="number"
              id="amount"
              step="0.01"
              placeholder="0.00"
              required
              value={formData.amount}
              onChange={(e) => handleInputChange("amount", e.target.value)}
              className="flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 mt-1"
            />
          </div>

          {/* Person/Entity Name */}
          <div>
            <label
              htmlFor="person"
              className="text-sm font-medium leading-none text-slate-700"
            >
              Person/Entity Name
            </label>
            <input
              type="text"
              id="person"
              placeholder="e.g. John Doe, ABC Company"
              required
              value={formData.person}
              onChange={(e) => handleInputChange("person", e.target.value)}
              className="flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 mt-1"
            />
          </div>

          {/* Due Date */}
          <div>
            <label
              htmlFor="due_date"
              className="text-sm font-medium leading-none text-slate-700"
            >
              Due Date
            </label>
            <input
              type="date"
              id="due_date"
              required
              value={formData.due_date}
              onChange={(e) => handleInputChange("due_date", e.target.value)}
              className="flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 mt-1"
            />
          </div>

          {/* Status */}
          <div>
            <label
              htmlFor="status"
              className="text-sm font-medium leading-none text-slate-700"
            >
              Status
            </label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) => handleInputChange("status", e.target.value)}
              className="flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 mt-1"
            >
              {statusOptions.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div>
            <label
              htmlFor="notes"
              className="text-sm font-medium leading-none text-slate-700"
            >
              Notes (Optional)
            </label>
            <textarea
              id="notes"
              placeholder="Add any additional details..."
              rows="3"
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              className="flex min-h-[60px] w-full rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 mt-1"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 bg-red-600 text-white hover:bg-white hover:text-red-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background text-primary-foreground shadow h-9 px-4 py-2 bg-green-600 text-white hover:bg-white hover:text-green-600"
            >
              {isEdit ? "Update" : "Add"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DueReceivablesForm;
