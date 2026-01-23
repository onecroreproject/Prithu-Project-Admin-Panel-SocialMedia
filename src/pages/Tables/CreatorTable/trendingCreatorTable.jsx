import { useState, useEffect, useMemo } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHeader, 
  TableRow 
} from "../../../components/ui/table";
import Badge from "../../../components/ui/badge/Badge";
import { 
  ChevronDown, 
  Eye, 
  Heart, 
  Share2, 
  Users, 
  Image as ImageIcon, 
  Video, 
  TrendingUp,
  BarChart3,
  ArrowUpDown,
  Flame
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Time ago helper
const timeAgo = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);
  const intervals = [
    { label: "year", seconds: 31536000 },
    { label: "month", seconds: 2592000 },
    { label: "day", seconds: 86400 },
    { label: "hour", seconds: 3600 },
    { label: "minute", seconds: 60 },
  ];
  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds);
    if (count >= 1) return `${count} ${interval.label}${count > 1 ? "s" : ""} ago`;
  }
  return "Just now";
};

// Format numbers with commas
const formatNumber = (num) => {
  if (!num) return "0";
  return new Intl.NumberFormat().format(num);
};

// Get trending score color
const getScoreColor = (score) => {
  if (score >= 80) return "bg-gradient-to-r from-green-500 to-emerald-600";
  if (score >= 60) return "bg-gradient-to-r from-blue-500 to-cyan-600";
  if (score >= 40) return "bg-gradient-to-r from-yellow-500 to-orange-500";
  return "bg-gradient-to-r from-gray-400 to-gray-500";
};

