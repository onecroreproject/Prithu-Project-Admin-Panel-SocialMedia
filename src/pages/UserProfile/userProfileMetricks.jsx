import { useQuery } from "@tanstack/react-query";
import { Users, CheckCircle, XCircle, Shield } from "lucide-react";
import { fetchUserMetricks } from "../../Services/UserServices/userServices";
 
export default function UserProfileMetricks() {
  const { data = {}, isLoading, isError } = useQuery({
    queryKey: ["userMetrics"],
    queryFn: async () => {
      try {
        const res = await fetchUserMetricks();
        return res || {
          totalUsers: 0,
          onlineUsers: 0,
          offlineUsers: 0,
          blockedUserCount: 0,
        };
      } catch (err) {
        console.error("Error fetching user metrics:", err);
        return {
          totalUsers: 0,
          onlineUsers: 0,
          offlineUsers: 0,
          blockedUserCount: 0,
        };
      }
    },
    staleTime: 1000 * 60 * 5,
  });
 
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
 
  const metrics = [
    {
      title: "Total Users",
      value: data.totalUsers || 0,
      icon: Users,
      color: "blue",
      description: "All registered users",
    },
    {
      title: "Online Users",
      value: data.onlineUsers || 0,
      icon: CheckCircle,
      color: "green",
      description: "Currently active",
    },
    {
      title: "Offline Users",
      value: data.offlineUsers || 0,
      icon: XCircle,
      color: "gray",
      description: "Not currently active",
    },
    {
      title: "Blocked Users",
      value: data.blockedUserCount || 0,
      icon: Shield,
      color: "red",
      description: "Restricted accounts",
    },
  ];
 
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric, index) => {
        const Icon = metric.icon;
        const percentage = data.totalUsers ? ((metric.value / data.totalUsers) * 100).toFixed(1) : 0;
       
        const colorClasses = {
          blue: { bg: "bg-blue-50", text: "text-blue-600", progress: "bg-blue-500" },
          green: { bg: "bg-green-50", text: "text-green-600", progress: "bg-green-500" },
          gray: { bg: "bg-gray-50", text: "text-gray-600", progress: "bg-gray-500" },
          red: { bg: "bg-red-50", text: "text-red-600", progress: "bg-red-500" },
        };
 
        return (
          <div
            key={index}
            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`p-2 rounded-lg ${colorClasses[metric.color].bg}`}>
                <Icon className={`w-5 h-5 ${colorClasses[metric.color].text}`} />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">{metric.value.toLocaleString()}</div>
                <div className="text-xs text-gray-500">{percentage}%</div>
              </div>
            </div>
           
            <h3 className="text-sm font-medium text-gray-900 mb-1">{metric.title}</h3>
            <p className="text-xs text-gray-500 mb-3">{metric.description}</p>
           
            <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${colorClasses[metric.color].progress}`}
                style={{ width: `${Math.min(percentage, 100)}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
 