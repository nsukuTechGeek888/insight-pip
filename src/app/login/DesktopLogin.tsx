// app/login/DesktopLogin.tsx - UPDATED VERSION
'use client';

import Link from 'next/link';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  Zap, 
  TrendingUp, 
  Award,
  Star,
  Users,
  BarChart3,
  Shield,
  Check,
  X,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';

export default function DesktopLoginPage() {
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
  const { login } = useUser(); // FIXED: Correct function name

  function validate() {
    const newErrors: { [key: string]: string } = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
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
    // Clear general error on any input
    if (errors.general) {
      setErrors(prev => ({ ...prev, general: '' }));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    
    const validationErrors = validate();
    setErrors(validationErrors);
    
    if (Object.keys(validationErrors).length === 0) {
      try {
        // USE THE USERCONTEXT LOGIN FUNCTION
        const success = await login(formData.email, formData.password);
        
        if (success) {
          // Login successful
          setSubmitted(true);
          
          // Redirect to homepage after a brief delay
          setTimeout(() => {
            router.push('/');
          }, 1500);
        } else {
          // Handle backend errors
          setErrors({ 
            general: 'Invalid email or password. Please try again.' 
          });
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Login error:', error);
        setErrors({ general: 'Network error. Please try again.' });
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
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

  const features = [
    {
      icon: TrendingUp,
      title: "Track Your Progress",
      description: "Access your trading performance dashboard"
    },
    {
      icon: BarChart3,
      title: "Compare Strategies",
      description: "Review your saved comparisons and analyses"
    },
    {
      icon: Award,
      title: "Exclusive Content",
      description: "Access member-only insights and tools"
    },
    {
      icon: Users,
      title: "Community Access",
      description: "Connect with our trading community"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Forex Trader",
      text: "Insight Pip transformed how I analyze trading platforms. The comparison tools are incredible!",
      avatar: "SC"
    },
    {
      name: "Mike Rodriguez",
      role: "Prop Firm Trader",
      text: "Found my perfect prop firm match through Insight Pip. The community reviews are spot on.",
      avatar: "MR"
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative bg-gradient-to-br from-purple-900 via-blue-900 to-zinc-900 text-white py-16 px-6 text-center rounded-b-3xl shadow-lg border-b border-zinc-800 overflow-hidden"
      >
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="absolute top-0 left-0 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
        
        <div className="relative z-10 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-500/30 px-4 py-2 rounded-full text-blue-300 text-sm mb-6"
          >
            <Zap className="w-4 h-4" />
            Welcome Back Trader
          </motion.div>

          <h1 className="text-5xl sm:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Sign In
          </h1>
          <p className="text-xl sm:text-2xl max-w-2xl mx-auto mb-8 text-zinc-300">
            Access your personalized trading dashboard and continue your journey to success.
          </p>
        </div>
      </motion.section>

      {/* Stats Section */}
      <section className="py-12 bg-zinc-900 border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { number: "10K+", label: "Active Traders", icon: Users, color: "text-blue-400" },
              { number: "50+", label: "Platforms Tracked", icon: BarChart3, color: "text-purple-400" },
              { number: "4.8/5", label: "Satisfaction Rate", icon: Star, color: "text-yellow-400" },
              { number: "24/7", label: "Secure Access", icon: Shield, color: "text-green-400" }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.1 }}
                className="text-center p-6 bg-zinc-800/50 rounded-xl border border-zinc-700 hover:border-zinc-600 transition-all duration-300"
              >
                <stat.icon className={`w-8 h-8 ${stat.color} mx-auto mb-4`} />
                <div className="text-3xl font-bold text-white mb-2">{stat.number}</div>
                <div className="text-zinc-400">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Login Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="w-full"
          >
            <div className="bg-zinc-900 rounded-2xl p-8 border border-zinc-700 shadow-xl">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">
                  Welcome Back
                </h2>
                <p className="text-zinc-400">
                  Sign in to your Insight Pip account
                </p>
              </div>

              <AnimatePresence mode="wait">
                {submitted ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="text-center py-8"
                  >
                    <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <Check className="text-white" size={32} />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-4">
                      Login Successful!
                    </h3>
                    <p className="text-zinc-300 mb-6">
                      Redirecting you to your dashboard...
                    </p>
                    <div className="flex items-center justify-center gap-2 text-blue-400">
                      <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                      <span>Loading your data</span>
                    </div>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onSubmit={handleSubmit}
                    noValidate 
                    className="space-y-6"
                  >
                    {/* General Error Display */}
                    {errors.general && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-red-500/20 border border-red-500/30 text-red-400 p-4 rounded-xl flex items-center gap-2"
                      >
                        <X className="w-4 h-4 flex-shrink-0" />
                        <span>{errors.general}</span>
                      </motion.div>
                    )}

                    {/* Email */}
                    <div>
                      <label className="block mb-2 font-semibold text-white flex items-center gap-2">
                        <Mail className="w-4 h-4 text-blue-400" />
                        Email Address
                      </label>
                      <Input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="you@example.com"
                        className={`w-full bg-zinc-800 border-zinc-700 text-white rounded-xl h-12 ${
                          errors.email ? 'border-red-500' : 'hover:border-zinc-600'
                        }`}
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
                      <label className="block mb-2 font-semibold text-white flex items-center gap-2">
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
                          className={`w-full bg-zinc-800 border-zinc-700 text-white rounded-xl h-12 pr-10 ${
                            errors.password ? 'border-red-500' : 'hover:border-zinc-600'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-400 hover:text-white transition-colors"
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
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-4 rounded-xl text-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:transform-none disabled:hover:scale-100"
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2 justify-center">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Signing In...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 justify-center">
                          Sign In
                          <ArrowRight className="w-5 h-5" />
                        </div>
                      )}
                    </Button>

                    {/* Sign Up Link */}
                    <p className="text-center text-zinc-400">
                      Don't have an account?{' '}
                      <Link 
                        href="/signup" 
                        className="text-purple-400 font-semibold hover:text-purple-300 transition-colors inline-flex items-center gap-1"
                      >
                        Create one now
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </p>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Features & Testimonials Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-6"
          >
            {/* Features */}
            <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 rounded-2xl p-8 border border-purple-500/30">
              <h3 className="text-2xl font-bold text-white mb-6 text-center">
                What's Waiting For You
              </h3>
              
              <div className="space-y-4">
                {features.map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="flex items-start gap-4 p-4 bg-zinc-800/30 rounded-xl hover:bg-zinc-800/50 transition-colors group"
                  >
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      <feature.icon className="text-white" size={20} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white mb-1">{feature.title}</h4>
                      <p className="text-zinc-400 text-sm">{feature.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Testimonials */}
            <div className="space-y-4">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={testimonial.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="bg-zinc-900 rounded-2xl p-6 border border-zinc-700 hover:border-zinc-600 transition-colors"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">{testimonial.name}</h4>
                      <p className="text-zinc-400 text-sm">{testimonial.role}</p>
                    </div>
                  </div>
                  <p className="text-zinc-300 text-sm italic">
                    "{testimonial.text}"
                  </p>
                </motion.div>
              ))}
            </div>

            {/* Security Badge */}
            <div className="bg-gradient-to-br from-green-900/50 to-teal-900/50 rounded-2xl p-6 border border-green-500/30 text-center">
              <Shield className="w-12 h-12 text-green-400 mx-auto mb-3" />
              <h4 className="font-semibold text-white mb-2">Secure & Encrypted</h4>
              <p className="text-zinc-400 text-sm">
                Your data is protected with bank-level security encryption.
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <AnimatePresence>
        {showForgotModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            aria-modal="true"
            role="dialog"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowForgotModal(false);
                setForgotErrors('');
                setForgotEmail('');
                setForgotSuccess(false);
              }
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-zinc-900 rounded-2xl p-8 w-full max-w-md border border-zinc-700 shadow-2xl relative"
            >
              <button
                className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-zinc-800"
                onClick={() => {
                  setShowForgotModal(false);
                  setForgotErrors('');
                  setForgotEmail('');
                  setForgotSuccess(false);
                }}
                aria-label="Close modal"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Lock className="text-white" size={24} />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Reset Password</h2>
                <p className="text-zinc-400">
                  Enter your email to receive a password reset link
                </p>
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
                      <Check className="text-white" size={24} />
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