export default function TrendingCreatorsTable({ 
  creators = [], 
  isLoading = false,
  sortBy = "trendingScore",
  sortOrder = "desc",
  onSortChange 
}) {
  const [localSortBy, setLocalSortBy] = useState(sortBy);
  const [localSortOrder, setLocalSortOrder] = useState(sortOrder);

  // Sync with parent sort
  useEffect(() => {
    setLocalSortBy(sortBy);
    setLocalSortOrder(sortOrder);
  }, [sortBy, sortOrder]);

  // Sort creators locally for table display
  const sortedCreators = useMemo(() => {
    if (!creators?.length) return [];
    
    const sorted = [...creators];
    sorted.sort((a, b) => {
      let valueA, valueB;
      
      switch (localSortBy) {
        case "trendingScore":
          valueA = parseFloat(a.trendingScore) || 0;
          valueB = parseFloat(b.trendingScore) || 0;
          break;
        case "followerCount":
          valueA = a.followerCount || 0;
          valueB = b.followerCount || 0;
          break;
        case "totalLikes":
          valueA = a.totalLikes || 0;
          valueB = b.totalLikes || 0;
          break;
        case "totalShares":
          valueA = a.totalShares || 0;
          valueB = b.totalShares || 0;
          break;
        case "totalPosts":
          valueA = (a.imagePosts || 0) + (a.videoPosts || 0);
          valueB = (b.imagePosts || 0) + (b.videoPosts || 0);
          break;
        default:
          valueA = parseFloat(a.trendingScore) || 0;
          valueB = parseFloat(b.trendingScore) || 0;
      }
      
      return localSortOrder === "asc" ? valueA - valueB : valueB - valueA;
    });
    
    return sorted;
  }, [creators, localSortBy, localSortOrder]);

  const handleSort = (column) => {
    let newSortOrder = "desc";
    let newSortBy = column;
    
    if (localSortBy === column) {
      newSortOrder = localSortOrder === "desc" ? "asc" : "desc";
    }
    
    setLocalSortBy(newSortBy);
    setLocalSortOrder(newSortOrder);
    
    // Notify parent component
    if (onSortChange) {
      onSortChange(newSortBy, newSortOrder);
    }
  };

  const getSortIcon = (column) => {
    if (localSortBy !== column) {
      return <ArrowUpDown className="w-3 h-3 ml-1 text-gray-400" />;
    }
    
    return (
      <ChevronDown
        className={`w-3 h-3 ml-1 transition-transform duration-200 ${
          localSortOrder === "desc" ? "rotate-0" : "rotate-180"
        } text-blue-500`}
      />
    );
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800 shadow-lg">
        <div className="max-w-full overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
              <tr>
                {["Creator", "Trending Score", "Followers", "Views", "Likes", "Shares", "Content", "Last Updated"].map((header, i) => (
                  <th key={i} className="px-6 py-4">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {[...Array(5)].map((_, rowIndex) => (
                <tr key={rowIndex}>
                  {[...Array(8)].map((_, cellIndex) => (
                    <td key={cellIndex} className="px-6 py-4">
                      <div className="h-6 bg-gray-100 dark:bg-gray-700 rounded animate-pulse"></div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Empty state
  if (!creators || creators.length === 0) {
    return (
      <motion.div
        className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800 shadow-lg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="text-center py-16 px-4">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
            <Users className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
            No Creators Found
          </h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
            Try adjusting your search or filters to find trending creators
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800 shadow-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="max-w-full overflow-x-auto">
          <Table className="min-w-full text-sm">
            <TableHeader className="border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
              <TableRow>
                <TableCell 
                  isHeader 
                  className="px-6 py-4 font-semibold text-left text-gray-700 dark:text-gray-300 sticky left-0 bg-inherit z-10 min-w-[220px]"
                >
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-2" />
                    <span>Creator</span>
                  </div>
                </TableCell>
                
                <TableCell
                  isHeader
                  className="px-6 py-4 font-semibold text-left text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors min-w-[150px]"
                  onClick={() => handleSort("trendingScore")}
                >
                  <div className="flex items-center group">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    <span>Trending Score</span>
                    {getSortIcon("trendingScore")}
                  </div>
                </TableCell>
                
                <TableCell
                  isHeader
                  className="px-6 py-4 font-semibold text-left text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors min-w-[130px]"
                  onClick={() => handleSort("followerCount")}
                >
                  <div className="flex items-center group">
                    <Users className="w-4 h-4 mr-2" />
                    <span>Followers</span>
                    {getSortIcon("followerCount")}
                  </div>
                </TableCell>
                
                <TableCell 
                  isHeader 
                  className="px-6 py-4 font-semibold text-left text-gray-700 dark:text-gray-300 min-w-[130px]"
                >
                  <div className="flex items-center">
                    <Eye className="w-4 h-4 mr-2" />
                    <span>Views</span>
                  </div>
                </TableCell>
                
                <TableCell
                  isHeader
                  className="px-6 py-4 font-semibold text-left text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors min-w-[100px]"
                  onClick={() => handleSort("totalLikes")}
                >
                  <div className="flex items-center group">
                    <Heart className="w-4 h-4 mr-2" />
                    <span>Likes</span>
                    {getSortIcon("totalLikes")}
                  </div>
                </TableCell>
                
                <TableCell
                  isHeader
                  className="px-6 py-4 font-semibold text-left text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors min-w-[100px]"
                  onClick={() => handleSort("totalShares")}
                >
                  <div className="flex items-center group">
                    <Share2 className="w-4 h-4 mr-2" />
                    <span>Shares</span>
                    {getSortIcon("totalShares")}
                  </div>
                </TableCell>
                
                <TableCell 
                  isHeader 
                  className="px-6 py-4 font-semibold text-left text-gray-700 dark:text-gray-300 min-w-[120px]"
                >
                  <div className="flex items-center">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    <span>Content</span>
                  </div>
                </TableCell>
                
                <TableCell 
                  isHeader 
                  className="px-6 py-4 font-semibold text-left text-gray-700 dark:text-gray-300 min-w-[140px]"
                >
                  <span>Last Updated</span>
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-gray-700">
              <AnimatePresence>
                {sortedCreators.map((creator, idx) => (
                  <motion.tr
                    key={creator.userId || idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2, delay: idx * 0.02 }}
                    className="group hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 dark:hover:from-gray-700/50 dark:hover:to-gray-800/50 transition-all duration-200"
                  >
                    <TableCell className="px-6 py-4 sticky left-0 bg-white dark:bg-gray-800 group-hover:bg-gray-50 dark:group-hover:bg-gray-700/50 z-10 min-w-[220px]">
                      <div className="flex items-center gap-3">
                        <div className="relative flex-shrink-0">
                          <div className="w-12 h-12 overflow-hidden rounded-full border-2 border-white dark:border-gray-700 shadow-lg">
                            <img 
                              width={48} 
                              height={48} 
                              src={creator.profileAvatar || "/default-avatar.png"} 
                              alt={creator.userName}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.src = "/default-avatar.png";
                              }}
                            />
                          </div>
                          {creator.trendingScore >= 80 && (
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-sm">
                              <Flame className="w-3 h-3 text-white" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <span className="block font-semibold text-gray-900 dark:text-gray-100 truncate">
                            {creator.userName || "Unknown Creator"}
                          </span>
                          <span className="block text-xs text-gray-500 dark:text-gray-400 truncate">
                            ID: {creator.userId?.toString().slice(0, 8) || "N/A"}...
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="px-6 py-4 min-w-[150px]">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <Badge 
                            size="md" 
                            className={`font-bold px-3 py-1 ${getScoreColor(creator.trendingScore)} text-white border-0`}
                          >
                            {parseFloat(creator.trendingScore || 0).toFixed(1)}
                          </Badge>
                          <div className="text-xs text-gray-500">
                            {localSortBy === "trendingScore" && (
                              <span className={`flex items-center ${localSortOrder === "desc" ? "text-red-500" : "text-green-500"}`}>
                                {localSortOrder === "desc" ? "↓" : "↑"}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full transition-all duration-500 ${getScoreColor(creator.trendingScore)}`}
                            style={{ width: `${Math.min(creator.trendingScore || 0, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell className="px-6 py-4 min-w-[130px]">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-blue-500" />
                        <span className="font-semibold text-gray-900 dark:text-gray-100">
                          {formatNumber(creator.followerCount)}
                        </span>
                      </div>
                    </TableCell>
                    
                    <TableCell className="px-6 py-4 min-w-[130px]">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <Video className="w-4 h-4 text-purple-500" />
                          <span className="font-medium">{formatNumber(creator.totalVideoViews)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <ImageIcon className="w-4 h-4 text-blue-500" />
                          <span className="font-medium">{formatNumber(creator.totalImageViews)}</span>
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell className="px-6 py-4 min-w-[100px]">
                      <div className="flex items-center gap-2">
                        <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                        <span className="font-semibold text-gray-900 dark:text-gray-100">
                          {formatNumber(creator.totalLikes)}
                        </span>
                      </div>
                    </TableCell>
                    
                    <TableCell className="px-6 py-4 min-w-[100px]">
                      <div className="flex items-center gap-2">
                        <Share2 className="w-4 h-4 text-green-500" />
                        <span className="font-semibold text-gray-900 dark:text-gray-100">
                          {formatNumber(creator.totalShares)}
                        </span>
                      </div>
                    </TableCell>
                    
                    <TableCell className="px-6 py-4 min-w-[120px]">
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <div className="flex items-center gap-1 mb-1">
                            <ImageIcon className="w-4 h-4 text-blue-500" />
                            <span className="font-semibold">{creator.imagePosts || 0}</span>
                          </div>
                          <span className="text-xs text-gray-500">Images</span>
                        </div>
                        <div className="h-8 w-px bg-gray-200 dark:bg-gray-600"></div>
                        <div className="text-center">
                          <div className="flex items-center gap-1 mb-1">
                            <Video className="w-4 h-4 text-purple-500" />
                            <span className="font-semibold">{creator.videoPosts || 0}</span>
                          </div>
                          <span className="text-xs text-gray-500">Videos</span>
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell className="px-6 py-4 min-w-[140px]">
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-900 dark:text-gray-100 font-medium">
                          {timeAgo(creator.lastUpdated)}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(creator.lastUpdated).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                    </TableCell>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </TableBody>
          </Table>
        </div>
        
        {/* Table footer */}
        <div className="px-6 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-sm text-gray-600 dark:text-gray-400">
            <div>
              Showing <span className="font-semibold text-gray-900 dark:text-gray-100">{sortedCreators.length}</span> creators
              {localSortBy !== "trendingScore" && (
                <span className="ml-2 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded text-xs">
                  Sorted by {localSortBy.replace(/([A-Z])/g, ' $1').toLowerCase()}
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-gradient-to-r from-green-500 to-emerald-600"></div>
                <span className="text-xs">High Score (80+)</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-cyan-600"></div>
                <span className="text-xs">Good Score (60-79)</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500"></div>
                <span className="text-xs">Medium Score (40-59)</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}