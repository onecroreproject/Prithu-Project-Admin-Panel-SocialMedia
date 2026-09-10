import { useState, useMemo,useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Users, 
  UserCheck, 
  UserPlus, 
  UserX, 
  Flag, 
  ShieldCheck,
  Server
} from "lucide-react";
import api from "../../../Services/apiService";
import { useDashboardHeartbeat } from "../../../hooks/useDashboardHeartbeat";
import ChildAdminListModal from "./ChildAdminListModal";

// Responsive Skeleton Loader
const MetricCardSkeleton = () => (
  <div className="animate-pulse">
    <div className="h-3 sm:h-4 bg-gray-200 rounded w-2/3 sm:w-3/4 mb-2 sm:mb-3"></div>
    <div className="h-6 sm:h-8 bg-gray-200 rounded w-1/2 sm:w-1/2"></div>
    <div className="mt-2 sm:mt-3">
      <div className="h-1.5 bg-gray-100 rounded-full w-full"></div>
    </div>
  </div>
);

export default function TodayMetrics() {
  const navigate = useNavigate();
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

  const { data: heartbeat, isLoading, isError } = useDashboardHeartbeat();
  const [systemMetrics, setSystemMetrics] = useState(null);

  const data = heartbeat?.metrics;

  useEffect(() => {
    const fetchSystemMetrics = async () => {
      try {
        const response = await api.get('/api/admin/system/metrics');
        if (response.data.success) {
          setSystemMetrics(response.data.data);
        }
      } catch (err) {
        console.error("System Metrics Error");
      }
    };
    fetchSystemMetrics();
    const interval = setInterval(fetchSystemMetrics, 60000); // Poll every minute
    return () => clearInterval(interval);
  }, []);

  // Responsive Loading State
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-7 gap-3 sm:gap-4 px-2 sm:px-4">
        {[...Array(7)].map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-gray-100 bg-white shadow-sm p-3 sm:p-4 md:p-5 min-h-[110px] xs:min-h-[120px] sm:min-h-[130px] md:min-h-[140px] flex flex-col justify-between"
          >
            <MetricCardSkeleton />
          </div>
        ))}
      </div>
    );
  }

  // Responsive Error State
  if (isError) {
    return (
      <div className="text-center py-6 sm:py-8 px-4">
        <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-red-50 mb-3">
          <Users className="text-red-400 text-lg sm:text-xl" />
        </div>
        <p className="text-red-500 font-medium text-sm sm:text-base">
          Failed to load metrics
        </p>
        <p className="text-gray-500 text-xs sm:text-sm mt-1">
          Please try again later
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-3 sm:mt-4 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  const metrics = [
    {
      key: "totalUsers",
      title: "Total Users",
      value: data.totalUsers,
      icon: Users,
      color: "bg-linear-to-br from-blue-500 to-blue-600",
      border: "border-blue-100",
      trend: null,
      description: "All registered users",
    },
    {
      key: "onlineUsers",
      title: "Online Users",
      value: data.onlineUsers,
      icon: UserCheck,
      color: "bg-linear-to-br from-emerald-500 to-emerald-600",
      border: "border-emerald-100",
      trend: "Live",
      description: "Currently online users",
    },
    {
      key: "newRegistrationsToday",
      title: "New Today",
      value: data.newRegistrationsToday,
      icon: UserPlus,
      color: "bg-linear-to-br from-violet-500 to-violet-600",
      border: "border-violet-100",
      trend: null,
      description: "New registrations",
    },
    {
      key: "suspendedUsers",
      title: "Suspended",
      value: data.suspendedUsers,
      icon: UserX,
      color: "bg-linear-to-br from-rose-500 to-rose-600",
      border: "border-rose-100",
      trend: null,
      description: "Blocked accounts",
    },
    {
      key: "totalReports",
      title: "Total Reports",
      value: data.totalReports,
      icon: Flag,
      color: "bg-linear-to-br from-amber-500 to-amber-600",
      border: "border-amber-100",
      trend: "-3%",
      description: "All reports",
    },
    {
      key: "totalChildAdmins",
      title: "Total Child Admins",
      value: data.totalChildAdmins,
      icon: ShieldCheck,
      color: "bg-linear-to-br from-indigo-500 to-indigo-600",
      border: "border-indigo-100",
      trend: null,
      description: "Total team members",
    },
    {
      key: "onlineChildAdmins",
      title: "Online Admins",
      value: data.onlineChildAdmins,
      icon: UserCheck,
      color: "bg-linear-to-br from-cyan-500 to-cyan-600",
      border: "border-cyan-100",
      trend: "Live",
      description: "Admins currently active",
    },
    {
      key: "systemHealth",
      title: "System Performance",
      value: systemMetrics?.apiPerformance.requestsPerMinute ?? "--",
      icon: Server,
      color: "bg-linear-to-br from-indigo-500 to-indigo-600",
      border: "border-indigo-100",
      trend: systemMetrics?.apiPerformance.avgResponseTime || "--",
      description: `Status: ${systemMetrics?.healthCheck.server || "Checking..."}`,
    },
  ];

  // Responsive number formatting
  const formatNumber = (num) => {
    if (!num && num !== 0) return "0";
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const handleMetricClick = (key) => {
    if (key === "systemHealth") {
      navigate("/settings/server/management");
      return;
    }
    if (key === "totalReports") {
      navigate("/social/user-reportinfo");
      return;
    }
    if (key === "totalChildAdmins") {
      setIsAdminModalOpen(true);
      return;
    }

    const navigableMetrics = ["totalUsers", "onlineUsers", "newRegistrationsToday", "suspendedUsers"];
    if (navigableMetrics.includes(key)) {
      navigate(`/social/profile?filter=${key === "onlineUsers" ? "online" : key}`);
    }
  };

  return (
    <div className="w-full">
      {/* Container with responsive padding */}
      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-7 gap-3 sm:gap-4 px-2 sm:px-3 md:px-4">
        {metrics.map((metric) => (
          <div
            key={metric.key}
            onClick={() => handleMetricClick(metric.key)}
            className={`group relative rounded-xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-all duration-300 
              p-3 sm:p-4 md:p-5 
              hover:scale-[1.01] sm:hover:scale-[1.02]
              min-h-[110px] xs:min-h-[120px] sm:min-h-[130px] md:min-h-[140px]
              flex flex-col justify-between
              w-full cursor-pointer`}
          >
            {/* Glow effect - hidden on mobile for performance */}
            <div className="hidden sm:block absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-linear-to-r from-transparent via-white/10 to-transparent pointer-events-none"></div>

            <div className="relative z-10 w-full">
              {/* Header Section */}
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                  <div
                    className={`rounded-lg sm:rounded-xl p-2 sm:p-2.5 ${metric.color} shadow-md group-hover:shadow-lg transition-shadow
                      w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11
                      shrink-0`}
                  >
                    <metric.icon className="text-white text-sm sm:text-base md:text-lg" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-gray-700 text-xs sm:text-sm truncate">
                      {metric.title}
                    </h3>
                    <p className="text-gray-400 text-xs truncate hidden sm:block">
                      {metric.description}
                    </p>
                  </div>
                </div>

                {/* Trend Badge - hidden on extra small screens */}
                {metric.trend && (
                  <span
                    className={`hidden xs:inline-flex text-[10px] sm:text-xs font-medium px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full ml-1 shrink-0 ${metric.trend.startsWith("+")
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-rose-50 text-rose-700"
                      }`}
                  >
                    {metric.trend}
                  </span>
                )}
              </div>

              {/* Value and Progress Bar Section */}
              <div className="mt-2 sm:mt-3">
                <div className="flex items-baseline gap-1 sm:gap-2">
                  <span className="font-bold text-gray-900 text-xl sm:text-2xl md:text-3xl">
                    {formatNumber(metric.value)}
                  </span>
                  <div className="hidden sm:block h-1.5 w-1.5 rounded-full bg-gray-300 shrink-0"></div>
                </div>

                {/* Specific details for Online Admins */}
                {metric.key === "onlineChildAdmins" && data.onlineAdminNames?.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {data.onlineAdminNames.slice(0, 3).map((name, idx) => (
                      <span key={idx} className="text-[10px] bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded-md font-medium">
                        {name}
                      </span>
                    ))}
                    {data.onlineAdminNames.length > 3 && (
                      <span className="text-[10px] text-gray-400">+{data.onlineAdminNames.length - 3} more</span>
                    )}
                  </div>
                )}

                {/* Progress Bar - hidden on mobile to save space */}
                <div className="hidden sm:block mt-2">
                  <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${metric.key === "totalUsers"
                        ? "bg-blue-500"
                        : metric.key === "onlineUsers"
                          ? "bg-emerald-500"
                          : metric.key === "newRegistrationsToday"
                            ? "bg-violet-500"
                            : metric.key === "suspendedUsers"
                              ? "bg-rose-500"
                              : "bg-amber-500"
                        }`}
                      style={{
                        width: `${Math.min((metric.value / (data.totalUsers || 1)) * 100, 100)}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom border on hover - hidden on mobile */}
            <div className="hidden sm:block absolute bottom-0 left-4 right-4 h-0.5 bg-linear-to-r from-transparent via-gray-200 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

            {/* Mobile indicator - visible only on mobile */}
            <div className="sm:hidden absolute bottom-2 right-2">
              <div className="w-1.5 h-1.5 rounded-full bg-gray-200"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Legend/Help Text - hidden on mobile, shown on tablet+ */}
      <div className="hidden md:flex items-center justify-center mt-4 px-4">
        <p className="text-xs text-gray-500 text-center">
          Hover over cards for details • Click to view detailed analytics
        </p>
      </div>

      <ChildAdminListModal isOpen={isAdminModalOpen} onClose={() => setIsAdminModalOpen(false)} />
    </div>
  );
}