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
  selectedMonth,
  selectedYear,
}) => {
  const [formData, setFormData] = useState({
    type: "income",
    amount: "",
    from_wallet_id: "",
    to_wallet_id: "",
    category_id: "",
    date: new Date().toISOString().slice(0, 16),
    notes: "",
  });

  useEffect(() => {
    if (isEdit && editData) {
      setFormData({
        type: editData.type || "income",
        amount: editData.amount || "",
        from_wallet_id: editData.from_wallet_id || "",
        to_wallet_id: editData.to_wallet_id || "",
        category_id: editData.category_id || "",
        date: editData.date
          ? new Date(editData.date).toISOString().slice(0, 16)
          : new Date().toISOString().slice(0, 16),
        notes: editData.notes || "",
      });
    } else {
      setFormData({
        type: "income",
        amount: "",
        from_wallet_id: "",
        to_wallet_id: "",
        category_id: "",
        date: new Date().toISOString().slice(0, 16),
        notes: "",
      });
    }
  }, [isEdit, editData]);

  const filteredCategories = categories.filter(
    (category) => category.type === formData.type
  );

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (!formData.from_wallet_id) {
      toast.error("Please select a wallet");
      return;
    }

    if (formData.type !== "transfer" && !formData.category_id) {
      toast.error("Please select a category");
      return;
    }

    const submitData = {
      type: formData.type,
      amount: parseFloat(formData.amount),
      from_wallet_id: formData.from_wallet_id,
      date: formData.date,
      notes: formData.notes || "",
    };

    if (formData.type !== "transfer") {
      submitData.category_id = formData.category_id;
    }

    if (formData.type === "transfer") {
      if (!formData.to_wallet_id) {
        toast.error("Please select a to wallet for transfer");
        return;
      }
      if (formData.from_wallet_id === formData.to_wallet_id) {
        toast.error("From wallet and To wallet cannot be the same");
        return;
      }
      submitData.to_wallet_id = formData.to_wallet_id;
    } else if (formData.type === "income") {
      submitData.to_wallet_id = formData.from_wallet_id;
    }

    onSubmit(submitData);
  };

  const handleInputChange = (field, value) => {
    if (field === "type") {
      setFormData((prev) => ({
        ...prev,
        type: value,
        category_id: value === "transfer" ? "" : prev.category_id,
        to_wallet_id: value !== "transfer" ? "" : prev.to_wallet_id,
      }));
    } else if (field === "from_wallet_id") {
      setFormData((prev) => ({
        ...prev,
        from_wallet_id: value,
        to_wallet_id:
          prev.type === "transfer" && value === prev.to_wallet_id
            ? ""
            : prev.to_wallet_id,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleClose = () => {
    setFormData({
      type: "income",
      amount: "",
      from_wallet_id: "",
      to_wallet_id: "",
      category_id: "",
      date: new Date().toISOString().slice(0, 16),
      notes: "",
    });
    onClose();
  };

  if (!isOpen) return null;

  if (wallets.length === 0) {
    return (
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
        <div className="relative w-full max-w-md bg-white rounded-lg shadow-lg p-6 animate-in fade-in-0 zoom-in-95">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              No Wallets Found
            </h3>
            <p className="text-slate-600 mb-4">
              You need to create wallets for {selectedMonth}/{selectedYear}{" "}
              before adding transactions.
            </p>
            <button
              onClick={onClose}
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-red-600 text-white shadow hover:bg-red-700 h-9 px-4 py-2"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div
        className="relative w-full max-w-lg bg-white rounded-lg shadow-lg p-6 animate-in fade-in-0 zoom-in-95 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>

        <div className="flex flex-col space-y-1.5 text-center sm:text-left mb-4">
          <h2 className="text-lg font-semibold leading-none tracking-tight">
            {isEdit ? "Edit Transaction" : "Add Transaction"}
          </h2>
          {isEdit && (
            <p className="text-sm text-slate-500">
              Editing{" "}
              {formData.type === "transfer" ? "transfer" : formData.type}{" "}
              transaction
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Type
            </label>
            <div className="mt-1">
              <div
                role="tablist"
                className="h-9 items-center justify-center rounded-lg p-1 text-muted-foreground grid w-full grid-cols-3 bg-white"
              >
                <button
                  type="button"
                  role="tab"
                  onClick={() => handleInputChange("type", "income")}
                  className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer ${
                    formData.type === "income"
                      ? "bg-green-500 text-white shadow"
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
                      ? "bg-green-500 text-white shadow"
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
                      ? "bg-green-500 text-white shadow"
                      : ""
                  }`}
                >
                  Transfer
                </button>
              </div>
            </div>
          </div>

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

          <div>
            <label
              htmlFor="from_wallet_id"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {formData.type === "income" ? "Receiving Wallet" : "From Wallet"}
            </label>
            <select
              id="from_wallet_id"
              value={formData.from_wallet_id}
              onChange={(e) =>
                handleInputChange("from_wallet_id", e.target.value)
              }
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-ring"
              required
            >
              <option value="">Select wallet</option>
              {wallets.map((wallet) => (
                <option key={wallet._id} value={wallet._id}>
                  {wallet.name} (Balance: ৳{wallet.monthlyBalance || 0})
                </option>
              ))}
            </select>
          </div>

          {formData.type === "transfer" ? (
            <div>
              <label
                htmlFor="to_wallet_id"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                To Wallet
              </label>
              <select
                id="to_wallet_id"
                value={formData.to_wallet_id}
                onChange={(e) =>
                  handleInputChange("to_wallet_id", e.target.value)
                }
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-ring"
                required={formData.type === "transfer"}
              >
                <option value="">Select to wallet</option>
                {wallets
                  .filter((wallet) => wallet._id !== formData.from_wallet_id)
                  .map((wallet) => (
                    <option key={wallet._id} value={wallet._id}>
                      {wallet.name} (Balance: ৳{wallet.monthlyBalance || 0})
                    </option>
                  ))}
              </select>
            </div>
          ) : (
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
                onChange={(e) =>
                  handleInputChange("category_id", e.target.value)
                }
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-ring"
                required={formData.type !== "transfer"}
              >
                <option value="">Select category</option>
                {filteredCategories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          )}

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
