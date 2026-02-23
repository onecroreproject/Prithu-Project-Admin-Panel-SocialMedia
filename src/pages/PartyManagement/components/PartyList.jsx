import { useState, useEffect, useMemo } from "react";
import { Edit2, Trash2, Search, MapPin, Flag, Filter, X, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Api from "../../../Utils/axiosApi";
import getMediaUrl from "../../../Utils/mediaUrl";
import toast from "react-hot-toast";

export default function PartyList({ onEdit }) {
    const [parties, setParties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // Filters
    const [stateFilter, setStateFilter] = useState("all");
    const [partyFilter, setPartyFilter] = useState("all");
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const fetchParties = async () => {
        try {
            const response = await Api.get("/api/admin/parties");
            if (response.data.success) {
                setParties(response.data.data);
            }
        } catch (error) {
            console.error("Fetch parties error:", error);
            toast.error("Failed to load parties");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchParties();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this party?")) return;
        try {
            await Api.delete(`/api/admin/party/${id}`);
            toast.success("Party deleted successfully");
            fetchParties();
        } catch (error) {
            toast.error("Failed to delete party");
        }
    };

    // Extract unique states and parties for filters
    const uniqueStates = useMemo(() => {
        return ["all", ...new Set(parties.map(p => p.state))].sort();
    }, [parties]);

    const uniqueParties = useMemo(() => {
        return ["all", ...new Set(parties.map(p => p.partyName))].sort();
    }, [parties]);

    const filteredParties = parties.filter(party => {
        const matchesSearch =
            party.partyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            party.state.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (party.partyShortName && party.partyShortName.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesState = stateFilter === "all" || party.state === stateFilter;
        const matchesParty = partyFilter === "all" || party.partyName === partyFilter;

        return matchesSearch && matchesState && matchesParty;
    });

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-24">
                <div className="w-12 h-12 border-4 border-blue-600/10 border-t-blue-600 rounded-full animate-spin mb-4" />
                <p className="text-gray-400 font-black uppercase tracking-[0.3em] text-[10px] animate-pulse">Syncing Political Data...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Action Bar */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex flex-col sm:flex-row items-center gap-4 flex-1">
                    {/* Search Bar */}
                    <div className="relative group flex-1 max-w-md w-full">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                        </div>
                        <input
                            type="text"
                            placeholder="SEARCH BY NAME, STATE OR CODE..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="block w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-gray-800 rounded-2xl text-[10px] font-black tracking-widest text-gray-900 dark:text-white uppercase focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600/50 transition-all outline-none"
                        />
                    </div>

                    {/* Filter Toggle */}
                    <button
                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                        className={`flex items-center gap-2 px-6 py-3.5 rounded-2xl border transition-all text-[10px] font-black uppercase tracking-widest ${isFilterOpen || stateFilter !== 'all' || partyFilter !== 'all'
                            ? "border-blue-600/30 bg-blue-600/5 text-blue-600"
                            : "border-gray-200 dark:border-gray-800 text-gray-500 hover:border-gray-300 dark:hover:border-gray-700"
                            }`}
                    >
                        <Filter size={14} />
                        Advanced Filters
                        {(stateFilter !== 'all' || partyFilter !== 'all') && (
                            <span className="w-2 h-2 bg-blue-600 rounded-full animate-ping" />
                        )}
                    </button>
                </div>
            </div>

            {/* Filter Panel */}
            <AnimatePresence>
                {isFilterOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6 bg-gray-50 dark:bg-white/[0.02] border border-gray-200 dark:border-gray-800 rounded-3xl">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Filter by State</label>
                                <select
                                    value={stateFilter}
                                    onChange={(e) => setStateFilter(e.target.value)}
                                    className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-2.5 text-[10px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-blue-500/20"
                                >
                                    {uniqueStates.map(s => <option key={s} value={s}>{s === 'all' ? 'All States' : s.toUpperCase()}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Filter by Party</label>
                                <select
                                    value={partyFilter}
                                    onChange={(e) => setPartyFilter(e.target.value)}
                                    className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-2.5 text-[10px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-blue-500/20"
                                >
                                    {uniqueParties.map(p => <option key={p} value={p}>{p === 'all' ? 'All Parties' : p.toUpperCase()}</option>)}
                                </select>
                            </div>
                            <div className="flex items-end">
                                <button
                                    onClick={() => { setStateFilter("all"); setPartyFilter("all"); }}
                                    className="flex items-center gap-2 px-6 py-2.5 text-[10px] font-black text-red-500 hover:bg-red-500/10 rounded-xl transition-all uppercase tracking-widest"
                                >
                                    <X size={14} />
                                    Clear All
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Table */}
            <div className="bg-white dark:bg-transparent border border-gray-200 dark:border-gray-800 rounded-3xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 dark:bg-white/[0.02] border-b border-gray-100 dark:border-gray-800">
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.25em]">Entity</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.25em]">Region</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.25em]">Leadership</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.25em]">Status</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] text-right">Operations</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800/50">
                            {filteredParties.length > 0 ? (
                                filteredParties.map((party) => (
                                    <tr key={party._id} className="group hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-all duration-300">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-5">
                                                <div className="relative shrink-0">
                                                    <div className="absolute inset-0 bg-blue-600/10 rounded-2xl blur-lg group-hover:blur-xl transition-all opacity-0 group-hover:opacity-100" />
                                                    <img
                                                        src={getMediaUrl(party.partyLogo)}
                                                        alt={party.partyName}
                                                        className="w-14 h-14 rounded-2xl object-contain bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-2 shadow-sm group-hover:scale-110 transition-transform relative z-10"
                                                    />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider group-hover:text-blue-600 transition-colors">{party.partyName}</span>
                                                    <span className="text-[10px] font-bold text-gray-400 tracking-widest mt-0.5">{party.partyShortName}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[11px] font-black text-gray-700 dark:text-gray-300 uppercase tracking-widest flex items-center gap-2">
                                                    <MapPin size={12} className="text-blue-500" />
                                                    {party.state}
                                                </span>
                                                {party.stateRegionalName && (
                                                    <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 ml-5">{party.stateRegionalName}</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex -space-x-3">
                                                {party.leaders.slice(0, 4).map((leader, i) => (
                                                    <div key={i} className="relative group/leader">
                                                        <img
                                                            src={getMediaUrl(leader.photo) || 'https://api.dicebear.com/7.x/initials/svg?seed=' + leader.name}
                                                            alt={leader.name}
                                                            className="w-10 h-10 rounded-full border-2 border-white dark:border-gray-900 object-cover shadow-sm group-hover/leader:z-20 transition-all group-hover/leader:scale-125 cursor-help"
                                                        />
                                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 bg-gray-900 text-white text-[8px] font-black uppercase tracking-widest rounded-lg opacity-0 group-hover/leader:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                                            {leader.name}
                                                        </div>
                                                    </div>
                                                ))}
                                                {party.leaders.length > 4 && (
                                                    <div className="w-10 h-10 rounded-full border-2 border-white dark:border-gray-900 bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-[10px] font-black text-blue-600 relative z-0">
                                                        +{party.leaders.length - 4}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-2">
                                                <span className={`w-2 h-2 rounded-full ${party.isActive ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                                                <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${party.isActive ? 'text-green-600' : 'text-red-500'}`}>
                                                    {party.isActive ? 'ACTIVE' : 'OFFLINE'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                                                <button
                                                    onClick={() => onEdit(party)}
                                                    className="p-3 bg-blue-600/5 text-blue-600 hover:bg-blue-600 hover:text-white rounded-2xl transition-all shadow-lg shadow-blue-600/5"
                                                    title="Edit Architecture"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(party._id)}
                                                    className="p-3 bg-red-600/5 text-red-600 hover:bg-red-600 hover:text-white rounded-2xl transition-all shadow-lg shadow-red-600/5"
                                                    title="Decommission"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-8 py-32 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-20 h-20 bg-gray-50 dark:bg-white/[0.03] rounded-[2.5rem] flex items-center justify-center border border-gray-100 dark:border-gray-800">
                                                <Flag size={32} className="text-gray-300" />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-gray-900 dark:text-white text-xs font-black uppercase tracking-[0.3em]">No Entities Index</p>
                                                <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Adjust filters to broaden search parameters</p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
