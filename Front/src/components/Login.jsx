import React, { useState } from "react";
// Remove Clerk import to resolve build errors
// import { useSignIn } from "@clerk/clerk-react";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  Loader2,
  Check,
  X,
  Shield,
  AlertCircle,
  UserPlus,
} from "lucide-react";
import Navbar from "./Navbar";

export default function LoginPage() {
  // Remove Clerk hooks
  // const { isLoaded, signIn, setActive } = useSignIn();

  // form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // ui state
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailValid, setEmailValid] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showAccountNotFound, setShowAccountNotFound] = useState(false);

  // validators
  const validateEmail = (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);

  const handleEmailChange = (val) => {
    setEmail(val);
    setEmailTouched(true);
    setEmailValid(validateEmail(val));
    // Reset error states when user starts typing
    if (errorMessage || showAccountNotFound) {
      setErrorMessage("");
      setShowAccountNotFound(false);
    }
  };

  const handleSubmit = async () => {
    
    // Remove isLoaded check since we're not using Clerk
    // if (!isLoaded) return;

    if (!emailValid) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }
    if (!password) {
      setErrorMessage("Please enter your password.");
      return;
    }

    setLoading(true);
    setErrorMessage("");
    setShowAccountNotFound(false);

    try {
      // CLERK INTEGRATION: Replace this with actual Clerk signin
      /*
      const result = await signIn.create({
        identifier: email,
        password,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        window.location.href = "/dashboard"; // redirect
      } else {
        console.log(result);
        setErrorMessage("Additional steps required. Please check your email.");
      }
      */

      // Simulate the signin attempt
      console.log('Attempting signin with:', { email, password });
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call

      // Simulate the "account not found" error that you're experiencing
      // This is what happens when someone tries to sign in before completing signup
      const simulateAccountNotFound = true; // Change this to false to simulate successful login
      
      if (simulateAccountNotFound) {
        throw {
          errors: [{
            code: "form_identifier_not_found",
            message: "Couldn't find your account."
          }]
        };
      }

      // If successful, redirect to dashboard
      console.log('Login successful!');
      // window.location.href = "/dashboard";

    } catch (err) {
      console.error("Login error:", err);
      
      // Handle specific Clerk errors
      if (err.errors) {
        const hasAccountNotFound = err.errors.some(error => 
          error.code === "form_identifier_not_found"
        );
        
        if (hasAccountNotFound) {
          setShowAccountNotFound(true);
          setErrorMessage("Account not found. You may need to complete your signup first.");
        } else {
          setErrorMessage(err.errors.map((e) => e.message).join(", "));
        }
      } else {
        setErrorMessage("Invalid credentials. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoToSignup = () => {
    // Redirect to signup page with the email prefilled
    window.location.href = `/signup?email=${encodeURIComponent(email)}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Branding */}
        <Navbar/>
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full mb-4">
            <Shield className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            PlagioGuard
          </h1>
         
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
            AI-Powered Research Security
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-3xl p-8">
          <h2 className="text-2xl font-semibold text-center mb-6 text-gray-900 dark:text-white">
            Sign In
          </h2>

          <div className="space-y-6">
            {/* Email */}
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  placeholder="Enter your email"
                  className={`w-full pl-10 pr-10 h-12 text-base border-2 rounded-lg focus:outline-none transition-all duration-200 ${
                    emailTouched
                      ? emailValid
                        ? "border-green-500 focus:border-green-600"
                        : "border-red-500 focus:border-red-600"
                      : "border-gray-300 focus:border-green-500"
                  }`}
                  required
                />
                {emailTouched &&
                  (emailValid ? (
                    <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
                  ) : (
                    <X className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500" />
                  ))}
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-10 h-12 text-base border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none transition-all duration-200"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 flex items-center justify-center rounded hover:bg-gray-100"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 text-gray-400" />
                  ) : (
                    <Eye className="w-4 h-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="space-y-3">
                <p className="text-sm text-red-600 dark:text-red-400 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errorMessage}
                </p>
                
                {/* Account Not Found Helper */}
                {showAccountNotFound && (
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <UserPlus className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-green-800 dark:text-green-200 mb-1">
                          Need to create an account?
                        </h4>
                        <p className="text-sm text-green-600 dark:text-green-300 mb-3">
                          It looks like you haven't completed your account setup yet. You may need to finish the signup process or verify your email.
                        </p>
                        <button
                          type="button"
                          onClick={handleGoToSignup}
                          className="inline-flex items-center px-3 py-1.5 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors"
                        >
                          <UserPlus className="w-4 h-4 mr-1" />
                          Complete Signup
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Submit */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="w-full h-12 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center justify-center disabled:bg-gray-400 transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" /> Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </div>

          {/* Forgot Password */}
          <div className="text-center mt-4">
            <a
              href="/forgot-password"
              className="text-sm text-green-600 hover:text-green-500 dark:text-green-400 dark:hover:text-green-300 font-medium transition-colors"
            >
              Forgot your password?
            </a>
          </div>

          {/* Footer */}
          <div className="text-center mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Don't have an account?{" "}
              <a
                href="/signup"
                className="text-green-600 font-medium hover:underline dark:text-green-400"
              >
                Create one
              </a>
            </p>
          </div>
        </div>

        {/* Additional Help */}
        <div className="text-center mt-6">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Having trouble signing in?{" "}
            <a
              href="/help"
              className="text-green-600 hover:text-green-500 dark:text-green-400 dark:hover:text-green-300 underline"
            >
              Get help
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}