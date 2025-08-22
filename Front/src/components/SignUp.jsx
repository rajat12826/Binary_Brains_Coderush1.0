import React, { useState } from 'react';
import { useSignUp } from '@clerk/clerk-react';
import { Eye, EyeOff, Check, X, FileText, User, Mail, Lock, Loader2, ArrowLeft } from 'lucide-react';
import Navbar from './Navbar';

export default function CMTSignupPage() {
  const { isLoaded, signUp, setActive } = useSignUp();

  const [formData, setFormData] = useState({
    email: '',
    username: '',
    role: '',
    password: '',
    confirmPassword: ''
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [emailValid, setEmailValid] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordsMatch, setPasswordsMatch] = useState(true);

  const [step, setStep] = useState('signup'); // 'signup' or 'verify'
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  // ---- Validation Functions ----
  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    return strength;
  };

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

  // ---- Input Change Handler ----
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    if (field === 'email') {
      setEmailTouched(true);
      setEmailValid(validateEmail(value));
    }
    if (field === 'password') {
      setPasswordStrength(calculatePasswordStrength(value));
      setPasswordsMatch(formData.confirmPassword === '' || formData.confirmPassword === value);
    }
    if (field === 'confirmPassword') {
      setPasswordsMatch(value === formData.password);
    }
  };

  // ---- Submit Signup ----
  const handleSubmit = async () => {
    if (!formData.email || !formData.username || !formData.role || !formData.password || !formData.confirmPassword) {
      alert('Please fill all required fields');
      return;
    }
    if (!emailValid) {
      alert('Enter a valid email');
      return;
    }
    if (passwordStrength < 3) {
      alert('Password too weak');
      return;
    }
    if (!passwordsMatch) {
      alert('Passwords do not match');
      return;
    }
    if (!isLoaded) return;

    setLoading(true);
    try {
      // Create signup attempt
      await signUp.create({
        emailAddress: formData.email,
        password: formData.password,
        username: formData.username,
        unsafeMetadata: { role: formData.role }
      });

      // Send email verification
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });

      setStep('verify');
      console.log('Verification email sent');
    } catch (error) {
      console.error(error);
      alert('Signup failed: ' + (error.errors ? error.errors.map(e => e.message).join(', ') : error.message));
    } finally {
      setLoading(false);
    }
  };

  // ---- Handle Email Verification ----
  const handleVerification = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      alert('Enter 6-digit code');
      return;
    }
    if (!isLoaded) return;

    setVerificationLoading(true);
    try {
      if (signUp.missingFields?.includes('username')) {
        await signUp.update({
          username: formData.username,
          password: formData.password
        });
      }

      const completeSignUp = await signUp.attemptEmailAddressVerification({ code: verificationCode });
      if (completeSignUp.status === 'complete') {
        await setActive({ session: completeSignUp.createdSessionId });
        window.location.href = '/dashboard';
      }
    } catch (error) {
      console.error(error);
      alert('Verification failed. Check code or missing fields.');
    } finally {
      setVerificationLoading(false);
    }
  };

  // ---- Resend Verification Code ----
  const handleResendCode = async () => {
    setResendLoading(true);
    try {
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      alert('New verification code sent!');
    } catch (error) {
      console.error(error);
      alert('Failed to resend code.');
    } finally {
      setResendLoading(false);
    }
  };

  // ---- RENDER: Email Verification Step ----
  if (step === 'verify') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-black flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full mb-4">
              <FileText className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Plagio Guard</h1>
            {/* <p className="text-gray-600 dark:text-gray-400">Conference Management ToolKit</p> */}
          </div>

          <div className="bg-white dark:bg-gray-800 shadow-xl border-0 rounded-3xl overflow-hidden p-8">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full mb-4">
                <Mail className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Verify Your Email</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-2">We sent a verification code to</p>
              <p className="text-sm font-medium text-green-600 dark:text-green-400 mb-3">{formData.email}</p>
            </div>

            <div className="space-y-6">
              <input
                type="text"
                maxLength={6}
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter 6-digit code"
                className="w-full h-12 text-center text-2xl font-mono tracking-widest border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none"
              />
              <button
                onClick={handleVerification}
                disabled={verificationLoading || verificationCode.length !== 6}
                className="w-full h-12 text-base font-medium bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg transition-all flex items-center justify-center"
              >
                {verificationLoading ? 'Verifying...' : 'Verify Email'}
              </button>
              <button
                onClick={handleResendCode}
                disabled={resendLoading}
                className="w-full h-12 text-base font-medium bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-all"
              >
                {resendLoading ? 'Resending...' : 'Resend Code'}
              </button>
              <button
                onClick={() => setStep('signup')}
                className="w-full h-12 text-base font-medium bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-all flex items-center justify-center"
              >
                <ArrowLeft className="mr-2 w-4 h-4" /> Back to Signup
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-black flex items-center justify-center p-4">
      <Navbar/>
      <div className="w-full max-w-md my-20">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full mb-4">
            {/* <FileText className="w-8 h-8 text-green-600 dark:text-green-400" /> */}
            <img src='/PlagLogo.jpeg' className='bg-blur rounded-full ' ></img>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Plagio Guard
          </h1>
          {/* <p className="text-gray-600 dark:text-gray-400">
            Conference Management ToolKit
          </p> */}
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
            AI-Powered Plagiarism & Content Detection
          </p>
        </div>

        {/* Main Form Card */}
        <div className="bg-white dark:bg-gray-800 shadow-xl border-0 rounded-3xl overflow-hidden p-8">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full mb-4">
              <User className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Create Account
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Join the research community
            </p>
          </div>

          <div className="space-y-6">
            {/* Email Field */}
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
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Enter your email"
                  className={`w-full pl-10 pr-10 h-12 text-base border-2 rounded-lg transition-all duration-200 focus:outline-none ${
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

            {/* Username Field */}
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Username *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  id="username"
                  type="text"
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  placeholder="Choose a username"
                  className="w-full pl-10 h-12 text-base border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none transition-all duration-200"
                  required
                />
              </div>
            </div>

            {/* Role Selection */}
            <div className="space-y-2">
              <label htmlFor="role" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Role *
              </label>
              <select
                id="role"
                value={formData.role}
                onChange={(e) => handleInputChange('role', e.target.value)}
                className="w-full h-12 text-base border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none transition-all duration-200 px-3"
                required
              >
                <option value="">Select your role</option>
                <option value="researcher">🔬 Researcher</option>
                <option value="reviewer">📝 Reviewer</option>
                <option value="author">✍️ Author</option>
                <option value="editor">📋 Editor</option>
                <option value="admin">⚙️ Administrator</option>
              </select>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="Create a strong password"
                  className="w-full pl-10 pr-10 h-12 text-base border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none transition-all duration-200"
                  required
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 flex items-center justify-center rounded hover:bg-gray-100"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 text-gray-400" />
                  ) : (
                    <Eye className="w-4 h-4 text-gray-400" />
                  )}
                </button>
              </div>
              {formData.password && (
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
                    <li className={`flex items-center ${formData.password.length >= 8 ? 'text-green-600' : ''}`}>
                      <Check className={`w-3 h-3 mr-2 ${formData.password.length >= 8 ? 'text-green-600' : 'text-gray-400'}`} />
                      At least 8 characters
                    </li>
                    <li className={`flex items-center ${/[A-Z]/.test(formData.password) ? 'text-green-600' : ''}`}>
                      <Check className={`w-3 h-3 mr-2 ${/[A-Z]/.test(formData.password) ? 'text-green-600' : 'text-gray-400'}`} />
                      One uppercase letter
                    </li>
                    <li className={`flex items-center ${/[0-9]/.test(formData.password) ? 'text-green-600' : ''}`}>
                      <Check className={`w-3 h-3 mr-2 ${/[0-9]/.test(formData.password) ? 'text-green-600' : 'text-gray-400'}`} />
                      One number
                    </li>
                  </ul>
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Confirm Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  placeholder="Confirm your password"
                  className={`w-full pl-10 pr-10 h-12 text-base border-2 rounded-lg transition-all duration-200 focus:outline-none ${
                    formData.confirmPassword
                      ? passwordsMatch
                        ? 'border-green-500 focus:border-green-600'
                        : 'border-red-500 focus:border-red-600'
                      : 'border-gray-300 focus:border-green-500'
                  }`}
                  required
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 flex items-center justify-center rounded hover:bg-gray-100"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4 text-gray-400" />
                  ) : (
                    <Eye className="w-4 h-4 text-gray-400" />
                  )}
                </button>
                {formData.confirmPassword && passwordsMatch && (
                  <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
                    <Check className="w-4 h-4 text-green-500" />
                  </div>
                )}
              </div>
              {formData.confirmPassword && !passwordsMatch && (
                <p className="text-sm text-red-600 dark:text-red-400 flex items-center">
                  <X className="w-3 h-3 mr-1" />
                  Passwords do not match
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading || !emailValid || passwordStrength < 3 || !passwordsMatch}
              className="w-full h-12 text-base font-medium bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <a
              href="/sign-in"
              className="text-green-600 hover:text-green-500 dark:text-green-400 dark:hover:text-green-300 font-medium transition-colors"
            >
              Sign in
            </a>
          </p>
          <div className="flex items-center justify-center space-x-6 text-xs text-gray-500 dark:text-gray-400">
            <a href="/privacy" className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
              Privacy Policy
            </a>
            <a href="/terms" className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
              Terms of Service
            </a>
            <a href="/help" className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
              Help
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}