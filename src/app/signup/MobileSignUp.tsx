// app/signup/page.tsx
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
  User,
  Star,
  Users,
  BarChart3,
  Award,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';

export default function MobileSignUpPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [submitted, setSubmitted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string>('');

  const router = useRouter();
  const { login } = useUser(); // Get login function from context

  // Password strength indicator
  const getPasswordStrength = (password: string) => {
    if (!password) return { strength: 0, text: '', color: '' };
    
    let strength = 0;
    if (password.length >= 6) strength += 1;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;

    const strengths = [
      { text: 'Very Weak', color: 'bg-red-500' },
      { text: 'Weak', color: 'bg-orange-500' },
      { text: 'Fair', color: 'bg-yellow-500' },
      { text: 'Good', color: 'bg-blue-500' },
      { text: 'Strong', color: 'bg-green-500' },
      { text: 'Very Strong', color: 'bg-green-600' }
    ];

    return { ...strengths[strength], strength };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  // Validation function
  function validate() {
    const newErrors: { [key: string]: string } = {};
    setApiError(''); // Clear API errors on new validation

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Name must be at least 2 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    } else if (passwordStrength.strength < 2) {
      newErrors.password = 'Please choose a stronger password';
    }

    if (formData.confirmPassword !== formData.password) {
      newErrors.confirmPassword = "Passwords don't match";
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
    
    // Clear API error on any input change
    if (apiError) {
      setApiError('');
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setApiError('');
    
    const validationErrors = validate();
    setErrors(validationErrors);
    
    if (Object.keys(validationErrors).length === 0) {
      try {
        console.log('📤 Sending registration request...', {
          email: formData.email,
          fullName: formData.fullName,
          passwordLength: formData.password.length
        });

        // API call with better error handling
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            email: formData.email.trim(),
            password: formData.password,
            fullName: formData.fullName.trim() // Send as fullName, backend will handle both
          })
        });

        console.log('📥 Response status:', response.status);
        
        const data = await response.json();
        console.log('📥 Response data:', data);

        if (response.ok) {
          // Signup successful
          console.log('✅ Registration successful:', data);
          
          // Auto-login the user after successful registration
          const loginSuccess = await login(formData.email, formData.password);
          
          if (loginSuccess) {
            // Both registration and login successful
            setSubmitted(true);
            
            // Redirect to homepage after 2 seconds
            setTimeout(() => {
              router.push('/');
            }, 2000);
          } else {
            // Registration succeeded but auto-login failed
            setSubmitted(true);
            
            // Redirect to login page after 2 seconds
            setTimeout(() => {
              router.push('/login?registered=true');
            }, 2000);
          }
        } else {
          // Handle backend errors
          console.error('❌ Registration failed:', data);
          
          if (data.error) {
            // Check for specific error messages
            if (data.error.includes('already exists')) {
              setErrors({ email: 'An account with this email already exists' });
            } else if (data.error.includes('email')) {
              setErrors({ email: data.error });
            } else if (data.error.includes('password')) {
              setErrors({ password: data.error });
            } else if (data.error.includes('name')) {
              setErrors({ fullName: data.error });
            } else {
              setApiError(data.error || 'Registration failed. Please try again.');
            }
          } else {
            setApiError('An unexpected error occurred. Please try again.');
          }
        }
      } catch (error) {
        console.error('💥 Network error:', error);
        setApiError('Network error. Please check your connection and try again.');
      }
    }
    
    setIsLoading(false);
  }

  const features = [
    {
      icon: BarChart3,
      title: "Compare Platforms",
      description: "Side-by-side broker comparisons"
    },
    {
      icon: Award,
      title: "Exclusive Offers",
      description: "Special promotions and deals"
    },
    {
      icon: Users,
      title: "Join Community",
      description: "Connect with traders worldwide"
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-black/80 backdrop-blur-lg border-b border-zinc-800 px-4 py-3">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.back()}
            className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
            disabled={isLoading}
          >
            <ArrowLeft size={20} className="text-white" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-white">Create Account</h1>
            <p className="text-zinc-400 text-sm">Join InsightPip today</p>
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
            Start Your Journey
          </h2>
          <p className="text-zinc-400">
            Create your account and unlock powerful trading tools
          </p>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-3 mb-6"
        >
          <div className="bg-zinc-900 rounded-xl p-3 text-center border border-zinc-800">
            <div className="text-white font-bold text-sm">10K+</div>
            <div className="text-zinc-400 text-xs">Traders</div>
          </div>
          <div className="bg-zinc-900 rounded-xl p-3 text-center border border-zinc-800">
            <div className="text-white font-bold text-sm">50+</div>
            <div className="text-zinc-400 text-xs">Platforms</div>
          </div>
          <div className="bg-zinc-900 rounded-xl p-3 text-center border border-zinc-800">
            <div className="text-white font-bold text-sm">4.8/5</div>
            <div className="text-zinc-400 text-xs">Rating</div>
          </div>
        </motion.div>

        {/* Sign Up Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800"
        >
          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="text-center py-8"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="text-white" size={32} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  Welcome to Insight Pip!
                </h3>
                <p className="text-zinc-300 mb-4">
                  Your account has been created successfully.
                </p>
                <div className="flex items-center justify-center gap-2 text-blue-400">
                  <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm">Redirecting to dashboard...</span>
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
                className="space-y-5"
              >
                {/* API Error Display */}
                {apiError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-500/20 border border-red-500/30 text-red-400 p-4 rounded-xl"
                  >
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-sm font-medium">{apiError}</span>
                    </div>
                  </motion.div>
                )}

                {/* Full Name */}
                <div>
                  <label className="block mb-2 font-medium text-white flex items-center gap-2">
                    <User className="w-4 h-4 text-blue-400" />
                    Full Name
                  </label>
                  <Input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    disabled={isLoading}
                    className={`w-full bg-zinc-800 border-zinc-700 text-white rounded-xl h-12 ${
                      errors.fullName ? 'border-red-500' : 'hover:border-zinc-600'
                    } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  />
                  {errors.fullName && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-400 text-sm mt-2 flex items-center gap-1"
                    >
                      <X className="w-4 h-4" />
                      {errors.fullName}
                    </motion.p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block mb-2 font-medium text-white flex items-center gap-2">
                    <Mail className="w-4 h-4 text-purple-400" />
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
                    <Lock className="w-4 h-4 text-green-400" />
                    Password
                  </label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Create a strong password"
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
                  
                  {/* Password Strength Indicator */}
                  {formData.password && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-3"
                    >
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-zinc-400">Password strength</span>
                        <span className={`font-medium ${
                          passwordStrength.strength >= 4 ? 'text-green-400' :
                          passwordStrength.strength >= 3 ? 'text-blue-400' :
                          passwordStrength.strength >= 2 ? 'text-yellow-400' :
                          'text-red-400'
                        }`}>
                          {passwordStrength.text}
                        </span>
                      </div>
                      <div className="w-full bg-zinc-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                          style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                        />
                      </div>
                    </motion.div>
                  )}

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

                {/* Confirm Password */}
                <div>
                  <label className="block mb-2 font-medium text-white">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm your password"
                      disabled={isLoading}
                      className={`w-full bg-zinc-800 border-zinc-700 text-white rounded-xl h-12 pr-10 ${
                        errors.confirmPassword ? 'border-red-500' : 'hover:border-zinc-600'
                      } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      disabled={isLoading}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-400 hover:text-white transition-colors disabled:opacity-50"
                    >
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-400 text-sm mt-2 flex items-center gap-1"
                    >
                      <X className="w-4 h-4" />
                      {errors.confirmPassword}
                    </motion.p>
                  )}
                </div>

                {/* Terms Agreement */}
                <div className={`flex items-start gap-3 p-4 bg-zinc-800/50 rounded-xl ${isLoading ? 'opacity-50' : ''}`}>
                  <input
                    type="checkbox"
                    required
                    disabled={isLoading}
                    className="mt-1 w-4 h-4 text-purple-600 bg-zinc-700 border-zinc-600 rounded focus:ring-purple-500 focus:ring-2 disabled:opacity-50"
                  />
                  <div className="text-sm text-zinc-300">
                    I agree to the{' '}
                    <Link href="/terms" className="text-purple-400 hover:text-purple-300 underline">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link href="/privacy" className="text-purple-400 hover:text-purple-300 underline">
                      Privacy Policy
                    </Link>
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-4 rounded-xl text-base transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2 justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Creating Account...
                    </div>
                  ) : (
                    'Create Account'
                  )}
                </Button>

                {/* Login Link */}
                <p className={`text-center text-zinc-400 text-sm ${isLoading ? 'opacity-50' : ''}`}>
                  Already have an account?{' '}
                  <Link 
                    href="/login" 
                    className={`text-purple-400 font-semibold hover:text-purple-300 transition-colors ${isLoading ? 'pointer-events-none' : ''}`}
                  >
                    Sign in here
                  </Link>
                </p>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4 mt-6"
        >
          <h3 className="text-lg font-bold text-white text-center">Why Join Insight Pip?</h3>
          
          <div className="space-y-3">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="flex items-center gap-4 p-4 bg-zinc-900 rounded-xl border border-zinc-800"
              >
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <feature.icon className="text-white" size={20} />
                </div>
                <div>
                  <h4 className="font-semibold text-white text-sm">{feature.title}</h4>
                  <p className="text-zinc-400 text-xs">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Testimonial */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800 mt-6"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
              TS
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm">Thomas S.</h4>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                ))}
              </div>
            </div>
          </div>
          <p className="text-zinc-300 text-xs italic">
            "Insight Pip helped me compare prop firms and find the perfect match for my trading style. The community insights are invaluable!"
          </p>
        </motion.div>

        {/* Security Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gradient-to-br from-green-900/50 to-teal-900/50 rounded-2xl p-4 border border-green-500/30 text-center mt-6"
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <Shield className="w-5 h-5 text-green-400" />
            <span className="text-white font-semibold text-sm">Bank-Level Security</span>
          </div>
          <p className="text-zinc-400 text-xs">
            Your data is encrypted and protected with enterprise-grade security
          </p>
        </motion.div>
      </div>
    </div>
  );
}