import { useState, useEffect, useCallback, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "../../Utils/axiosApi";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon, MailIcon, LockIcon } from "../../icons";
import { AlertCircle, Key } from "lucide-react";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import { useAdminAuth } from "../../context/adminAuthContext";

export default function ForgotPassword() {
  const [step, setStep] = useState(1); // 1: email, 2: OTP, 3: reset password
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [emailStatus, setEmailStatus] = useState(null); // null, 'checking', 'available', 'unavailable', 'error'
  const [emailDetails, setEmailDetails] = useState(null);
  const checkTimeoutRef = useRef(null);
  const axiosCancelToken = useRef(null);

  const { sendOtp, verifyOtp, resetPassword, loading, error } = useAdminAuth();
  const navigate = useNavigate();

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);
    
    const handleChange = () => setReducedMotion(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Function to check email availability using axios
  const checkEmailAvailability = useCallback(async (emailToCheck) => {
    if (!emailToCheck || !/\S+@\S+\.\S+/.test(emailToCheck)) {
      setEmailStatus(null);
      setEmailDetails(null);
      return;
    }

    // Cancel previous request if exists
    if (axiosCancelToken.current) {
      if (typeof axiosCancelToken.current === 'function') {
        axiosCancelToken.current("Operation canceled due to new request.");
      } else if (axiosCancelToken.current.cancel) {
        axiosCancelToken.current.cancel("Operation canceled due to new request.");
      }
    }

    // Create cancel token for this request
    const source = axios.CancelToken ? axios.CancelToken.source() : null;
    axiosCancelToken.current = source;

    setIsCheckingEmail(true);
    setEmailStatus('checking');
    
    try {
      const config = {
        params: { 
          email: emailToCheck.toLowerCase().trim() 
        },
        timeout: 10000,
      };
      
      // Add cancel token only if it exists
      if (source) {
        config.cancelToken = source.token;
      }
      
      const response = await axios.get("/api/auth/check-availability", config);
      console.log("Email check response:", response.data);
      
      const data = response.data;
      
      if (data.success) {
        if (data.exists) {
          setEmailStatus('unavailable');
          setEmailDetails(data.data);
          setSuccessMsg(`This email is registered as ${data.foundIn}. You can proceed with password reset.`);
          setTimeout(() => setSuccessMsg(""), 5000);
        } else {
          setEmailStatus('available');
          setEmailDetails(null);
        }
      } else {
        setEmailStatus('error');
        setEmailDetails(null);
        setSuccessMsg(data.message || "Error checking email availability");
        setTimeout(() => setSuccessMsg(""), 5000);
      }
    } catch (err) {
      // Check if the error is from cancellation
      if (axios.isCancel && axios.isCancel(err)) {
        console.log('Request canceled:', err.message);
        return;
      } else if (err.name === 'CanceledError' || err.message?.includes('canceled')) {
        console.log('Request canceled');
        return;
      }
      
      console.error('Email availability check error:', err);
      
      if (err.response) {
        // Server responded with error status
        console.error('Response error:', err.response.status, err.response.data);
        setEmailStatus('error');
        setEmailDetails(null);
        setSuccessMsg(err.response.data?.message || "Server error checking email");
        setTimeout(() => setSuccessMsg(""), 5000);
      } else if (err.request) {
        // No response received
        console.error('Network error:', err.message);
        setEmailStatus('error');
        setEmailDetails(null);
        setSuccessMsg("Network error. Please check your connection.");
        setTimeout(() => setSuccessMsg(""), 5000);
      } else {
        // Request setup error
        console.error('Request setup error:', err.message);
        setEmailStatus('error');
        setEmailDetails(null);
      }
    } finally {
      setIsCheckingEmail(false);
    }
  }, []);

  // Cleanup function for axios cancellation
  useEffect(() => {
    return () => {
      if (axiosCancelToken.current) {
        if (typeof axiosCancelToken.current === 'function') {
          axiosCancelToken.current("Component unmounted");
        } else if (axiosCancelToken.current.cancel) {
          axiosCancelToken.current.cancel("Component unmounted");
        }
      }
    };
  }, []);

  // Debounced email check on change
  useEffect(() => {
    if (checkTimeoutRef.current) {
      clearTimeout(checkTimeoutRef.current);
    }

    // Reset status when email is cleared or invalid
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setEmailStatus(null);
      setEmailDetails(null);
      return;
    }

    checkTimeoutRef.current = setTimeout(() => {
      checkEmailAvailability(email);
    }, 500); // Debounce for 500ms

    return () => {
      if (checkTimeoutRef.current) {
        clearTimeout(checkTimeoutRef.current);
      }
    };
  }, [email, checkEmailAvailability]);

  // Handle OTP input change
  const handleOtpChange = (index, value) => {
    // Only allow numbers
    if (!/^\d*$/.test(value)) return;
    
    if (value.length > 1) {
      // If user pastes multiple digits, handle them
      const digits = value.split('');
      const newOtp = [...otp];
      digits.forEach((digit, i) => {
        if (index + i < 6) {
          newOtp[index + i] = digit;
        }
      });
      setOtp(newOtp);
      
      // Focus on the last input if we pasted multiple digits
      const lastIndex = Math.min(index + digits.length - 1, 5);
      const lastInput = document.getElementById(`otp-${lastIndex}`);
      if (lastInput) lastInput.focus();
    } else {
      // Single digit input
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      
      // Auto-focus next input
      if (value && index < 5) {
        const nextInput = document.getElementById(`otp-${index + 1}`);
        if (nextInput) {
          setTimeout(() => nextInput.focus(), 10);
        }
      }
    }
  };

  // Handle OTP paste
  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').trim();
    const digits = pasteData.split('').filter(char => /^\d+$/.test(char)).slice(0, 6);
    
    if (digits.length === 6) {
      setOtp(digits);
      // Focus on the last input
      setTimeout(() => {
        const lastInput = document.getElementById(`otp-5`);
        if (lastInput) lastInput.focus();
      }, 10);
    }
  };

  // Handle OTP key down for navigation
  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'ArrowRight' && index < 5) {
      e.preventDefault();
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    } else if (e.key === 'Backspace' && !otp[index] && index > 0) {
      e.preventDefault();
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) {
        prevInput.focus();
        // Clear the previous input value
        const newOtp = [...otp];
        newOtp[index - 1] = '';
        setOtp(newOtp);
      }
    } else if (e.key === 'Delete' && !otp[index] && index < 5) {
      e.preventDefault();
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  // Countdown timer for OTP resend
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  // Step 1: Send OTP (only if email exists)
  const handleSendOtp = useCallback(async (e) => {
    e.preventDefault();
    
    // Validate email format
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setSuccessMsg("Please enter a valid email address");
      setTimeout(() => setSuccessMsg(""), 3000);
      return;
    }

    // If email doesn't exist in system, show appropriate message
    if (emailStatus === 'unavailable') {
      // Email exists, proceed with OTP
      try {
        // Clear any existing success/error messages
        setSuccessMsg("");
        
        // Call sendOtp function
        const result = await sendOtp(email);
        
        console.log("Send OTP result:", result);
        
        if (result) {
          // If sendOtp returns a success message
          setSuccessMsg(result || "OTP sent successfully! Check your email.");
          setTimeout(() => setSuccessMsg(""), 3000);
          
          // Move to step 2
          setStep(2);
          setCountdown(30); // 30 seconds cooldown
          
          // Clear OTP fields
          setOtp(["", "", "", "", "", ""]);
        } else {
          // If sendOtp doesn't return anything but didn't throw error
          setSuccessMsg("OTP sent successfully! Check your email.");
          setTimeout(() => setSuccessMsg(""), 3000);
          setStep(2);
          setCountdown(30);
          setOtp(["", "", "", "", "", ""]);
        }
      } catch (err) {
        console.error("Send OTP error:", err);
        setSuccessMsg(err.response?.data?.message || err.message || "Failed to send OTP. Please try again.");
        setTimeout(() => setSuccessMsg(""), 5000);
      }
    } else if (emailStatus === 'available') {
      // Email doesn't exist in system
      setSuccessMsg("This email is not registered in our system. Please contact the administrator.");
      setTimeout(() => setSuccessMsg(""), 5000);
      return;
    } else if (emailStatus === 'error') {
      setSuccessMsg("Unable to verify email. Please try again or contact administrator.");
      setTimeout(() => setSuccessMsg(""), 5000);
      return;
    } else if (emailStatus === 'checking') {
      setSuccessMsg("Please wait while we check your email...");
      setTimeout(() => setSuccessMsg(""), 3000);
      return;
    } else {
      setSuccessMsg("Please enter your email address first");
      setTimeout(() => setSuccessMsg(""), 3000);
    }
  }, [email, emailStatus, sendOtp]);

  // Step 2: Verify OTP
  const handleVerifyOtp = useCallback(async (e) => {
    e.preventDefault();
    const otpString = otp.join('');
    
    // Validate OTP
    if (otpString.length !== 6) {
      setSuccessMsg("Please enter all 6 digits of the OTP");
      setTimeout(() => setSuccessMsg(""), 3000);
      return;
    }
    
    if (!/^\d{6}$/.test(otpString)) {
      setSuccessMsg("OTP must contain only numbers");
      setTimeout(() => setSuccessMsg(""), 3000);
      return;
    }
    
    try {
      // Clear any existing messages
      setSuccessMsg("");
      
      // Call verifyOtp function
      const msg = await verifyOtp(otpString);
      
      console.log("Verify OTP result:", msg);
      
      if (msg) {
        setSuccessMsg(msg);
        setTimeout(() => {
          setSuccessMsg("");
          setStep(3);
        }, 1500);
      } else {
        // If verifyOtp returns falsy value but didn't throw error
        setSuccessMsg("OTP verified successfully!");
        setTimeout(() => {
          setSuccessMsg("");
          setStep(3);
        }, 1500);
      }
    } catch (err) {
      console.error("Verify OTP error:", err);
      setSuccessMsg(err.response?.data?.message || err.message || "Invalid OTP. Please try again.");
      setTimeout(() => setSuccessMsg(""), 5000);
    }
  }, [otp, verifyOtp]);

  // Step 3: Reset Password
  const handleResetPassword = useCallback(async (e) => {
    e.preventDefault();
    
    // Validate passwords
    if (!newPassword || !confirmPassword) {
      setSuccessMsg("Please fill in both password fields");
      setTimeout(() => setSuccessMsg(""), 3000);
      return;
    }

    if (newPassword.length < 6) {
      setSuccessMsg("Password must be at least 6 characters long");
      setTimeout(() => setSuccessMsg(""), 3000);
      return;
    }

    if (newPassword !== confirmPassword) {
      setSuccessMsg("Passwords do not match!");
      setTimeout(() => setSuccessMsg(""), 3000);
      return;
    }

    try {
      // Clear any existing messages
      setSuccessMsg("");
      
      // Call resetPassword function
      const msg = await resetPassword(email, newPassword);
      
      console.log("Reset password result:", msg);
      
      if (msg) {
        setSuccessMsg(msg);
        setTimeout(() => navigate("/signin"), 2000);
      } else {
        // If resetPassword returns falsy value but didn't throw error
        setSuccessMsg("Password reset successfully! Redirecting to login...");
        setTimeout(() => navigate("/signin"), 2000);
      }
    } catch (err) {
      console.error("Reset password error:", err);
      setSuccessMsg(err.response?.data?.message || err.message || "Failed to reset password. Please try again.");
      setTimeout(() => setSuccessMsg(""), 5000);
    }
  }, [email, newPassword, confirmPassword, resetPassword, navigate]);

  // Resend OTP
  const handleResendOtp = useCallback(async () => {
    if (countdown > 0) return;
    
    try {
      // Clear any existing messages
      setSuccessMsg("");
      
      // Call sendOtp function
      const result = await sendOtp(email);
      
      if (result) {
        setCountdown(30);
        setSuccessMsg(result || "OTP resent successfully!");
        setTimeout(() => setSuccessMsg(""), 3000);
      } else {
        setCountdown(30);
        setSuccessMsg("OTP resent successfully!");
        setTimeout(() => setSuccessMsg(""), 3000);
      }
    } catch (err) {
      console.error("Resend OTP error:", err);
      setSuccessMsg(err.response?.data?.message || err.message || "Failed to resend OTP. Please try again.");
      setTimeout(() => setSuccessMsg(""), 5000);
    }
  }, [email, sendOtp, countdown]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
        duration: reducedMotion ? 0 : 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: reducedMotion ? 0 : 10, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "tween",
        duration: reducedMotion ? 0 : 0.3,
        ease: "easeOut"
      }
    }
  };

  const stepIndicatorVariants = {
    initial: { scale: 0.8, opacity: 0.5 },
    active: { scale: 1, opacity: 1 },
    completed: { scale: 0.9, opacity: 0.7 }
  };

  // Email status indicator component
  const renderEmailStatus = () => {
    switch (emailStatus) {
      case 'checking':
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-2 flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400"
          >
            <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            Checking email availability...
          </motion.div>
        );
      
      case 'available':
        return (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 flex items-center gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-800"
          >
            <AlertCircle className="size-4 flex-shrink-0" />
            <div>
              <p className="font-medium">Email not found in system</p>
              <p className="mt-1 text-red-500 dark:text-red-400">
                This email is not registered. Please{" "}
                <button
                  type="button"
                  onClick={() => navigate("/contact-admin")}
                  className="font-semibold underline hover:text-red-700 dark:hover:text-red-300"
                >
                  contact administrator
                </button>{" "}
                for assistance.
              </p>
            </div>
          </motion.div>
        );
      
      case 'unavailable':
        return (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 flex items-center gap-2 text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-200 dark:border-green-800"
          >
            <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center bg-green-100 dark:bg-green-800 rounded-full">
              <svg className="w-3 h-3 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="font-medium">Email verified ✓</p>
              <p className="mt-1 text-green-500 dark:text-green-400">
                {emailDetails?.foundIn === 'Admin' ? 'Admin account' : 'Child Admin account'} found. 
                You can proceed with password reset.
              </p>
            </div>
          </motion.div>
        );
      
      case 'error':
        return (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 flex items-center gap-2 text-sm text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg border border-yellow-200 dark:border-yellow-800"
          >
            <AlertCircle className="size-4 flex-shrink-0" />
            <div>
              <p className="font-medium">Unable to verify email</p>
              <p className="mt-1 text-yellow-500 dark:text-yellow-400">
                Please try again or contact administrator if the issue persists.
              </p>
            </div>
          </motion.div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col flex-1">
      {/* Back link */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: reducedMotion ? 0 : 0.3 }}
        className="w-full max-w-md pt-6 mx-auto"
      >
        <Link
          to="/signin"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors duration-200 group"
        >
          <ChevronLeftIcon className="size-5 mr-1 transition-transform group-hover:-translate-x-1" />
          Back to Sign In
        </Link>
      </motion.div>

      {/* Main content */}
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto px-4 sm:px-0">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="space-y-4">
            <div className="space-y-2">
              <h1 className="font-semibold text-gray-800 text-2xl md:text-3xl dark:text-white">
                Reset Your Password
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Follow the steps below to secure your account
              </p>
            </div>

            {/* Step indicator */}
            <div className="flex items-center justify-between max-w-xs mx-auto">
              {[1, 2, 3].map((stepNum) => (
                <div key={stepNum} className="flex flex-col items-center">
                  <motion.div
                    variants={stepIndicatorVariants}
                    initial="initial"
                    animate={
                      step === stepNum 
                        ? "active" 
                        : step > stepNum 
                          ? "completed" 
                          : "initial"
                    }
                    className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 ${
                      step === stepNum
                        ? "bg-gradient-to-r from-brand-500 to-purple-500 text-white shadow-lg shadow-brand-500/30"
                        : step > stepNum
                          ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-400"
                    }`}
                  >
                    {step > stepNum ? (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      stepNum
                    )}
                  </motion.div>
                  <span className={`text-xs mt-2 font-medium ${
                    step === stepNum 
                      ? "text-brand-500" 
                      : step > stepNum 
                        ? "text-green-600 dark:text-green-400"
                        : "text-gray-400"
                  }`}>
                    {stepNum === 1 ? "Email" : stepNum === 2 ? "OTP" : "Password"}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Error/Success messages */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
              >
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </motion.div>
            )}
            
            {successMsg && (
              <motion.div
                key={successMsg}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`p-4 rounded-lg border ${
                  successMsg.includes("success") || successMsg.includes("✓") || successMsg.includes("sent") || successMsg.includes("verified")
                    ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                    : successMsg.includes("error") || successMsg.includes("failed") || successMsg.includes("invalid") || successMsg.includes("not registered")
                    ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                    : "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
                }`}
              >
                <p className={`text-sm ${
                  successMsg.includes("success") || successMsg.includes("✓") || successMsg.includes("sent") || successMsg.includes("verified")
                    ? "text-green-600 dark:text-green-400"
                    : successMsg.includes("error") || successMsg.includes("failed") || successMsg.includes("invalid") || successMsg.includes("not registered")
                    ? "text-red-600 dark:text-red-400"
                    : "text-blue-600 dark:text-blue-400"
                }`}>
                  {successMsg}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Forms - ANIMATE PRESENCE FIX */}
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.form
                key="step-1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: reducedMotion ? 0 : 0.3 }}
                onSubmit={handleSendOtp}
                className="space-y-6"
              >
                <motion.div variants={itemVariants}>
                  <Label className="flex items-center gap-2 mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <MailIcon className="size-4" />
                    Email Address
                  </Label>
                  <div className="relative">
                    <Input 
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent dark:bg-gray-900 dark:text-white transition-all duration-200 ${
                        emailStatus === 'unavailable'
                          ? 'border-green-500 focus:ring-green-500'
                          : emailStatus === 'available'
                          ? 'border-red-500 focus:ring-red-500'
                          : emailStatus === 'error'
                          ? 'border-yellow-500 focus:ring-yellow-500'
                          : 'border-gray-300 dark:border-gray-700 focus:ring-brand-500'
                      }`}
                      required
                      autoComplete="email"
                      autoFocus
                    />
                    <MailIcon className={`absolute left-3 top-1/2 transform -translate-y-1/2 size-5 ${
                      emailStatus === 'unavailable'
                        ? 'text-green-500'
                        : emailStatus === 'available'
                        ? 'text-red-500'
                        : emailStatus === 'error'
                        ? 'text-yellow-500'
                        : 'text-gray-400'
                    }`} />
                  </div>
                  
                  {/* Email status indicator */}
                  {renderEmailStatus()}
                  
                  {/* Help text */}
                  {!emailStatus && email && (
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      Please wait while we verify your email...
                    </p>
                  )}
                </motion.div>

                <motion.div variants={itemVariants}>
                  <button
                    type="submit"
                    disabled={loading || !email || emailStatus !== 'unavailable' || isCheckingEmail}
                    className={`relative w-full py-3 text-base font-medium text-white transition-all duration-200 rounded-lg shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                      emailStatus === 'unavailable'
                        ? 'bg-gradient-to-r from-brand-500 to-purple-500 hover:from-brand-600 hover:to-purple-600 focus:ring-brand-500'
                        : 'bg-gradient-to-r from-gray-400 to-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {loading || isCheckingEmail ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        {isCheckingEmail ? 'Checking email...' : 'Sending OTP...'}
                      </span>
                    ) : emailStatus === 'unavailable' ? (
                      "Send OTP"
                    ) : emailStatus === 'available' ? (
                      "Email Not Registered"
                    ) : emailStatus === 'checking' ? (
                      "Checking Email..."
                    ) : (
                      "Enter Valid Email"
                    )}
                  </button>
                </motion.div>

                {/* Contact admin CTA for non-registered emails */}
                {emailStatus === 'available' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-800"
                  >
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
                        Need help accessing your account?
                      </p>
                      <button
                        type="button"
                        onClick={() => navigate("/contact-admin")}
                        className="w-full py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      >
                        Contact Administrator
                      </button>
                    </div>
                  </motion.div>
                )}
              </motion.form>
            )}

            {step === 2 && (
              <motion.form
                key="step-2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: reducedMotion ? 0 : 0.3 }}
                onSubmit={handleVerifyOtp}
                className="space-y-6"
              >
                <div className="mb-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    OTP sent to: <span className="font-medium text-brand-500">{email}</span>
                  </p>
                </div>
                
                <motion.div variants={itemVariants}>
                  <Label className="flex items-center gap-2 mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <Key className="size-4" />
                    Verification Code
                  </Label>
                  <div className="space-y-4">
                    <div className="flex justify-center gap-3">
                      {otp.map((digit, index) => (
                        <input
                          key={index}
                          id={`otp-${index}`}
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength="1"
                          value={digit}
                          onChange={(e) => handleOtpChange(index, e.target.value)}
                          onPaste={handleOtpPaste}
                          onKeyDown={(e) => handleOtpKeyDown(index, e)}
                          className="w-14 h-14 text-center text-2xl font-semibold border-2 border-gray-300 dark:border-gray-700 rounded-lg focus:border-brand-500 focus:ring-2 focus:ring-brand-500 focus:ring-opacity-20 dark:bg-gray-900 dark:text-white transition-all duration-200"
                          autoFocus={index === 0 && !otp[0]}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                      Enter the 6-digit code sent to your email
                    </p>
                  </div>
                </motion.div>

                <div className="space-y-4">
                  <motion.div variants={itemVariants}>
                    <button
                      type="submit"
                      disabled={loading || otp.join('').length !== 6}
                      className="relative w-full py-3 text-base font-medium text-white transition-all duration-200 bg-gradient-to-r from-brand-500 to-purple-500 rounded-lg shadow-lg hover:shadow-xl hover:from-brand-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
                    >
                      {loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Verifying...
                        </span>
                      ) : (
                        "Verify OTP"
                      )}
                    </button>
                  </motion.div>

                  <motion.div variants={itemVariants} className="text-center">
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={countdown > 0 || loading}
                      className="text-sm text-brand-500 hover:text-brand-600 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                    >
                      {countdown > 0 ? (
                        <>
                          <span className="w-3 h-3 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                          Resend OTP in {countdown}s
                        </>
                      ) : (
                        "Resend OTP"
                      )}
                    </button>
                  </motion.div>
                </div>
              </motion.form>
            )}

            {step === 3 && (
              <motion.form
                key="step-3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: reducedMotion ? 0 : 0.3 }}
                onSubmit={handleResetPassword}
                className="space-y-6"
              >
                <div className="mb-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Setting new password for: <span className="font-medium text-brand-500">{email}</span>
                  </p>
                </div>
                
                <motion.div variants={itemVariants} className="space-y-4">
                  <div>
                    <Label className="flex items-center gap-2 mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      <LockIcon className="size-4" />
                      New Password
                    </Label>
                    <div className="relative">
                      <Input 
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter new password (min. 6 characters)"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-900 dark:text-white"
                        required
                        minLength="6"
                        autoComplete="new-password"
                        autoFocus
                      />
                      <LockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 size-5" />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeCloseIcon className="size-5" /> : <EyeIcon className="size-5" />}
                      </button>
                    </div>
                    {newPassword && newPassword.length < 6 && (
                      <p className="mt-2 text-sm text-yellow-500">Password must be at least 6 characters</p>
                    )}
                  </div>

                  <div>
                    <Label className="flex items-center gap-2 mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      <LockIcon className="size-4" />
                      Confirm Password
                    </Label>
                    <div className="relative">
                      <Input 
                        type="password"
                        placeholder="Confirm new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-900 dark:text-white"
                        required
                        minLength="6"
                        autoComplete="new-password"
                      />
                      <LockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 size-5" />
                    </div>
                    {newPassword && confirmPassword && newPassword !== confirmPassword && (
                      <p className="mt-2 text-sm text-red-500">Passwords do not match</p>
                    )}
                    {newPassword && confirmPassword && newPassword === confirmPassword && newPassword.length >= 6 && (
                      <p className="mt-2 text-sm text-green-500">✓ Passwords match</p>
                    )}
                  </div>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <button
                    type="submit"
                    disabled={loading || !newPassword || !confirmPassword || newPassword !== confirmPassword || newPassword.length < 6}
                    className="relative w-full py-3 text-base font-medium text-white transition-all duration-200 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg shadow-lg hover:shadow-xl hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Updating...
                      </span>
                    ) : (
                      "Reset Password"
                    )}
                  </button>
                </motion.div>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}