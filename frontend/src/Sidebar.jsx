/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import {
  FiHome,
  FiSettings,
  FiChevronLeft,
  FiChevronRight,
  FiBell,
  FiChevronDown,
  FiChevronUp,
  FiLogOut,
  FiUser,
  FiX,
  FiCreditCard,
  FiDollarSign,
  FiPieChart,
  FiTarget,
  FiTrendingUp,
  FiCalendar,
  FiFileText,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

const Sidebar = ({
  activeView,
  setActiveView,
  notificationCount = 0,
  setNotificationCount,
  isMobileOpen,
  setIsMobileOpen,
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [expandedMenus, setExpandedMenus] = useState({});
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isTabletOrMobile, setIsTabletOrMobile] = useState(false);

  const navigate = useNavigate();
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
    { name: "Dashboard", icon: <FiHome />, component: "dashboard" },
    { name: "Transactions", icon: <FiCreditCard />, component: "transactions" },
    {
      name: "Wallets",
      icon: <FiDollarSign />,
      children: [
        { name: "My Wallets", component: "myWallets" },
        { name: "Add Wallet", component: "addWallet" },
        { name: "Wallet Analytics", component: "walletAnalytics" },
      ],
    },
    {
      name: "Categories",
      icon: <FiPieChart />,
      children: [
        { name: "All Categories", component: "allCategories" },
        { name: "Add Category", component: "addCategory" },
        { name: "Category Report", component: "categoryReport" },
      ],
    },
    {
      name: "Budgets",
      icon: <FiTarget />,
      children: [
        { name: "Budget Overview", component: "budgetOverview" },
        { name: "Create Budget", component: "createBudget" },
        { name: "Budget Tracking", component: "budgetTracking" },
      ],
    },
    {
      name: "Savings",
      icon: <FiTrendingUp />,
      children: [
        { name: "Savings Goals", component: "savingsGoals" },
        { name: "Add Savings", component: "addSavings" },
        { name: "Savings Progress", component: "savingsProgress" },
      ],
    },
    {
      name: "Reports",
      icon: <FiFileText />,
      children: [
        { name: "Financial Report", component: "financialReport" },
        { name: "Expense Report", component: "expenseReport" },
        { name: "Income Report", component: "incomeReport" },
      ],
    },
    {
      name: "Due/Receivable",
      icon: <FiCalendar />,
      children: [
        { name: "Due Payments", component: "duePayments" },
        { name: "Receivables", component: "receivables" },
        { name: "Payment Reminders", component: "paymentReminders" },
      ],
    },
    {
      name: "Notifications",
      icon: (
        <div className="relative">
          <FiBell />
          {notificationCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs text-white"
            >
              {Math.min(notificationCount, 99)}
            </motion.span>
          )}
        </div>
      ),
      component: "notifications",
    },
    { name: "Settings", icon: <FiSettings />, component: "settings" },
  ];

  const toggleMenu = (menuName) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [menuName]: !prev[menuName],
    }));
  };

  const handleToggleSidebar = () => {
    if (isTabletOrMobile) {
      setIsMobileOpen(!isMobileOpen);
    } else {
      if (isOpen) {
        setExpandedMenus({});
      }
      setIsOpen(!isOpen);
    }
  };

  const handleItemClick = (item) => {
    if (!sidebarOpen && !isTabletOrMobile) {
      setIsOpen(true);
      if (item.children) {
        toggleMenu(item.name);
      } else {
        setActiveView(item.component);
      }
      return;
    }
    if (item.children) {
      toggleMenu(item.name);
    } else {
      setActiveView(item.component);
      if (isTabletOrMobile) {
        setIsMobileOpen(false);
      }
    }
  };

  const handleChildItemClick = (component) => {
    setActiveView(component);
    if (isTabletOrMobile) {
      setIsMobileOpen(false);
    }
  };

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
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
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
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
        className={`bg-gradient-to-b from-blue-50 to-indigo-50 h-full flex flex-col border-r border-gray-200 shadow-xl overflow-hidden fixed lg:relative z-50 ${
          isTabletOrMobile ? "w-64" : ""
        }`}
      >
        {/* Header */}
        <div
          className="cursor-pointer flex items-center justify-between p-3 ml-2 border-b border-gray-200 h-16"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={handleToggleSidebar}
        >
          {sidebarOpen ? (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-col"
            >
              <h1 className="text-xl font-bold text-gray-800">FinanceFlow</h1>
              <p className="text-xs text-gray-600">Financial Management</p>
            </motion.div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white flex items-center justify-center font-bold shadow-md">
              F
            </div>
          )}

          {isTabletOrMobile ? (
            <button
              onClick={() => setIsMobileOpen(false)}
              className="cursor-pointer rounded-lg text-gray-600 hover:text-gray-900 transition-colors"
            >
              <FiX className="w-5 h-5" />
            </button>
          ) : (
            <motion.button
              whileHover={{}}
              animate={{
                x: isHovered ? (isOpen ? -4 : 4) : 0,
                scale: isHovered ? 1.2 : 1,
              }}
              transition={{ type: "spring", stiffness: 300 }}
              className="cursor-pointer rounded-lg text-gray-600 transition-colors"
            >
              {isOpen ? <FiChevronLeft /> : <FiChevronRight />}
            </motion.button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-4">
          <ul className="space-y-2">
            {financeNavItems.map((item) => {
              const isParentActive =
                item.component === activeView ||
                (item.children &&
                  item.children.some(
                    (child) => child.component === activeView
                  ));

              return (
                <li key={item.name}>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleItemClick(item)}
                    className={`flex items-center w-full p-4 rounded-xl transition-all ${
                      sidebarOpen
                        ? "justify-between px-4"
                        : "justify-center px-0"
                    } ${
                      isParentActive
                        ? "bg-blue-100 text-blue-700 shadow-md border border-blue-200"
                        : expandedMenus[item.name]
                        ? "bg-gray-100 text-gray-900"
                        : "text-gray-700 hover:bg-gray-100"
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
                        <span className="capitalize font-medium text-sm md:text-base">
                          {item.name}
                        </span>
                      )}
                    </div>

                    {sidebarOpen &&
                      item.children &&
                      (expandedMenus[item.name] ? (
                        <FiChevronUp className="w-4 h-4" />
                      ) : (
                        <FiChevronDown className="w-4 h-4" />
                      ))}
                  </motion.button>

                  <AnimatePresence>
                    {expandedMenus[item.name] &&
                      sidebarOpen &&
                      item.children && (
                        <motion.ul
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden ml-6 border-l border-gray-300 pl-3 mt-2"
                        >
                          {item.children.map((child, index) => (
                            <motion.li
                              key={child.name}
                              whileHover={{ x: -2 }}
                              className="mb-1"
                            >
                              <button
                                onClick={() =>
                                  handleChildItemClick(child.component)
                                }
                                className={`text-sm py-2.5 px-4 w-full text-left rounded-lg transition-colors ${
                                  activeView === child.component
                                    ? "bg-blue-600 text-white font-medium shadow-sm"
                                    : "text-gray-600 hover:bg-blue-50"
                                } ${index === 0 ? "rounded-t-lg" : ""} ${
                                  index === item.children.length - 1
                                    ? "rounded-b-lg"
                                    : ""
                                }`}
                              >
                                {child.name}
                              </button>
                            </motion.li>
                          ))}
                        </motion.ul>
                      )}
                  </AnimatePresence>
                </li>
              );
            })}
          </ul>

          {/* User Status */}
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
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
          <motion.div
            className="flex items-center"
            whileHover={sidebarOpen ? { scale: 1.005 } : {}}
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white flex items-center justify-center font-bold shadow-md">
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>

            {sidebarOpen && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex-1 min-w-0 ml-3"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-[700] text-gray-800 truncate">
                    {user?.name || "User"}
                  </p>
                  <div className="flex gap-1">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleLogout}
                      className="p-1 rounded-md hover:bg-gray-100 cursor-pointer transition-colors"
                      title="Logout"
                    >
                      <FiLogOut className="w-4 h-4 text-gray-500 hover:text-red-500" />
                    </motion.button>
                  </div>
                </div>
                <p className="text-xs text-gray-500 font-[600] truncate mt-0.5">
                  {user?.email || "user@financeflow.com"}
                </p>
              </motion.div>
            )}
          </motion.div>
        </div>
      </motion.aside>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black bg-opacity-70 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ type: "spring", damping: 25 }}
              className="bg-white rounded-2xl shadow-2xl overflow-hidden w-full max-w-md"
            >
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
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowLogoutConfirm(false)}
                    className="px-5 py-2.5 text-sm font-medium rounded-lg cursor-pointer bg-gray-500 text-white hover:bg-gray-600 transition-all shadow-sm"
                  >
                    Cancel
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={confirmLogout}
                    className="px-5 py-2.5 text-sm font-medium rounded-lg bg-red-500 cursor-pointer text-white hover:bg-red-600 transition-all shadow-sm"
                  >
                    Logout
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
