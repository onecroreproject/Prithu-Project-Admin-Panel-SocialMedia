import React, { useState, useRef, useEffect } from "react";
import { X, Check, Plus, Trash, ChevronDown } from "lucide-react";
import { updateFeedCategoryAndSub, addCategory, updateCategory, deleteCategory } from "../../Services/FeedServices/feedServices";
import toast from "react-hot-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const SearchableSelect = ({ value, options, onChange, placeholder, disabled = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter(opt => 
    opt.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className={`relative ${disabled ? "opacity-50 pointer-events-none" : ""}`} ref={dropdownRef}>
      <div 
        className="w-full border border-gray-300 rounded p-2 dark:bg-gray-800 dark:border-gray-700 text-sm cursor-pointer flex justify-between items-center bg-white dark:bg-gray-800"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="truncate pr-2">{selectedOption ? selectedOption.label : placeholder}</span>
        <ChevronDown className="w-4 h-4 text-gray-500 shrink-0" />
      </div>
      
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded shadow-lg max-h-60 flex flex-col">
          <div className="p-2 border-b dark:border-gray-700 sticky top-0 bg-gray-50 dark:bg-gray-900 rounded-t">
            <input 
              type="text"
              placeholder="Search..."
              className="w-full p-1 border rounded dark:bg-gray-800 dark:border-gray-700 text-sm focus:outline-none focus:border-blue-500 bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              autoFocus
            />
          </div>
          <div className="overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map(opt => (
                <div
                  key={opt.value}
                  className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-sm ${opt.value === value ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium" : ""}`}
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                    setSearchTerm("");
                  }}
                >
                  {opt.label}
                </div>
              ))
            ) : (
              <div className="p-2 text-gray-500 text-sm text-center">No results found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default function FeedCategoryEditModal({ feed, categories, onClose }) {
  const queryClient = useQueryClient();
  
  const originalMainCat = feed.categories && feed.categories.length > 0 ? feed.categories[0].id : "";
  const originalSubCat = feed.subCategory || "";

  const [selectedMainCat, setSelectedMainCat] = useState(originalMainCat);
  const [selectedSubCat, setSelectedSubCat] = useState(originalSubCat);
  
  const [isAddingMain, setIsAddingMain] = useState(false);
  const [newMainName, setNewMainName] = useState("");
  
  const [isAddingSub, setIsAddingSub] = useState(false);
  const [newSubName, setNewSubName] = useState("");

  const currentCategory = categories.find((c) => c.categoryId === selectedMainCat);
  const subcategories = currentCategory?.subcategories || [];

  const isChanged = selectedMainCat !== originalMainCat || selectedSubCat !== originalSubCat;

  const handleMainCatChange = (e) => {
    setSelectedMainCat(e.target.value);
    setSelectedSubCat(""); // Reset subcategory when main category changes
  };

  const updateMutation = useMutation({
    mutationFn: updateFeedCategoryAndSub,
    onMutate: async (variables) => {
      // Cancel any outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: ["feeds"] });

      // Find the new category name
      const selectedCat = categories.find(c => c.categoryId === variables.categoryId);
      const newCategoryArray = selectedCat ? [{ id: selectedCat.categoryId, name: selectedCat.categoriesName }] : [];

      // Optimistically update the UI cache
      queryClient.setQueriesData({ queryKey: ["feeds"] }, (oldData) => {
        if (!oldData || !oldData.feeds) return oldData;
        return {
          ...oldData,
          feeds: oldData.feeds.map(f => 
            f._id === variables.feedId 
              ? { ...f, categories: newCategoryArray, subCategory: variables.subCategory || null } 
              : f
          )
        };
      });
    },
    onSuccess: () => {
      toast.success("Feed category updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["feeds"] });
      onClose();
    },
    onError: (err) => {
      toast.error(err.message || "Failed to update category");
      queryClient.invalidateQueries({ queryKey: ["feeds"] }); // rollback if error
    },
  });

  const addMainMutation = useMutation({
    mutationFn: (name) => addCategory({ names: name }),
    onSuccess: (data) => {
      toast.success("Main category added!");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      
      let newCatId = "";
      if (data.addedCategories && data.addedCategories.length > 0) {
        newCatId = data.addedCategories[0].id;
        setSelectedMainCat(newCatId);
        setSelectedSubCat("");
      }
      
      setIsAddingMain(false);
      setNewMainName("");

      // Automatically save and close the popup for the feed
      if (newCatId) {
        updateMutation.mutate({
          feedId: feed._id,
          categoryId: newCatId,
          subCategory: "",
        });
      }
    },
    onError: (err) => toast.error(err.message || "Failed to add category"),
  });

  const addSubMutation = useMutation({
    mutationFn: ({ id, name, newSub }) => {
      const updatedSubs = [...subcategories, newSub];
      return updateCategory({ id, name, subcategories: updatedSubs });
    },
    onSuccess: (_, variables) => {
      toast.success("Subcategory added!");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setSelectedSubCat(variables.newSub);
      setIsAddingSub(false);
      setNewSubName("");

      // Automatically save and close the popup for the feed
      if (selectedMainCat) {
        updateMutation.mutate({
          feedId: feed._id,
          categoryId: selectedMainCat,
          subCategory: variables.newSub,
        });
      }
    },
    onError: (err) => toast.error(err.message || "Failed to add subcategory"),
  });

  const deleteMainMutation = useMutation({
    mutationFn: (id) => deleteCategory(id),
    onSuccess: () => {
      toast.success("Main category deleted!");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["feeds"] });
      setSelectedMainCat("");
      setSelectedSubCat("");
    },
    onError: (err) => toast.error(err.message || "Failed to delete category"),
  });

  const deleteSubMutation = useMutation({
    mutationFn: ({ id, name, subToRemove }) => {
      const updatedSubs = subcategories.filter(s => s !== subToRemove);
      return updateCategory({ id, name, subcategories: updatedSubs });
    },
    onSuccess: () => {
      toast.success("Subcategory deleted!");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["feeds"] });
      setSelectedSubCat("");
    },
    onError: (err) => toast.error(err.message || "Failed to delete subcategory"),
  });

  const handleSave = () => {
    updateMutation.mutate({
      feedId: feed._id,
      categoryId: selectedMainCat,
      subCategory: selectedSubCat,
    });
  };

  const handleAddMain = () => {
    if (newMainName.trim()) {
      addMainMutation.mutate(newMainName.trim());
    }
  };

  const handleAddSub = () => {
    if (newSubName.trim() && currentCategory) {
      addSubMutation.mutate({
        id: currentCategory.categoryId,
        name: currentCategory.categoriesName,
        newSub: newSubName.trim(),
      });
    }
  };

  const handleDeleteMain = () => {
    if (selectedMainCat && window.confirm("Are you sure you want to delete this main category completely? This affects all feeds.")) {
      deleteMainMutation.mutate(selectedMainCat);
    }
  };

  const handleDeleteSub = () => {
    if (selectedSubCat && currentCategory && window.confirm("Are you sure you want to delete this subcategory completely? This affects all feeds using it.")) {
      deleteSubMutation.mutate({
        id: currentCategory.categoryId,
        name: currentCategory.categoriesName,
        subToRemove: selectedSubCat,
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 p-6 rounded-xl w-full max-w-md shadow-xl border border-gray-200 dark:border-gray-800">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
            Edit Categories
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium">Main Category</label>
              <div className="flex gap-2">
                {selectedMainCat && !isAddingMain && (
                  <button 
                    onClick={handleDeleteMain}
                    disabled={deleteMainMutation.isLoading}
                    className="text-red-500 hover:text-red-600 text-xs flex items-center gap-1"
                  >
                    <Trash className="w-3 h-3" /> Delete
                  </button>
                )}
                <button 
                  onClick={() => setIsAddingMain(!isAddingMain)}
                  className="text-blue-500 hover:text-blue-600 text-xs flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> {isAddingMain ? "Cancel" : "Add"}
                </button>
              </div>
            </div>
            {isAddingMain ? (
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={newMainName}
                  onChange={(e) => setNewMainName(e.target.value)}
                  placeholder="New Main Category"
                  className="w-full border border-gray-300 rounded p-2 dark:bg-gray-800 dark:border-gray-700 text-sm"
                />
                <button 
                  onClick={handleAddMain}
                  disabled={addMainMutation.isPending || !newMainName.trim()}
                  className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm disabled:opacity-50"
                >
                  Save
                </button>
              </div>
            ) : (
              <SearchableSelect
                value={selectedMainCat}
                options={categories.map(cat => ({ value: cat.categoryId, label: cat.categoriesName }))}
                onChange={(val) => {
                  setSelectedMainCat(val);
                  setSelectedSubCat("");
                }}
                placeholder="-- Select Main Category --"
              />
            )}
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium">Subcategory</label>
              <div className="flex gap-2">
                {selectedSubCat && !isAddingSub && (
                  <button 
                    onClick={handleDeleteSub}
                    disabled={deleteSubMutation.isPending}
                    className="text-red-500 hover:text-red-600 text-xs flex items-center gap-1"
                  >
                    <Trash className="w-3 h-3" /> Delete
                  </button>
                )}
                {selectedMainCat && (
                  <button 
                    onClick={() => setIsAddingSub(!isAddingSub)}
                    className="text-blue-500 hover:text-blue-600 text-xs flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> {isAddingSub ? "Cancel" : "Add"}
                  </button>
                )}
              </div>
            </div>
            
            {isAddingSub ? (
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={newSubName}
                  onChange={(e) => setNewSubName(e.target.value)}
                  placeholder="New Subcategory"
                  className="w-full border border-gray-300 rounded p-2 dark:bg-gray-800 dark:border-gray-700 text-sm"
                />
                <button 
                  onClick={handleAddSub}
                  disabled={addSubMutation.isPending || !newSubName.trim()}
                  className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm disabled:opacity-50"
                >
                  Save
                </button>
              </div>
            ) : (
              <SearchableSelect
                value={selectedSubCat}
                options={subcategories.map(sub => ({ value: sub, label: sub }))}
                onChange={setSelectedSubCat}
                placeholder="-- Select Subcategory --"
                disabled={!selectedMainCat || subcategories.length === 0}
              />
            )}
            
            {!isAddingSub && selectedMainCat && subcategories.length === 0 && (
              <p className="text-xs text-gray-500 mt-1 italic">
                No subcategories available for this category.
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 rounded-lg transition-colors text-sm font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!isChanged || updateMutation.isPending || isAddingMain || isAddingSub}
            className="flex items-center gap-2 px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 text-sm font-medium"
          >
            <Check className="w-4 h-4" />
            {updateMutation.isPending ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
