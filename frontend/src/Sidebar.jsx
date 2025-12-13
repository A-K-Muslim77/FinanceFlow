/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import {
  FiHome,
  FiChevronLeft,
  FiChevronRight,
  FiX,
  FiCreditCard,
  FiDollarSign,
  FiPieChart,
  FiTarget,
  FiTrendingUp,
  FiFileText,
  FiCalendar,
  FiLogOut,
} from "react-icons/fi";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-hot-toast";

const Sidebar = ({
  activeView,
  setActiveView,
  notificationCount = 0,
  setNotificationCount,
  isMobileOpen,
  setIsMobileOpen,
  showLogoutConfirm,
  setShowLogoutConfirm,
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [isTabletOrMobile, setIsTabletOrMobile] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  // Check if screen is tablet or mobile (<= 1024px)
  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      const tabletOrMobile = width <= 1020;
      setIsTabletOrMobile(tabletOrMobile);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Close sidebar on tablet/mobile when clicking outside or selecting item
  useEffect(() => {
    if (isTabletOrMobile) {
      setIsOpen(false);
    }
  }, [isTabletOrMobile]);

  const financeNavItems = [
    { name: "Dashboard", icon: <FiHome />, path: "/dashboard" },
    { name: "Transactions", icon: <FiCreditCard />, path: "/transactions" },
    { name: "Wallets", icon: <FiDollarSign />, path: "/wallets" },
    { name: "Categories", icon: <FiPieChart />, path: "/categories" },
    { name: "Budgets", icon: <FiTarget />, path: "/budgets" },
    { name: "Savings", icon: <FiTrendingUp />, path: "/savings" },
    { name: "Reports", icon: <FiFileText />, path: "/reports" },
    { name: "Due/Receivable", icon: <FiCalendar />, path: "/due" },
  ];

  const handleToggleSidebar = () => {
    if (isTabletOrMobile) {
      setIsMobileOpen(!isMobileOpen);
    } else {
      if (isOpen) {
        // Close all expanded menus
      }
      setIsOpen(!isOpen);
    }
  };

  const handleItemClick = (item) => {
    navigate(item.path);
    setActiveView(item.path.substring(1)); // Remove the leading slash

    if (isTabletOrMobile) {
      setTimeout(() => {
        setIsMobileOpen(false);
      }, 150);
    }
  };

  const confirmLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("hasBeenLoggedIn");
    toast.success("Logout successful!");
    setTimeout(() => {
      navigate("/login", { replace: true });
    }, 800);
  };

  // Determine sidebar state based on screen size and mobile toggle
  const sidebarOpen = isTabletOrMobile ? isMobileOpen : isOpen;

  return (
    <>
      {/* Tablet/Mobile Overlay */}
      {isTabletOrMobile && isMobileOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          x: isTabletOrMobile ? (isMobileOpen ? 0 : -300) : 0,
          width: isTabletOrMobile ? 256 : isOpen ? 256 : 80,
        }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className={`bg-gradient-to-b from-blue-50 to-indigo-50 h-full flex flex-col border-r border-gray-200 shadow-xl overflow-hidden fixed lg:relative z-50 sidebar-scrollbar ${
          isTabletOrMobile ? "w-64" : ""
        }`}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-3 ml-2 border-b border-gray-200 h-16"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Logo/Icon area - clickable for toggling */}
          <div className="cursor-pointer" onClick={handleToggleSidebar}>
            {sidebarOpen ? (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col"
              >
                <h1 className="text-xl font-bold text-gray-800">FinanceFlow</h1>
                <p className="text-xs text-gray-600">Financial Management</p>
              </motion.div>
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-red-500 to-green-600 text-white flex items-center justify-center font-bold shadow-md">
                F
              </div>
            )}
          </div>

          {/* Toggle Button */}
          {isTabletOrMobile ? (
            <button
              onClick={handleToggleSidebar}
              className="cursor-pointer rounded-lg text-gray-600 hover:text-gray-900 transition-colors duration-200"
            >
              <FiX className="w-5 h-5" />
            </button>
          ) : (
            <motion.button
              onClick={handleToggleSidebar}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="cursor-pointer rounded-lg text-gray-600 hover:text-gray-900 transition-colors duration-200"
            >
              {isOpen ? <FiChevronLeft /> : <FiChevronRight />}
            </motion.button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-4 sidebar-scrollbar">
          <ul className="space-y-2">
            {financeNavItems.map((item) => {
              const isActive = location.pathname === item.path;

              return (
                <li key={item.name}>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleItemClick(item)}
                    className={`flex items-center w-full p-4 rounded-xl transition-all duration-200 ${
                      sidebarOpen
                        ? "justify-between px-4"
                        : "justify-center px-0"
                    } ${
                      isActive
                        ? "bg-blue-100 text-blue-700 shadow-md border border-blue-200"
                        : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    }`}
                  >
                    <div
                      className={`flex items-center ${
                        sidebarOpen ? "space-x-3" : ""
                      }`}
                    >
                      <span className="w-5 h-5 flex items-center justify-center">
                        {item.icon}
                      </span>
                      {sidebarOpen && (
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.2 }}
                          className="capitalize font-medium text-sm md:text-base"
                        >
                          {item.name}
                        </motion.span>
                      )}
                    </div>
                  </motion.button>
                </li>
              );
            })}
          </ul>

          {/* User Status */}
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-6 mx-2 p-4 bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-xl border border-green-500/20"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-600 text-sm font-semibold">
                  ACTIVE
                </span>
              </div>
              <p className="text-gray-700 text-sm">
                Full financial access enabled
              </p>
            </motion.div>
          )}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center flex-1 min-w-0">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-red-500 to-green-600 text-white flex items-center justify-center font-bold shadow-md">
                {user?.name?.charAt(0)?.toUpperCase() || "F"}
              </div>

              {sidebarOpen && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex-1 min-w-0 ml-3"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-[700] text-gray-800 truncate">
                      {user?.name || "User"}
                    </p>
                  </div>
                  <p className="text-xs text-gray-500 font-[600] truncate mt-0.5">
                    {user?.email || "user@financeflow.com"}
                  </p>
                </motion.div>
              )}
            </div>

            {/* Show logout button only on desktop when sidebar is open */}
            {!isTabletOrMobile && sidebarOpen && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowLogoutConfirm(true)}
                className="p-2 rounded-md hover:bg-gray-100 cursor-pointer transition-colors duration-200 flex-shrink-0"
                title="Logout"
              >
                <FiLogOut className="w-5 h-5 text-gray-500 hover:text-red-500" />
              </motion.button>
            )}
          </div>

          {/* Mobile: Show logout button as a full-width button */}
          {isTabletOrMobile && sidebarOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-3"
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setShowLogoutConfirm(true);
                  setIsMobileOpen(false);
                }}
                className="w-full flex items-center justify-center p-3 rounded-lg border border-gray-300 hover:bg-gray-50 text-gray-700 hover:text-gray-900 cursor-pointer transition-all duration-200"
              >
                <FiLogOut className="w-5 h-5 mr-2" />
                <span className="font-medium">Logout</span>
              </motion.button>
            </motion.div>
          )}
        </div>
      </motion.aside>
    </>
  );
};

export default Sidebar;
