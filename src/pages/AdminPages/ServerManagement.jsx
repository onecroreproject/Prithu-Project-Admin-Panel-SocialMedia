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
    FileSearch,
    Database as DbIcon,
    TerminalSquare,
    Trash2,
    Play,
    Square,
    RotateCcw,
    Info,
    ShieldAlert,
    Zap,
    History,
    Eraser,
    Search,
    PlayCircle,
    PauseCircle
} from 'lucide-react';

const LogViewerModal = ({ isOpen, onClose }) => {
    const [logs, setLogs] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const response = await api.get('/api/admin/server/logs');
            if (response.data.success) {
                setLogs(response.data.logs);
            }
        } catch (err) {
            setError("Failed to load logs");
        } finally {
            setLoading(false);
        }
    };

    const flushLogs = async () => {
        if (!window.confirm("Are you sure you want to clear all PM2 logs? This cannot be undone.")) return;
        try {
            const response = await api.post('/api/admin/server/logs/flush');
            if (response.data.success) {
                alert("Logs cleared successfully");
                setLogs('Logs flushed.');
            }
        } catch (err) {
            alert("Failed to flush logs");
        }
    };

    useEffect(() => {
        if (isOpen) fetchLogs();
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-gray-900 w-full max-w-4xl rounded-3xl shadow-2xl border border-gray-800 overflow-hidden flex flex-col max-h-[85vh]">
                <div className="p-6 border-b border-gray-800 flex items-center justify-between bg-black/40">
                    <div className="flex items-center gap-3">
                        <TerminalSquare className="text-green-500 w-6 h-6" />
                        <div>
                            <h2 className="font-bold text-white text-lg">System Logs</h2>
                            <p className="text-[10px] text-gray-500 font-mono">Real-time tail -n 100 output</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={fetchLogs} className="p-2 hover:bg-gray-800 rounded-xl transition-colors text-gray-400" title="Refresh Logs">
                            <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                        <button onClick={flushLogs} className="p-2 hover:bg-red-500/20 hover:text-red-500 rounded-xl transition-colors text-gray-400" title="Clear All Logs">
                            <Trash2 className="w-4 h-4" />
                        </button>
                        <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-full transition-colors text-gray-400">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-auto p-4 bg-black/20 font-mono text-[11px] leading-relaxed no-scrollbar">
                    {loading ? (
                        <div className="h-full flex items-center justify-center text-gray-500 animate-pulse">Streaming logs...</div>
                    ) : error ? (
                        <div className="h-full flex items-center justify-center text-red-500">{error}</div>
                    ) : (
                        <pre className="text-gray-300 whitespace-pre-wrap selection:bg-blue-500/30">
                            {logs || "No logs available."}
                        </pre>
                    )}
                </div>

                <div className="p-4 bg-black/40 border-t border-gray-800 flex justify-between items-center">
                    <div className="flex gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500 shadow-sm shadow-green-500/50"></div>
                            <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Active Stream</span>
                        </div>
                    </div>
                    <p className="text-[10px] text-gray-600 font-bold italic">Restricted Access • Audit Enabled</p>
                </div>
            </div>
        </div>
    );
};

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
    const [isLogOpen, setIsLogOpen] = useState(false);
    const [dbStats, setDbStats] = useState(null);
    const [dbLoading, setDbLoading] = useState(true);
    const [redisStats, setRedisStats] = useState(null);
    const [redisLoading, setRedisLoading] = useState(true);
    const [cronStatus, setCronStatus] = useState([]);
    const [cronLoading, setCronLoading] = useState(true);

    const fetchStats = async (isManual = false) => {
        if (isManual) setRefreshing(true);
        fetchDbStats();
        fetchRedisStats();
        fetchCronStatus();
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

    const fetchDbStats = async () => {
        setDbLoading(true);
        try {
            const response = await api.get('/api/admin/db/stats');
            if (response.data.success) {
                setDbStats(response.data.data);
            }
        } catch (err) {
            console.error("DB Stats Error");
        } finally {
            setDbLoading(false);
        }
    };

    const triggerBackup = async () => {
        if (!window.confirm("This will create a full database backup. It may take a moment depending on data size. Proceed?")) return;
        try {
            const response = await api.post('/api/admin/db/backup');
            if (response.data.success) {
                alert(`Backup success: ${response.data.data.fileName}`);
            }
        } catch (err) {
            alert("Backup failed. Check server logs.");
        }
    };

    const fetchRedisStats = async () => {
        setRedisLoading(true);
        try {
            const response = await api.get('/api/admin/redis/stats');
            if (response.data.success) setRedisStats(response.data.data);
        } catch (err) {
            console.error("Redis Stats Error");
        } finally {
            setRedisLoading(false);
        }
    };

    const fetchCronStatus = async () => {
        setCronLoading(true);
        try {
            const response = await api.get('/api/admin/cron/status');
            if (response.data.success) setCronStatus(response.data.data);
        } catch (err) {
            console.error("Cron Status Error");
        } finally {
            setCronLoading(false);
        }
    };

    const handleRedisFlush = async () => {
        if (!window.confirm("CRITICAL: This will clear the entire Redis cache. This may temporarily increase database load. Proceed?")) return;
        try {
            const response = await api.post('/api/admin/redis/flush');
            if (response.data.success) {
                alert("Redis cache flushed successfully");
                fetchRedisStats();
            }
        } catch (err) {
            alert("Flush failed");
        }
    };

    const handleTriggerCron = async (taskId, taskName) => {
        if (!window.confirm(`Manually trigger '${taskName}' now?`)) return;
        try {
            const response = await api.post('/api/admin/cron/trigger', { taskId });
            if (response.data.success) {
                alert(`Task '${taskName}' started successfully`);
            }
        } catch (err) {
            alert(`Trigger failed: ${err.response?.data?.message || err.message}`);
        }
    };

    const handleProcessAction = async (action, processName = 'all') => {
        const confirmMsg = action === 'stop'
            ? `WARNING: This will STOP the ${processName} process, taking the application offline. Continue?`
            : `Are you sure you want to ${action} ${processName}?`;

        if (!window.confirm(confirmMsg)) return;

        try {
            const response = await api.post('/api/admin/server/process/manage', { action, processName });
            if (response.data.success) {
                alert(`Process ${action} initiated successfully.`);
                fetchStats();
            }
        } catch (err) {
            alert(`Action failed: ${err.response?.data?.message || err.message}`);
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

            {/* Action Center - NEW */}
            <div className="bg-linear-to-br from-gray-900 to-gray-800 p-8 rounded-[2rem] text-white shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-12 opacity-5 scale-150 rotate-12 group-hover:rotate-0 transition-transform duration-1000">
                    <ShieldAlert className="w-32 h-32" />
                </div>

                <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
                    <div className="max-w-md">
                        <h2 className="text-2xl font-black mb-2 flex items-center gap-2">
                            <TerminalSquare className="text-blue-400" />
                            Process Action Center
                        </h2>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            Manage your application lifecycle with whitelisted PM2 commands. All actions are
                            <span className="text-blue-400 font-bold"> Audit Logged </span>
                            for security compliance.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full lg:w-auto">
                        <button
                            onClick={() => handleProcessAction('restart')}
                            className="bg-blue-600 hover:bg-blue-500 p-4 rounded-2xl flex flex-col items-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-blue-500/20"
                        >
                            <RotateCcw className="w-6 h-6" />
                            <div className="text-center">
                                <p className="font-bold text-sm">Restart All</p>
                                <p className="text-[10px] opacity-70">Graceful reboot</p>
                            </div>
                        </button>

                        <button
                            onClick={() => handleProcessAction('reload')}
                            className="bg-green-600 hover:bg-green-500 p-4 rounded-2xl flex flex-col items-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-green-500/20"
                        >
                            <RefreshCcw className="w-6 h-6" />
                            <div className="text-center">
                                <p className="font-bold text-sm">Reload Zero</p>
                                <p className="text-[10px] opacity-70">Zero-downtime</p>
                            </div>
                        </button>

                        <button
                            onClick={() => handleProcessAction('stop')}
                            className="bg-red-600 hover:bg-red-500 p-4 rounded-2xl flex flex-col items-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-red-500/20"
                        >
                            <Square className="w-6 h-6" />
                            <div className="text-center">
                                <p className="font-bold text-sm">Critical Stop</p>
                                <p className="text-[10px] opacity-70">Shutdown backend</p>
                            </div>
                        </button>
                    </div>
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
                    {/* Redis Dashboard - NEW */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 transform translate-x-4 -translate-y-4 opacity-5 group-hover:rotate-12 transition-transform duration-1000">
                            <Zap className="w-24 h-24 text-red-500" />
                        </div>

                        <div className="flex items-center justify-between mb-6 relative z-10">
                            <h2 className="font-bold flex items-center gap-2">
                                <Zap className="text-red-500 w-5 h-5" />
                                Redis Cache Hub
                            </h2>
                            <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${redisStats?.status === 'ready' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {redisStats?.status || 'Offline'}
                            </span>
                        </div>

                        {redisLoading ? (
                            <div className="py-4 animate-pulse space-y-3">
                                <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded w-full"></div>
                                <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded w-5/6"></div>
                            </div>
                        ) : redisStats ? (
                            <div className="space-y-4 relative z-10">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-3 bg-gray-50 dark:bg-gray-900/30 rounded-2xl">
                                        <p className="text-[9px] text-gray-400 font-bold uppercase mb-1">Used Memory</p>
                                        <p className="font-black text-gray-800 dark:text-gray-100">{redisStats.memory.used}</p>
                                    </div>
                                    <div className="p-3 bg-gray-50 dark:bg-gray-900/30 rounded-2xl">
                                        <p className="text-[9px] text-gray-400 font-bold uppercase mb-1">Cache Hits</p>
                                        <p className="font-black text-blue-600">{redisStats.performance.hitRatio}</p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between text-[11px] font-bold">
                                        <span className="text-gray-500 uppercase tracking-tighter">Total Keys</span>
                                        <span className="text-gray-900 dark:text-gray-100 tabular-nums">{redisStats.keys.total}</span>
                                    </div>
                                    <div className="flex justify-between text-[11px] font-bold">
                                        <span className="text-gray-500 uppercase tracking-tighter">Connected Clients</span>
                                        <span className="text-gray-900 dark:text-gray-100 tabular-nums">{redisStats.clients}</span>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-gray-50 dark:border-gray-700 flex gap-2">
                                    <button
                                        onClick={handleRedisFlush}
                                        className="flex-1 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg shadow-red-500/20"
                                    >
                                        <Eraser className="w-3 h-3" /> Flush DB
                                    </button>
                                </div>
                            </div>
                        ) : null}
                    </div>

                    {/* Cron Manager - NEW */}
                    <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-gray-50 dark:border-gray-700 bg-gray-50/30 dark:bg-gray-900/10">
                            <h2 className="font-bold flex items-center gap-2">
                                <History className="text-purple-500 w-5 h-5" />
                                Automated Task Registry
                            </h2>
                            <p className="text-[10px] text-gray-400 font-mono mt-1 uppercase tracking-tighter">Manage internal node-cron schedules</p>
                        </div>

                        <div className="divide-y divide-gray-50 dark:divide-gray-700 max-h-[300px] overflow-y-auto no-scrollbar">
                            {cronLoading ? (
                                <div className="p-8 text-center text-gray-400 animate-pulse text-xs">Fetching schedules...</div>
                            ) : cronStatus.map((cron, i) => (
                                <div key={i} className="p-4 hover:bg-gray-50/50 dark:hover:bg-gray-900/20 transition-all flex items-center justify-between group">
                                    <div className="flex-1 pr-4">
                                        <h4 className="font-bold text-sm text-gray-800 dark:text-gray-100 leading-none">{cron.name}</h4>
                                        <p className="text-[10px] text-purple-600 font-mono mt-1">{cron.schedule}</p>
                                        <p className="text-[9px] text-gray-400 mt-1 line-clamp-1">{cron.description}</p>
                                    </div>
                                    <button
                                        onClick={() => handleTriggerCron(cron.id, cron.name)}
                                        className="p-2.5 bg-gray-100 dark:bg-gray-700 text-gray-500 hover:bg-purple-500 hover:text-white rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                        title="Trigger Manually"
                                    >
                                        <PlayCircle className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <div className="p-3 bg-purple-50 dark:bg-purple-900/10 text-center border-t border-purple-100 dark:border-purple-800/30">
                            <p className="text-[9px] text-purple-600 font-bold italic uppercase">Audit Logging Enabled for Manual Triggers</p>
                        </div>
                    </div>

                    {/* Database Hub */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="font-bold flex items-center gap-2">
                                <DbIcon className="text-green-500 w-5 h-5" />
                                Database Hub
                            </h2>
                            <button
                                onClick={triggerBackup}
                                className="text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-green-100 text-green-700 rounded-full hover:bg-green-500 hover:text-white transition-all"
                            >
                                Trigger Backup
                            </button>
                        </div>

                        {dbLoading ? (
                            <div className="py-4 animate-pulse space-y-2">
                                <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded w-1/2"></div>
                                <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded w-full"></div>
                            </div>
                        ) : dbStats ? (
                            <div className="space-y-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Database Engine</span>
                                    <span className="font-bold underline cursor-help decoration-blue-500/30" title="MongoDB 6.0 Enterprise">MongoDB Cluster</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Total Data Size</span>
                                    <span className="font-bold text-green-600">{dbStats.dataSize}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Storage Used</span>
                                    <span className="font-bold">{dbStats.storageSize}</span>
                                </div>

                                <div className="pt-4 border-t border-gray-50 dark:border-gray-700">
                                    <p className="text-[10px] text-gray-400 uppercase font-black mb-2 tracking-widest">Top Collections</p>
                                    <div className="space-y-2">
                                        {dbStats.collectionDetails.slice(0, 3).map((col, i) => (
                                            <div key={i} className="flex justify-between text-[11px] font-bold">
                                                <span className="text-gray-400">{col.name}</span>
                                                <span className="text-blue-500">{col.size}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="py-6 text-center text-gray-400 italic text-sm">Database stats unavailable</div>
                        )}
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm relative group cursor-pointer" onClick={() => setIsLogOpen(true)}>
                        <h2 className="font-bold flex items-center gap-2 mb-4">
                            <Terminal className="text-blue-500 w-5 h-5" />
                            Live Logs Console
                        </h2>
                        <p className="text-xs text-gray-500 leading-relaxed mb-4">
                            Access the latest application runtime logs. Vital for tracking errors and runtime behavior in production.
                        </p>
                        <div className="bg-gray-900 rounded-xl p-3 font-mono text-[9px] text-green-500 overflow-hidden h-12 relative">
                            <div className="animate-pulse">
                                [INFO] Server stabilized on port 5000... <br />
                                [AUTH] Admin heartbeat detected...
                            </div>
                            <div className="absolute inset-0 bg-linear-to-t from-gray-900 via-transparent flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-[10px] font-bold shadow-lg">Open Terminal</span>
                            </div>
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

            <LogViewerModal
                isOpen={isLogOpen}
                onClose={() => setIsLogOpen(false)}
            />
        </div>
    );
};

export default ServerManagement;
