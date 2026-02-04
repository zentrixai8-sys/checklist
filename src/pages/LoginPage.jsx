"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, User, ArrowRight, CheckCircle, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const LoginPage = () => {
  const navigate = useNavigate();
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [masterData, setMasterData] = useState({
    userCredentials: {},
    userRoles: {},
    userEmails: {},
  });
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [loggedInUsername, setLoggedInUsername] = useState("");

  const isInactiveRole = (role) => {
    if (!role) return false;
    const normalizedRole = String(role).toLowerCase().trim();
    return (
      normalizedRole === "inactive" ||
      normalizedRole === "in active" ||
      normalizedRole === "inactiv" ||
      normalizedRole === "in activ"
    );
  };

  useEffect(() => {
    const fetchMasterData = async () => {
      const SCRIPT_URL =
        "https://script.google.com/macros/s/AKfycbwM1fIz3diOVcz0DApgcCF3YB9pqkvIPREj0BC1LdMZcc5b_iyIXQKSsZmLGIWymzPNZg/exec";

      try {
        setIsDataLoading(true);
        const response = await fetch(`${SCRIPT_URL}?action=fetch&sheet=master`);
        const data = await response.json();

        const userCredentials = {};
        const userRoles = {};
        const userEmails = {};

        if (data.table && data.table.rows) {
          for (let i = 1; i < data.table.rows.length; i++) {
            const row = data.table.rows[i];
            const username = row.c[2]
              ? String(row.c[2].v || "").trim().toLowerCase()
              : "";
            const password = row.c[3] ? String(row.c[3].v || "").trim() : "";
            const role = row.c[4] ? String(row.c[4].v || "").trim() : "user";
            const email = row.c[5] ? String(row.c[5].v || "").trim() : "";

            if (username && password && password.trim() !== "") {
              if (isInactiveRole(role)) {
                continue;
              }
              const normalizedRole = role.toLowerCase();
              userCredentials[username] = password;
              userRoles[username] = normalizedRole;
              userEmails[username] = email;
            }
          }
        }

        setMasterData({ userCredentials, userRoles, userEmails });
      } catch (error) {
        console.error("Error Fetching Master Data:", error);
        try {
          const fallbackResponse = await fetch(SCRIPT_URL, { method: "GET" });
          if (fallbackResponse.ok) {
            showToast("Unable to load user data. Contact admin.", "error");
          }
        } catch (fallbackError) {
          console.error("Fallback failed:", fallbackError);
        }
        showToast(`Network error: ${error.message}`, "error");
      } finally {
        setIsDataLoading(false);
      }
    };
    fetchMasterData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const logAttendance = async (username, role) => {
    const SCRIPT_URL =
      "https://script.google.com/macros/s/AKfycbwM1fIz3diOVcz0DApgcCF3YB9pqkvIPREj0BC1LdMZcc5b_iyIXQKSsZmLGIWymzPNZg/exec";

    try {
      const response = await fetch(
        `${SCRIPT_URL}?action=fetch&sheet=Attendance%20Login`
      );
      const data = await response.json();

      let rowIndex = -1;
      if (data.table && data.table.rows) {
        for (let i = 0; i < data.table.rows.length; i++) {
          const row = data.table.rows[i];
          const cellValue =
            row.c && row.c[1]
              ? String(row.c[1].v || "").trim().toLowerCase()
              : "";

          if (cellValue === username.trim().toLowerCase()) {
            rowIndex = i + 2;
            break;
          }
        }
      }

      if (rowIndex === -1) {
        console.warn("User not found in Attendance Login sheet");
        return;
      }

      const now = new Date();
      const day = now.getDate().toString().padStart(2, "0");
      const month = (now.getMonth() + 1).toString().padStart(2, "0");
      const year = now.getFullYear();
      const hours = now.getHours().toString().padStart(2, "0");
      const minutes = now.getMinutes().toString().padStart(2, "0");
      const seconds = now.getSeconds().toString().padStart(2, "0");
      const formattedTimestamp = `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;

      const payload = new FormData();
      payload.append("sheetName", "Attendance Login");
      payload.append("action", "update");
      payload.append("rowIndex", rowIndex.toString());
      const rowData = ["", "", formattedTimestamp];
      payload.append("rowData", JSON.stringify(rowData));

      fetch(SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        body: payload,
      }).catch((err) => console.error("Attendance logging failed", err));
    } catch (error) {
      console.error("Error preparing attendance log:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoginLoading(true);

    try {
      const trimmedUsername = formData.username.trim().toLowerCase();
      const trimmedPassword = formData.password.trim();

      if (trimmedUsername in masterData.userCredentials) {
        const correctPassword = masterData.userCredentials[trimmedUsername];
        const userRole = masterData.userRoles[trimmedUsername];
        const userEmail = masterData.userEmails[trimmedUsername] || "";

        if (correctPassword === trimmedPassword) {
          sessionStorage.setItem("username", trimmedUsername);
          sessionStorage.setItem("email", userEmail);
          setLoggedInUsername(trimmedUsername);
          const isAdmin = userRole === "admin";
          sessionStorage.setItem("role", isAdmin ? "admin" : "user");
          if (isAdmin) {
            sessionStorage.setItem("department", "all");
            sessionStorage.setItem("isAdmin", "true");
          } else {
            sessionStorage.setItem("department", trimmedUsername);
            sessionStorage.setItem("isAdmin", "false");
          }
          logAttendance(trimmedUsername, userRole);
          setShowSuccessPopup(true);
          setTimeout(() => {
            navigate("/dashboard/admin");
          }, 2000);
          showToast(`Welcome, ${trimmedUsername}!`, "success");
          return;
        } else {
          showToast("Incorrect password.", "error");
        }
      } else {
        showToast("Username not found.", "error");
      }
      console.error("Login Failed");
    } catch (error) {
      console.error("Login Error:", error);
      showToast(`Login failed: ${error.message}`, "error");
    } finally {
      setIsLoginLoading(false);
    }
  };

  const showToast = (message, type) => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "" });
    }, 5000);
  };

  const togglePasswordVisibility = () => {
    setVisible(!visible);
  };

  return (
    <div className="flex min-h-screen bg-white">
      {/* Left Panel - Visual & Branding */}
      <div className="hidden lg:flex w-1/2 bg-gray-900 relative overflow-hidden items-center justify-center p-12">
        {/* Animated Background Blobs */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{ x: [0, 50, 0], y: [0, -50, 0], scale: [1, 1.2, 1] }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-indigo-600/30 rounded-full mix-blend-screen filter blur-[100px]"
          />
          <motion.div
            animate={{ x: [0, -50, 0], y: [0, 50, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-violet-600/30 rounded-full mix-blend-screen filter blur-[100px]"
          />
        </div>

        <div className="relative z-10 text-center max-w-lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-8 flex justify-center"
          >
            <div className="h-24 w-24 rounded-3xl bg-gradient-to-tr from-violet-500 to-indigo-500 flex items-center justify-center shadow-2xl shadow-indigo-500/30">
              <i className="fas fa-layer-group text-5xl text-white"></i>
            </div>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-5xl font-bold text-white mb-6 tracking-tight"
          >
            <a
              href="https://zentrix-dv.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-indigo-200 transition-colors cursor-pointer"
            >
              Zentrix
            </a>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-xl text-gray-300 leading-relaxed font-light"
          >
            Streamline your workflow with our advanced checklist and delegation system. Simple, powerful, and effective.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            className="mt-12 flex items-center justify-center gap-2 text-sm text-gray-400"
          >
            <div className="h-px w-8 bg-gray-600"></div>
            <span>Trusted by Industry Leaders</span>
            <div className="h-px w-8 bg-gray-600"></div>
          </motion.div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-12 relative">
        <div className="w-full max-w-md space-y-8">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-center lg:text-left">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
              <p className="text-gray-500">Enter your credentials to access your account.</p>
            </div>

            <form onSubmit={handleSubmit} className="mt-10 space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Username</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User size={18} className="text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                    </div>
                    <input
                      name="username"
                      type="text"
                      required
                      value={formData.username}
                      onChange={handleChange}
                      className="w-full pl-10 pr-3 py-3 border-b-2 border-gray-400 focus:border-indigo-600 outline-none transition-colors bg-transparent placeholder-gray-500"
                      placeholder="e.g. johndoe"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Password</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock size={18} className="text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                    </div>
                    <input
                      name="password"
                      type={visible ? "text" : "password"}
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full pl-10 pr-10 py-3 border-b-2 border-gray-400 focus:border-indigo-600 outline-none transition-colors bg-transparent placeholder-gray-500"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-gray-400 hover:text-gray-600"
                    >
                      {visible ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">Remember me</label>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoginLoading || isDataLoading}
                className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-full shadow-lg text-sm font-semibold text-white bg-gray-900 hover:bg-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:-translate-y-0.5"
              >
                {isLoginLoading ? (
                  <div className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing In...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    Sign In <ArrowRight size={16} />
                  </div>
                )}
              </button>

              <div className="mt-8 text-center text-sm text-gray-500">
                <p>Protected by reCAPTCHA and subject to the Privacy Policy and Terms of Service.</p>
              </div>
            </form>
          </motion.div>
        </div>

        {/* Mobile Footer Branding - Visible only on mobile */}
        <div className="absolute bottom-6 left-0 right-0 text-center lg:hidden">
          <span className="text-xs text-gray-500 font-medium">
            Powered by <a
              href="https://zentrix-dv.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              Zentrix
            </a>
          </span>
        </div>
      </div>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: 20 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: -20, x: 20 }}
            className={`fixed top-4 right-4 z-[100] flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl border ${toast.type === "success"
              ? "bg-white border-green-200 text-green-700"
              : "bg-white border-red-200 text-red-700"
              }`}
          >
            {toast.type === "success" ? <CheckCircle size={24} className="text-green-500" /> : <AlertCircle size={24} className="text-red-500" />}
            <span className="font-semibold">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Popup */}
      <AnimatePresence>
        {showSuccessPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center z-[100] bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-8 max-w-sm w-full mx-4 shadow-2xl text-center"
            >
              <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-6">
                <CheckCircle size={40} className="text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Login Successful</h3>
              <p className="text-gray-500 mb-8">Access granted. Redirecting...</p>
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-indigo-600 mx-auto"></div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LoginPage;
