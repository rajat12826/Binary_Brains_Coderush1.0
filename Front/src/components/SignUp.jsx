// src/components/SignupPage.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Eye, EyeOff, Check, X, ArrowRight, ArrowLeft, GraduationCap, User, Mail, Lock, Shield, BookOpen, Users, AlertCircle, Heart } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Progress } from '@/components/ui/progress';

// Placeholder for your API service.
const apiService = {
  post: async (endpoint, data) => {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || 'API call failed');
    }
    return result;
  },
};

// Placeholder for a loading button component
const LoadingButton = ({ type, loading, text, className, onClick, disabled }) => (
  <Button type={type} disabled={disabled || loading} className={className} onClick={onClick}>
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

export default function SignupPage() {
  const navigate = useNavigate();

  // State Management
  const [signupEmail, setSignupEmail] = useState('');
  const [signupUsername, setSignupUsername] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupDisplayName, setSignupDisplayName] = useState('');
  const [userRole, setUserRole] = useState('');
  const [institutionName, setInstitutionName] = useState('');
  const [gradeLevel, setGradeLevel] = useState('');
  const [subject, setSubject] = useState('');

  // UI States
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [emailValid, setEmailValid] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [direction, setDirection] = useState(0);

  // Password strength calculator
  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    return strength;
  };

  // Email validation
  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Handle password change
  const handlePasswordChange = (value) => {
    setSignupPassword(value);
    setPasswordStrength(calculatePasswordStrength(value));
  };

  // Handle email change
  const handleEmailChange = (value) => {
    setSignupEmail(value);
    setEmailTouched(true);
    setEmailValid(validateEmail(value));
  };

  // Animation variants
  const slideVariants = {
    hidden: (direction) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    visible: {
      x: 0,
      opacity: 1,
    },
    exit: (direction) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0,
    }),
  };

  const slideTransition = {
    type: 'spring',
    stiffness: 300,
    damping: 30,
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
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

  // Form submission
  const handleSignup = async () => {
    setLoading(true);

    const endpoint = '/api/signup';
    const body = {
      email: signupEmail,
      username: signupUsername,
      password: signupPassword,
      display_name: signupDisplayName,
      user_role: userRole,
      institution_name: institutionName,
      grade_level: gradeLevel,
      subject: subject,
    };

    try {
      const data = await apiService.post(endpoint, body);
      toast.success(data.message || 'Welcome to AcadeMate!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Signup error:', error);
      toast.error(error.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step navigation
  const handleNextStep = () => {
    if (currentStep === 1) {
      if (!signupEmail || !signupPassword) {
        toast.error('Please fill in all required fields');
        return;
      }
      if (!emailValid) {
        toast.error('Please enter a valid email address');
        return;
      }
      if (passwordStrength < 3) {
        toast.error('Please create a stronger password');
        return;
      }
    }
    setDirection(1);
    setCurrentStep(2);
  };

  const handlePreviousStep = () => {
    setDirection(-1);
    setCurrentStep(1);
  };

  // Password strength indicator
  const getPasswordStrengthColor = (strength) => {
    if (strength < 2) return 'bg-red-500';
    if (strength < 4) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = (strength) => {
    if (strength < 2) return 'Weak';
    if (strength < 4) return 'Good';
    return 'Strong';
  };

  // Step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            key="step1"
            custom={direction}
            variants={slideVariants}
            transition={slideTransition}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-6"
            >
              <motion.div variants={itemVariants} transition={itemTransition} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full mb-4">
                  <User className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Create your account
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Join the AcadeMate learning ecosystem
                </p>
              </motion.div>

              <motion.div variants={itemVariants} transition={itemTransition} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email address *
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="email"
                      type="email"
                      value={signupEmail}
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
                        <Check className="w-4 h-4 text-green-500" />
                      </div>
                    )}
                  </div>
                  {emailTouched && !emailValid && (
                    <p className="text-sm text-red-600 dark:text-red-400 flex items-center">
                      <X className="w-3 h-3 mr-1" />
                      Please enter a valid email address
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Password *
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={signupPassword}
                      onChange={(e) => handlePasswordChange(e.target.value)}
                      placeholder="Create a strong password"
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
                  {signupPassword && (
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 ${getPasswordStrengthColor(passwordStrength)}`}
                            style={{ width: `${(passwordStrength / 5) * 100}%` }}
                          />
                        </div>
                        <span className={`text-xs font-medium ${
                          passwordStrength < 2 ? 'text-red-600' :
                          passwordStrength < 4 ? 'text-yellow-600' : 'text-green-600'
                        }`}>
                          {getPasswordStrengthText(passwordStrength)}
                        </span>
                      </div>
                      <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                        <li className={`flex items-center ${signupPassword.length >= 8 ? 'text-green-600' : ''}`}>
                          <Check className={`w-3 h-3 mr-2 ${signupPassword.length >= 8 ? 'text-green-600' : 'text-gray-400'}`} />
                          At least 8 characters
                        </li>
                        <li className={`flex items-center ${/[A-Z]/.test(signupPassword) ? 'text-green-600' : ''}`}>
                          <Check className={`w-3 h-3 mr-2 ${/[A-Z]/.test(signupPassword) ? 'text-green-600' : 'text-gray-400'}`} />
                          One uppercase letter
                        </li>
                        <li className={`flex items-center ${/[0-9]/.test(signupPassword) ? 'text-green-600' : ''}`}>
                          <Check className={`w-3 h-3 mr-2 ${/[0-9]/.test(signupPassword) ? 'text-green-600' : 'text-gray-400'}`} />
                          One number
                        </li>
                      </ul>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="displayName" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Display name
                    </Label>
                    <Input
                      id="displayName"
                      type="text"
                      value={signupDisplayName}
                      onChange={(e) => setSignupDisplayName(e.target.value)}
                      placeholder="e.g. Jane Doe"
                      className="h-12 text-base border-2 border-gray-300 focus:border-green-500 transition-all duration-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Username
                    </Label>
                    <Input
                      id="username"
                      type="text"
                      value={signupUsername}
                      onChange={(e) => setSignupUsername(e.target.value)}
                      placeholder="e.g. acade-jane"
                      className="h-12 text-base border-2 border-gray-300 focus:border-green-500 transition-all duration-200"
                    />
                  </div>
                </div>
              </motion.div>

              <motion.div variants={itemVariants} transition={itemTransition}>
                <Button
                  onClick={handleNextStep}
                  className="w-full h-12 text-base font-medium bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 transition-all duration-200 shadow-lg hover:shadow-xl"
                  disabled={!emailValid || passwordStrength < 3}
                >
                  Continue to Academic Profile
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            key="step2"
            custom={direction}
            variants={slideVariants}
            transition={slideTransition}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-6"
            >
              <motion.div variants={itemVariants} transition={itemTransition} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full mb-4">
                  <GraduationCap className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Your academic profile
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Tell us about your role in education
                </p>
              </motion.div>

              <motion.div variants={itemVariants} transition={itemTransition} className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="userRole" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    What's your role? *
                  </Label>
                  <Select value={userRole} onValueChange={setUserRole}>
                    <SelectTrigger className="h-12 text-base border-2 border-gray-300 focus:border-green-500 transition-all duration-200">
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">
                        <div className="flex items-center space-x-3 py-2">
                          <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                            <GraduationCap className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-medium">Student</div>
                            <div className="text-xs text-gray-500">Learning and growing</div>
                          </div>
                        </div>
                      </SelectItem>
                      <SelectItem value="teacher">
                        <div className="flex items-center space-x-3 py-2">
                          <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
                            <BookOpen className="w-4 h-4 text-green-600" />
                          </div>
                          <div>
                            <div className="font-medium">Teacher</div>
                            <div className="text-xs text-gray-500">Educating and inspiring</div>
                          </div>
                        </div>
                      </SelectItem>
                      <SelectItem value="administrator">
                        <div className="flex items-center space-x-3 py-2">
                          <div className="flex items-center justify-center w-8 h-8 bg-purple-100 rounded-full">
                            <Shield className="w-4 h-4 text-purple-600" />
                          </div>
                          <div>
                            <div className="font-medium">Administrator</div>
                            <div className="text-xs text-gray-500">Leading and managing</div>
                          </div>
                        </div>
                      </SelectItem>
                      <SelectItem value="parent">
                        <div className="flex items-center space-x-3 py-2">
                          <div className="flex items-center justify-center w-8 h-8 bg-pink-100 rounded-full">
                            <Heart className="w-4 h-4 text-pink-600" />
                          </div>
                          <div>
                            <div className="font-medium">Parent</div>
                            <div className="text-xs text-gray-500">Supporting education</div>
                          </div>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="institutionName" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Institution name
                  </Label>
                  <Input
                    id="institutionName"
                    type="text"
                    value={institutionName}
                    onChange={(e) => setInstitutionName(e.target.value)}
                    placeholder="Enter your school or university name"
                    className="h-12 text-base border-2 border-gray-300 focus:border-green-500 transition-all duration-200"
                  />
                </div>

                {userRole === 'student' && (
                  <motion.div variants={itemVariants} transition={itemTransition} className="space-y-3">
                    <Label htmlFor="gradeLevel" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Grade level
                    </Label>
                    <Select value={gradeLevel} onValueChange={setGradeLevel}>
                      <SelectTrigger className="h-12 text-base border-2 border-gray-300 focus:border-green-500 transition-all duration-200">
                        <SelectValue placeholder="Select your current grade level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="k-5">K-5 (Elementary)</SelectItem>
                        <SelectItem value="6-8">6-8 (Middle School)</SelectItem>
                        <SelectItem value="9-12">9-12 (High School)</SelectItem>
                        <SelectItem value="undergraduate">Undergraduate</SelectItem>
                        <SelectItem value="graduate">Graduate</SelectItem>
                      </SelectContent>
                    </Select>
                  </motion.div>
                )}

                {userRole === 'teacher' && (
                  <motion.div variants={itemVariants} transition={itemTransition} className="space-y-3">
                    <Label htmlFor="subject" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Primary subject area
                    </Label>
                    <Input
                      id="subject"
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="e.g., Mathematics, Science, English"
                      className="h-12 text-base border-2 border-gray-300 focus:border-green-500 transition-all duration-200"
                    />
                  </motion.div>
                )}
              </motion.div>

              <motion.div variants={itemVariants} transition={itemTransition} className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={handlePreviousStep}
                  variant="outline"
                  className="flex-1 h-12 text-base font-medium border-2 border-gray-300 hover:border-gray-400 transition-all duration-200"
                >
                  <ArrowLeft className="mr-2 w-4 h-4" />
                  Back
                </Button>
                <LoadingButton
                  type="button"
                  loading={loading}
                  onClick={handleSignup}
                  disabled={!userRole}
                  text="Create Account"
                  className="flex-1 h-12 text-base font-medium bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 transition-all duration-200 shadow-lg hover:shadow-xl"
                />
              </motion.div>
            </motion.div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full mb-4">
            <GraduationCap className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            AcadeMate
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Your intelligent academic companion
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Step {currentStep} of 2
            </span>
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
              {Math.round((currentStep / 2) * 100)}% Complete
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-green-600 to-green-800 h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${(currentStep / 2) * 100}%` }}
            />
          </div>
        </div>

        {/* Main Form Card */}
        <Card className="bg-white dark:bg-gray-800 shadow-xl border-0 rounded-3xl overflow-hidden">
          <CardContent className="p-8">
            <AnimatePresence mode="wait" initial={false}>
              {renderStepContent()}
            </AnimatePresence>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-green-600 hover:text-green-500 dark:text-green-400 dark:hover:text-green-300 font-medium transition-colors"
            >
              Sign in
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
              Help
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}