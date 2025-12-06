import { useState } from "react";
import { X } from "lucide-react";
import { toast } from "react-toastify";

const DepositWithdrawModal = ({ isOpen, onClose, onSubmit, goal, type }) => {
  const [formData, setFormData] = useState({
    amount: "",
    notes: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    onSubmit(formData);
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
      notes: "",
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div
        className="relative w-full max-w-md bg-white rounded-lg shadow-lg p-6 animate-in fade-in-0 zoom-in-95"
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
            {type === "deposit" ? "Deposit to Goal" : "Withdraw from Goal"}
          </h2>
          <p className="text-sm text-slate-500">
            {type === "deposit"
              ? `Add money to "${goal?.name}"`
              : `Withdraw money from "${goal?.name}"`}
          </p>
          {/* <p className="text-sm font-medium text-slate-700">
            Current Balance: ৳{goal?.currentBalance?.toLocaleString() || 0}
          </p>
          {type === "withdrawal" && (
            <p className="text-xs text-orange-600">
              Note: Withdrawals don't affect your wallet balance
            </p>
          )} */}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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
            {type === "withdrawal" && goal?.currentBalance > 0 && (
              <p className="text-xs text-slate-500 mt-1">
                Maximum withdrawal: ৳{goal.currentBalance.toLocaleString()}
              </p>
            )}
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
              {type === "deposit" ? "Deposit" : "Withdraw"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DepositWithdrawModal;
