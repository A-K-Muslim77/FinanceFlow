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

    if (
      type === "withdrawal" &&
      parseFloat(formData.amount) > goal?.currentBalance
    ) {
      toast.error(
        `Withdrawal amount cannot exceed current balance (৳${goal?.currentBalance.toLocaleString()})`
      );
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

  const isWithdrawal = type === "withdrawal";
  const actionColor = isWithdrawal ? "red" : "green";

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-3 sm:p-4">
      <div
        className="relative w-full max-w-md bg-white rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6 animate-in fade-in-0 zoom-in-95 max-h-[90vh] overflow-y-auto"
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
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                isWithdrawal ? "bg-red-100" : "bg-green-100"
              }`}
            >
              {isWithdrawal ? (
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
                  <path d="M12 5v14" />
                  <path d="m19 12-7 7-7-7" />
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
                  className="text-green-600"
                >
                  <path d="M12 5v14" />
                  <path d="m5 12 7-7 7 7" />
                </svg>
              )}
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-semibold leading-none tracking-tight text-slate-900">
                {isWithdrawal ? "Withdraw from Goal" : "Deposit to Goal"}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                {isWithdrawal
                  ? `Withdraw money from "${goal?.name}"`
                  : `Add money to "${goal?.name}"`}
              </p>
            </div>
          </div>
        </div>

        {/* Goal Info Card */}
        <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-slate-50 rounded-lg border border-slate-200">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-slate-700">
                Current Balance
              </p>
              <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
                ৳{goal?.currentBalance?.toLocaleString() || "0"}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-slate-700">Target</p>
              <p className="text-lg sm:text-xl font-semibold text-slate-900 mt-1">
                ৳{goal?.targetAmount?.toLocaleString() || "0"}
              </p>
            </div>
          </div>
          {goal?.currentBalance > 0 && (
            <div className="mt-3 pt-3 border-t border-slate-200">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500">Progress</span>
                <span className="text-xs font-medium text-slate-700">
                  {Math.min(
                    100,
                    Math.round((goal.currentBalance / goal.targetAmount) * 100)
                  )}
                  %
                </span>
              </div>
              <div className="h-2 bg-slate-200 rounded-full overflow-hidden mt-1">
                <div
                  className={`h-full ${
                    isWithdrawal ? "bg-red-500" : "bg-green-500"
                  } rounded-full transition-all duration-300`}
                  style={{
                    width: `${Math.min(
                      100,
                      Math.round(
                        (goal.currentBalance / goal.targetAmount) * 100
                      )
                    )}%`,
                  }}
                />
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
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
                max={isWithdrawal ? goal?.currentBalance : undefined}
                placeholder="0.00"
                required
                value={formData.amount}
                onChange={(e) => handleInputChange("amount", e.target.value)}
                className="flex h-10 sm:h-11 w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 py-2 text-sm sm:text-base shadow-sm transition-colors placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                autoFocus
              />
            </div>
            {isWithdrawal && goal?.currentBalance > 0 && (
              <div className="flex items-center gap-1 text-xs sm:text-sm text-slate-600 mt-2 p-2 bg-slate-100 rounded">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-slate-500"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
                <span>
                  Maximum withdrawal:{" "}
                  <span className="font-medium">
                    ৳{goal.currentBalance.toLocaleString()}
                  </span>
                </span>
              </div>
            )}
            {formData.amount && !isNaN(parseFloat(formData.amount)) && (
              <div
                className={`text-xs sm:text-sm mt-2 p-2 rounded ${
                  isWithdrawal
                    ? "bg-red-50 text-red-700"
                    : "bg-green-50 text-green-700"
                }`}
              >
                {isWithdrawal ? (
                  <>
                    New balance will be:{" "}
                    <span className="font-bold">
                      ৳
                      {(
                        goal.currentBalance - parseFloat(formData.amount)
                      ).toLocaleString()}
                    </span>
                  </>
                ) : (
                  <>
                    New balance will be:{" "}
                    <span className="font-bold">
                      ৳
                      {(
                        goal.currentBalance + parseFloat(formData.amount)
                      ).toLocaleString()}
                    </span>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <label
              htmlFor="notes"
              className="text-sm font-medium leading-none text-slate-700 block"
            >
              Notes (Optional)
            </label>
            <textarea
              id="notes"
              placeholder={`Describe this ${
                isWithdrawal ? "withdrawal" : "deposit"
              }...`}
              rows="3"
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              className="flex min-h-[80px] sm:min-h-[100px] w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm sm:text-base shadow-sm transition-colors placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
            />
            <p className="text-xs text-slate-500">
              Add a description for your records (e.g., "Monthly savings",
              "Emergency withdrawal")
            </p>
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
              className={`inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-${actionColor}-600 disabled:pointer-events-none disabled:opacity-50 bg-${actionColor}-600 text-white shadow hover:bg-${actionColor}-700 h-11 sm:h-10 px-4 py-3 sm:py-2 w-full sm:w-auto`}
            >
              {isWithdrawal ? "Withdraw Money" : "Deposit Money"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DepositWithdrawModal;
