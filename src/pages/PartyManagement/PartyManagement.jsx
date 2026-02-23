import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { List, PlusCircle } from "lucide-react";
import PartyList from "./components/PartyList";
import AddPartyForm from "./components/AddPartyForm";

export default function PartyManagement() {
    const [activeTab, setActiveTab] = useState("partyList");

    const tabVariants = {
        hidden: { opacity: 0, scale: 0.98 },
        visible: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.98 },
    };

    const tabs = [
        { id: "partyList", label: "Party List", icon: <List className="h-4 w-4 mr-2" /> },
        { id: "addParty", label: "Add Party", icon: <PlusCircle className="h-4 w-4 mr-2" /> },
    ];

    const [editingParty, setEditingParty] = useState(null);

    const handleEdit = (party) => {
        setEditingParty(party);
        setActiveTab("addParty");
    };

    const onSuccess = () => {
        setEditingParty(null);
        setActiveTab("partyList");
    };

    return (
        <div className="mx-auto mt-6 px-4 md:px-8 max-w-[1600px] animate-in fade-in duration-700">
            <div className="mb-8 space-y-1">
                <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-widest uppercase flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/20">
                        <List size={20} className="text-white" />
                    </div>
                    Party Management
                </h1>
                <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest ml-14">Manage political entities and leadership synchronization</p>
            </div>

            {/* Main Container */}
            <div className="max-w-7xl mx-auto rounded-3xl border border-gray-200 bg-white p-2 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
                {/* Tab Switcher */}
                <div className="flex flex-wrap border-b border-gray-100 dark:border-gray-800 -mb-0.5">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => {
                                setActiveTab(tab.id);
                                if (tab.id === 'partyList') setEditingParty(null);
                            }}
                            className={`flex items-center px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] transition-all border-b-2 relative ${activeTab === tab.id
                                ? "border-blue-600 text-blue-600 bg-blue-50/50 dark:bg-blue-900/10"
                                : "border-transparent text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                                }`}
                        >
                            <div className={activeTab === tab.id ? "scale-110 transition-transform" : ""}>
                                {tab.icon}
                            </div>
                            {editingParty && tab.id === 'addParty' ? 'Edit Party' : tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="p-6 md:p-8">
                    <AnimatePresence mode="wait">
                        {activeTab === "partyList" && (
                            <motion.div
                                key="partyList"
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                variants={tabVariants}
                                transition={{ duration: 0.4, ease: "easeOut" }}
                            >
                                <PartyList onEdit={handleEdit} />
                            </motion.div>
                        )}

                        {activeTab === "addParty" && (
                            <motion.div
                                key="addParty"
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                variants={tabVariants}
                                transition={{ duration: 0.4, ease: "easeOut" }}
                            >
                                <AddPartyForm initialData={editingParty} onSuccess={onSuccess} />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
