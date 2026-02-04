import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Checkbox from "../form/input/Checkbox";
import Button from "../ui/button/Button";
import { useAdminAuth } from "../../context/adminAuthContext";

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  const { login, error, loading, role, admin } = useAdminAuth();
  const navigate = useNavigate();

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);

    const handleChange = () => setReducedMotion(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const result = await login(email, password);

    // After login, use the role from context or the result
    if (role === "Child_Admin" || admin?.role === "Child_Admin") {
      const adminId = admin?.userId || admin?._id || admin?.id;
      if (adminId) {
        navigate(`/settings/child/admin/profile/${adminId}`);
      } else {
        navigate("/");
      }
    } else if (role === "Admin" || admin?.role === "Admin") {
      navigate("/");
    }
    setIsSubmitting(false);
  }, [email, password, login, role, admin, navigate]);

  // Simplified animations with reduced motion support
  const containerVariants = reducedMotion ? {
    hidden: { opacity: 1 },
    visible: { opacity: 1 }
  } : {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05, // Reduced from 0.1
        delayChildren: 0.1, // Reduced from 0.2
      }
    }
  };

  const itemVariants = reducedMotion ? {
    hidden: { opacity: 1 },
    visible: { opacity: 1 }
  } : {
    hidden: { y: 10, opacity: 0 }, // Reduced from 20
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "tween", // Changed from spring for performance
        duration: 0.3, // Faster animation
        ease: "easeOut"
      }
    }
  };

  const pageTransition = reducedMotion ? { duration: 0 } : { duration: 0.3, ease: "easeOut" };

  return (
    <div className="flex flex-col flex-1">
      {/* Back link - simplified */}
      <div className="w-full max-w-md pt-6 mx-auto">
        <Link
          to="/reset-password"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors duration-150"
        >
          <ChevronLeftIcon className="size-5 mr-1" />
          Forgot password?
        </Link>
      </div>

      {/* Form container */}
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto px-4 sm:px-0">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="mb-6">
            <h1 className="mb-2 font-semibold text-gray-800 text-2xl dark:text-white">
              Welcome Back
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Enter your credentials to access your account
            </p>

            {/* Error message - simplified animation */}
            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
                className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
              >
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </motion.div>
            )}
          </motion.div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* Email Input */}
              <motion.div variants={itemVariants}>
                <Label className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email Address
                </Label>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 transition-all duration-150 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                  required
                  autoComplete="email"
                  autoFocus
                />
              </motion.div>

              {/* Password Input */}
              <motion.div variants={itemVariants}>
                <Label className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2.5 pr-12 transition-all duration-150 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors focus:outline-none"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeIcon className="w-5 h-5" />
                    ) : (
                      <EyeCloseIcon className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </motion.div>

              {/* Remember me & Forgot password */}
              <motion.div variants={itemVariants} className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={isChecked}
                    onChange={setIsChecked}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Keep me logged in
                  </span>
                </div>
                <Link
                  to="/reset-password"
                  className="text-sm font-medium text-brand-500 hover:text-brand-600 transition-colors"
                >
                  Forgot password?
                </Link>
              </motion.div>

              {/* Submit Button */}
              <motion.div
                variants={itemVariants}
                initial={reducedMotion ? false : { scale: 0.95 }}
                animate={reducedMotion ? false : { scale: 1 }}
                transition={pageTransition}
              >
                <button
                  type="submit"
                  disabled={loading || isSubmitting}
                  className="relative w-full py-3 text-base font-medium text-white transition-all duration-200 bg-gradient-to-r from-brand-500 to-brand-600 rounded-lg shadow hover:shadow-md hover:from-brand-600 hover:to-brand-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
                >
                  {(loading || isSubmitting) ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Signing in...
                    </span>
                  ) : (
                    "Sign in"
                  )}
                </button>
              </motion.div>
            </div>
          </form>

          {/* Additional info */}
          <motion.div
            variants={itemVariants}
            className="pt-6 mt-6 border-t border-gray-200 dark:border-gray-800"
          >
            <p className="text-center text-sm text-gray-500 dark:text-gray-400">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="font-medium text-brand-500 hover:text-brand-600 transition-colors"
              >
                Contact administrator
              </Link>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}