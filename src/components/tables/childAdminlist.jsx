export default function ChildAdminList({ admins, onSelect }) {
  return (
    <ul className="space-y-3">
      {admins.map((admin) => (
        <li
          key={admin.childAdminId}
          className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => onSelect(admin)}
          role="button"
          tabIndex={0}
          onKeyDown={e => { if (e.key === "Enter") onSelect(admin); }}
        >
          <div className="flex items-center space-x-4">
            <img
              src={admin.avatarUrl || "/default-avatar.png"}
              alt={admin.userName}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div>
              <p className="font-medium text-gray-900">{admin.userName}</p>
              <p className="text-sm text-gray-500 truncate w-48">{admin.email}</p>
            </div>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onSelect(admin); }}
            className="px-4 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 drop-shadow transition"
            aria-label={`View permissions for ${admin.userName}`}
          >
            Permissions
          </button>
        </li>
      ))}
    </ul>
  );
}
