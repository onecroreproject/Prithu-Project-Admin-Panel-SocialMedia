import { 
  Users, 
  Heart, 
  MessageCircle, 
  Share2, 
  Download, 
  Eye, 
  BarChart3,
  TrendingUp,
  Video,
  Image as ImageIcon,
  Bookmark,
  XCircle,
  ThumbsUp,
  ThumbsDown
} from "lucide-react";

const statConfigs = {
  following: {
    icon: Users,
    color: "from-blue-500 to-cyan-500",
    label: "Following",
    description: "Accounts user follows"
  },
  followers: {
    icon: Users,
    color: "from-green-500 to-emerald-500",
    label: "Followers",
    description: "Accounts following user"
  },
  liked: {
    icon: Heart,
    color: "from-red-500 to-pink-500",
    label: "Liked Posts",
    description: "Posts user liked"
  },
  commented: {
    icon: MessageCircle,
    color: "from-purple-500 to-violet-500",
    label: "Comments",
    description: "Comments made"
  },
  shared: {
    icon: Share2,
    color: "from-orange-500 to-amber-500",
    label: "Shared",
    description: "Posts shared"
  },
  downloaded: {
    icon: Download,
    color: "from-indigo-500 to-blue-500",
    label: "Downloads",
    description: "Content downloaded"
  },
  posts: {
    icon: BarChart3,
    color: "from-gray-600 to-gray-800",
    label: "Total Posts",
    description: "User's posts"
  },
  images: {
    icon: ImageIcon,
    color: "from-blue-400 to-cyan-400",
    label: "Images",
    description: "Image posts"
  },
  videos: {
    icon: Video,
    color: "from-purple-400 to-pink-400",
    label: "Videos",
    description: "Video posts"
  },
  hidden: {
    icon: Eye,
    color: "from-gray-500 to-gray-700",
    label: "Hidden",
    description: "Posts hidden"
  },
  interested: {
    icon: ThumbsUp,
    color: "from-green-400 to-emerald-400",
    label: "Interested",
    description: "Categories of interest"
  },
  nonInterested: {
    icon: ThumbsDown,
    color: "from-red-400 to-pink-400",
    label: "Not Interested",
    description: "Categories not interested"
  }
};

export default function AnalyticsStats({ stats }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {Object.entries(stats).map(([key, value]) => {
        const config = statConfigs[key];
        if (!config) return null;
        
        const Icon = config.icon;
        
        return (
          <div
            key={key}
            className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow duration-300"
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`p-2.5 rounded-lg bg-gradient-to-br ${config.color}`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                {value.toLocaleString()}
              </div>
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">
              {value.toLocaleString()}
            </h3>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {config.label}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {config.description}
            </p>
          </div>
        );
      })}
    </div>
  );
}