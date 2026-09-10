import { useState, useEffect, useRef, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  FaCalendarAlt,
  FaRedoAlt,
  FaUsers,
  FaUserFriends,
  FaUserClock,
  FaUserCheck,
  FaDollarSign,
  FaExclamationCircle,
  FaWallet,
  FaReceipt
} from "react-icons/fa";
import { getAnalyticsData } from "../../Services/SalesDashboardSecrvices/metricServices";

const metricConfigs = {
  totalUsers: {
    label: "Total Users",
    description: "Total registered users",
    icon: FaUsers,
    theme: "border-blue-500 text-blue-600 bg-blue-50/30",
    shadow: "shadow-blue-100",
  },
  byReferralUsers: {
    label: "Referral Users",
    description: "Registered with referral code",
    icon: FaUserFriends,
    theme: "border-indigo-500 text-indigo-600 bg-indigo-50/30",
    shadow: "shadow-indigo-100",
  },
  totalTrialUsers: {
    label: "Trial Users",
    description: "Users who finished trial",
    icon: FaUserClock,
    theme: "border-purple-500 text-purple-600 bg-purple-50/30",
    shadow: "shadow-purple-100",
  },
  totalSubscribers: {
    label: "Subscribers",
    description: "Actual subscribed users",
    icon: FaUserCheck,
    theme: "border-emerald-500 text-emerald-600 bg-emerald-50/30",
    shadow: "shadow-emerald-100",
  },
  totalRevenue: {
    label: "Revenue",
    description: "Accumulated plan amount",
    icon: FaDollarSign,
    theme: "border-green-500 text-green-600 bg-green-50/30",
    shadow: "shadow-green-100",
    isCurrency: true,
  },
  totalWithdrawals: {
    label: "Withdrawals Count",
    description: "How many user withdrawals",
    icon: FaExclamationCircle,
    theme: "border-rose-500 text-rose-600 bg-rose-50/30",
    shadow: "shadow-rose-100",
  },
  totalWithdrawalAmount: {
    label: "Withdrawal Amounts",
    description: "Accumulated withdrawal amount",
    icon: FaWallet,
    theme: "border-pink-500 text-pink-600 bg-pink-50/30",
    shadow: "shadow-pink-100",
    isCurrency: true,
  },
};

// Single Card
const AnalyticsCard = ({ config, value, change, baselineValue }) => {
  const { label, icon: Icon, theme, shadow, isCurrency } = config;

  const isPositive = change > 0;
  const isNeutral = change === 0;

  const displayValue = isCurrency
    ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value)
    : value;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -4 }}
      className={`bg-white border-t-4 ${theme.split(' ')[0]} rounded-2xl p-5 flex-1 min-w-[240px] shadow-sm ${shadow} hover:shadow-xl transition-all duration-300 group`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl ${theme.split(' ').slice(2).join(' ')} group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="text-xl" />
        </div>
        <div className={`flex flex-col items-end`}>
          <span className={`text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1`}>vs Prev Period</span>
          <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-bold ${isNeutral ? "bg-gray-100 text-gray-500" : isPositive ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
            }`}>
            {isNeutral ? "" : isPositive ? "↑" : "↓"}
            {Math.abs(change).toFixed(1)}%
          </div>
        </div>
      </div>

      <div>
        <div className="text-gray-500 text-sm font-medium mb-1">{label}</div>
        <div className="text-2xl font-black text-gray-900 tracking-tight">
          {displayValue}
        </div>
        <div className="mt-3 h-1 w-full bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "70%" }}
            className={`h-full ${theme.split(' ')[1].replace('text', 'bg')}`}
          />
        </div>
      </div>
    </motion.div>
  );
};

// InfoCard Dashboard
export default function InfoCard() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const startInputRef = useRef(null);
  const endInputRef = useRef(null);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["sales-analytics", startDate, endDate],
    queryFn: async () => {
      const response = await getAnalyticsData(startDate, endDate);
      // The service already returns totals, but for this specific component we want the whole response
      // Wait, let's check metricServices.js... it returns totals || {}.
      // I need to update metricServices.js to return the full object if I want baseline.
      return response;
    },
  });

  // WAIT: I need to check metricServices.js - it returns response.data.totals || {}
  // If I want baseline, I should update metricServices.js or use it differently.

  const calculatePercentChange = (current, baseline) => {
    if (!baseline || baseline === 0) return current > 0 ? 100 : 0;
    return ((current - baseline) / baseline) * 100;
  };

  const metrics = useMemo(() => {
    if (!data) return [];

    // Fallback: If data is just totals (because of metricServices.js), baseline is missing.
    // I will handle this by checking if baseline exists.
    const totals = data.totals || data; // Handle both full response and just totals
    const baseline = data.baseline || {};

    return Object.entries(metricConfigs).map(([key, config]) => ({
      key,
      config,
      value: totals[key] || 0,
      baselineValue: baseline[key] || 0,
      change: calculatePercentChange(totals[key] || 0, baseline[key] || 0),
    }));
  }, [data]);

  const handleReset = () => {
    setStartDate("");
    setEndDate("");
  };

  return (
    <div className="py-6 px-4 sm:px-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight mb-1">Sales Performance</h2>
          <p className="text-sm text-gray-500 font-medium tracking-wide">Track your growth and revenue metrics</p>
        </div>

        {/* Date Picker + Reset */}
        <div className="flex flex-wrap gap-2 sm:gap-4 items-center w-full md:w-auto">
          <div className="flex flex-1 md:flex-none gap-2">
            <div className="relative flex-1 md:w-44">
              <FaCalendarAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
              <input
                ref={startInputRef}
                type="date"
                className="w-full border-gray-200 border rounded-xl pl-10 pr-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all shadow-sm"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="relative flex-1 md:w-44">
              <FaCalendarAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
              <input
                ref={endInputRef}
                type="date"
                className="w-full border-gray-200 border rounded-xl pl-10 pr-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all shadow-sm"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <button
            onClick={handleReset}
            className="p-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-white hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm flex items-center justify-center bg-gray-50"
            title="Reset Filters"
          >
            <FaRedoAlt className="text-sm" />
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-44 bg-gray-100 rounded-3xl border border-gray-50" />
          ))}
        </div>
      )}

      {isError && (
        <div className="p-10 text-center bg-rose-50 rounded-3xl border border-rose-100">
          <FaExclamationCircle className="mx-auto text-3xl text-rose-500 mb-3" />
          <p className="text-rose-900 font-bold">Unable to fetch analytics</p>
          <p className="text-rose-600 text-sm mt-1">Please check your connection and try again.</p>
        </div>
      )}

      {!isLoading && !isError && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {metrics.map((metric) => (
            <AnalyticsCard
              key={metric.key}
              config={metric.config}
              value={metric.value}
              change={metric.change}
              baselineValue={metric.baselineValue}
            />
          ))}
        </div>
      )}
    </div>
  );
}
