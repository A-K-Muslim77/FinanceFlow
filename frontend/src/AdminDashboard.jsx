import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import Wallets from "./pages/Wallets";
import Categories from "./pages/Categories";
import Budgets from "./pages/Budgets";
import Savings from "./pages/Savings";
import Reports from "./pages/Reports";
import Due from "./pages/Due";

const AdminDashboard = () => {
  const [activeView, setActiveView] = useState(() => {
    return localStorage.getItem("financeActiveView") || "dashboard";
  });

  const [notificationCount, setNotificationCount] = useState(0);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isTabletOrMobile, setIsTabletOrMobile] = useState(false);

  // Check screen size on mount and resize
  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      const tabletOrMobile = width <= 1020;
      setIsTabletOrMobile(tabletOrMobile);
      if (!tabletOrMobile) {
        setIsMobileOpen(false);
      }
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Save view to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("financeActiveView", activeView);
  }, [activeView]);

  const renderView = () => {
    switch (activeView) {
      case "dashboard":
        return <Dashboard />;
      case "transactions":
        return <Transactions />;
      case "wallets":
        return <Wallets />;
        return (
          <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-800">
              Wallet Analytics
            </h1>
            <p className="text-gray-600 mt-4">Analytics for your wallets</p>
          </div>
        );
      case "categories":
        return <Categories />;
        return (
          <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-800">
              Category Report
            </h1>
            <p className="text-gray-600 mt-4">Category analytics</p>
          </div>
        );
      case "budgets":
        return <Budgets />;
        return (
          <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-800">
              Budget Tracking
            </h1>
            <p className="text-gray-600 mt-4">Track your budgets</p>
          </div>
        );
      case "savings":
        return <Savings />;
        return (
          <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-800">
              Savings Progress
            </h1>
            <p className="text-gray-600 mt-4">Track savings progress</p>
          </div>
        );
      case "reports":
        return <Reports />;
        return (
          <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-800">Income Report</h1>
            <p className="text-gray-600 mt-4">Income analysis</p>
          </div>
        );
      case "due":
        return <Due />;
        return (
          <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-800">
              Payment Reminders
            </h1>
            <p className="text-gray-600 mt-4">Set payment reminders</p>
          </div>
        );

        return (
          <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-800">Settings</h1>
            <p className="text-gray-600 mt-4">Account settings</p>
          </div>
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen flex items-center justify-center p-2 md:p-4 relative">
      {/* Mobile/Tablet Header */}
      {isTabletOrMobile && (
        <div className="fixed top-0 left-0 right-0 h-16 bg-white backdrop-blur-xl border-b border-gray-200 flex items-center justify-between px-4 z-40 lg:hidden animate-slideDown">
          <button
            onClick={() => setIsMobileOpen(true)}
            className="p-2 rounded-2xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-300 shadow-md active:scale-90 border border-gray-300"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          <h1 className="text-lg font-bold text-gray-800">FinanceFlow</h1>

          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white flex items-center justify-center font-bold shadow-md">
            U
          </div>
        </div>
      )}

      {/* Content */}
      <div
        className={`flex w-full bg-white rounded-3xl md:rounded-3xl shadow-sm sm:shadow-lg border border-gray-200 overflow-hidden relative ${
          isTabletOrMobile ? "mt-16 mb-2 h-[calc(100vh-5rem)]" : "h-[95vh]"
        }`}
      >
        {/* Sidebar */}
        {isTabletOrMobile ? (
          // Tablet/Mobile: Fixed overlay sidebar
          <div className="fixed inset-y-0 left-0 z-50">
            <Sidebar
              activeView={activeView}
              setActiveView={setActiveView}
              isMobileOpen={isMobileOpen}
              setIsMobileOpen={setIsMobileOpen}
              notificationCount={notificationCount}
              setNotificationCount={setNotificationCount}
            />
          </div>
        ) : (
          // Desktop: Persistent sidebar
          <div className="relative">
            <Sidebar
              activeView={activeView}
              setActiveView={setActiveView}
              isMobileOpen={isMobileOpen}
              setIsMobileOpen={setIsMobileOpen}
              notificationCount={notificationCount}
              setNotificationCount={setNotificationCount}
            />
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 h-full overflow-auto relative bg-gray-50">
          <div className="p-6">{renderView()}</div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
