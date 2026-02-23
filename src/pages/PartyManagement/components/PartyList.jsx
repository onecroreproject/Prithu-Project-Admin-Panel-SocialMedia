import { useState, useEffect, useMemo } from "react";
import { Edit2, Trash2, Search, MapPin, Flag, Filter, X, ChevronRight, User } from "lucide-react";
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
            <div className="py-24 flex flex-col items-center justify-center bg-gray-50/50 rounded-4xl border border-dashed border-gray-200">
                <div className="w-14 h-14 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mb-6"></div>
                <p className="text-gray-600 font-medium tracking-tight">Syncing Registry...</p>
                <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-2">Fetching comprehensive entity data</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Action Bar */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex flex-col sm:flex-row items-center gap-4 flex-1">
                    {/* Search Bar */}
                    <div className="relative group flex-1 max-w-lg w-full">
                        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                        </div>
                        <input
                            type="text"
                            placeholder="Find entity by name, state or code..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="block w-full pl-14 pr-6 py-4 bg-gray-50/50 border border-gray-200 rounded-2xl text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all outline-none"
                        />
                    </div>

                    {/* Filter Toggle */}
                    <button
                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                        className={`flex items-center gap-2.5 px-8 py-4 rounded-2xl border text-sm font-bold tracking-tight transition-all duration-300 ${isFilterOpen || stateFilter !== 'all' || partyFilter !== 'all'
                            ? "bg-linear-to-r from-blue-500 to-blue-600 text-white border-transparent shadow-lg shadow-blue-500/20"
                            : "bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50 shadow-sm"
                            }`}
                    >
                        <Filter size={18} />
                        Refinement
                        {(stateFilter !== 'all' || partyFilter !== 'all') && (
                            <span className="w-2 h-2 bg-white rounded-full animate-pulse ml-1" />
                        )}
                    </button>
                </div>
            </div>

            {/* Filter Panel */}
            <AnimatePresence>
                {isFilterOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0, y: -10 }}
                        animate={{ height: "auto", opacity: 1, y: 0 }}
                        exit={{ height: 0, opacity: 0, y: -10 }}
                        className="overflow-hidden"
                    >
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 p-8 bg-gray-50/50 border border-gray-100 rounded-3xl mb-4">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Geographic Filter</label>
                                <select
                                    value={stateFilter}
                                    onChange={(e) => setStateFilter(e.target.value)}
                                    className="w-full bg-white border border-gray-200 rounded-xl px-5 py-3 text-sm font-semibold text-gray-700 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/40 transition-all cursor-pointer"
                                >
                                    {uniqueStates.map(s => <option key={s} value={s}>{s === 'all' ? 'All Jurisdictions' : s}</option>)}
                                </select>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Identity Filter</label>
                                <select
                                    value={partyFilter}
                                    onChange={(e) => setPartyFilter(e.target.value)}
                                    className="w-full bg-white border border-gray-200 rounded-xl px-5 py-3 text-sm font-semibold text-gray-700 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/40 transition-all cursor-pointer"
                                >
                                    {uniqueParties.map(p => <option key={p} value={p}>{p === 'all' ? 'All Entity Names' : p}</option>)}
                                </select>
                            </div>
                            <div className="flex items-end">
                                <button
                                    onClick={() => { setStateFilter("all"); setPartyFilter("all"); }}
                                    className="flex items-center gap-2 px-6 py-3 text-xs font-bold text-red-500 hover:bg-red-50 rounded-xl transition-all uppercase tracking-widest"
                                >
                                    <X size={16} />
                                    Reset Filters
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Table */}
            <div className="bg-white border border-gray-100 rounded-4xl overflow-hidden shadow-2xl shadow-gray-200/40">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                <th className="px-10 py-6 text-xs font-bold text-gray-400 uppercase tracking-widest">Organization</th>
                                <th className="px-10 py-6 text-xs font-bold text-gray-400 uppercase tracking-widest">State</th>
                                <th className="px-10 py-6 text-xs font-bold text-gray-400 uppercase tracking-widest">Leadership</th>
                                <th className="px-10 py-6 text-xs font-bold text-gray-400 uppercase tracking-widest">Status</th>
                                <th className="px-10 py-6 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredParties.length > 0 ? (
                                filteredParties.map((party) => (
                                    <tr key={party._id} className="group hover:bg-gray-50/30 transition-all duration-300">
                                        <td className="px-10 py-6">
                                            <div className="flex items-center gap-6">
                                                <div className="relative shrink-0">
                                                    <div className="absolute inset-0 bg-blue-500/20 rounded-2xl blur-xl transition-all opacity-0 group-hover:opacity-100" />
                                                    <img
                                                        src={getMediaUrl(party.partyLogo)}
                                                        alt={party.partyName}
                                                        className="w-16 h-16 rounded-2xl object-contain bg-white border border-gray-100 p-2.5 shadow-sm group-hover:scale-110 transition-all duration-500 relative z-10"
                                                    />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-base font-bold text-gray-900 group-hover:text-blue-600 transition-colors tracking-tight">{party.partyName}</span>
                                                    <span className="text-xs font-bold text-blue-500/60 uppercase tracking-widest mt-1">{party.partyShortName}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-6">
                                            <div className="flex flex-col gap-1.5">
                                                <span className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                                    <MapPin size={14} className="text-blue-500" />
                                                    {party.state}
                                                </span>
                                                {party.stateRegionalName && (
                                                    <span className="text-xs font-semibold text-gray-400 ml-5">{party.stateRegionalName}</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-10 py-6">
                                            <div className="flex -space-x-4">
                                                {party.leaders.slice(0, 4).map((leader, i) => (
                                                    <div key={i} className="relative group/leader">
                                                        <img
                                                            src={getMediaUrl(leader.photo) || 'https://api.dicebear.com/7.x/initials/svg?seed=' + leader.name}
                                                            alt={leader.name}
                                                            className="w-12 h-12 rounded-full border-4 border-white object-cover shadow-md group-hover/leader:z-20 transition-all group-hover/leader:scale-125 cursor-help"
                                                        />
                                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-4 py-1.5 bg-gray-900 text-white text-[10px] font-bold uppercase tracking-widest rounded-xl opacity-0 group-hover/leader:opacity-100 transition-all whitespace-nowrap pointer-events-none shadow-xl border border-white/10">
                                                            {leader.name}
                                                        </div>
                                                    </div>
                                                ))}
                                                {party.leaders.length > 4 && (
                                                    <div className="w-12 h-12 rounded-full border-4 border-white bg-gray-50 flex items-center justify-center text-xs font-bold text-blue-600 shadow-sm relative z-0">
                                                        +{party.leaders.length - 4}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-10 py-6">
                                            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border ${party.isActive
                                                ? "bg-emerald-50 border-emerald-100 text-emerald-700 shadow-sm shadow-emerald-200/20"
                                                : "bg-red-50 border-red-100 text-red-700"
                                                }`}>
                                                <span className={`w-2 h-2 rounded-full ${party.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                                                <span className="text-xs font-bold uppercase tracking-widest">
                                                    {party.isActive ? 'Active' : 'Hidden'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-6 text-right">
                                            <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
                                                <button
                                                    onClick={() => onEdit(party)}
                                                    className="p-3 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl transition-all shadow-sm hover:shadow-lg"
                                                    title="Edit Party"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(party._id)}
                                                    className="p-3 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-xl transition-all shadow-sm hover:shadow-lg"
                                                    title="Delete Party"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-8 py-40 text-center">
                                        <div className="flex flex-col items-center gap-6">
                                            <div className="w-24 h-24 bg-gray-50 rounded-[2.5rem] flex items-center justify-center border border-gray-100 shadow-inner">
                                                <Flag size={40} className="text-gray-300" />
                                            </div>
                                            <div className="space-y-2">
                                                <p className="text-gray-900 text-sm font-black uppercase tracking-[0.3em]">No Entities Indexed</p>
                                                <p className="text-gray-400 text-[11px] font-bold uppercase tracking-widest">Broaden your search parameters or append a new entity</p>
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
