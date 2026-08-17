// app/signup/DesktopSignUp.tsx - UPDATED WITH REGION SUPPORT

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRegion } from '@/contexts/RegionContext';
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  User,
  Zap, 
  Shield,
  Check,
  X,
  ArrowRight,
  Star,
  Users,
  BarChart3,
  Award,
  AlertCircle,
  Globe
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';

// Region display info
const REGION_DISPLAY: Record<string, { label: string; flag: string }> = {
  SA: { label: 'South Africa', flag: '🇿🇦' },
  EU: { label: 'Europe', flag: '🇪🇺' },
  UK: { label: 'United Kingdom', flag: '🇬🇧' },
  UAE: { label: 'UAE', flag: '🇦🇪' },
  KE: { label: 'Kenya', flag: '🇰🇪' },
  AU: { label: 'Australia', flag: '🇦🇺' },
  SG: { label: 'Singapore', flag: '🇸🇬' },
  US: { label: 'United States', flag: '🇺🇸' },
  CA: { label: 'Canada', flag: '🇨🇦' },
  MU: { label: 'Mauritius', flag: '🇲🇺' },
  SC: { label: 'Seychelles', flag: '🇸🇨' },
  BVI: { label: 'BVI', flag: '🇻🇬' },
  NZ: { label: 'New Zealand', flag: '🇳🇿' },
  HK: { label: 'Hong Kong', flag: '🇭🇰' },
  IN: { label: 'India', flag: '🇮🇳' },
  BR: { label: 'Brazil', flag: '🇧🇷' },
  MX: { label: 'Mexico', flag: '🇲🇽' },
  NG: { label: 'Nigeria', flag: '🇳🇬' },
  GH: { label: 'Ghana', flag: '🇬🇭' },
  TZ: { label: 'Tanzania', flag: '🇹🇿' },
  ZW: { label: 'Zimbabwe', flag: '🇿🇼' },
  GLOBAL: { label: 'Global', flag: '🌍' },
};

