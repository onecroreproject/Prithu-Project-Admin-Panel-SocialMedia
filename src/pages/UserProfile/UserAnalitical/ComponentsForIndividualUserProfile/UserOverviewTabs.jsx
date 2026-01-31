
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  CreditCard,
  Smartphone,
  Users,
  GraduationCap,
  Briefcase,
  FileText,
  BarChart
} from "lucide-react";

const tabVariants = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
  transition: { duration: 0.2 }
};

export default function UserOverviewTabs({ user, activeTab, setActiveTab }) {
  const [tabs] = useState([
    { id: "profile", label: "Profile", icon: Shield },
    { id: "subscription", label: "Subscription", icon: CreditCard },
    { id: "device", label: "Device", icon: Smartphone },
    { id: "referrals", label: "Referrals", icon: Users },
  ]);

  const renderTabContent = () => {
    switch (activeTab.toLowerCase()) {
      case "profile":
        return (
          <div className="space-y-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Profile Details</h4>
              <p className="text-sm text-gray-600">
                This user has completed {user.profile?.completionRate || 0}% of their profile.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500">Profile Views</p>
                <p className="font-semibold text-gray-900">{user.profileViews || 0}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500">Social Links</p>
                <p className="font-semibold text-gray-900">{user.socialLinks || 0}</p>
              </div>
            </div>
          </div>
        );

      case "subscription":
        return (
          <div className="space-y-4">
            <div className={`rounded-lg p-4 ${user.subscriptionActive ? 'bg-green-50' : 'bg-gray-50'
              }`}>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">Current Plan</h4>
                  <p className={`text-sm ${user.subscriptionActive ? 'text-green-600' : 'text-gray-600'}`}>
                    {user.subscriptionActive ? 'Active Premium Plan' : 'Free Plan'}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${user.subscriptionActive
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                  }`}>
                  {user.subscriptionActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              {(() => {
                const Icon = tabs.find(t => t.label.toLowerCase() === activeTab.toLowerCase())?.icon || FileText;
                return <Icon className="w-6 h-6 text-gray-400" />;
              })()}
            </div>
            <p className="text-gray-600">
              {activeTab} information will appear here
            </p>
          </div>
        );
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-full flex flex-col">
      {/* Tab Header */}
      <div className="border-b border-gray-100 px-6 py-4">
        <h3 className="text-lg font-semibold text-gray-900">User Overview</h3>
        <p className="text-sm text-gray-500 mt-1">Detailed account information</p>
      </div>

      {/* Tabs Navigation */}
      <div className="px-6 pt-4">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab.toLowerCase() === tab.id.toLowerCase();
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.label)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isActive
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            {...tabVariants}
            className="h-full"
          >
            {renderTabContent()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Quick Stats Footer */}
      <div className="border-t border-gray-100 p-4 bg-gray-50 rounded-b-xl">
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center">
            <div className="text-xl font-bold text-gray-900">{user.totalPosts || 0}</div>
            <div className="text-xs text-gray-600">Total Posts</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-gray-900">{user.totalLikes || 0}</div>
            <div className="text-xs text-gray-600">Total Likes</div>
          </div>
        </div>
      </div>
    </div>
  );
}