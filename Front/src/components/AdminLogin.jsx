// AdminLoginPage.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Mail, Lock, Eye, EyeOff, Loader2, Shield, ArrowLeft } from "lucide-react";
import Navbar from "./Navbar";
import { useNavigate } from "react-router-dom";

export default function AdminLoginPage() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleLogin = async () => {
    if (!formData.email || !formData.password) {
      setError("Please enter email and password");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { data } = await axios.post(
        "http://localhost:8000/api/user/adminlogin",
        formData
      );
console.log(data);

      // ✅ Ensure only admins can login (match backend role exactly)
      if (!data.success ) {
        setError("Access denied: Admins only!");
        return;
      }

      // Save session/JWT info
      localStorage.setItem("user", JSON.stringify(data.data.user));
      localStorage.setItem("token", data.token);

      // Redirect to dashboard
      navigate("/admin/dashboard", { replace: true });
    } catch (err) {
      console.error("Login error:", err);
      setError(err.response?.data?.message || "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-black flex items-center justify-center p-4">
      <Navbar />
      <div className="w-full max-w-md my-20">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full mb-4">
            <Shield className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Admin Login</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Secure access for administrators</p>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow-xl border-0 rounded-3xl overflow-hidden p-8">
          <div className="space-y-6">
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}

            {/* Email */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Email address *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="Enter your admin email"
                  className="w-full pl-10 h-12 text-base border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none transition-all duration-200"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-10 h-12 text-base border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none transition-all duration-200"
                  required
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 flex items-center justify-center rounded hover:bg-gray-100"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
                </button>
              </div>
            </div>

            {/* Login button */}
            <button
              type="button"
              onClick={handleLogin}
              disabled={loading}
              className="w-full h-12 text-base font-medium bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                  Signing In...
                </>
              ) : (
                "Login as Admin"
              )}
            </button>

            {/* Back */}
            <button
              onClick={() => navigate("/")}
              className="flex items-center justify-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            >
              <ArrowLeft className="mr-1 w-4 h-4" /> Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
