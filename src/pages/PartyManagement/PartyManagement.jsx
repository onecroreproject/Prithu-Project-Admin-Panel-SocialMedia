import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { List, PlusCircle, LayoutGrid, Flag } from "lucide-react";
import PartyList from "./components/PartyList";
import AddPartyForm from "./components/AddPartyForm";

const pageMotion = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3 }
};

export default function PartyManagement() {
    const [activeTab, setActiveTab] = useState("partyList");
    const [editingParty, setEditingParty] = useState(null);

    const tabs = [
        { id: "partyList", label: "Party List", icon: <List size={18} /> },
        { id: "addParty", label: "Add Party", icon: <PlusCircle size={18} /> },
    ];

    const handleEdit = (party) => {
        setEditingParty(party);
        setActiveTab("addParty");
    };

    const onSuccess = () => {
        setEditingParty(null);
        setActiveTab("partyList");
    };

    return (
        <motion.div
            {...pageMotion}
            className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header Section */}
                <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-3">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                                <Flag size={24} className="text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Party Management</h1>
                                <p className="text-gray-500 mt-1 font-medium">Manage political organizations and their leadership profiles</p>
                            </div>
                        </div>
                    </div>

                    {/* Quick Tab Switcher */}
                    <div className="flex bg-white p-1 rounded-2xl border border-gray-200 shadow-sm">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => {
                                    setActiveTab(tab.id);
                                    if (tab.id === 'partyList') setEditingParty(null);
                                }}
                                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${activeTab === tab.id
                                    ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md"
                                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                                    }`}
                            >
                                {tab.icon}
                                {editingParty && tab.id === 'addParty' ? 'Edit Party' : tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content Container */}
                <div className="bg-white rounded-3xl border border-gray-200 shadow-xl shadow-gray-200/50 overflow-hidden">
                    <div className="p-1">
                        <div className="bg-gray-50/50 border-b border-gray-100 px-8 py-4 flex items-center justify-between">
                            <h2 className="text-sm font-bold text-gray-700 uppercase tracking-widest flex items-center gap-2">
                                <LayoutGrid size={16} className="text-blue-500" />
                                {activeTab === "partyList" ? "Recent Activity" : (editingParty ? "Update Record" : "Basic Information")}
                            </h2>
                            <div className="flex gap-1.5">
                                <div className="w-2.5 h-2.5 rounded-full bg-red-400/20 border border-red-400/30"></div>
                                <div className="w-2.5 h-2.5 rounded-full bg-amber-400/20 border border-amber-400/30"></div>
                                <div className="w-2.5 h-2.5 rounded-full bg-green-400/20 border border-green-400/30"></div>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 md:p-10 bg-white">
                        <AnimatePresence mode="wait">
                            {activeTab === "partyList" && (
                                <motion.div
                                    key="partyList"
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 10 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <PartyList onEdit={handleEdit} />
                                </motion.div>
                            )}

                            {activeTab === "addParty" && (
                                <motion.div
                                    key="addParty"
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <AddPartyForm initialData={editingParty} onSuccess={onSuccess} />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
