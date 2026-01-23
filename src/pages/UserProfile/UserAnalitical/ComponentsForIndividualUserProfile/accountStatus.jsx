import { motion } from "framer-motion";
import { 
  Calendar, 
  Clock, 
  Shield, 
  Users,
  TrendingUp
} from "lucide-react";

export default function AccountStats({ user }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-5"
    >
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Statistics</h3>
      
      <div className="space-y-4">
        {/* Registration Date */}
        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Registered</p>
              <p className="text-xs text-gray-600">Account creation date</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-semibold text-gray-900">
              {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric' 
              }) : "N/A"}
            </div>
            <div className="text-xs text-gray-500">
              {user.createdAt ? new Date(user.createdAt).getFullYear() : ""}
            </div>
          </div>
        </div>

        {/* Last Login */}
        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <Clock className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Last Login</p>
              <p className="text-xs text-gray-600">Most recent activity</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-semibold text-gray-900">
              {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric' 
              }) : "Never"}
            </div>
            <div className="text-xs text-gray-500">
              {user.lastLogin ? new Date(user.lastLogin).toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit' 
              }) : ""}
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <Shield className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Account Status</p>
              <p className="text-xs text-gray-600">Current user status</p>
            </div>
          </div>
          <div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              user.isBlocked 
                ? 'bg-red-100 text-red-800'
                : user.isOnline 
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-800'
            }`}>
              {user.isBlocked ? 'Blocked' : user.isOnline ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>

        {/* Gender */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
              <Users className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Gender</p>
              <p className="text-xs text-gray-600">User gender</p>
            </div>
          </div>
          <div className="text-sm font-semibold text-gray-900">
            {user.profile?.gender || "Not specified"}
          </div>
        </div>

        {/* Activity Score */}
        <div className="p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-gray-900">Activity Score</span>
            </div>
            <span className="text-sm font-bold text-blue-700">{user.activityScore || 0}%</span>
          </div>
          <div className="w-full bg-white rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${user.activityScore || 0}%` }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}