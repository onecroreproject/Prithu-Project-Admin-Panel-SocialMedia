// SettingsDashboard.jsx
import { useEffect, useState } from "react";
import { 
  Users, 
  Building, 
  CreditCard, 
  BarChart3, 
  TrendingUp,
  Activity,
  Clock,
  AlertCircle,
  CheckCircle,
  DollarSign
} from "lucide-react";
import { motion } from "framer-motion";

const SettingsDashboard = ({ user }) => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCompanies: 0,
    activeSubscriptions: 0,
    totalRevenue: 0,
    platformGrowth: 0,
    systemHealth: 100
  });

  const [recentActivity, setRecentActivity] = useState([]);
  const [systemAlerts, setSystemAlerts] = useState([]);

  useEffect(() => {
    // Fetch dashboard data
    const fetchDashboardData = async () => {
      // Mock data - replace with actual API calls
      setStats({
        totalUsers: 1245,
        totalCompanies: 156,
        activeSubscriptions: 89,
        totalRevenue: 45230,
        platformGrowth: 24,
        systemHealth: 98
      });

      setRecentActivity([
        { id: 1, action: "New company registered", details: "Tech Corp Inc", time: "1 hour ago", type: "success" },
        { id: 2, action: "Subscription upgraded", details: "Pro Plan - $99/month", time: "3 hours ago", type: "info" },
        { id: 3, action: "New admin user added", details: "Sarah Johnson", time: "5 hours ago", type: "warning" },
        { id: 4, action: "System backup completed", details: "Full backup successful", time: "1 day ago", type: "success" },
        { id: 5, action: "API rate limit reached", details: "Temporary restriction", time: "2 days ago", type: "error" },
      ]);

      setSystemAlerts([
        { id: 1, message: "Database connection optimal", status: "success" },
        { id: 2, message: "Email server: Sending delayed", status: "warning" },
        { id: 3, message: "Payment gateway: Active", status: "success" },
        { id: 4, message: "Storage: 85% used", status: "warning" },
      ]);
    };

    fetchDashboardData();
  }, []);

  const statCards = [
    {
      title: "Total Users",
      value: stats.totalUsers.toLocaleString(),
      change: "+12 today",
      icon: <Users className="w-6 h-6" />,
      color: "bg-blue-500",
      gradient: "from-blue-500 to-blue-400"
    },
    {
      title: "Companies",
      value: stats.totalCompanies,
      change: "+3 this week",
      icon: <Building className="w-6 h-6" />,
      color: "bg-purple-500",
      gradient: "from-purple-500 to-purple-400"
    },
    {
      title: "Active Subs",
      value: stats.activeSubscriptions,
      change: `${((stats.activeSubscriptions / stats.totalCompanies) * 100).toFixed(0)}% conversion`,
      icon: <CreditCard className="w-6 h-6" />,
      color: "bg-emerald-500",
      gradient: "from-emerald-500 to-emerald-400"
    },
    {
      title: "Total Revenue",
      value: `$${stats.totalRevenue.toLocaleString()}`,
      change: "+18% from last month",
      icon: <DollarSign className="w-6 h-6" />,
      color: "bg-amber-500",
      gradient: "from-amber-500 to-amber-400"
    },
  ];

  const quickActions = [
    { title: "Manage Users", icon: <Users className="w-5 h-5" />, path: "/settings/users", color: "bg-blue-100 text-blue-600" },
    { title: "View Analytics", icon: <BarChart3 className="w-5 h-5" />, path: "/settings/analytics", color: "bg-purple-100 text-purple-600" },
    { title: "Manage Subscriptions", icon: <CreditCard className="w-5 h-5" />, path: "/subscription/page", color: "bg-emerald-100 text-emerald-600" },
    { title: "System Settings", icon: <Activity className="w-5 h-5" />, path: "/settings/system/general", color: "bg-amber-100 text-amber-600" },
  ];

  const getStatusIcon = (type) => {
    switch(type) {
      case 'success': return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case 'warning': return <AlertCircle className="w-4 h-4 text-amber-500" />;
      case 'error': return <AlertCircle className="w-4 h-4 text-red-500" />;
      default: return <Activity className="w-4 h-4 text-blue-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'success': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300';
      case 'warning': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
      case 'error': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default: return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Overview of platform performance and system status
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className={`px-3 py-1 rounded-full ${stats.systemHealth >= 90 ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'}`}>
            <span className="text-sm font-medium">System Health: {stats.systemHealth}%</span>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            <Clock className="w-4 h-4 inline mr-1" />
            Updated just now
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{stat.title}</p>
                <p className="text-2xl font-bold mt-2">{stat.value}</p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">{stat.change}</p>
              </div>
              <div className={`p-3 rounded-full ${stat.color} bg-opacity-10`}>
                <div className={`text-white p-2 rounded-lg bg-gradient-to-br ${stat.gradient}`}>
                  {stat.icon}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions & System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="p-5 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Quick Actions</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Common administrative tasks</p>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-2 gap-4">
                {quickActions.map((action, index) => (
                  <motion.a
                    key={action.title}
                    href={action.path}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex flex-col items-center justify-center p-4 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-purple-200 dark:hover:border-purple-800 hover:shadow-md transition-all group"
                  >
                    <div className={`p-3 rounded-full ${action.color} bg-opacity-20 mb-3 group-hover:scale-110 transition-transform`}>
                      {action.icon}
                    </div>
                    <span className="font-medium text-gray-900 dark:text-gray-100">{action.title}</span>
                  </motion.a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 h-full">
            <div className="p-5 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">System Status</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Current platform health</p>
            </div>
            <div className="p-5">
              <div className="space-y-3">
                {systemAlerts.map((alert) => (
                  <div key={alert.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                    <div className="flex items-center gap-3">
                      <div className={`p-1.5 rounded-full ${getStatusColor(alert.status)}`}>
                        {alert.status === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                      </div>
                      <span className="text-sm text-gray-900 dark:text-gray-100">{alert.message}</span>
                    </div>
                    <div className={`w-2 h-2 rounded-full ${alert.status === 'success' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                  </div>
                ))}
              </div>
              <div className="mt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Platform Growth</span>
                  <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">+{stats.platformGrowth}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-purple-400 h-2 rounded-full" 
                    style={{ width: `${Math.min(stats.platformGrowth, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity & Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="p-5 border-b border-gray-100 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Recent Activity</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Latest platform events</p>
          </div>
          <div className="p-5">
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <div className="flex-shrink-0 mt-0.5">
                    {getStatusIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{activity.action}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{activity.details}</p>
                  </div>
                  <div className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0">
                    {activity.time}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="p-5 border-b border-gray-100 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Performance Metrics</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Key platform indicators</p>
          </div>
          <div className="p-5">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">User Retention</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Monthly active users</p>
                </div>
                <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">78%</div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Avg Response Time</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">API performance</p>
                </div>
                <div className="text-lg font-bold text-blue-600 dark:text-blue-400">124ms</div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Uptime</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Last 30 days</p>
                </div>
                <div className="text-lg font-bold text-purple-600 dark:text-purple-400">99.9%</div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Support Tickets</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Open requests</p>
                </div>
                <div className="text-lg font-bold text-amber-600 dark:text-amber-400">12</div>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Data Storage</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Used / Total</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900 dark:text-gray-100">85.2 GB</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">of 100 GB</p>
                </div>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-blue-400 h-2 rounded-full" 
                  style={{ width: '85.2%' }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-gradient-to-r from-purple-50 to-purple-100/50 dark:from-purple-900/20 dark:to-purple-900/10 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100">Platform Summary</h3>
            <p className="text-purple-700 dark:text-purple-300 mt-1">
              The platform is operating normally with {stats.totalUsers} users across {stats.totalCompanies} companies.
              System health is excellent at {stats.systemHealth}%.
            </p>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
              Generate Report
            </button>
            <button className="px-4 py-2 border border-purple-600 text-purple-600 dark:text-purple-400 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/30 transition-colors">
              View Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsDashboard;