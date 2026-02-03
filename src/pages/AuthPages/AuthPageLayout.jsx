import React, { useEffect, useState } from "react";
import GridShape from "../../components/common/GridShape";
import PrithuLogo from "../../Assets/Logo/prithulogo.png";
import ThemeTogglerTwo from "../../components/common/ThemeTogglerTwo";

export default function AuthLayout({ children }) {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);
  }, []);

  return (
    <div className="relative min-h-screen bg-white dark:bg-gray-900">
      {/* Static background gradients - no animation */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900" />
      
      <div className="relative flex flex-col lg:flex-row min-h-screen">
        {/* Left side - Form */}
        <div className="flex flex-col justify-center w-full lg:w-1/2 px-4 sm:px-6 lg:px-12 xl:px-20 py-8 lg:py-0">
          <div className="w-full max-w-md mx-auto">
            {children}
          </div>
        </div>

        {/* Right side - Brand showcase */}
        <div className="hidden lg:flex items-center justify-center w-full lg:w-1/2 bg-gradient-to-br from-white to-gray-50/80 dark:from-gray-900 dark:to-gray-900/90 relative overflow-hidden">
          {/* Grid Shape */}
          <div className="absolute inset-0 z-0">
            <GridShape />
          </div>

          <div className="relative z-10 px-8">
            <div className="flex flex-col items-center max-w-sm space-y-6">
              {/* Logo */}
              <div className="relative p-6 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-800 shadow-lg">
                <img
                  width={200}
                  height={42}
                  src={PrithuLogo}
                  alt="Logo"
                  className={reducedMotion ? "" : "transition-transform duration-300 hover:scale-105"}
                  loading="eager"
                />
              </div>

              {/* Slogan - simplified */}
              <div className="space-y-3 text-center">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-brand-500 to-purple-500 bg-clip-text text-transparent">
                  Prithu Wellness
                </h1>
                
                <p className="text-gray-600 dark:text-gray-400 text-sm tracking-wide">
                  <span className="font-medium">Feel It. Share It. Heal Together</span>
                </p>
              </div>

              {/* Decorative dots - only show if motion is allowed */}
              {!reducedMotion && (
                <div className="flex space-x-2 mt-4">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="w-1.5 h-1.5 bg-brand-400 rounded-full"
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Theme toggler - positioned absolutely */}
        <div className="fixed z-50 bottom-6 right-6">
          <ThemeTogglerTwo />
        </div>
      </div>

      {/* Minimal CSS animations - only if motion is allowed */}
      {!reducedMotion && (
        <style>
          {`
          @keyframes fade-in {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          .animate-fade-in {
            animation: fade-in 0.4s ease-out forwards;
          }

          @keyframes spin {
            to { transform: rotate(360deg); }
          }
          
          .animate-spin {
            animation: spin 0.8s linear infinite;
          }
          `}
        </style>
      )}
    </div>
  );
}