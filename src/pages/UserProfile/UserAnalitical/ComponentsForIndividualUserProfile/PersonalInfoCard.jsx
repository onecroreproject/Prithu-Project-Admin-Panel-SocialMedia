// Replace with this updated version
export default function PersonalInfoCard({ user }) {
  const profile = user.profile || {};
  
  return (
    <div>
      <h3 className="font-semibold text-gray-900 mb-4 text-lg">Personal Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <div className="text-xs text-gray-500 font-medium mb-1">Full Name</div>
            <div className="text-sm text-gray-900 font-medium">
              {profile.name} {profile.lastName}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 font-medium mb-1">Email</div>
            <div className="text-sm text-gray-900 font-medium">{user.email}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 font-medium mb-1">Phone Number</div>
            <div className="text-sm text-gray-900 font-medium">{profile.phoneNumber || 'N/A'}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 font-medium mb-1">Gender</div>
            <div className="text-sm text-gray-900 font-medium">{profile.gender || 'N/A'}</div>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <div className="text-xs text-gray-500 font-medium mb-1">Location</div>
            <div className="text-sm text-gray-900 font-medium">
              {profile.city}, {profile.country}
            </div>
          </div>
          
          <div>
            <div className="text-xs text-gray-500 font-medium mb-1">Shareable Link</div>
            <div className="text-sm text-blue-600 truncate">
              <a href={profile.shareableLink} target="_blank" rel="noopener noreferrer" className="hover:underline">
                {profile.shareableLink || 'N/A'}
              </a>
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 font-medium mb-1">Profile Visibility</div>
            <div className="text-sm text-gray-900 font-medium">
              {profile.isPublished ? 'Public' : 'Private'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}