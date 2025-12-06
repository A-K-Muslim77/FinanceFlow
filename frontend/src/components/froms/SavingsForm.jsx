import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { toast } from "react-toastify";

const SavingsForm = ({
  isOpen,
  onClose,
  onSubmit,
  editData,
  isEdit = false,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    targetAmount: "",
    monthlyTarget: "",
    description: "",
    icon: "piggy-bank",
    color: "#3b82f6",
  });

  const icons = [
    { name: "piggy-bank", component: <PiggyBankIcon /> },
    { name: "wallet", component: <WalletIcon /> },
    { name: "dollar-sign", component: <DollarSignIcon /> },
    { name: "trending-up", component: <TrendingUpIcon /> },
    { name: "house", component: <HouseIcon /> },
    { name: "car", component: <CarIcon /> },
    { name: "plane", component: <PlaneIcon /> },
    { name: "graduation-cap", component: <GraduationCapIcon /> },
    { name: "gift", component: <GiftIcon /> },
    { name: "heart", component: <HeartIcon /> },
    { name: "briefcase", component: <BriefcaseIcon /> },
    { name: "smartphone", component: <SmartphoneIcon /> },
    { name: "gamepad", component: <GamepadIcon /> },
    { name: "shirt", component: <ShirtIcon /> },
    { name: "coffee", component: <CoffeeIcon /> },
    { name: "tag", component: <TagIcon /> },
  ];

  const colors = [
    "#ef4444",
    "#f97316",
    "#f59e0b",
    "#84cc16",
    "#10b981",
    "#14b8a6",
    "#06b6d4",
    "#3b82f6",
    "#6366f1",
    "#8b5cf6",
    "#d946ef",
    "#ec4899",
    "#f43f5e",
  ];

  // Prefill form when editData changes
  useEffect(() => {
    if (isEdit && editData) {
      setFormData({
        name: editData.name || "",
        targetAmount: editData.targetAmount || "",
        monthlyTarget: editData.monthlyTarget || "",
        description: editData.description || "",
        icon: editData.icon || "piggy-bank",
        color: editData.color || "#3b82f6",
      });
    } else {
      // Reset form for create mode
      setFormData({
        name: "",
        targetAmount: "",
        monthlyTarget: "",
        description: "",
        icon: "piggy-bank",
        color: "#3b82f6",
      });
    }
  }, [isEdit, editData]);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate form data
    if (!formData.name.trim()) {
      toast.error("Please enter a goal name");
      return;
    }

    if (!formData.targetAmount || parseFloat(formData.targetAmount) <= 0) {
      toast.error("Please enter a valid target amount");
      return;
    }

    onSubmit({
      ...formData,
      targetAmount: parseFloat(formData.targetAmount),
      monthlyTarget: formData.monthlyTarget
        ? parseFloat(formData.monthlyTarget)
        : null,
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
      name: "",
      targetAmount: "",
      monthlyTarget: "",
      description: "",
      icon: "piggy-bank",
      color: "#3b82f6",
    });
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
          className="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>

        {/* Header */}
        <div className="flex flex-col space-y-1.5 text-center sm:text-left mb-4">
          <h2 className="text-lg font-semibold leading-none tracking-tight">
            {isEdit ? "Edit Savings Goal" : "Create Savings Goal"}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Goal Name */}
          <div>
            <label
              htmlFor="name"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Goal Name
            </label>
            <input
              type="text"
              id="name"
              placeholder="e.g. Emergency Fund, Vacation"
              required
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>

          {/* Target Amount */}
          <div>
            <label
              htmlFor="targetAmount"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Target Amount (৳)
            </label>
            <input
              type="number"
              id="targetAmount"
              step="0.01"
              placeholder="0.00"
              required
              value={formData.targetAmount}
              onChange={(e) =>
                handleInputChange("targetAmount", e.target.value)
              }
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>

          {/* Monthly Target */}
          <div>
            <label
              htmlFor="monthlyTarget"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Monthly Target (Optional)
            </label>
            <input
              type="number"
              id="monthlyTarget"
              step="0.01"
              placeholder="0.00"
              value={formData.monthlyTarget}
              onChange={(e) =>
                handleInputChange("monthlyTarget", e.target.value)
              }
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Description (Optional)
            </label>
            <textarea
              id="description"
              placeholder="What are you saving for?"
              rows="3"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>

          {/* Icon Selection */}
          <div>
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Icon
            </label>
            <div className="grid grid-cols-8 gap-2 mt-2">
              {icons.map((icon) => (
                <button
                  key={icon.name}
                  type="button"
                  onClick={() => handleInputChange("icon", icon.name)}
                  className={`p-3 rounded-lg border-2 transition-all hover:border-slate-300 ${
                    formData.icon === icon.name
                      ? "border-blue-500 bg-blue-50"
                      : "border-slate-200"
                  }`}
                >
                  {icon.component}
                </button>
              ))}
            </div>
          </div>

          {/* Color Selection */}
          <div>
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Color
            </label>
            <div className="grid grid-cols-8 gap-2 mt-2">
              {colors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => handleInputChange("color", color)}
                  className={`w-10 h-10 rounded-lg transition-all hover:scale-105 ${
                    formData.color === color
                      ? "ring-2 ring-offset-2 ring-blue-500 scale-110"
                      : ""
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
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
              {isEdit ? "Update Goal" : "Create Goal"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Reuse existing icons from CategoryForm and add PiggyBank
const PiggyBankIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-5 h-5 text-slate-700"
  >
    <path d="M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-4c1-.5 1.7-1 2-2h2v-4h-2c0-1-.5-1.5-1-2h0V5z"></path>
    <path d="M2 9v1c0 1.1.9 2 2 2h1"></path>
    <path d="M16 11h0"></path>
  </svg>
);

// Reuse icons from CategoryForm
const TagIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-5 h-5 text-slate-700"
  >
    <path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"></path>
    <circle cx="7.5" cy="7.5" r=".5" fill="currentColor"></circle>
  </svg>
);

const WalletIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-5 h-5 text-slate-700"
  >
    <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"></path>
    <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"></path>
  </svg>
);

const DollarSignIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-5 h-5 text-slate-700"
  >
    <line x1="12" x2="12" y1="2" y2="22"></line>
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
  </svg>
);

const TrendingUpIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-5 h-5 text-slate-700"
  >
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
    <polyline points="16 7 22 7 22 13"></polyline>
  </svg>
);

const HouseIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-5 h-5 text-slate-700"
  >
    <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"></path>
    <path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
  </svg>
);

const CarIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-5 h-5 text-slate-700"
  >
    <path d="M14 16H9m10 0h1a1 1 0 0 0 1-1v-2a2 2 0 0 0-2-2h-8.5a2 2 0 0 0-2 2v2a1 1 0 0 0 1 1h1"></path>
    <path d="M4 17a1 1 0 0 0 1 1h13"></path>
    <path d="M7 11V7a2 2 0 0 1 2-2h5l2 2h1a2 2 0 0 1 2 2v1"></path>
  </svg>
);

const PlaneIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-5 h-5 text-slate-700"
  >
    <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"></path>
  </svg>
);

const GraduationCapIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-5 h-5 text-slate-700"
  >
    <path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"></path>
    <path d="M22 10v6"></path>
    <path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"></path>
  </svg>
);

const GiftIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-5 h-5 text-slate-700"
  >
    <rect x="3" y="8" width="18" height="4" rx="1"></rect>
    <path d="M12 8v13"></path>
    <path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"></path>
    <path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5"></path>
  </svg>
);

const HeartIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-5 h-5 text-slate-700"
  >
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path>
  </svg>
);

const BriefcaseIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-5 h-5 text-slate-700"
  >
    <path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
    <rect width="20" height="14" x="2" y="6" rx="2"></rect>
  </svg>
);

const SmartphoneIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-5 h-5 text-slate-700"
  >
    <rect width="14" height="20" x="5" y="2" rx="2" ry="2"></rect>
    <path d="M12 18h.01"></path>
  </svg>
);

const GamepadIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-5 h-5 text-slate-700"
  >
    <line x1="6" x2="10" y1="12" y2="12"></line>
    <line x1="8" x2="8" y1="10" y2="14"></line>
    <line x1="15" x2="15.01" y1="13" y2="13"></line>
    <line x1="18" x2="18.01" y1="11" y2="11"></line>
    <rect width="20" height="12" x="2" y="6" rx="2"></rect>
  </svg>
);

const ShirtIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-5 h-5 text-slate-700"
  >
    <path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"></path>
  </svg>
);

const CoffeeIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-5 h-5 text-slate-700"
  >
    <path d="M10 2v2"></path>
    <path d="M14 2v2"></path>
    <path d="M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 1 1 0 8h-1"></path>
    <path d="M6 2v2"></path>
  </svg>
);

export default SavingsForm;
