import { useQuery } from "@tanstack/react-query";
import { Users, CheckCircle, XCircle, Shield } from "lucide-react";
import { fetchUserMetricks } from "../../Services/UserServices/userServices";

export default function UserProfileMetricks({ onMetricClick, activeMetric }) {
  const { data = {}, isLoading, isError } = useQuery({
    queryKey: ["userMetrics"],
    queryFn: async () => {
      try {
        const res = await fetchUserMetricks();
        return res || {
          totalUsers: 0,
          onlineUsers: 0,
          subscriptionCount: 0,
          trialUsedCount: 0,
        };
      } catch (err) {
        console.error("Error fetching user metrics:", err);
        return {
          totalUsers: 0,
          onlineUsers: 0,
          subscriptionCount: 0,
          trialUsedCount: 0,
        };
      }
    },
    staleTime: 1000 * 60 * 5,
  });

  const metrics = [
    {
      id: "total",
      title: "Total Users",
      value: data?.totalUsers || 0,
      icon: Users,
      color: "blue",
      description: "All registered users",
    },
    {
      id: "online",
      title: "Online Users",
      value: data?.onlineUsers || 0,
      icon: CheckCircle,
      color: "green",
      description: "Currently active now",
    },
    {
      id: "subscribed",
      title: "Subscribed Users",
      value: data?.subscriptionCount || 0,
      icon: CheckCircle,
      color: "blue",
      description: "Active paid subscriptions",
    },
    {
      id: "trial",
      title: "Trial Used Users",
      value: data?.trialUsedCount || 0,
      icon: Shield,
      color: "purple",
      description: "Users who utilized trial",
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-gray-50 rounded-lg p-4 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <XCircle className="w-5 h-5 text-red-500" />
          <p className="text-red-600 text-sm">Failed to load metrics</p>
        </div>
      </div>
    );
  }

  const getColorClasses = (color, isActive) => {
    const base = isActive ? "ring-2 ring-offset-2 " : "hover:shadow-md transition-shadow ";
    switch (color) {
      case "blue": return base + (isActive ? "ring-blue-500 bg-blue-50" : "bg-blue-50/50");
      case "green": return base + (isActive ? "ring-green-500 bg-green-50" : "bg-green-50/50");
      case "purple": return base + (isActive ? "ring-purple-500 bg-purple-50" : "bg-purple-50/50");
      default: return base + "bg-gray-50/50";
    }
  };

  const getIconColor = (color) => {
    switch (color) {
      case "blue": return "text-blue-600";
      case "green": return "text-green-600";
      case "purple": return "text-purple-600";
      default: return "text-gray-600";
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric) => {
        const Icon = metric.icon;
        const isActive = activeMetric === metric.id;

        return (
          <button
            key={metric.id}
            onClick={() => onMetricClick?.(isActive ? null : metric.id)}
            className={`flex flex-col p-4 rounded-xl border border-gray-100 text-left transition-all ${getColorClasses(metric.color, isActive)}`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2 rounded-lg bg-white shadow-sm ${getIconColor(metric.color)}`}>
                <Icon size={20} />
              </div>
              {isActive && (
                <span className="flex h-2 w-2">
                  <span className={`animate-ping absolute inline-flex h-2 w-2 rounded-full opacity-75 ${getIconColor(metric.color).replace('text', 'bg')}`}></span>
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${getIconColor(metric.color).replace('text', 'bg')}`}></span>
                </span>
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">{metric.title}</p>
              <div className="flex items-baseline gap-2 mt-1">
                <h3 className="text-2xl font-bold text-gray-900">
                  {metric.value.toLocaleString()}
                </h3>
              </div>
              <p className="text-xs text-gray-400 mt-1">{metric.description}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
