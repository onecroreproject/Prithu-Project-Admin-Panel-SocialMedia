// Update to show correct data from new structure
export default function UserStats({ user }) {
  return (
    <div>
      <h3 className="font-semibold text-gray-900 mb-6 text-lg">User Statistics</h3>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gradient-to-br from-blue-50 to-white p-3 rounded-xl border border-blue-100">
            <div className="text-lg font-bold text-blue-600">{user.posts?.length || 0}</div>
            <div className="text-xs text-gray-500">Total Posts</div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-white p-3 rounded-xl border border-green-100">
            <div className="text-lg font-bold text-green-600">{user.reports?.length || 0}</div>
            <div className="text-xs text-gray-500">Reports Filed</div>
          </div>
        </div>

        <div className="p-3 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-900">Account Level</span>
            <span className="px-2 py-1 bg-gradient-to-r from-yellow-100 to-yellow-50 text-yellow-700 rounded-full text-xs font-medium">
              Level {user.currentLevel || 1}
            </span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full"
              style={{ width: `${Math.min((user.currentLevel || 1) * 10, 100)}%` }}
            ></div>
          </div>
        </div>

        <div className="p-3 bg-gradient-to-br from-purple-50 to-white rounded-xl border border-purple-100">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500">Online Status</div>
              <div className="text-lg font-bold text-gray-900">
                {user.isOnline ? 'Online Now' : 'Offline'}
              </div>
            </div>
            <div className={`p-2 rounded-lg ${user.isOnline ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}`}>
              <div className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${user.isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                <span className="text-xs font-medium">{user.isOnline ? 'Active' : 'Inactive'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}