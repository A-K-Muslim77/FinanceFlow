import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import BackgroundCircles from "./components/BackgroundCircles";
import { FiLogOut } from "react-icons/fi";
import { useNavigate, Outlet, useLocation, Navigate } from "react-router-dom";
import { toast } from "react-hot-toast";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Check authentication on component mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  // Get current view from route path
  const getCurrentView = () => {
    const path = location.pathname;
    if (path === "/dashboard") return "dashboard";
    if (path === "/transactions") return "transactions";
    if (path === "/wallets") return "wallets";
    if (path === "/categories") return "categories";
    if (path === "/budgets") return "budgets";
    if (path === "/savings") return "savings";
    if (path === "/reports") return "reports";
    if (path === "/due") return "due";
    return "dashboard";
  };

  const [activeView, setActiveView] = useState(getCurrentView());
  const [notificationCount, setNotificationCount] = useState(0);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isTabletOrMobile, setIsTabletOrMobile] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Update active view when route changes
  useEffect(() => {
    setActiveView(getCurrentView());
  }, [location.pathname]);

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

  const confirmLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("hasBeenLoggedIn");
    toast.success("Logout successful!");
    setTimeout(() => {
      navigate("/login", { replace: true });
    }, 800);
  };

  // Check if user is authenticated
  const token = localStorage.getItem("token");
  if (!token) {
    return null; // Or a loading spinner, but App.js will redirect anyway
  }

  return (
    <div className="bg-gray-50 min-h-screen flex items-center justify-center p-2 md:p-4 relative">
      {/* Background Circles */}
      <BackgroundCircles />

      {/* Mobile/Tablet Header */}
      {isTabletOrMobile && (
        <div className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-xl border-b border-gray-200 flex items-center justify-between px-4 z-40 lg:hidden">
          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
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

          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="p-2 rounded-2xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-300 shadow-md active:scale-90 border border-gray-300"
            title="Logout"
          >
            <FiLogOut className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Content */}
      <div
        className={`flex w-full bg-white/80 backdrop-blur-sm rounded-3xl md:rounded-3xl shadow-sm sm:shadow-lg border border-gray-200 overflow-hidden relative transition-all duration-300 ${
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
              showLogoutConfirm={showLogoutConfirm}
              setShowLogoutConfirm={setShowLogoutConfirm}
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
              showLogoutConfirm={showLogoutConfirm}
              setShowLogoutConfirm={setShowLogoutConfirm}
            />
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 h-full overflow-auto relative bg-transparent">
          <div className="p-6">
            <Outlet />
          </div>
        </div>
      </div>

      {/* Logout Confirmation Modal - Now moved here for mobile header */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-70 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden w-full max-w-md">
            <div className="p-8 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-500 mb-4">
                <FiLogOut className="h-5 w-5 text-white" />
              </div>

              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Ready to leave?
              </h3>
              <p className="text-sm text-gray-700 mb-6">
                Are you sure you want to sign out of your account?
              </p>

              <div className="flex justify-center space-x-3">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="px-5 py-2.5 text-sm font-medium rounded-lg cursor-pointer bg-gray-500 text-white hover:bg-gray-600 transition-all duration-200 shadow-sm"
                >
                  Cancel
                </button>

                <button
                  onClick={confirmLogout}
                  className="px-5 py-2.5 text-sm font-medium rounded-lg bg-red-500 cursor-pointer text-white hover:bg-red-600 transition-all duration-200 shadow-sm"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
