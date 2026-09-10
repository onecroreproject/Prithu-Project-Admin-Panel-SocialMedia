import { motion } from "framer-motion";
import { 
  Eye, 
  Heart, 
  Share2, 
  Download, 
  MessageCircle,
  ThumbsDown,
  Calendar,
  BarChart3,
  ExternalLink,
  User,
  Tag,
  Lock,
  ThumbsUp,
  Send,
  Save
} from "lucide-react";

const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatNumber = (num) => {
  if (!num && num !== 0) return '-';
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
};

const renderTableCell = (activeTab, row, column) => {
  console.log(activeTab)
  switch (activeTab) {
    case "posts":
      if (column === "post") {
        return (
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
              {row.feedId?.contentUrl ? (
                <img
                  src={row.feedId.contentUrl}
                  alt={row.feedId.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  {row.feedId?.type === 'video' ? '🎥' : '📷'}
                </div>
              )}
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-gray-100">{row.feedId?.title}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                <Calendar className="w-3 h-3" />
                {formatDate(row.feedId?.createdAt || row.createdAt)}
              </p>
            </div>
          </div>
        );
      }
      if (column === "engagement") {
        return (
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <Eye className="w-3 h-3 text-blue-500" />
                <span className="text-sm font-medium">{formatNumber(row.views)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Heart className="w-3 h-3 text-red-500" />
                <span className="text-sm font-medium">{formatNumber(row.likes)}</span>
              </div>
              <div className="flex items-center gap-1">
                <MessageCircle className="w-3 h-3 text-green-500" />
                <span className="text-sm font-medium">{formatNumber(row.comments)}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <Share2 className="w-3 h-3 text-orange-500" />
                <span className="text-sm font-medium">{formatNumber(row.shares)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Download className="w-3 h-3 text-purple-500" />
                <span className="text-sm font-medium">{formatNumber(row.downloads)}</span>
              </div>
              <div className="flex items-center gap-1">
                <ThumbsDown className="w-3 h-3 text-gray-500" />
                <span className="text-sm font-medium">{formatNumber(row.dislikes)}</span>
              </div>
            </div>
          </div>
        );
      }
      break;

    case "following":
    case "followers":
      if (column === "user") {
        return (
          <div className="flex items-center gap-3">
            <img
              src={row.profileAvatar}
              alt={row.userName}
              className="w-10 h-10 rounded-full border-2 border-white dark:border-gray-700 shadow-sm"
              onError={(e) => {
                e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${row.userName}`;
              }}
            />
            <div>
              <p className="font-medium text-gray-900 dark:text-gray-100">{row.userName}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">ID: {row.userId?.slice(0, 8)}...</p>
            </div>
          </div>
        );
      }
      if (column === "joined") {
        return (
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-gray-400" />
            {formatDate(row.followedAt || row.createdAt)}
          </div>
        );
      }
      break;

    case "interested":
    case "nonInterested":
      if (column === "category") {
        return (
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              activeTab === "interested" 
                ? "bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400"
                : "bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400"
            }`}>
              {activeTab === "interested" ? <ThumbsUp className="w-5 h-5" /> : <ThumbsDown className="w-5 h-5" />}
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-gray-100">{row.name || "Unnamed Category"}</p>
              {row.description && (
                <p className="text-sm text-gray-500 dark:text-gray-400">{row.description}</p>
              )}
            </div>
          </div>
        );
      }
      if (column === "description") {
        return (
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {row.description || "No description available"}
          </div>
        );
      }
      break;

    case "hidden":
      if (column === "content") {
        return (
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
              {row.feedId?.contentUrl ? (
                <img
                  src={row.feedId.contentUrl}
                  alt={row.feedId.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  {row.feedId?.type === 'video' ? '🎥' : '📷'}
                </div>
              )}
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-gray-100">{row.feedId?.title || "Untitled Content"}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                <Lock className="w-3 h-3" />
                {row.createdBy?.userName ? `Hidden from ${row.createdBy.userName}` : 'Hidden post'}
              </p>
            </div>
          </div>
        );
      }
      if (column === "type") {
        return (
          <div className="flex items-center gap-2">
            {row.feedId?.type === 'video' ? (
              <div className="px-2 py-1 bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded text-xs font-medium">
                Video
              </div>
            ) : (
              <div className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded text-xs font-medium">
                Image
              </div>
            )}
          </div>
        );
      }
      if (column === "hiddenOn") {
        return (
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-gray-400" />
            {formatDate(row.hiddenAt)}
          </div>
        );
      }
      break;

    case "liked":
    case "disliked":
    case "shared":
    case "downloaded":
    case "saved":
      if (column === "content") {
        const actionIcons = {
          liked: { icon: Heart, color: "text-red-500", bg: "bg-red-100 dark:bg-red-900/20" },
          disliked: { icon: ThumbsDown, color: "text-gray-500", bg: "bg-gray-100 dark:bg-gray-700" },
          shared: { icon: Share2, color: "text-orange-500", bg: "bg-orange-100 dark:bg-orange-900/20" },
          downloaded: { icon: Download, color: "text-purple-500", bg: "bg-purple-100 dark:bg-purple-900/20" },
          saved: { icon: Save, color: "text-yellow-500", bg: "bg-yellow-100 dark:bg-yellow-900/20" }
        };
        
        const ActionIcon = actionIcons[activeTab]?.icon || Heart;
        const iconColor = actionIcons[activeTab]?.color || "text-gray-500";
        const iconBg = actionIcons[activeTab]?.bg || "bg-gray-100";
        
        return (
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
              {row.feedId?.contentUrl ? (
                <img
                  src={row.feedId.contentUrl}
                  alt={row.feedId.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  {row.feedId?.type === 'video' ? '🎥' : '📷'}
                </div>
              )}
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-gray-100">{row.feedId?.title || `${activeTab} Content`}</p>
              <div className="flex items-center gap-2 mt-1">
                <div className={`px-2 py-1 ${iconBg} ${iconColor} rounded text-xs font-medium flex items-center gap-1`}>
                  <ActionIcon className="w-3 h-3" />
                  <span className="capitalize">{activeTab}</span>
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {row.feedId?.type === 'video' ? 'Video' : 'Image'}
                </span>
              </div>
            </div>
          </div>
        );
      }
      if (column === "type") {
        return (
          <div className="flex items-center gap-2">
            {row.feedId?.type === 'video' ? (
              <div className="px-2 py-1 bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded text-xs font-medium">
                Video
              </div>
            ) : (
              <div className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded text-xs font-medium">
                Image
              </div>
            )}
          </div>
        );
      }
      if (column === "actionDate") {
        const dateField = `${activeTab}At`; // likedAt, dislikedAt, etc.
        return (
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-gray-400" />
            {formatDate(row[dateField] || row.createdAt)}
          </div>
        );
      }
      break;

    case "commented":
      if (column === "post") {
        return (
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
              {row.feed?.contentUrl ? (
                <img
                  src={row.feed.contentUrl}
                  alt={row.feed.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  {row.feed?.type === 'video' ? '🎥' : '📷'}
                </div>
              )}
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-gray-100">{row.feed?.title || "Commented Post"}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                by {row.feed?.creator || row.feed?.createdByAccount || 'Unknown'}
              </p>
            </div>
          </div>
        );
      }
      if (column === "comment") {
        return (
          <div className="max-w-md">
            <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">{row.commentText}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {row.commentText?.length > 100 ? `${row.commentText.length} characters` : ''}
            </p>
          </div>
        );
      }
      if (column === "commentedOn") {
        return (
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-gray-400" />
            {formatDate(row.createdAt)}
          </div>
        );
      }
      break;

    default:
      return <span className="text-gray-500 dark:text-gray-400">-</span>;
  }
};

export default function UserAnalyticsTable({ activeTab, data, currentPage, itemsPerPage, isLoading, analyticsData }) {
  const getColumns = () => {
    switch (activeTab) {
      case "posts":
        return ["post", "engagement"];
      case "following":
      case "followers":
        return ["user", "joined", "actions"];
      case "interested":
      case "nonInterested":
        return ["category", "description"];
      case "hidden":
        return ["content", "type", "hiddenOn"];
      case "liked":
      case "disliked":
      case "shared":
      case "downloaded":
      case "saved":
        return ["content", "type", "actionDate"];
      case "commented":
        return ["post", "comment", "commentedOn"];
      default:
        return ["content", "type", "actionDate"];
    }
  };

  const getColumnHeaders = () => {
    switch (activeTab) {
      case "posts":
        return ["Post", "Engagement"];
      case "following":
        return ["User", "Followed On", "Actions"];
      case "followers":
        return ["Follower", "Followed On", "Actions"];
      case "interested":
        return ["Interested Category", "Description"];
      case "nonInterested":
        return ["Not Interested Category", "Description"];
      case "hidden":
        return ["Content", "Type", "Hidden Date"];
      case "liked":
        return ["Content", "Type", "Liked On"];
      case "disliked":
        return ["Content", "Type", "Disliked On"];
      case "shared":
        return ["Content", "Type", "Shared On"];
      case "downloaded":
        return ["Content", "Type", "Downloaded On"];
      case "saved":
        return ["Content", "Type", "Saved On"];
      case "commented":
        return ["Post", "Comment", "Commented On"];
      default:
        return ["Content", "Type", "Action Date"];
    }
  };

  const getActions = (row) => {
    switch (activeTab) {
      case "following":
      case "followers":
        return (
          <div className="flex items-center gap-2">
            <button 
              className="px-3 py-1.5 text-sm bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
              onClick={() => {/* View profile action */}}
            >
              View Profile
            </button>
            {activeTab === "following" && (
              <button 
                className="px-3 py-1.5 text-sm bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                onClick={() => {/* Unfollow action */}}
              >
                Unfollow
              </button>
            )}
          </div>
        );
      case "interested":
      case "nonInterested":
        return (
          <div className="flex items-center gap-2">
            <button 
              className="px-3 py-1.5 text-sm bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
              onClick={() => {/* View category action */}}
            >
              Explore
            </button>
            {activeTab === "interested" ? (
              <button 
                className="px-3 py-1.5 text-sm bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                onClick={() => {/* Mark as not interested */}}
              >
                Remove
              </button>
            ) : (
              <button 
                className="px-3 py-1.5 text-sm bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                onClick={() => {/* Mark as interested */}}
              >
                Try Again
              </button>
            )}
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-2">
            <button 
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
              title="View Details"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button 
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
              title="Open"
            >
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse"></div>
        ))}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
          {activeTab === "interested" || activeTab === "nonInterested" ? (
            activeTab === "interested" ? 
              <ThumbsUp className="w-10 h-10 text-gray-400" /> : 
              <ThumbsDown className="w-10 h-10 text-gray-400" />
          ) : activeTab === "shared" ? (
            <Share2 className="w-10 h-10 text-gray-400" />
          ) : activeTab === "downloaded" ? (
            <Download className="w-10 h-10 text-gray-400" />
          ) : activeTab === "saved" ? (
            <Save className="w-10 h-10 text-gray-400" />
          ) : (
            <BarChart3 className="w-10 h-10 text-gray-400" />
          )}
        </div>
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
          No {activeTab === "interested" ? "interested categories" : 
              activeTab === "nonInterested" ? "not interested categories" :
              activeTab === "shared" ? "shared posts" :
              activeTab === "downloaded" ? "downloaded posts" :
              activeTab === "saved" ? "saved posts" :
              activeTab.replace(/([A-Z])/g, ' $1').toLowerCase()} data available
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          {activeTab === "interested" || activeTab === "nonInterested" ? 
            "User hasn't selected any categories yet" :
            "Try adjusting your filters or check back later"}
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-700">
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">#</th>
            {getColumnHeaders().map((header, index) => (
              <th key={index} className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">
                {header}
              </th>
            ))}
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {data.map((row, rowIndex) => (
            <motion.tr
              key={row.id || row._id || rowIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: rowIndex * 0.05 }}
              className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <td className="py-3 px-4">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {(currentPage - 1) * itemsPerPage + rowIndex + 1}
                </span>
              </td>
              
              {getColumns().map((column, colIndex) => (
                <td key={colIndex} className="py-3 px-4">
                  {renderTableCell(activeTab, row, column) || (
                    <span className="text-gray-500 dark:text-gray-400">-</span>
                  )}
                </td>
              ))}
              
              <td className="py-3 px-4">
                {getActions(row)}
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}