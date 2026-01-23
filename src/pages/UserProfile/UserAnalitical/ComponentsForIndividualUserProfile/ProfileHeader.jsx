// Replace current implementation with:
export default function ProfileHeader({ user }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
      <h3 className="font-semibold text-gray-900 mb-4 text-lg">Profile Overview</h3>
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 rounded-xl">
          <div className="text-xs text-gray-600 mb-1">Account Status</div>
          <div className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${user.isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm font-medium text-gray-900">{user.isActive ? 'Active' : 'Inactive'}</span>
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-3 rounded-xl">
          <div className="text-xs text-gray-600 mb-1">Subscription</div>
          <div className="text-sm font-medium text-gray-900">
            {user.subscription?.subscriptionActive ? 'Premium' : 'Free'}
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-3 rounded-xl">
          <div className="text-xs text-gray-600 mb-1">Earnings</div>
          <div className="text-sm font-medium text-gray-900">
            ${user.totalEarnings?.toLocaleString() || '0'}
          </div>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-3 rounded-xl">
          <div className="text-xs text-gray-600 mb-1">Referral Code</div>
          <div className="text-sm font-medium text-gray-900">{user.referralCode || 'N/A'}</div>
        </div>
      </div>
    </div>
  );
};