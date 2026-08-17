// components/auth/MobileLoginPage.tsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  ArrowLeft,
  CheckCircle2,
  X,
  Zap,
  Shield,
  Smartphone,
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';

export default function MobileLoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [submitted, setSubmitted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Forgot password modal state
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotErrors, setForgotErrors] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);

  const router = useRouter();
  const { login } = useUser(); // Get login function from context

  function validate() {
    const newErrors: { [key: string]: string } = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    return newErrors;
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    
    const validationErrors = validate();
    setErrors(validationErrors);
    
    if (Object.keys(validationErrors).length === 0) {
      try {
        // Use the context's login function which handles API call and state update
        const success = await login(formData.email, formData.password);
        
        if (success) {
          // Login successful
          setSubmitted(true);
          
          // Redirect to homepage after a brief delay
          setTimeout(() => {
            router.push('/');
          }, 1000);
        } else {
          // Login failed - error is already set in context, but we'll add a general error
          setErrors({ 
            general: 'Login failed. Please check your credentials.' 
          });
        }
      } catch (error) {
        console.error('Login error:', error);
        setErrors({ general: 'Network error. Please try again.' });
      }
    }
    
    setIsLoading(false);
  }

  // Forgot password validation & submission
  async function handleForgotSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      setForgotErrors('Email is required');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(forgotEmail)) {
      setForgotErrors('Please enter a valid email address');
      return;
    }

    setForgotErrors('');
    setForgotSuccess(true);

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    setShowForgotModal(false);
    setForgotEmail('');
    setForgotSuccess(false);
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-black/80 backdrop-blur-lg border-b border-zinc-800 px-4 py-3">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.back()}
            className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} className="text-white" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-white">Sign In</h1>
            <p className="text-zinc-400 text-sm">Welcome back to InsightPip</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 py-6">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Zap size={24} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Welcome Back
          </h2>
          <p className="text-zinc-400">
            Sign in to access your trading dashboard
          </p>
        </motion.div>

        {/* Login Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800"
        >
          <AnimatePresence>
            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="text-white" size={32} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  Login Successful!
                </h3>
                <p className="text-zinc-300 mb-4">
                  Redirecting to your dashboard...
                </p>
                <div className="flex items-center justify-center gap-2 text-blue-400">
                  <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm">Loading your data</span>
                </div>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="space-y-5">
                {/* General Error Display */}
                {errors.general && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-500/20 border border-red-500/30 text-red-400 p-4 rounded-xl"
                  >
                    <div className="flex items-center gap-2">
                      <X className="w-4 h-4" />
                      {errors.general}
                    </div>
                  </motion.div>
                )}

                {/* Email */}
                <div>
                  <label className="block mb-2 font-medium text-white flex items-center gap-2">
                    <Mail className="w-4 h-4 text-blue-400" />
                    Email Address
                  </label>
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    disabled={isLoading}
                    className={`w-full bg-zinc-800 border-zinc-700 text-white rounded-xl h-12 ${
                      errors.email ? 'border-red-500' : 'hover:border-zinc-600'
                    } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  />
                  {errors.email && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-400 text-sm mt-2 flex items-center gap-1"
                    >
                      <X className="w-4 h-4" />
                      {errors.email}
                    </motion.p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label className="block mb-2 font-medium text-white flex items-center gap-2">
                    <Lock className="w-4 h-4 text-purple-400" />
                    Password
                  </label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                      disabled={isLoading}
                      className={`w-full bg-zinc-800 border-zinc-700 text-white rounded-xl h-12 pr-10 ${
                        errors.password ? 'border-red-500' : 'hover:border-zinc-600'
                      } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-400 hover:text-white transition-colors disabled:opacity-50"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {errors.password && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-400 text-sm mt-2 flex items-center gap-1"
                    >
                      <X className="w-4 h-4" />
                      {errors.password}
                    </motion.p>
                  )}
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-zinc-300 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-purple-600 bg-zinc-700 border-zinc-600 rounded focus:ring-purple-500 focus:ring-2"
                    />
                    <span className="text-sm">Remember me</span>
                  </label>
                  
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(true)}
                    className="text-sm text-purple-400 hover:text-purple-300 transition-colors font-medium"
                  >
                    Forgot Password?
                  </button>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-4 rounded-xl text-base transition-all duration-200 disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2 justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Signing In...
                    </div>
                  ) : (
                    'Sign In'
                  )}
                </Button>

                {/* Sign Up Link */}
                <p className={`text-center text-zinc-400 text-sm ${isLoading ? 'opacity-50' : ''}`}>
                  Don't have an account?{' '}
                  <Link 
                    href="/signup" 
                    className={`text-purple-400 font-semibold hover:text-purple-300 transition-colors ${isLoading ? 'pointer-events-none' : ''}`}
                  >
                    Create one now
                  </Link>
                </p>
              </form>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-3 gap-3 mt-6"
        >
          <div className="bg-zinc-900 rounded-xl p-3 text-center border border-zinc-800">
            <div className="text-white font-bold text-sm">10K+</div>
            <div className="text-zinc-400 text-xs">Traders</div>
          </div>
          <div className="bg-zinc-900 rounded-xl p-3 text-center border border-zinc-800">
            <div className="text-white font-bold text-sm">99.9%</div>
            <div className="text-zinc-400 text-xs">Uptime</div>
          </div>
          <div className="bg-zinc-900 rounded-xl p-3 text-center border border-zinc-800">
            <div className="text-white font-bold text-sm">256-bit</div>
            <div className="text-zinc-400 text-xs">Security</div>
          </div>
        </motion.div>

        {/* Security Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-green-900/50 to-teal-900/50 rounded-2xl p-4 border border-green-500/30 text-center mt-6"
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <Shield className="w-5 h-5 text-green-400" />
            <span className="text-white font-semibold text-sm">Secure & Encrypted</span>
          </div>
          <p className="text-zinc-400 text-xs">
            Your data is protected with bank-level security
          </p>
        </motion.div>
      </div>

      {/* Forgot Password Modal */}
      <AnimatePresence>
        {showForgotModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-50 p-4 flex items-center justify-center"
            aria-modal="true"
            role="dialog"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-zinc-900 rounded-2xl p-6 w-full max-w-sm border border-zinc-700 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-bold text-white">Reset Password</h2>
                  <p className="text-zinc-400 text-sm">
                    Enter your email to receive a reset link
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowForgotModal(false);
                    setForgotErrors('');
                    setForgotEmail('');
                    setForgotSuccess(false);
                  }}
                  className="text-zinc-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-zinc-800"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <AnimatePresence mode="wait">
                {!forgotSuccess ? (
                  <motion.form
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onSubmit={handleForgotSubmit}
                    noValidate
                    className="space-y-4"
                  >
                    <div>
                      <Input
                        type="email"
                        value={forgotEmail}
                        onChange={(e) => {
                          setForgotEmail(e.target.value);
                          setForgotErrors('');
                        }}
                        placeholder="you@example.com"
                        className={`w-full bg-zinc-800 border-zinc-700 text-white rounded-xl h-12 ${
                          forgotErrors ? 'border-red-500' : 'hover:border-zinc-600'
                        }`}
                        required
                      />
                      {forgotErrors && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-red-400 text-sm mt-2 flex items-center gap-1"
                        >
                          <X className="w-4 h-4" />
                          {forgotErrors}
                        </motion.p>
                      )}
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-bold py-3 rounded-xl"
                    >
                      Send Reset Link
                    </Button>
                  </motion.form>
                ) : (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-4"
                  >
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="text-white" size={24} />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      Check Your Email
                    </h3>
                    <p className="text-zinc-300 text-sm">
                      If this email exists in our system, you'll receive a password reset link shortly.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}