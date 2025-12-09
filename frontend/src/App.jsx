import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Login from "./Login";
import Registration from "./Registration";
import ForgetPassword from "./forgetPassword";
import AdminDashboard from "./AdminDashboard";
import BackgroundCircles from "./components/BackgroundCircles";

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

          {/* Protected routes */}
          <Route path="/dashboard" element={<AdminDashboard />} />

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
