import React, { useState, useRef, useEffect } from 'react';
import { X, Check, ChevronDown } from 'lucide-react';

const CategorySelector = ({
    categories = [],
    selectedIds = [],
    onChange,
    placeholder = "Select categories...",
    className = "",
    variant = "dark" // "dark" for upload, "light" for FeedUpload
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const dropdownRef = useRef(null);

    // Normalize category data to handle different field names from different endpoints
    const normalizedCategories = categories.map(cat => ({
        id: String(cat.categoryId || cat._id || ''),
        name: cat.categoriesName || cat.categoryName || cat.name || "Unnamed Category"
    })).filter(cat => cat.id); // Filter out any that didn't have an ID

    const selectedCategories = normalizedCategories.filter(c => 
        selectedIds.some(sid => String(sid) === c.id)
    );
    const filteredCategories = normalizedCategories.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleCategory = (id) => {
        const newIds = selectedIds.includes(id)
            ? selectedIds.filter(i => i !== id)
            : [...selectedIds, id];
        onChange(newIds);
    };

    const isLight = variant === "light";

    return (
        <div className={`relative ${className}`} ref={dropdownRef}>
            {/* Main Input Area */}
            <div
                onClick={() => setIsOpen(!isOpen)}
                className={`min-h-[42px] w-full border rounded-xl px-3 py-1.5 flex flex-wrap gap-2 cursor-pointer transition-all duration-300 ${isOpen
                        ? 'border-blue-500 ring-4 ring-blue-500/10'
                        : isLight ? 'border-gray-100 bg-white hover:border-blue-100' : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                    }`}
            >
                {selectedCategories.length === 0 && !isOpen && (
                    <span className="text-gray-500 text-[11px] font-black uppercase tracking-widest py-1">{placeholder}</span>
                )}

                {selectedCategories.map(cat => (
                    <span
                        key={cat.id}
                        className="bg-blue-500 text-white text-[10px] font-black px-2 py-0.5 rounded-lg flex items-center gap-1.5 animate-in zoom-in-95 duration-200"
                    >
                        {cat.name}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                toggleCategory(cat.id);
                            }}
                            className="hover:text-blue-200 transition-colors"
                        >
                            <X size={10} strokeWidth={4} />
                        </button>
                    </span>
                ))}

                {isOpen && (
                    <input
                        autoFocus
                        type="text"
                        className={`bg-transparent border-none outline-none text-[11px] font-black uppercase tracking-widest min-w-[60px] flex-1 py-1 ${isLight ? 'text-gray-900' : 'text-white'}`}
                        placeholder="SEARCH..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                    />
                )}

                <div className="flex-1 flex justify-end items-center pointer-events-none">
                    <ChevronDown
                        size={14}
                        className={`text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                    />
                </div>
            </div>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className={`absolute z-100 w-full mt-2 border rounded-xl shadow-2xl p-2 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 ${isLight ? 'bg-white border-gray-100' : 'bg-gray-900 border-gray-800 shadow-black/50'
                    }`}>
                    <div className="max-h-52 overflow-y-auto custom-scrollbar">
                        {filteredCategories.length === 0 ? (
                            <div className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-gray-500 text-center">
                                No categories
                            </div>
                        ) : (
                            filteredCategories.map(cat => {
                                const isSelected = selectedIds.some(sid => String(sid) === cat.id);
                                return (
                                    <div
                                        key={cat.id}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleCategory(cat.id);
                                        }}
                                        className={`flex items-center justify-between px-4 py-2.5 rounded-xl cursor-pointer transition-all duration-200 mb-1 last:mb-0 ${isSelected
                                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                                                : isLight ? 'hover:bg-blue-50 text-gray-700' : 'hover:bg-gray-800 text-gray-300'
                                            }`}
                                    >
                                        <span className="text-[11px] font-black uppercase tracking-widest">{cat.name}</span>
                                        {isSelected && (
                                            <Check size={12} strokeWidth={4} />
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CategorySelector;
