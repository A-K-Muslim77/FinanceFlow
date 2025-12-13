import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Login from "./Login";
import Registration from "./Registration";
import ForgetPassword from "./forgetPassword";
import AdminDashboard from "./AdminDashboard";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import Wallets from "./pages/Wallets";
import Categories from "./pages/Categories";
import Budgets from "./pages/Budgets";
import Savings from "./pages/Savings";
import Reports from "./pages/Reports";
import Due from "./pages/Due";
import BackgroundCircles from "./components/BackgroundCircles";

// Authentication wrapper component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");

  if (!token) {
    // Redirect to login if no token found
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <div className="App relative">
        {/* Single BackgroundCircles component that handles mobile/desktop internally */}
        <BackgroundCircles />

        <Routes>
          {/* Redirect root path to login */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Auth routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Registration />} />
          <Route path="/forgot-password" element={<ForgetPassword />} />

          {/* Main dashboard - Protected routes */}
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          >
            {/* Child routes */}
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="transactions" element={<Transactions />} />
            <Route path="wallets" element={<Wallets />} />
            <Route path="categories" element={<Categories />} />
            <Route path="budgets" element={<Budgets />} />
            <Route path="savings" element={<Savings />} />
            <Route path="reports" element={<Reports />} />
            <Route path="due" element={<Due />} />

            {/* Redirect to dashboard by default */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>

          {/* 404 fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>

        {/* React Toastify Container */}
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </div>
    </Router>
  );
}

export default App;