export default function DesktopSignUpPage() {
  const { region } = useRegion(); // ✅ ADDED REGION
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
  const [agreeTerms, setAgreeTerms] = useState(false);

  const router = useRouter();
  const { login } = useUser();

  // Get region info for display
  const regionInfo = REGION_DISPLAY[region] || REGION_DISPLAY['GLOBAL'];

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

  function validate() {
    const newErrors: { [key: string]: string } = {};
    setApiError('');

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
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    if (apiError) {
      setApiError('');
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!agreeTerms) {
      setApiError('Please agree to the Terms of Service and Privacy Policy');
      return;
    }

    setIsLoading(true);
    setApiError('');
    
    const validationErrors = validate();
    setErrors(validationErrors);
    
    if (Object.keys(validationErrors).length === 0) {
      try {
        console.log('📤 Sending registration request for region:', region);

        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            email: formData.email.trim(),
            password: formData.password,
            fullName: formData.fullName.trim(),
            region: region // ✅ SEND REGION
          })
        });

        // Try to parse the response, but handle empty responses
        let data = {};
        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.includes('application/json')) {
          try {
            data = await response.json();
            console.log('📥 Response data:', data);
          } catch (parseError) {
            console.error('❌ Failed to parse JSON response:', parseError);
            if (response.ok) {
              data = { success: true };
            } else {
              data = { error: 'Invalid server response' };
            }
          }
        } else {
          const text = await response.text();
          console.log('📥 Response text:', text);
          
          if (response.ok) {
            data = { success: true };
          } else {
            data = { error: text || 'Registration failed' };
          }
        }

        if (response.ok) {
          console.log('✅ Registration successful for region:', region);
          
          const loginSuccess = await login(formData.email, formData.password);
          
          if (loginSuccess) {
            setSubmitted(true);
            setTimeout(() => {
              router.push('/');
            }, 2000);
          } else {
            setSubmitted(true);
            setTimeout(() => {
              router.push('/login?registered=true');
            }, 2000);
          }
        } else {
          console.error('❌ Registration failed:', data);
          
          const errorMessage = (data as any).error || 
                              (data as any).message || 
                              'Registration failed. Please try again.';
          
          if (errorMessage.toLowerCase().includes('already exists') || 
              errorMessage.toLowerCase().includes('already registered')) {
            setErrors({ email: 'An account with this email already exists' });
          } else if (errorMessage.toLowerCase().includes('email')) {
            setErrors({ email: errorMessage });
          } else if (errorMessage.toLowerCase().includes('password')) {
            setErrors({ password: errorMessage });
          } else if (errorMessage.toLowerCase().includes('name')) {
            setErrors({ fullName: errorMessage });
          } else {
            setApiError(errorMessage);
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
      description: "Side-by-side broker and prop firm comparisons in your region"
    },
    {
      icon: Award,
      title: "Exclusive Offers",
      description: `Access special promotions and deals available in ${regionInfo.flag} ${regionInfo.label}`
    },
    {
      icon: Users,
      title: "Join Community",
      description: `Connect with traders in ${regionInfo.flag} ${regionInfo.label} and worldwide`
    },
    {
      icon: Star,
      title: "Real Reviews",
      description: `Read authentic trader experiences from ${regionInfo.flag} ${regionInfo.label}`
    }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Forex Trader",
      text: `Insight Pip transformed how I analyze trading platforms available in ${regionInfo.label}. The comparison tools are incredible!`,
      avatar: "SC"
    },
    {
      name: "Mike Rodriguez",
      role: "Prop Firm Trader",
      text: `Found my perfect prop firm match available in ${regionInfo.label} through Insight Pip. The community reviews are spot on.`,
      avatar: "MR"
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* ✅ Region Banner */}
      <div className="bg-zinc-900/50 border-b border-zinc-800 px-4 py-2 text-center">
        <p className="text-xs text-zinc-400">
          You are signing up from <span className="text-white font-medium">{regionInfo.flag} {regionInfo.label}</span>
          {' '}<span className="text-zinc-500">•</span>{' '}
          <button
            onClick={() => {
              const regionSelector = document.querySelector('[data-region-selector]');
              if (regionSelector) {
                (regionSelector as HTMLElement).click();
              }
            }}
            className="text-purple-400 hover:text-purple-300 transition-colors"
          >
            Change region
          </button>
        </p>
      </div>

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
            Join the Community in {regionInfo.flag} {regionInfo.label}
          </motion.div>

          <h1 className="text-5xl sm:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Create Account
          </h1>
          <p className="text-xl sm:text-2xl max-w-2xl mx-auto mb-8 text-zinc-300">
            Start your journey to smarter trading decisions today in {regionInfo.flag} {regionInfo.label}.
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
          {/* Sign Up Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="w-full"
          >
            <div className="bg-zinc-900 rounded-2xl p-8 border border-zinc-700 shadow-xl">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">
                  Get Started Free
                </h2>
                <p className="text-zinc-400">
                  Create your account in less than 2 minutes from {regionInfo.flag} {regionInfo.label}
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
                      Welcome to Insight Pip!
                    </h3>
                    <p className="text-zinc-300 mb-6">
                      Your account has been created successfully in {regionInfo.flag} {regionInfo.label}.
                    </p>
                    <div className="flex items-center justify-center gap-2 text-blue-400">
                      <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                      <span>Redirecting to dashboard...</span>
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
                    {/* API Error Display */}
                    {apiError && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-red-500/20 border border-red-500/30 text-red-400 p-4 rounded-xl flex items-center gap-2"
                      >
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <span>{apiError}</span>
                      </motion.div>
                    )}

                    {/* Full Name */}
                    <div>
                      <label className="block mb-2 font-semibold text-white flex items-center gap-2">
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
                      <label className="block mb-2 font-semibold text-white flex items-center gap-2">
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
                      <label className="block mb-2 font-semibold text-white flex items-center gap-2">
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
                      <label className="block mb-2 font-semibold text-white">
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
                    <div className="flex items-start gap-3 p-4 bg-zinc-800/50 rounded-xl">
                      <input
                        type="checkbox"
                        id="terms"
                        checked={agreeTerms}
                        onChange={(e) => setAgreeTerms(e.target.checked)}
                        disabled={isLoading}
                        className="mt-1 w-4 h-4 text-purple-600 bg-zinc-700 border-zinc-600 rounded focus:ring-purple-500 focus:ring-2 disabled:opacity-50"
                      />
                      <label htmlFor="terms" className="text-sm text-zinc-300">
                        I agree to the{' '}
                        <Link href="/terms" className="text-purple-400 hover:text-purple-300 underline">
                          Terms of Service
                        </Link>{' '}
                        and{' '}
                        <Link href="/privacy" className="text-purple-400 hover:text-purple-300 underline">
                          Privacy Policy
                        </Link>
                      </label>
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
                          Creating Account in {regionInfo.flag} {regionInfo.label}...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 justify-center">
                          Create Account in {regionInfo.flag} {regionInfo.label}
                          <ArrowRight className="w-5 h-5" />
                        </div>
                      )}
                    </Button>

                    {/* Login Link */}
                    <p className="text-center text-zinc-400">
                      Already have an account?{' '}
                      <Link 
                        href="/login" 
                        className="text-purple-400 font-semibold hover:text-purple-300 transition-colors inline-flex items-center gap-1"
                      >
                        Sign in here
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
                What You'll Get in {regionInfo.flag} {regionInfo.label}
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
              <h4 className="font-semibold text-white mb-2">Bank-Level Security</h4>
              <p className="text-zinc-400 text-sm">
                Your data is encrypted and protected with enterprise-grade security in {regionInfo.flag} {regionInfo.label}.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}