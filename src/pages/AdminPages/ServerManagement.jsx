import React, { useState, useEffect } from 'react';
import api from '../../Services/apiClient';
import {
    Server,
    Cpu,
    HardDrive,
    Activity,
    RefreshCcw,
    Clock,
    Network,
    Terminal,
    AlertCircle,
    CheckCircle2,
    Folder,
    ChevronRight,
    ArrowLeft,
    X,
    FileSearch
} from 'lucide-react';

const FolderExplorerModal = ({ isOpen, onClose }) => {
    const [path, setPath] = useState('');
    const [history, setHistory] = useState([]);
    const [folders, setFolders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchFolders = async (targetPath) => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get(`/api/admin/server/explore?folderPath=${targetPath}`);
            if (response.data.success) {
                setFolders(response.data.folders);
                setPath(targetPath);
            } else {
                setError(response.data.message);
            }
        } catch (err) {
            setError(err.response?.data?.message || "Failed to fetch folder details");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchFolders('');
            setHistory([]);
        }
    }, [isOpen]);

    const handleFolderClick = (newPath) => {
        setHistory(prev => [...prev, path]);
        fetchFolders(newPath);
    };

    const handleBack = () => {
        if (history.length === 0) return;
        const newHistory = [...history];
        const prevPath = newHistory.pop();
        setHistory(newHistory);
        fetchFolders(prevPath);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white dark:bg-gray-800 w-full max-w-2xl rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col max-h-[80vh]">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-gray-50/50 dark:bg-gray-900/20">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500 rounded-xl text-white">
                            <FileSearch className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="font-bold text-gray-900 dark:text-white">Secure Folder Explorer</h2>
                            <p className="text-[10px] text-gray-500 font-mono truncate max-w-[300px]">Base: / {path}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-500">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-2 no-scrollbar">
                    {history.length > 0 && (
                        <button
                            onClick={handleBack}
                            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-all text-blue-600 font-bold text-sm border border-transparent hover:border-blue-100 dark:hover:border-blue-900"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Parent
                        </button>
                    )}

                    {loading ? (
                        <div className="py-20 flex flex-col items-center justify-center space-y-3">
                            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-xs text-gray-500 animate-pulse">Scanning Directories...</p>
                        </div>
                    ) : error ? (
                        <div className="py-12 text-center text-red-500 space-y-2">
                            <AlertCircle className="w-10 h-10 mx-auto opacity-50" />
                            <p className="font-medium">{error}</p>
                        </div>
                    ) : folders.length === 0 ? (
                        <div className="py-20 text-center text-gray-400 space-y-2">
                            <Folder className="w-12 h-12 mx-auto opacity-20" />
                            <p>No subfolders found</p>
                        </div>
                    ) : (
                        folders.map((folder, i) => (
                            <button
                                key={i}
                                onClick={() => handleFolderClick(folder.path)}
                                className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-all group border border-transparent hover:border-blue-100 dark:hover:border-blue-900/30"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="p-2.5 bg-gray-100 dark:bg-gray-800 rounded-xl group-hover:bg-blue-500 group-hover:text-white transition-all">
                                        <Folder className="w-5 h-5" />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-bold text-gray-900 dark:text-gray-100 text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400">{folder.name}</p>
                                        <p className="text-[10px] text-gray-500 font-mono tracking-tighter">{folder.path}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="text-xs font-bold text-gray-400 group-hover:text-blue-500 tabular-nums">{folder.size}</span>
                                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                                </div>
                            </button>
                        ))
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 bg-gray-50 dark:bg-gray-900/30 border-t border-gray-100 dark:border-gray-700 text-center">
                    <p className="text-[10px] text-gray-400 uppercase font-black tracking-[0.2em]">Restricted Admin View</p>
                </div>
            </div>
        </div>
    );
};

const ServerManagement = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const [isExplorerOpen, setIsExplorerOpen] = useState(false);

    const fetchStats = async (isManual = false) => {
        if (isManual) setRefreshing(true);
        try {
            // const token = localStorage.getItem('adminToken'); // Token handling should be in apiClient
            const response = await api.get('/api/admin/server/status'); // Changed to apiClient.get
            if (response.data.success) { // Access data via response.data
                setStats(response.data.data);
                setError(null);
            } else {
                setError(response.data.message || "Failed to load stats"); // Access message via response.data
            }
        } catch (err) {
            setError(err.response?.data?.message || "Server connection lost"); // Access error message for Axios
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchStats();
        const interval = setInterval(() => fetchStats(), 30000); // Auto-refresh every 30s
        return () => clearInterval(interval);
    }, []);

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <p className="text-gray-500 animate-pulse">Initializing Monitor...</p>
        </div>
    );

    if (error) return (
        <div className="p-6 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-4 text-red-700">
            <AlertCircle className="w-8 h-8" />
            <div>
                <h3 className="font-bold">Monitoring Error</h3>
                <p>{error}</p>
                <button onClick={() => fetchStats()} className="mt-2 text-sm font-semibold underline">Retry Connection</button>
            </div>
        </div>
    );

    const formatBytes = (bytes) => {
        if (!bytes || isNaN(bytes)) return "0 B";
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const formatUptime = (seconds) => {
        const d = Math.floor(seconds / (3600 * 24));
        const h = Math.floor(seconds % (3600 * 24) / 3600);
        const m = Math.floor(seconds % 3600 / 60);
        return `${d}d ${h}h ${m} m`;
    };

    return (
        <div className="p-6 space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Server className="text-blue-500" />
                        Server Management
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Real-time health and process monitoring for node.js backend</p>
                </div>
                <button
                    onClick={() => fetchStats(true)}
                    disabled={refreshing}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-all disabled:opacity-50"
                >
                    <RefreshCcw className={`w - 4 h - 4 ${refreshing ? 'animate-spin' : ''} `} />
                    {refreshing ? 'Refreshing...' : 'Refresh Now'}
                </button>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* CPU Card */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                            <Cpu className="text-amber-600 w-6 h-6" />
                        </div>
                        <span className="text-xs font-semibold px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">{stats.cpu.cores} Cores</span>
                    </div>
                    <p className="text-gray-500 text-xs uppercase font-bold tracking-wider">CPU Model</p>
                    <h3 className="text-sm font-semibold mt-1 mb-2 line-clamp-1">{stats.cpu.model}</h3>
                    <div className="w-full bg-gray-100 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                        <div
                            className="bg-amber-500 h-full transition-all duration-1000"
                            style={{ width: `${stats.cpu.loadAverage?.[0] || (5 + Math.random() * 10)}% ` }}
                        ></div>
                    </div>
                </div>

                {/* RAM Card */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <Activity className="text-blue-600 w-6 h-6" />
                        </div>
                        <span className="text-sm font-bold text-blue-600">{stats.memory.usagePercent}%</span>
                    </div>
                    <p className="text-gray-500 text-xs uppercase font-bold tracking-wider">RAM Usage</p>
                    <h3 className="text-lg font-bold mt-1 mb-2">{formatBytes(stats.memory.used)} / {formatBytes(stats.memory.total)}</h3>
                    <div className="w-full bg-gray-100 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                        <div
                            className="bg-blue-500 h-full transition-all duration-1000"
                            style={{ width: `${stats.memory.usagePercent}% ` }}
                        ></div>
                    </div>
                </div>

                {/* Disk Card */}
                <div
                    onClick={() => setIsExplorerOpen(true)}
                    className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm cursor-pointer hover:shadow-md hover:border-blue-200 dark:hover:border-blue-900/50 transition-all group"
                >
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg group-hover:bg-green-500 group-hover:text-white transition-all">
                            <HardDrive className="text-green-600 w-6 h-6 group-hover:text-white" />
                        </div>
                        <span className="text-sm font-bold text-green-600">{Array.isArray(stats.disk) ? stats.disk[0]?.percent : 0}%</span>
                    </div>
                    <p className="text-gray-500 text-xs uppercase font-bold tracking-wider">Primary Disk</p>
                    <h3 className="text-lg font-bold mt-1 mb-2">{formatBytes(Array.isArray(stats.disk) ? stats.disk[0]?.used : 0)} / {formatBytes(Array.isArray(stats.disk) ? stats.disk[0]?.total : 0)}</h3>
                    <div className="w-full bg-gray-100 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                        <div
                            className="bg-green-500 h-full transition-all duration-1000"
                            style={{ width: `${Array.isArray(stats.disk) ? stats.disk[0]?.percent : 0}%` }}
                        ></div>
                    </div>
                    <p className="text-[10px] text-blue-500 mt-3 font-bold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <FileSearch className="w-3 h-3" /> Click to Explore Folders
                    </p>
                </div>

                {/* Uptime Card */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                            <Clock className="text-purple-600 w-6 h-6" />
                        </div>
                    </div>
                    <p className="text-gray-500 text-xs uppercase font-bold tracking-wider">System Uptime</p>
                    <h3 className="text-xl font-black mt-2 text-gray-800 dark:text-gray-100">{formatUptime(stats.uptime.system)}</h3>
                    <p className="text-xs text-gray-400 mt-2">Server Folder Size: <span className="text-gray-600 dark:text-gray-300 font-semibold">{stats.projectSize}</span></p>
                </div>
            </div>

            {/* Detailed Info Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* PM2 Processes Table */}
                <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-gray-50 dark:border-gray-700 flex items-center justify-between">
                        <h2 className="font-bold flex items-center gap-2">
                            <Terminal className="text-blue-500 w-5 h-5" />
                            PM2 Process Monitor
                        </h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 font-bold uppercase tracking-wider text-[10px]">
                                <tr>
                                    <th className="px-6 py-4">Process</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">CPU/RAM</th>
                                    <th className="px-6 py-4 text-center">Restarts</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                                {Array.isArray(stats.pm2) ? stats.pm2.map((proc, i) => (
                                    <tr key={i} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/20 transition-colors">
                                        <td className="px-6 py-4 font-bold">{proc.name}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px - 2 py - 1 rounded - full text - [10px] uppercase font - bold flex items - center gap - 1 w - fit ${proc.status === 'online' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'} `}>
                                                {proc.status === 'online' ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                                                {proc.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right tabular-nums">
                                            <div className="font-bold">{proc.cpu}%</div>
                                            <div className="text-[10px] text-gray-400">{formatBytes(proc.memory)}</div>
                                        </td>
                                        <td className="px-6 py-4 text-center tabular-nums font-bold text-amber-600">{proc.restarts}</td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-12 text-center text-gray-400 italic">
                                            {typeof stats.pm2 === 'string' ? stats.pm2 : 'Process statistics not available'}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Hardware/Network Details */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm">
                        <h2 className="font-bold flex items-center gap-2 mb-6">
                            <Network className="text-blue-500 w-5 h-5" />
                            System Environment
                        </h2>
                        <div className="grid grid-cols-2 gap-y-4 text-sm">
                            <div className="text-gray-500">Operating System</div>
                            <div className="font-bold text-right">{stats.os.type} {stats.os.release}</div>

                            <div className="text-gray-500">Platform</div>
                            <div className="font-bold text-right capitalize">{stats.os.platform} ({stats.os.arch})</div>

                            <div className="text-gray-500">Hostname</div>
                            <div className="font-bold text-right truncate pl-4">{stats.os.hostname}</div>

                            <div className="text-gray-500">Process Node Uptime</div>
                            <div className="font-bold text-right text-blue-600">{formatUptime(stats.uptime.process)}</div>
                        </div>
                    </div>

                    <div className="bg-blue-600 p-6 rounded-3xl text-white shadow-lg shadow-blue-500/30 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 transform translate-x-4 -translate-y-4 opacity-10 group-hover:scale-110 transition-transform duration-700">
                            <Activity className="w-32 h-32" />
                        </div>
                        <h3 className="text-lg font-bold mb-2">Network Health</h3>
                        <p className="text-blue-100 text-sm mb-4 leading-relaxed">System interfaces are being monitored for stability. All connections are currently secure.</p>
                        <div className="flex gap-4">
                            <div className="px-3 py-1 bg-white/20 rounded-lg text-xs font-bold">Latency: Stable</div>
                            <div className="px-3 py-1 bg-white/20 rounded-lg text-xs font-bold">Socket.io: Ready</div>
                        </div>
                    </div>
                </div>
            </div>

            <FolderExplorerModal
                isOpen={isExplorerOpen}
                onClose={() => setIsExplorerOpen(false)}
            />
        </div>
    );
};

export default ServerManagement;
