import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { toast } from "react-toastify";

const TransactionForm = ({
  isOpen,
  onClose,
  onSubmit,
  editData,
  isEdit = false,
  wallets = [],
  categories = [],
}) => {
  const [formData, setFormData] = useState({
    type: "income",
    amount: "",
    wallet_id: "",
    category_id: "",
    date: new Date().toISOString().slice(0, 16), // Current date-time in local format
    notes: "",
  });

  // Prefill form when editData changes
  useEffect(() => {
    if (isEdit && editData) {
      setFormData({
        type: editData.type || "income",
        amount: editData.amount || "",
        wallet_id: editData.wallet_id || "",
        category_id: editData.category_id || "",
        date: editData.date
          ? new Date(editData.date).toISOString().slice(0, 16)
          : new Date().toISOString().slice(0, 16),
        notes: editData.notes || "",
      });
    } else {
      // Reset form for create mode
      setFormData({
        type: "income",
        amount: "",
        wallet_id: "",
        category_id: "",
        date: new Date().toISOString().slice(0, 16),
        notes: "",
      });
    }
  }, [isEdit, editData]);

  // Filter categories by type (income/expense)
  const filteredCategories = categories.filter(
    (category) => category.type === formData.type
  );

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate form data
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (!formData.wallet_id) {
      toast.error("Please select a wallet");
      return;
    }

    if (!formData.category_id) {
      toast.error("Please select a category");
      return;
    }

    // Convert amount to number
    const submitData = {
      ...formData,
      amount: parseFloat(formData.amount),
    };

    onSubmit(submitData);
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // If type changes, reset category selection
    if (field === "type") {
      setFormData((prev) => ({
        ...prev,
        type: value,
        category_id: "",
      }));
    }
  };

  const handleClose = () => {
    setFormData({
      type: "income",
      amount: "",
      wallet_id: "",
      category_id: "",
      date: new Date().toISOString().slice(0, 16),
      notes: "",
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div
        className="relative w-full max-w-lg bg-white rounded-lg shadow-lg p-6 animate-in fade-in-0 zoom-in-95 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>

        {/* Header */}
        <div className="flex flex-col space-y-1.5 text-center sm:text-left mb-4">
          <h2 className="text-lg font-semibold leading-none tracking-tight">
            {isEdit ? "Edit Transaction" : "Add Transaction"}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type Selection */}
          <div>
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Type
            </label>
            <div className="mt-1">
              <div
                role="tablist"
                className="h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground grid w-full grid-cols-3"
              >
                <button
                  type="button"
                  role="tab"
                  onClick={() => handleInputChange("type", "income")}
                  className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer ${
                    formData.type === "income"
                      ? "bg-white text-foreground shadow"
                      : ""
                  }`}
                >
                  Income
                </button>
                <button
                  type="button"
                  role="tab"
                  onClick={() => handleInputChange("type", "expense")}
                  className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer ${
                    formData.type === "expense"
                      ? "bg-white text-foreground shadow"
                      : ""
                  }`}
                >
                  Expense
                </button>
                <button
                  type="button"
                  role="tab"
                  onClick={() => handleInputChange("type", "transfer")}
                  className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer ${
                    formData.type === "transfer"
                      ? "bg-white text-foreground shadow"
                      : ""
                  }`}
                >
                  Transfer
                </button>
              </div>
            </div>
          </div>

          {/* Amount */}
          <div>
            <label
              htmlFor="amount"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
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
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>

          {/* Wallet Selection */}
          <div>
            <label
              htmlFor="wallet_id"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Wallet
            </label>
            <select
              id="wallet_id"
              value={formData.wallet_id}
              onChange={(e) => handleInputChange("wallet_id", e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="">Select wallet</option>
              {wallets.map((wallet) => (
                <option key={wallet._id} value={wallet._id}>
                  {wallet.name}
                </option>
              ))}
            </select>
          </div>

          {/* Category Selection */}
          <div>
            <label
              htmlFor="category_id"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Category
            </label>
            <select
              id="category_id"
              value={formData.category_id}
              onChange={(e) => handleInputChange("category_id", e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-ring"
              disabled={filteredCategories.length === 0}
            >
              <option value="">
                {filteredCategories.length === 0
                  ? "No categories available for this type"
                  : "Select category"}
              </option>
              {filteredCategories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date & Time */}
          <div>
            <label
              htmlFor="date"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Date & Time
            </label>
            <input
              type="datetime-local"
              id="date"
              required
              value={formData.date}
              onChange={(e) => handleInputChange("date", e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>

          {/* Notes */}
          <div>
            <label
              htmlFor="notes"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Notes (Optional)
            </label>
            <textarea
              id="notes"
              placeholder="Add description..."
              rows="3"
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
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
              {isEdit ? "Update Transaction" : "Add Transaction"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionForm;
