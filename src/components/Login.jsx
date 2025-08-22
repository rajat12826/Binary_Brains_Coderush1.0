// src/pages/LoginPage.jsx (or wherever you prefer to place it)

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

import { Loader2, Eye, EyeOff, Mail, Lock, Globe, ArrowRight, Shield, Key, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Placeholder for axiosServices.
// In your actual project, you would import your configured axios instance.
const axiosServices = {
  post: async (url, data) => {
    // This is a placeholder. Replace with your actual API call.
    // For example, if you are using fetch:
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Something went wrong');
    }
    return response.json();
  }
};

// Placeholder for LoadingButton
const LoadingButton = ({ type, loading, text, className, onClick }) => (
  <Button type={type} disabled={loading} className={className} onClick={onClick}>
    {loading ? (
      <>
        <Loader2 className="mr-2 w-4 h-4 animate-spin" />
        Please wait...
      </>
    ) : (
      text
    )}
  </Button>
);

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailValid, setEmailValid] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [forgotPasswordEmailValid, setForgotPasswordEmailValid] = useState(false);
  const [forgotPasswordEmailTouched, setForgotPasswordEmailTouched] = useState(false);
  const [passwordResetSent, setPasswordResetSent] = useState(false);
  const [forgotPasswordError, setForgotPasswordError] = useState("");

  const navigate = useNavigate();

  // Email validation
  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Handle email change for login form
  const handleEmailChange = (value) => {
    setEmail(value);
    setEmailTouched(true);
    setEmailValid(validateEmail(value));
  };

  // Handle email change for forgot password form
  const handleForgotPasswordEmailChange = (value) => {
    setForgotPasswordEmail(value);
    setForgotPasswordEmailTouched(true);
    setForgotPasswordEmailValid(validateEmail(value));
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
    },
  };

  const itemTransition = {
    type: 'spring',
    stiffness: 400,
    damping: 25,
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!emailValid) {
      toast.error('Please enter a valid email address');
      return;
    }

    if (!password) {
      toast.error('Please enter your password');
      return;
    }

    setLoading(true);

    try {
      const response = await axiosServices.post('/api/login', { email, password });
      if (response.data?.newPasswordRequired) {
        toast.info("New password required. Please complete your registration.");
      } else {
        toast.success(response.message || 'Welcome back!');
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!forgotPasswordEmailValid) {
      setForgotPasswordError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    setForgotPasswordError("");
    try {
      await axiosServices.post("/api/forgot-password", { email: forgotPasswordEmail });
      setPasswordResetSent(true);
    } catch (err) {
      setForgotPasswordError(err.message || "Failed to send reset link. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDialogClose = () => {
    setForgotPasswordOpen(false);
    setForgotPasswordEmail('');
    setForgotPasswordEmailTouched(false);
    setForgotPasswordEmailValid(false);
    setPasswordResetSent(false);
    setForgotPasswordError("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-black flex items-center justify-center p-4">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-md"
      >
        <motion.div variants={itemVariants} transition={itemTransition} className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full mb-4">
            <Shield className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Language Learner
          </h1>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome back!
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Sign in to access your personalized learning dashboard
          </p>
        </motion.div>

        <motion.div variants={itemVariants} transition={itemTransition}>
          <Card className="bg-white dark:bg-gray-800 shadow-xl border-0 rounded-3xl overflow-hidden">
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <motion.div variants={itemVariants} transition={itemTransition} className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => handleEmailChange(e.target.value)}
                      placeholder="Enter your email"
                      className={`pl-10 pr-10 h-12 text-base border-2 transition-all duration-200 ${
                        emailTouched
                          ? emailValid
                            ? 'border-green-500 focus:border-green-600'
                            : 'border-red-500 focus:border-red-600'
                          : 'border-gray-300 focus:border-green-500'
                      }`}
                      required
                    />
                    {emailTouched && emailValid && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      </div>
                    )}
                  </div>
                  {emailTouched && !emailValid && (
                    <p className="text-sm text-red-600 dark:text-red-400 flex items-center">
                      <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                      Please enter a valid email address
                    </p>
                  )}
                </motion.div>

                <motion.div variants={itemVariants} transition={itemTransition} className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="pl-10 pr-10 h-12 text-base border-2 border-gray-300 focus:border-green-500 transition-all duration-200"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4 text-gray-400" />
                      ) : (
                        <Eye className="w-4 h-4 text-gray-400" />
                      )}
                    </Button>
                  </div>
                </motion.div>

                <motion.div variants={itemVariants} transition={itemTransition} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <input
                      id="remember"
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 dark:focus:ring-green-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <Label htmlFor="remember" className="text-sm text-gray-700 dark:text-gray-300">
                      Remember me
                    </Label>
                  </div>
                  <Button
                    type="button"
                    variant="link"
                    className="p-0 h-auto text-sm text-green-600 hover:text-green-500 dark:text-green-400 dark:hover:text-green-300 font-medium transition-colors"
                    onClick={() => setForgotPasswordOpen(true)}
                  >
                    Forgot password?
                  </Button>
                </motion.div>

                <motion.div variants={itemVariants} transition={itemTransition}>
                  <LoadingButton
                    type="submit"
                    loading={loading}
                    text="Sign In"
                    className="w-full h-12 text-base font-medium bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </motion.div>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants} transition={itemTransition} className="text-center mt-8 space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Don't have an account?{' '}
            <Link
              to="/signup"
              className="text-green-600 hover:text-green-500 dark:text-green-400 dark:hover:text-green-300 font-medium transition-colors"
            >
              Sign up for free
            </Link>
          </p>
          <div className="flex items-center justify-center space-x-6 text-xs text-gray-500 dark:text-gray-400">
            <Link to="/privacy" className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
              Terms of Service
            </Link>
            <Link to="/help" className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
              Help Center
            </Link>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} transition={itemTransition} className="text-center mt-6">
          <div className="inline-flex items-center text-xs text-gray-500 dark:text-gray-400">
            <Shield className="w-3 h-3 mr-1" />
            Protected by enterprise-grade security
          </div>
        </motion.div>
      </motion.div>

      {/* Forgot Password Dialog */}
      <Dialog open={forgotPasswordOpen} onOpenChange={handleDialogClose}>
        <DialogContent className="w-[90%] max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">Forgot Password</DialogTitle>
          </DialogHeader>

          {passwordResetSent ? (
            <div className="py-4">
              <Alert className="bg-green-50 border-green-200">
                <AlertDescription className="text-xs sm:text-sm">
                  Password reset link has been sent to your email. Please check your inbox.
                </AlertDescription>
              </Alert>
              <Button className="w-full mt-4 text-xs sm:text-sm" onClick={handleDialogClose}>
                Close
              </Button>
            </div>
          ) : (
            <form onSubmit={handleForgotPasswordSubmit} className="space-y-3 sm:space-y-4">
              <div className="space-y-2">
                <Label htmlFor="forgot-password-email" className="text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="forgot-password-email"
                    type="email"
                    placeholder="Enter your email"
                    value={forgotPasswordEmail}
                    onChange={(e) => handleForgotPasswordEmailChange(e.target.value)}
                    className={`pl-10 pr-10 h-12 text-base border-2 transition-all duration-200 ${
                      forgotPasswordEmailTouched
                        ? forgotPasswordEmailValid
                          ? 'border-green-500 focus:border-green-600'
                          : 'border-red-500 focus:border-red-600'
                        : 'border-gray-300 focus:border-green-500'
                    }`}
                    required
                  />
                  {forgotPasswordEmailTouched && forgotPasswordEmailValid && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    </div>
                  )}
                </div>
                {forgotPasswordEmailTouched && !forgotPasswordEmailValid && (
                  <p className="text-sm text-red-600 dark:text-red-400 flex items-center">
                    <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                    Please enter a valid email address
                  </p>
                )}
              </div>

              {forgotPasswordError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  <AlertDescription className="text-xs sm:text-sm">{forgotPasswordError}</AlertDescription>
                </Alert>
              )}

              <DialogFooter className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full sm:w-auto text-xs sm:text-sm"
                  onClick={handleDialogClose}
                >
                  Cancel
                </Button>
                <LoadingButton
                  type="submit"
                  loading={loading}
                  text="Send Reset Link"
                  className="w-full sm:w-auto text-xs sm:text-sm bg-green-600 hover:bg-green-700"
                />
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}