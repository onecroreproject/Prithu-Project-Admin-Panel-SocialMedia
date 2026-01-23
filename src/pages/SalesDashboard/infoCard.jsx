import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { FaCalendarAlt, FaRedoAlt } from "react-icons/fa";
import { getAnalyticsData } from "../../Services/SalesDashboardSecrvices/metricServices";

const colorThemes = {
  Subscribers: "border-blue-400 text-blue-600 shadow-blue-100",
  "Trial Users": "border-purple-400 text-purple-600 shadow-purple-100",
  Revenue: "border-green-400 text-green-600 shadow-green-100",
  "Total Subscriptions": "border-teal-400 text-teal-600 shadow-teal-100",
  Invoices: "border-orange-400 text-orange-600 shadow-orange-100",
  Withdrawals: "border-red-400 text-red-600 shadow-red-100",
  "Withdrawal Invoices": "border-pink-400 text-pink-600 shadow-pink-100",
};

// Sample baseline values
const baselineValues = {
  totalSubscribers: 100,
  totalTrialUsers: 50,
  totalRevenue: 10000,
  totalUsers: 200,
  totalInvoices: 150,
  totalWithdrawals: 70,
  totalWithdrawalInvoices: 60,
};

// Single Card
const AnalyticsCard = ({ label, value, change, trendUp }) => {
  const theme = colorThemes[label] || "border-gray-300 text-gray-600 shadow-gray-100";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
      className={`bg-white border-l-4 ${theme} rounded-xl px-4 sm:px-6 py-4 sm:py-5 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5 min-w-[180px] sm:min-w-[220px] flex-1 shadow-md hover:shadow-lg transition-all`}
    >
      <div>
        <div className="font-normal text-gray-500 text-sm sm:text-base mb-1 sm:mb-2">{label}</div>
        <div className={`font-bold text-lg sm:text-2xl ${theme.split(" ")[1]}`}>{value ?? 0}</div>
        <div
  className={`text-xs sm:text-sm mt-1 sm:mt-2 font-medium ${
    trendUp && change !=="0%" ? "text-green-700" : "text-green-700" 
  }`}
>
  {change  ? `${change}` : "0%"}
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
    queryKey: ["analytics", startDate, endDate],
    queryFn: () => getAnalyticsData(startDate, endDate),
  });
console.log(data)
  useEffect(() => {
    refetch();
  }, [startDate, endDate, refetch]);

  const calculateChange = (actual, baseline) => {
    console.log(actual)
    if (!actual || !baseline || baseline === 0) return "0%";
    const diff = (actual / baseline) * 100;
    if (!isFinite(diff)) return "0%";
    const rounded = parseFloat(diff.toFixed(1));
    return `${rounded > 0 ? "+" : ""}${rounded}%`;
  };

  const metrics = [
     { label: "Users", value: data?.totalUsers || 0, change: calculateChange(data?.totalUsers, baselineValues.totalUsers), trendUp: (data?.totalUsers || 0) >= baselineValues.totalUsers },
         { label: "By Referral Users", value: data?.byReferralUsers || 0, change: calculateChange(data?.byReferralUsers, baselineValues.byReferralUsers), trendUp: (data?.byReferralUsers || 0) >= baselineValues.byReferralUsers },
       { label: "Trial Users", value: data?.totalTrialUsers || 0, change: calculateChange(data?.totalTrialUsers, baselineValues.totalTrialUsers), trendUp: (data?.totalTrialUsers || 0) >= baselineValues.totalTrialUsers },
       { label: "Subscribers", value: data?.totalSubscribers || 0, change: calculateChange(data?.totalSubscribers, baselineValues.totalSubscribers), trendUp: (data?.totalSubscribers || 0) >= baselineValues.totalSubscribers },
    { label: "Revenue", value: data?.totalRevenue || 0, change: calculateChange(data?.totalRevenue, baselineValues.totalRevenue), trendUp: (data?.totalRevenue || 0) >= baselineValues.totalRevenue },
    { label: "Withdrawals Count", value: data?.totalWithdrawals || 0, change: calculateChange(data?.totalWithdrawals, baselineValues.totalWithdrawals), trendUp: (data?.totalWithdrawals || 0) >= baselineValues.totalWithdrawals },
    { label: "Withdrawal Amounts", value: data?.totalWithdrawalInvoices || 0, change: calculateChange(data?.totalWithdrawalInvoices, baselineValues.totalWithdrawalInvoices), trendUp: (data?.totalWithdrawalInvoices || 0) >= baselineValues.totalWithdrawalInvoices },
  ];

  const handleReset = () => {
    setStartDate("");
    setEndDate("");
    refetch();
  };

  return (
    <div className="py-4 px-2 sm:px-4">
      <div className="flex flex-col sm:flex-row flex-wrap justify-between items-center mb-4 gap-3">
        <h2 className="text-xl sm:text-2xl font-bold">Sales Analytics</h2>

        {/* Date Picker + Reset */}
        <div className="flex flex-wrap gap-2 sm:gap-3 items-center mt-2 sm:mt-0">
          <div className="relative">
            <FaCalendarAlt className="absolute left-2 sm:left-3 top-2 sm:top-3 text-gray-500 cursor-pointer hover:text-blue-500" onClick={() => startInputRef.current?.showPicker()} />
            <input ref={startInputRef} type="date" className="border rounded pl-8 sm:pl-9 pr-3 py-1 sm:py-1.5 shadow-sm hover:shadow-md transition-all cursor-pointer" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>

          <div className="relative">
            <FaCalendarAlt className="absolute left-2 sm:left-3 top-2 sm:top-3 text-gray-500 cursor-pointer hover:text-blue-500" onClick={() => endInputRef.current?.showPicker()} />
            <input ref={endInputRef} type="date" className="border rounded pl-8 sm:pl-9 pr-3 py-1 sm:py-1.5 shadow-sm hover:shadow-md transition-all cursor-pointer" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>

          <button onClick={handleReset} className="flex items-center gap-1 sm:gap-2 border px-2 sm:px-3 py-1 rounded text-gray-600 hover:bg-gray-100 hover:text-blue-600 transition-all shadow-sm">
            <FaRedoAlt className="text-xs sm:text-sm" /> Reset
          </button>
        </div>
      </div>

      {isLoading && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 text-gray-500">Loading analytics...</motion.div>}
      {isError && <div className="p-6 text-red-500">Error fetching analytics data.</div>}

      <div className="flex flex-wrap gap-3 sm:gap-4 mt-4">
        {metrics.map((metric) => (
          <AnalyticsCard key={metric.label} label={metric.label} value={metric.value} change={metric.change} trendUp={metric.trendUp} />
        ))}
      </div>
    </div>
  );
}
