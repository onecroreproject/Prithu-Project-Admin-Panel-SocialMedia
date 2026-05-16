import React, { useState, useEffect } from "react";
import {
  Video,
  CheckCircle,
  AlertTriangle,
  Play,
  Pause,
  StopCircle,
  RefreshCw,
  Clock,
  Layout,
  ExternalLink
} from "lucide-react";
import videoCompressionService from "../../Services/videoCompressionService";
import { toast } from "react-hot-toast";

const VideoCompressionDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchStats();
    // Refresh stats every 30 seconds if there's processing going on
    const interval = setInterval(() => {
      if (stats?.stats?.processing > 0) {
        fetchStats(true);
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [stats?.stats?.processing]);

  const fetchStats = async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      const response = await videoCompressionService.getStats();
      if (response.success) {
        setStats(response);
      }
    } catch (error) {
      console.error("Failed to fetch compression stats", error);
      if (!isSilent) toast.error("Failed to load compression stats");
    } finally {
      if (!isSilent) setLoading(false);
    }
  };

  const handleStartBulk = async () => {
    if (!window.confirm("Are you sure you want to start bulk compression for all uncompressed videos? This will queue all pending videos.")) return;
    
    try {
      setActionLoading(true);
      const response = await videoCompressionService.startBulkCompression();
      if (response.success) {
        toast.success(response.message);
        fetchStats();
      }
    } catch (error) {
      toast.error("Failed to start bulk compression");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRetry = async (feedId) => {
    try {
      const response = await videoCompressionService.retryCompression(feedId);
      if (response.success) {
        toast.success("Retry job queued");
        fetchStats();
      }
    } catch (error) {
      toast.error("Failed to retry compression");
    }
  };

  const handleToggleQueue = async () => {
    try {
      setActionLoading(true);
      const response = await videoCompressionService.toggleQueue();
      if (response.success) {
        toast.success(response.message);
        fetchStats();
      }
    } catch (error) {
      toast.error("Failed to toggle queue status");
    } finally {
      setActionLoading(false);
    }
  };

  const handleStopAll = async () => {
    if (!window.confirm("Are you sure you want to stop all compression jobs and clear the queue? This will reset all currently processing videos.")) return;
    
    try {
      setActionLoading(true);
      const response = await videoCompressionService.stopAllCompression();
      if (response.success) {
        toast.success(response.message);
        fetchStats();
      }
    } catch (error) {
      toast.error("Failed to stop compression jobs");
    } finally {
      setActionLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, label, value, subValue, color, trend }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon className="w-6 h-6" />
        </div>
        {trend && (
            <span className={`text-xs font-bold px-2 py-1 rounded-full ${trend.includes('+') ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                {trend}
            </span>
        )}
      </div>
      <h3 className="text-3xl font-bold dark:text-white">{value}</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mt-1">{label}</p>
      {subValue && <p className="text-xs text-gray-400 mt-2">{subValue}</p>}
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
            <RefreshCw className="w-10 h-10 animate-spin text-blue-500" />
            <p className="text-gray-500 animate-pulse">Loading Compression Data...</p>
        </div>
      </div>
    );
  }

  const { stats: s, recentFailures } = stats || {};

  return (
    <div className="p-6 max-w-7xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold dark:text-white flex items-center gap-3">
            <Video className="w-8 h-8 text-blue-500" />
            Video Compression Dashboard
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage background video optimization and storage efficiency
          </p>
        </div>
        <div className="flex gap-3">
            <button
            onClick={() => fetchStats()}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 transition-all shadow-sm"
            >
            <RefreshCw className="w-4 h-4" />
            Refresh
            </button>
            <button
            onClick={handleToggleQueue}
            disabled={actionLoading}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all shadow-sm font-bold border ${
                s?.isPaused 
                ? 'bg-green-50 border-green-200 text-green-600 hover:bg-green-100' 
                : 'bg-amber-50 border-amber-200 text-amber-600 hover:bg-amber-100'
            }`}
            >
            {s?.isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            {s?.isPaused ? 'Resume Service' : 'Pause Service'}
            </button>

            <button
            onClick={handleStopAll}
            disabled={actionLoading || (!s?.processing && !s?.waitingCount)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all shadow-sm font-bold border ${
                (!s?.processing && !s?.waitingCount)
                ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100'
            }`}
            >
            <StopCircle className="w-4 h-4" />
            Stop All
            </button>

            <button
            onClick={handleStartBulk}
            disabled={actionLoading || s?.uncompressed === 0}
            className={`flex items-center gap-2 px-6 py-2 rounded-xl transition-all shadow-lg font-bold ${
                s?.uncompressed === 0 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/25'
            }`}
            >
            {actionLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            Start Compression
            </button>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
            <Video className="w-32 h-32 text-blue-500" />
        </div>
        
        <div className="relative z-10">
            <div className="flex justify-between items-end mb-4">
                <div>
                    <h3 className="text-lg font-bold dark:text-white">Overall Progress</h3>
                    <p className="text-sm text-gray-500">System-wide video optimization status</p>
                </div>
                <div className="text-right">
                    <span className="text-4xl font-black text-blue-600">{s?.percentage}%</span>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Completed</p>
                </div>
            </div>

            <div className="w-full bg-gray-100 dark:bg-gray-700 h-4 rounded-full overflow-hidden mb-6">
                <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-1000 ease-out shadow-inner"
                    style={{ width: `${s?.percentage}%` }}
                ></div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-2xl border border-blue-100 dark:border-blue-900/20">
                    <p className="text-xs text-blue-600 font-bold uppercase">Total Videos</p>
                    <p className="text-xl font-bold dark:text-white">{s?.totalVideos}</p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/10 p-4 rounded-2xl border border-green-100 dark:border-green-900/20">
                    <p className="text-xs text-green-600 font-bold uppercase">Compressed</p>
                    <p className="text-xl font-bold dark:text-white">{s?.compressed}</p>
                </div>
                <div className="bg-amber-50 dark:bg-amber-900/10 p-4 rounded-2xl border border-amber-100 dark:border-amber-900/20">
                    <p className="text-xs text-amber-600 font-bold uppercase">Processing</p>
                    <p className="text-xl font-bold dark:text-white">{s?.processing}</p>
                </div>
                <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-2xl border border-red-100 dark:border-red-900/20">
                    <p className="text-xs text-red-600 font-bold uppercase">Failed</p>
                    <p className="text-xl font-bold dark:text-white">{s?.failed}</p>
                </div>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Failures */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold dark:text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                Recent Failures
            </h3>
            <button 
                onClick={() => fetchStats()}
                className="text-xs text-blue-500 font-bold hover:underline"
            >
                View All
            </button>
          </div>
          
          <div className="space-y-4">
            {recentFailures?.length > 0 ? (
                recentFailures.map((item) => (
                    <div key={item._id} className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700 hover:border-red-200 transition-all group">
                        <div className="flex items-center gap-4 overflow-hidden">
                            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Video className="w-6 h-6 text-red-600" />
                            </div>
                            <div className="overflow-hidden">
                                <h4 className="text-sm font-bold dark:text-white truncate max-w-[200px]">ID: {item._id}</h4>
                                <p className="text-xs text-red-500 truncate mt-1">{item.compressionError || "Unknown error"}</p>
                                <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {new Date(item.compressionCompletedAt || Date.now()).toLocaleString()}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <a 
                                href={item.mediaUrl} 
                                target="_blank" 
                                rel="noreferrer"
                                className="p-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 hover:text-blue-500 transition-colors"
                            >
                                <ExternalLink className="w-4 h-4" />
                            </a>
                            <button 
                                onClick={() => handleRetry(item._id)}
                                className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                            >
                                <RefreshCw className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))
            ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="bg-green-50 dark:bg-green-900/10 p-4 rounded-full mb-4">
                        <CheckCircle className="w-8 h-8 text-green-500" />
                    </div>
                    <p className="text-gray-500 dark:text-gray-400">Great! No recent compression failures.</p>
                </div>
            )}
          </div>
        </div>

        {/* System Health */}
        <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-bold mb-6 dark:text-white flex items-center gap-2">
                    <Layout className="w-5 h-5 text-indigo-500" />
                    Worker Status
                </h3>
                
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50"></div>
                            <span className="text-sm font-medium dark:text-gray-300">BullMQ Worker</span>
                        </div>
                        <span className={`text-xs font-bold px-2 py-1 rounded-md ${s?.isPaused ? 'bg-amber-50 text-amber-600' : 'bg-green-50 text-green-600'}`}>
                            {s?.isPaused ? 'PAUSED' : 'ACTIVE'}
                        </span>
                    </div>

                    <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/20">
                        <h4 className="text-sm font-bold text-indigo-900 dark:text-indigo-400 mb-2">Queue Information</h4>
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs">
                                <span className="text-indigo-700 dark:text-indigo-500">Concurrency</span>
                                <span className="font-bold dark:text-white">2 Jobs</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-indigo-700 dark:text-indigo-500">Resolution Cap</span>
                                <span className="font-bold dark:text-white">720p (HD)</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-indigo-700 dark:text-indigo-500">Locking</span>
                                <span className="font-bold dark:text-white">Enabled</span>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900/30 border border-gray-100 dark:border-gray-800">
                        <p className="text-[10px] text-gray-400 font-medium leading-relaxed">
                            Worker is configured to process videos asynchronously. Original files are backed up before replacement to ensure zero downtime.
                        </p>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default VideoCompressionDashboard;
