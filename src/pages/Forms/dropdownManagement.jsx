import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchDropdownConfig, updateDropdownConfig } from "../../Services/FeedServices/feedServices";
import { Trash, Plus, Settings2 } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

export default function DropdownManagement() {
    const queryClient = useQueryClient();
    
    // Form states for adding new options
    const [newSession, setNewSession] = useState("");
    const [newDay, setNewDay] = useState("");
    const [newSpecialDay, setNewSpecialDay] = useState("");

    // Fetch config
    const { data: config, isLoading, isError, error } = useQuery({
        queryKey: ["dropdownConfig"],
        queryFn: fetchDropdownConfig,
    });

    // Update mutation
    const updateMutation = useMutation({
        mutationFn: updateDropdownConfig,
        onSuccess: () => {
            toast.success("Options updated successfully!");
            queryClient.invalidateQueries({ queryKey: ["dropdownConfig"] });
            setNewSession("");
            setNewDay("");
            setNewSpecialDay("");
        },
        onError: (err) => toast.error(err.message || "Update failed")
    });

    if (isLoading) return <p className="text-gray-500 p-4">Loading options...</p>;
    if (isError) return <p className="text-red-500 p-4">Error: {error.message}</p>;

    // Handlers for adding and deleting
    const handleAdd = (field, value) => {
        if (!value.trim()) return toast.error("Value cannot be empty");
        
        const currentList = config[field] || [];
        if (currentList.includes(value.trim())) return toast.error("Value already exists");
        
        updateMutation.mutate({
            [field]: [...currentList, value.trim()]
        });
    };

    const handleDelete = (field, valueToRemove) => {
        if (!confirm(`Are you sure you want to delete "${valueToRemove}"?`)) return;
        
        const currentList = config[field] || [];
        updateMutation.mutate({
            [field]: currentList.filter(v => v !== valueToRemove)
        });
    };

    const renderSection = (title, field, value, setValue) => {
        const list = config[field] || [];
        
        return (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4 flex items-center">
                    <Settings2 className="w-5 h-5 mr-2 text-blue-500" />
                    Manage {title}
                </h3>
                
                <div className="flex gap-2 mb-4">
                    <input 
                        type="text"
                        placeholder={`Add new ${title.toLowerCase()}...`}
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 outline-none focus:border-blue-500"
                        onKeyDown={(e) => e.key === 'Enter' && handleAdd(field, value)}
                    />
                    <button 
                        onClick={() => handleAdd(field, value)}
                        disabled={updateMutation.isPending}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                        <Plus className="w-4 h-4" />
                    </button>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                    {list.length === 0 ? (
                        <p className="text-sm text-gray-400 italic">No options found.</p>
                    ) : (
                        list.map(item => (
                            <div key={item} className="flex justify-between items-center p-2.5 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-700/50">
                                <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">{item}</span>
                                <button 
                                    onClick={() => handleDelete(field, item)}
                                    disabled={updateMutation.isPending}
                                    className="p-1.5 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors disabled:opacity-50"
                                >
                                    <Trash className="w-4 h-4" />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="mt-6">
            <Toaster position="top-right" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {renderSection("Sessions", "sessions", newSession, setNewSession)}
                {renderSection("Days", "days", newDay, setNewDay)}
                {renderSection("Special Days", "specialDays", newSpecialDay, setNewSpecialDay)}
            </div>
        </div>
    );
}
