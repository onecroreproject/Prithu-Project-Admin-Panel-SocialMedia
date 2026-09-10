import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchPostGlobalOptions,
  fetchCategories,
  addWeekGod,
  updateWeekGod,
  deleteWeekGod,
  addSpecialDay,
  updateSpecialDay,
  deleteSpecialDay,
  updateSessionsConfig,
  updateDaysConfig,
} from "../../Services/FeedServices/feedServices";
import {
  Calendar,
  Clock,
  Sparkles,
  Plus,
  Trash2,
  Edit2,
  Search,
  X,
  Sun,
  Sunrise,
  Sunset,
  Moon,
  Check,
  Filter,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

// Helper: convert 12-hour AM/PM string (e.g. "04:00 AM", "4am") to 24-hour "HH:mm" for <input type="time" />
const to24Hour = (timeStr) => {
  if (!timeStr) return "";
  const match = String(timeStr).trim().match(/^(\d{1,2}):?(\d{2})?\s*(AM|PM)?$/i);
  if (!match) return "";
  let hours = parseInt(match[1], 10);
  const minutes = match[2] ? parseInt(match[2], 10) : 0;
  const modifier = match[3] ? match[3].toUpperCase() : null;

  if (modifier === "PM" && hours < 12) hours += 12;
  if (modifier === "AM" && hours === 12) hours = 0;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
};

// Helper: convert 24-hour "HH:mm" (or existing string) to 12-hour "hh:mm A" (e.g. "04:00 AM", "12:00 PM")
const to12Hour = (timeStr) => {
  if (!timeStr) return "";
  const trimmed = String(timeStr).trim();
  if (/AM|PM/i.test(trimmed)) return trimmed;
  const parts = trimmed.split(":");
  if (parts.length < 2) return trimmed;
  let hours = parseInt(parts[0], 10);
  const minutes = parts[1].slice(0, 2);
  const modifier = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12;
  return `${String(hours).padStart(2, "0")}:${minutes} ${modifier}`;
};

// Helper: appropriate icon for session
const getSessionIcon = (name) => {
  const n = (name || "").toLowerCase();
  if (n.includes("morn")) return <Sunrise className="w-4 h-4 text-amber-500" />;
  if (n.includes("afternoon") || n.includes("midday") || n.includes("noon")) return <Sun className="w-4 h-4 text-orange-500" />;
  if (n.includes("even") || n.includes("sunset")) return <Sunset className="w-4 h-4 text-indigo-500" />;
  if (n.includes("night") || n.includes("late") || n.includes("dawn") || n.includes("dark")) return <Moon className="w-4 h-4 text-purple-400" />;
  return <Clock className="w-4 h-4 text-purple-500" />;
};

const ALL_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const DAY_COLORS = {
  Monday: "from-blue-500/10 to-indigo-500/10 border-blue-200 dark:border-blue-900/50 text-blue-600 dark:text-blue-400",
  Tuesday: "from-amber-500/10 to-orange-500/10 border-amber-200 dark:border-amber-900/50 text-amber-600 dark:text-amber-400",
  Wednesday: "from-emerald-500/10 to-teal-500/10 border-emerald-200 dark:border-emerald-900/50 text-emerald-600 dark:text-emerald-400",
  Thursday: "from-yellow-500/10 to-amber-500/10 border-yellow-200 dark:border-yellow-900/50 text-yellow-600 dark:text-yellow-400",
  Friday: "from-pink-500/10 to-rose-500/10 border-pink-200 dark:border-pink-900/50 text-pink-600 dark:text-pink-400",
  Saturday: "from-purple-500/10 to-violet-500/10 border-purple-200 dark:border-purple-900/50 text-purple-600 dark:text-purple-400",
  Sunday: "from-red-500/10 to-orange-500/10 border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400",
};

export default function PostGlobalOptionsDashboard() {
  const queryClient = useQueryClient();

  // Active Tab
  const [activeTab, setActiveTab] = useState("weekGods"); // "weekGods" | "specialDays" | "sessionsDays"

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDayFilter, setSelectedDayFilter] = useState("All");

  // Modals / Form Dialog States
  const [isWeekGodModalOpen, setIsWeekGodModalOpen] = useState(false);
  const [editingWeekGod, setEditingWeekGod] = useState(null);
  const [weekGodForm, setWeekGodForm] = useState({
    day: "Monday",
    godName: "",
    isActive: true,
  });

  const [isSpecialDayModalOpen, setIsSpecialDayModalOpen] = useState(false);
  const [editingSpecialDay, setEditingSpecialDay] = useState(null);
  const [specialDayForm, setSpecialDayForm] = useState({
    name: "",
    date: "",
    isRecurringYearly: true,
    isActive: true,
  });

  // Session & Day input states
  const [newSessionForm, setNewSessionForm] = useState({
    name: "",
    startTime: "04:00 AM",
    endTime: "11:00 AM",
  });
  const [editingSessionIndex, setEditingSessionIndex] = useState(null);
  const [editingSessionForm, setEditingSessionForm] = useState({
    name: "",
    startTime: "",
    endTime: "",
  });
  const [newDayInput, setNewDayInput] = useState("");

  // Session Modal state
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [sessionModalMode, setSessionModalMode] = useState("add"); // "add" | "edit"
  const [sessionModalEditIndex, setSessionModalEditIndex] = useState(null);
  const [sessionModalForm, setSessionModalForm] = useState({
    name: "",
    startTime: "04:00 AM",
    endTime: "11:00 AM",
  });

  const openAddSessionModal = (preset = null) => {
    setSessionModalMode("add");
    setSessionModalEditIndex(null);
    setSessionModalForm(preset || { name: "", startTime: "04:00 AM", endTime: "11:00 AM" });
    setIsSessionModalOpen(true);
  };

  const openEditSessionModal = (index) => {
    const target = effectiveSessions[index];
    if (!target) return;
    setSessionModalMode("edit");
    setSessionModalEditIndex(index);
    setSessionModalForm({
      name: target.name || "",
      startTime: target.startTime || "04:00 AM",
      endTime: target.endTime || "11:00 AM",
    });
    setIsSessionModalOpen(true);
  };

  const closeSessionModal = () => {
    setIsSessionModalOpen(false);
    setSessionModalEditIndex(null);
  };

  const handleSaveSessionModal = () => {
    const name = sessionModalForm.name.trim();
    if (!name) return toast.error("Session name is required");

    const startTime = sessionModalForm.startTime ? to12Hour(sessionModalForm.startTime.trim()) : "";
    const endTime = sessionModalForm.endTime ? to12Hour(sessionModalForm.endTime.trim()) : "";
    const timeRange = startTime && endTime ? `${startTime} - ${endTime}` : "";

    if (sessionModalMode === "add") {
      if (effectiveSessions.some((s) => s.name?.toLowerCase() === name.toLowerCase())) {
        return toast.error(`Session "${name}" already exists`);
      }
      const newItem = { name, startTime, endTime, timeRange, isActive: true };
      updateSessionsMutation.mutate([...effectiveSessions, newItem]);
    } else {
      if (sessionModalEditIndex === null) return;
      const updated = [...effectiveSessions];
      updated[sessionModalEditIndex] = {
        ...updated[sessionModalEditIndex],
        name,
        startTime,
        endTime,
        timeRange,
      };
      updateSessionsMutation.mutate(updated);
    }
    closeSessionModal();
  };

  // Day modal state
  const [isDayModalOpen, setIsDayModalOpen] = useState(false);
  const [editingDayIndex, setEditingDayIndex] = useState(null); // null = add mode, number = edit mode
  const [dayModalInput, setDayModalInput] = useState("");

  const openAddDayModal = () => {
    setEditingDayIndex(null);
    setDayModalInput("");
    setIsDayModalOpen(true);
  };

  const openEditDayModal = (index) => {
    setEditingDayIndex(index);
    setDayModalInput(days[index] || "");
    setIsDayModalOpen(true);
  };

  const closeDayModal = () => {
    setIsDayModalOpen(false);
    setDayModalInput("");
    setEditingDayIndex(null);
  };

  const handleSaveDayModal = () => {
    const trimmed = dayModalInput.trim();
    if (!trimmed) return toast.error("Day name cannot be empty");
    if (editingDayIndex === null) {
      // Add mode
      if (days.includes(trimmed)) return toast.error("Day already exists");
      updateDaysMutation.mutate([...days, trimmed]);
    } else {
      // Edit mode
      const updated = days.map((d, i) => (i === editingDayIndex ? trimmed : d));
      updateDaysMutation.mutate(updated);
    }
    closeDayModal();
  };

  // Query Data
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["postGlobalOptions"],
    queryFn: fetchPostGlobalOptions,
  });

  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  const categoriesList = useMemo(() => {
    const rawList = categoriesData || data?.categories || [];
    if (!Array.isArray(rawList)) return [];

    return rawList
      .map((cat) => {
        const id = String(cat.categoryId || cat._id || cat.id || "");
        const name = (cat.categoriesName || cat.name || "").trim();
        const rawSubs = cat.subcategories || [];
        const subcategories = Array.isArray(rawSubs)
          ? rawSubs
              .map((s) => (typeof s === "string" ? s.trim() : s?.name || String(s).trim()))
              .filter(Boolean)
          : typeof rawSubs === "string"
          ? rawSubs.split(",").map((s) => s.trim()).filter(Boolean)
          : [];

        return {
          id,
          name,
          subcategories,
        };
      })
      .filter((cat) => cat.id && cat.name);
  }, [categoriesData, data?.categories]);

  // Sort categories so that "God" category is placed first at the top
  const sortedCategoriesList = useMemo(() => {
    return [...categoriesList].sort((a, b) => {
      const aIsGod = a.name.toLowerCase() === "god";
      const bIsGod = b.name.toLowerCase() === "god";
      if (aIsGod && !bIsGod) return -1;
      if (!aIsGod && bIsGod) return 1;
      return a.name.localeCompare(b.name);
    });
  }, [categoriesList]);

  const config = data?.config || {};
  const weekGods = config.weekGods || [];
  const specialDays = config.specialDays || [];
  const sessions = config.sessions || ["Morning", "Afternoon", "Evening", "Night"];
  const days = config.days || ALL_DAYS;

  // Normalized detailed sessions array
  const effectiveSessions = useMemo(() => {
    if (Array.isArray(config.sessionsDetailed) && config.sessionsDetailed.length > 0) {
      return config.sessionsDetailed;
    }
    const rawSessions = config.sessions || ["Morning", "Afternoon", "Evening", "Night"];
    return rawSessions.map((s) => ({
      name: s,
      startTime: s === "Morning" ? "04:00 AM" : s === "Afternoon" ? "12:00 PM" : s === "Evening" ? "05:00 PM" : s === "Night" ? "08:00 PM" : "",
      endTime: s === "Morning" ? "11:00 AM" : s === "Afternoon" ? "05:00 PM" : s === "Evening" ? "08:00 PM" : s === "Night" ? "04:00 AM" : "",
      timeRange: s === "Morning" ? "04:00 AM - 11:00 AM" : s === "Afternoon" ? "12:00 PM - 05:00 PM" : s === "Evening" ? "05:00 PM - 08:00 PM" : s === "Night" ? "08:00 PM - 04:00 AM" : "",
      isActive: true,
    }));
  }, [config.sessionsDetailed, config.sessions]);

  // Selected Category in Week God Modal for picking God subcategories (default to "God")
  const [selectedCategoryId, setSelectedCategoryId] = useState("");

  // Automatically default set to "God" category as soon as categories load
  useEffect(() => {
    if (categoriesList.length > 0) {
      const godCat =
        categoriesList.find((c) => c.name.toLowerCase() === "god") ||
        categoriesList.find((c) => /god/i.test(c.name)) ||
        categoriesList[0];
      if (godCat && (!selectedCategoryId || !categoriesList.some((c) => c.id === selectedCategoryId))) {
        setSelectedCategoryId(godCat.id);
      }
    }
  }, [categoriesList, selectedCategoryId]);

  const availableSubcategories = useMemo(() => {
    if (!selectedCategoryId || !categoriesList.length) return [];
    const found = categoriesList.find((c) => String(c.id) === String(selectedCategoryId));
    return found?.subcategories || [];
  }, [categoriesList, selectedCategoryId]);

  // Selected Category in Special Day Modal for picking events / festivals
  const [specialDaySelectedCategoryId, setSpecialDaySelectedCategoryId] = useState("");

  const specialDaySortedCategories = useMemo(() => {
    return [...categoriesList].sort((a, b) => {
      const aIsSpecial = a.name.toLowerCase() === "special days";
      const bIsSpecial = b.name.toLowerCase() === "special days";
      if (aIsSpecial && !bIsSpecial) return -1;
      if (!aIsSpecial && bIsSpecial) return 1;

      const isFestA = /festiv|special|diwali|pongal|new year|republic|christ|ramzan|bakrid|holi|navratri/i.test(a.name);
      const isFestB = /festiv|diwali|pongal|new year|republic|christ|ramzan|bakrid|holi|navratri/i.test(b.name);
      if (isFestA && !isFestB) return -1;
      if (!isFestA && isFestB) return 1;
      return a.name.localeCompare(b.name);
    });
  }, [categoriesList]);

  // Automatically default set to "Special Days" category as soon as categories load
  useEffect(() => {
    if (categoriesList.length > 0) {
      const specialDaysCat =
        categoriesList.find((c) => c.name.toLowerCase() === "special days") ||
        categoriesList.find((c) => /special/i.test(c.name)) ||
        categoriesList.find((c) => /festiv/i.test(c.name)) ||
        categoriesList[0];
      if (specialDaysCat && (!specialDaySelectedCategoryId || !categoriesList.some((c) => c.id === specialDaySelectedCategoryId))) {
        setSpecialDaySelectedCategoryId(specialDaysCat.id);
      }
    }
  }, [categoriesList, specialDaySelectedCategoryId]);

  const specialDayAvailableSubcategories = useMemo(() => {
    if (!specialDaySelectedCategoryId || !categoriesList.length) return [];
    const found = categoriesList.find((c) => String(c.id) === String(specialDaySelectedCategoryId));
    return found?.subcategories || [];
  }, [categoriesList, specialDaySelectedCategoryId]);

  // Mutations
  const addWeekGodMutation = useMutation({
    mutationFn: addWeekGod,
    onSuccess: (res) => {
      toast.success(res.message || "Week God added successfully!");
      queryClient.invalidateQueries({ queryKey: ["postGlobalOptions"] });
      queryClient.invalidateQueries({ queryKey: ["dropdownConfig"] });
      closeWeekGodModal();
    },
    onError: (err) => toast.error(err.message || "Failed to add week god"),
  });

  const updateWeekGodMutation = useMutation({
    mutationFn: updateWeekGod,
    onSuccess: (res) => {
      toast.success(res.message || "Week God updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["postGlobalOptions"] });
      queryClient.invalidateQueries({ queryKey: ["dropdownConfig"] });
      closeWeekGodModal();
    },
    onError: (err) => toast.error(err.message || "Failed to update week god"),
  });

  const deleteWeekGodMutation = useMutation({
    mutationFn: deleteWeekGod,
    onSuccess: (res) => {
      toast.success(res.message || "Week God deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["postGlobalOptions"] });
      queryClient.invalidateQueries({ queryKey: ["dropdownConfig"] });
    },
    onError: (err) => toast.error(err.message || "Failed to delete week god"),
  });

  const addSpecialDayMutation = useMutation({
    mutationFn: addSpecialDay,
    onSuccess: (res) => {
      toast.success(res.message || "Special Day added successfully!");
      queryClient.invalidateQueries({ queryKey: ["postGlobalOptions"] });
      queryClient.invalidateQueries({ queryKey: ["dropdownConfig"] });
      closeSpecialDayModal();
    },
    onError: (err) => toast.error(err.message || "Failed to add special day"),
  });

  const updateSpecialDayMutation = useMutation({
    mutationFn: updateSpecialDay,
    onSuccess: (res) => {
      toast.success(res.message || "Special Day updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["postGlobalOptions"] });
      queryClient.invalidateQueries({ queryKey: ["dropdownConfig"] });
      closeSpecialDayModal();
    },
    onError: (err) => toast.error(err.message || "Failed to update special day"),
  });

  const deleteSpecialDayMutation = useMutation({
    mutationFn: deleteSpecialDay,
    onSuccess: (res) => {
      toast.success(res.message || "Special Day deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["postGlobalOptions"] });
      queryClient.invalidateQueries({ queryKey: ["dropdownConfig"] });
    },
    onError: (err) => toast.error(err.message || "Failed to delete special day"),
  });

  const updateSessionsMutation = useMutation({
    mutationFn: updateSessionsConfig,
    onSuccess: () => {
      toast.success("Sessions updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["postGlobalOptions"] });
      queryClient.invalidateQueries({ queryKey: ["dropdownConfig"] });
      setNewSessionForm({ name: "", startTime: "04:00 AM", endTime: "11:00 AM" });
      setEditingSessionIndex(null);
    },
    onError: (err) => toast.error(err.message || "Failed to update sessions"),
  });

  const handleAddSession = () => {
    const name = newSessionForm.name.trim();
    if (!name) return toast.error("Session name is required (e.g. Morning, Afternoon)");

    if (effectiveSessions.some((s) => s.name?.toLowerCase() === name.toLowerCase())) {
      return toast.error(`Session "${name}" already exists`);
    }

    const startTime = newSessionForm.startTime ? to12Hour(newSessionForm.startTime.trim()) : "";
    const endTime = newSessionForm.endTime ? to12Hour(newSessionForm.endTime.trim()) : "";
    const timeRange = startTime && endTime ? `${startTime} - ${endTime}` : "";

    const newSessionItem = {
      name,
      startTime,
      endTime,
      timeRange,
      isActive: true,
    };

    updateSessionsMutation.mutate([...effectiveSessions, newSessionItem]);
  };

  const handleStartEditSession = (index) => {
    const target = effectiveSessions[index];
    if (!target) return;
    setEditingSessionIndex(index);
    setEditingSessionForm({
      name: target.name || "",
      startTime: target.startTime || "",
      endTime: target.endTime || "",
    });
  };

  const handleSaveEditSession = () => {
    if (editingSessionIndex === null) return;
    const name = editingSessionForm.name.trim();
    if (!name) return toast.error("Session name cannot be empty");

    const startTime = editingSessionForm.startTime ? to12Hour(editingSessionForm.startTime.trim()) : "";
    const endTime = editingSessionForm.endTime ? to12Hour(editingSessionForm.endTime.trim()) : "";
    const timeRange = startTime && endTime ? `${startTime} - ${endTime}` : "";

    const updated = [...effectiveSessions];
    updated[editingSessionIndex] = {
      ...updated[editingSessionIndex],
      name,
      startTime,
      endTime,
      timeRange,
    };

    updateSessionsMutation.mutate(updated);
  };

  const handleDeleteSession = (indexToDelete) => {
    const target = effectiveSessions[indexToDelete];
    if (!target) return;
    if (confirm(`Remove session "${target.name}"?`)) {
      const updated = effectiveSessions.filter((_, idx) => idx !== indexToDelete);
      updateSessionsMutation.mutate(updated);
    }
  };

  const updateDaysMutation = useMutation({
    mutationFn: updateDaysConfig,
    onSuccess: () => {
      toast.success("Days updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["postGlobalOptions"] });
      queryClient.invalidateQueries({ queryKey: ["dropdownConfig"] });
      setNewDayInput("");
    },
    onError: (err) => toast.error(err.message || "Failed to update days"),
  });

  // Modal helpers
  const openAddWeekGodModal = (preselectedDay = "Monday") => {
    setEditingWeekGod(null);
    setWeekGodForm({
      day: preselectedDay,
      godName: "",
      isActive: true,
    });
    // Default set to "God" category
    const godCat =
      categoriesList.find((c) => c.name.toLowerCase() === "god") ||
      categoriesList.find((c) => /god/i.test(c.name || "")) ||
      [...categoriesList].sort((a, b) => b.subcategories.length - a.subcategories.length)[0];
    if (godCat) {
      setSelectedCategoryId(godCat.id);
    }
    setIsWeekGodModalOpen(true);
  };

  const openEditWeekGodModal = (item) => {
    setEditingWeekGod(item);
    setWeekGodForm({
      day: item.day || "Monday",
      godName: item.godName || "",
      isActive: item.isActive !== undefined ? item.isActive : true,
    });
    // Try to find the category that contains item.godName in its subcategories
    const matchingCat = categoriesList.find((c) =>
      c.subcategories.some(
        (s) => s.toLowerCase() === (item.godName || "").toLowerCase()
      )
    );
    if (matchingCat) {
      setSelectedCategoryId(matchingCat.id);
    } else {
      const godCat =
        categoriesList.find((c) => c.name.toLowerCase() === "god") ||
        categoriesList.find((c) => /god/i.test(c.name || "")) ||
        [...categoriesList].sort((a, b) => b.subcategories.length - a.subcategories.length)[0];
      if (godCat) {
        setSelectedCategoryId(godCat.id);
      }
    }
    setIsWeekGodModalOpen(true);
  };

  const closeWeekGodModal = () => {
    setIsWeekGodModalOpen(false);
    setEditingWeekGod(null);
  };

  const handleSaveWeekGod = (e) => {
    e.preventDefault();
    if (!weekGodForm.godName.trim()) {
      return toast.error("God Name is required");
    }
    if (editingWeekGod) {
      updateWeekGodMutation.mutate({
        id: editingWeekGod._id,
        data: weekGodForm,
      });
    } else {
      addWeekGodMutation.mutate(weekGodForm);
    }
  };

  const openAddSpecialDayModal = () => {
    setEditingSpecialDay(null);
    setSpecialDayForm({
      name: "",
      date: new Date().toISOString().split("T")[0],
      isRecurringYearly: true,
      isActive: true,
    });
    // Default set to "Special Days" category
    const specialDaysCat =
      categoriesList.find((c) => c.name.toLowerCase() === "special days") ||
      categoriesList.find((c) => /special/i.test(c.name)) ||
      categoriesList.find((c) => /festiv/i.test(c.name)) ||
      categoriesList[0];
    if (specialDaysCat) {
      setSpecialDaySelectedCategoryId(specialDaysCat.id);
    }
    setIsSpecialDayModalOpen(true);
  };

  const openEditSpecialDayModal = (item) => {
    setEditingSpecialDay(item);
    setSpecialDayForm({
      name: item.name || "",
      date: item.date || "",
      isRecurringYearly: item.isRecurringYearly !== undefined ? item.isRecurringYearly : true,
      isActive: item.isActive !== undefined ? item.isActive : true,
    });
    const matchingCat =
      categoriesList.find((c) =>
        c.subcategories.some((s) => s.toLowerCase() === (item.name || "").toLowerCase())
      ) ||
      categoriesList.find((c) => c.name.toLowerCase() === (item.name || "").toLowerCase()) ||
      categoriesList.find((c) => c.name.toLowerCase() === "special days") ||
      categoriesList[0];
    if (matchingCat) {
      setSpecialDaySelectedCategoryId(matchingCat.id);
    }
    setIsSpecialDayModalOpen(true);
  };

  const closeSpecialDayModal = () => {
    setIsSpecialDayModalOpen(false);
    setEditingSpecialDay(null);
  };

  const handleSaveSpecialDay = (e) => {
    e.preventDefault();
    if (!specialDayForm.name.trim() || !specialDayForm.date) {
      return toast.error("Special Day Name and Date are required");
    }
    if (editingSpecialDay) {
      updateSpecialDayMutation.mutate({
        id: editingSpecialDay._id,
        data: specialDayForm,
      });
    } else {
      addSpecialDayMutation.mutate(specialDayForm);
    }
  };

  // Filtered Week Gods
  const filteredWeekGods = useMemo(() => {
    return weekGods.filter((item) => {
      const matchesDay = selectedDayFilter === "All" || item.day === selectedDayFilter;
      const matchesSearch =
        !searchQuery ||
        item.godName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.day?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesDay && matchesSearch;
    });
  }, [weekGods, selectedDayFilter, searchQuery]);

  // Grouped by Day
  const groupedWeekGods = useMemo(() => {
    const groups = {};
    ALL_DAYS.forEach((d) => (groups[d] = []));
    filteredWeekGods.forEach((item) => {
      if (groups[item.day]) {
        groups[item.day].push(item);
      } else {
        groups[item.day] = [item];
      }
    });
    return groups;
  }, [filteredWeekGods]);

  // Filtered Special Days (Sorted chronologically by date)
  const filteredSpecialDays = useMemo(() => {
    return [...specialDays]
      .filter((item) => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
          item.name?.toLowerCase().includes(q) ||
          item.date?.toLowerCase().includes(q) ||
          item.dayOfWeek?.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => (a.date || "").localeCompare(b.date || ""));
  }, [specialDays, searchQuery]);

  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-500 font-medium">Loading Post Global Options...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-red-600">
        <p className="font-semibold">Failed to load Post Global Options</p>
        <p className="text-sm mt-1">{error?.message || "Unknown error"}</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <Toaster position="top-right" />

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-6 md:p-8 text-white shadow-lg">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-xs font-semibold text-blue-200 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-blue-300" />
              Content Scheduling & Feeds
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">Post Global Options</h2>
            <p className="text-blue-200 text-sm mt-1 max-w-2xl">
              Configure week gods (multi-entity day mappings like Monday → Murugan, Allah), special days with calendar dates (Diwali, New Year), and feed sessions.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {activeTab === "weekGods" && (
              <button
                onClick={() => openAddWeekGodModal(selectedDayFilter !== "All" ? selectedDayFilter : "Monday")}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all active:scale-95"
              >
                <Plus className="w-4 h-4" />
                Add Week God
              </button>
            )}
            {activeTab === "specialDays" && (
              <button
                onClick={openAddSpecialDayModal}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all active:scale-95"
              >
                <Calendar className="w-4 h-4" />
                Add Special Day
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => {
              setActiveTab("weekGods");
              setSearchQuery("");
            }}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeTab === "weekGods"
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            <Sun className="w-4 h-4" />
            Week Gods & Days
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${
                activeTab === "weekGods" ? "bg-white/20 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
              }`}
            >
              {weekGods.length}
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTab("specialDays");
              setSearchQuery("");
            }}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeTab === "specialDays"
                ? "bg-amber-600 text-white shadow-sm"
                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            <Calendar className="w-4 h-4" />
            Special Days (Dates)
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${
                activeTab === "specialDays" ? "bg-white/20 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
              }`}
            >
              {specialDays.length}
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTab("sessionsDays");
              setSearchQuery("");
            }}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeTab === "sessionsDays"
                ? "bg-purple-600 text-white shadow-sm"
                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            <Clock className="w-4 h-4" />
            Sessions & Days
          </button>
        </div>

        {/* Global Search Bar */}
        {(activeTab === "weekGods" || activeTab === "specialDays") && (
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={activeTab === "weekGods" ? "Search god or day..." : "Search festival or date..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 outline-none focus:border-blue-500 transition-all"
            />
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: WEEK GODS & DAYS TAB                                          */}
      {/* ========================================================================= */}
      {activeTab === "weekGods" && (
        <div className="space-y-6">
          {/* Day Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mr-1 flex items-center">
              <Filter className="w-3 h-3 mr-1" /> Days:
            </span>
            <button
              onClick={() => setSelectedDayFilter("All")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${
                selectedDayFilter === "All"
                  ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-sm"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200"
              }`}
            >
              All Days ({weekGods.length})
            </button>
            {ALL_DAYS.map((d) => {
              const count = weekGods.filter((w) => w.day === d).length;
              return (
                <button
                  key={d}
                  onClick={() => setSelectedDayFilter(d)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 flex items-center gap-1.5 ${
                    selectedDayFilter === d
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200"
                  }`}
                >
                  {d}
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      selectedDayFilter === d ? "bg-white/20 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-700"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Grouped Day View */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(selectedDayFilter === "All" ? ALL_DAYS : [selectedDayFilter]).map((dayName) => {
              const dayItems = groupedWeekGods[dayName] || [];
              const colorClass = DAY_COLORS[dayName] || "from-gray-500/10 to-slate-500/10 border-gray-200 text-gray-700";

              return (
                <div
                  key={dayName}
                  className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  <div>
                    {/* Day Card Header */}
                    <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100 dark:border-gray-800">
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border bg-gradient-to-r ${colorClass}`}>
                          {dayName}
                        </span>
                        <span className="text-xs text-gray-400 font-medium">{dayItems.length} entities</span>
                      </div>
                      <button
                        onClick={() => openAddWeekGodModal(dayName)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 px-2 py-1 rounded-lg transition-colors"
                        title={`Add another deity/entity to ${dayName}`}
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add Entity
                      </button>
                    </div>

                    {/* Entities for this Day (Multi-time support) */}
                    {dayItems.length === 0 ? (
                      <div className="py-8 text-center text-gray-400 text-xs italic">
                        No gods or entities added for {dayName} yet.
                        <button
                          onClick={() => openAddWeekGodModal(dayName)}
                          className="block mx-auto mt-2 text-blue-500 font-semibold underline not-italic hover:text-blue-600"
                        >
                          + Add first entity
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                        {dayItems.map((item) => (
                          <div
                            key={item._id}
                            className="group p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700/60 hover:border-blue-300 dark:hover:border-blue-800 transition-all flex items-center justify-between gap-3"
                          >
                            <h4 className="font-bold text-sm text-gray-900 dark:text-gray-100 truncate">{item.godName}</h4>

                            <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => openEditWeekGodModal(item)}
                                className="p-1.5 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-white dark:hover:bg-gray-700 transition-colors"
                                title="Edit"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(`Delete "${item.godName}" from ${item.day}?`)) {
                                    deleteWeekGodMutation.mutate(item._id);
                                  }
                                }}
                                className="p-1.5 rounded-lg text-gray-500 hover:text-red-600 hover:bg-white dark:hover:bg-gray-700 transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800/60 flex items-center justify-between text-[11px] text-gray-400">
                    <span>Supports multiple entities per day</span>
                    <span className="font-semibold text-gray-500 dark:text-gray-400">e.g. Murugan, Allah</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 2: SPECIAL DAYS TAB (CALENDAR DATES)                             */}
      {/* ========================================================================= */}
      {activeTab === "specialDays" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-amber-500/10 border border-amber-200 dark:border-amber-900/40 rounded-2xl p-4 md:p-5">
            <div>
              <h3 className="font-bold text-amber-900 dark:text-amber-200 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-amber-600" />
                Date-Wise Special Days
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-200 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 font-semibold">
                  {specialDays.length} Events
                </span>
              </h3>
              <p className="text-xs text-amber-800 dark:text-amber-300 mt-0.5">
                Feeds uploaded for these special days will be prioritized automatically on these specific calendar dates.
              </p>
            </div>
            <button
              onClick={openAddSpecialDayModal}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-sm font-semibold shadow transition-all shrink-0"
            >
              <Plus className="w-4 h-4" />
              Add Special Day
            </button>
          </div>

          {filteredSpecialDays.length === 0 ? (
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-12 text-center">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="font-bold text-gray-700 dark:text-gray-300 text-base">No Special Days found</p>
              <p className="text-gray-400 text-sm mt-1">Try changing your search query or add a new special day.</p>
              <button
                onClick={openAddSpecialDayModal}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600 text-white text-sm font-semibold hover:bg-amber-500"
              >
                <Plus className="w-4 h-4" />
                Add Special Day
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredSpecialDays.map((item) => {
                const formattedDate = item.date ? new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "-";
                return (
                  <div
                    key={item._id}
                    className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex flex-col">
                          <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                            {item.dayOfWeek || "Special Date"}
                          </span>
                          <h4 className="font-bold text-base text-gray-900 dark:text-gray-100">{item.name}</h4>
                        </div>
                        <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200 border border-amber-200 dark:border-amber-900/60 shrink-0">
                          {formattedDate}
                        </span>
                      </div>

                      {item.isRecurringYearly && (
                        <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                          Yearly Recurring
                        </span>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                      <span className="text-[11px] text-gray-400 font-mono">Date: {item.date}</span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEditSpecialDayModal(item)}
                          className="p-1.5 rounded-lg text-gray-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-gray-800 transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete special day "${item.name}"?`)) {
                              deleteSpecialDayMutation.mutate(item._id);
                            }
                          }}
                          className="p-1.5 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-gray-800 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 3: SESSIONS & DAYS TAB                                           */}
      {/* ========================================================================= */}
      {activeTab === "sessionsDays" && (
        <div className="flex flex-col gap-4">
          {/* ========================================== */}
          {/* SESSIONS — NO CARD                        */}
          {/* ========================================== */}
          <div className="space-y-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-xl font-extrabold text-gray-900 dark:text-gray-100 flex items-center gap-2.5">
                  <Clock className="w-5 h-5 text-purple-600 shrink-0" />
                  Manage Feed Sessions
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Time intervals for scheduled feed delivery (Morning, Afternoon, Evening, Night).
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-bold px-3 py-1 bg-purple-50 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 rounded-full border border-purple-200 dark:border-purple-800/60">
                  {effectiveSessions.length} Sessions
                </span>
                <button
                  onClick={() => openAddSessionModal()}
                  className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-sm font-semibold transition-all shadow-sm hover:shadow-md cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Add Session
                </button>
              </div>
            </div>

            {/* Sessions list */}
            {effectiveSessions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <Clock className="w-10 h-10 mb-3 opacity-30" />
                <p className="text-sm font-semibold">No sessions configured yet</p>
                <p className="text-xs mt-1 mb-4">Click "Add Session" to get started.</p>
                <button
                  onClick={() => openAddSessionModal()}
                  className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-semibold transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Add Your First Session
                </button>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-800 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                {effectiveSessions.map((sess, index) => {
                  const timeRangeDisplay = sess.timeRange || (sess.startTime && sess.endTime ? `${sess.startTime} - ${sess.endTime}` : "");
                  return (
                    <div
                      key={sess.name || index}
                      className="flex items-center gap-4 px-4 py-3.5 bg-white dark:bg-gray-900 hover:bg-gray-50/80 dark:hover:bg-gray-800/60 transition-colors group"
                    >
                      {/* Index */}
                      <span className="w-6 h-6 flex items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 text-[11px] font-bold shrink-0">
                        {index + 1}
                      </span>

                      {/* Icon + Name */}
                      <div className="flex items-center gap-2.5 flex-1 min-w-0">
                        <span className="shrink-0">{getSessionIcon(sess.name)}</span>
                        <span className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">{sess.name}</span>
                        {sess.isActive === false && (
                          <span className="text-[10px] px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 text-gray-500 rounded font-medium shrink-0">
                            Inactive
                          </span>
                        )}
                      </div>

                      {/* Time badge — center */}
                      <div className="flex-1 flex justify-center">
                        {timeRangeDisplay ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-900/30 border border-purple-200/70 dark:border-purple-800/50 px-3 py-1 rounded-lg">
                            <Clock className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                            {timeRangeDisplay}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400 italic">No time set</span>
                        )}
                      </div>

                      {/* Actions — right */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => openEditSessionModal(index)}
                          title="Edit Session"
                          className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-gray-500 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" /> Edit
                        </button>
                        <button
                          onClick={() => handleDeleteSession(index)}
                          title="Delete Session"
                          className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT SESSION                                                 */}
      {/* ========================================================================= */}
      {isSessionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            {/* Close */}
            <button
              onClick={closeSessionModal}
              className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Title */}
            <div className="mb-5">
              <div className="flex items-center gap-2.5 mb-1">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/40 rounded-xl">
                  <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-lg font-extrabold text-gray-900 dark:text-gray-100">
                  {sessionModalMode === "add" ? "Add New Session" : "Edit Session"}
                </h3>
              </div>
              <p className="text-xs text-gray-500 ml-11">
                {sessionModalMode === "add"
                  ? "Define a time slot for feed delivery."
                  : `Editing: ${effectiveSessions[sessionModalEditIndex]?.name || ""}`}
              </p>
            </div>

            {/* Quick Presets */}
            <div className="mb-4">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Quick Presets</p>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { name: "Morning", startTime: "04:00 AM", endTime: "11:00 AM", icon: <Sunrise className="w-4 h-4 text-amber-500" />, color: "border-amber-200 dark:border-amber-800/40 hover:border-amber-400" },
                  { name: "Afternoon", startTime: "12:00 PM", endTime: "05:00 PM", icon: <Sun className="w-4 h-4 text-orange-500" />, color: "border-orange-200 dark:border-orange-800/40 hover:border-orange-400" },
                  { name: "Evening", startTime: "05:00 PM", endTime: "08:00 PM", icon: <Sunset className="w-4 h-4 text-indigo-500" />, color: "border-indigo-200 dark:border-indigo-800/40 hover:border-indigo-400" },
                  { name: "Night", startTime: "08:00 PM", endTime: "04:00 AM", icon: <Moon className="w-4 h-4 text-purple-400" />, color: "border-purple-200 dark:border-purple-800/40 hover:border-purple-400" },
                ].map((p) => (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => setSessionModalForm({ name: p.name, startTime: p.startTime, endTime: p.endTime })}
                    className={`flex flex-col items-center justify-center p-2 rounded-xl bg-white dark:bg-gray-800 border ${p.color} transition-all text-center cursor-pointer`}
                  >
                    {p.icon}
                    <span className="text-[10px] font-bold text-gray-700 dark:text-gray-300 mt-1">{p.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Session Name */}
            <div className="space-y-4 mb-5">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Session Name *
                </label>
                <input
                  type="text"
                  autoFocus
                  placeholder="e.g., Morning, Midday, Late Night..."
                  value={sessionModalForm.name}
                  onChange={(e) => setSessionModalForm((p) => ({ ...p, name: e.target.value }))}
                  onKeyDown={(e) => { if (e.key === "Enter") handleSaveSessionModal(); }}
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                />
              </div>

              {/* Time Pickers */}
              <div className="grid grid-cols-2 gap-3">
                {/* Start */}
                <div className="bg-gray-50 dark:bg-gray-800/60 p-3 rounded-xl border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">Start Time</span>
                    <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 px-1.5 py-0.5 rounded">
                      {sessionModalForm.startTime || "--"}
                    </span>
                  </div>
                  <input
                    type="time"
                    value={to24Hour(sessionModalForm.startTime)}
                    onChange={(e) => setSessionModalForm((p) => ({ ...p, startTime: to12Hour(e.target.value) }))}
                    className="w-full px-2.5 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 outline-none focus:border-purple-500"
                  />
                </div>
                {/* End */}
                <div className="bg-gray-50 dark:bg-gray-800/60 p-3 rounded-xl border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">End Time</span>
                    <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 px-1.5 py-0.5 rounded">
                      {sessionModalForm.endTime || "--"}
                    </span>
                  </div>
                  <input
                    type="time"
                    value={to24Hour(sessionModalForm.endTime)}
                    onChange={(e) => setSessionModalForm((p) => ({ ...p, endTime: to12Hour(e.target.value) }))}
                    className="w-full px-2.5 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {/* Live Preview */}
              <div className="flex items-center justify-center gap-2 p-3 bg-purple-50/60 dark:bg-purple-950/20 rounded-xl border border-purple-100 dark:border-purple-900/30">
                <Clock className="w-4 h-4 text-purple-500 shrink-0" />
                <span className="text-sm font-bold text-purple-700 dark:text-purple-300">
                  {sessionModalForm.name || "Session Name"} · {sessionModalForm.startTime || "--"} → {sessionModalForm.endTime || "--"}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={closeSessionModal}
                className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSessionModal}
                disabled={updateSessionsMutation.isPending || !sessionModalForm.name.trim()}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-sm font-semibold transition-all shadow-sm hover:shadow-md disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                {sessionModalMode === "add" ? (
                  <><Plus className="w-4 h-4" /> Add Session</>
                ) : (
                  <><Check className="w-4 h-4" /> Save Changes</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT WEEK GOD                                               */}
      {/* ========================================================================= */}
      {isWeekGodModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <button
              onClick={closeWeekGodModal}
              className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1 flex items-center gap-2">
              <Sun className="w-5 h-5 text-blue-600" />
              {editingWeekGod ? "Edit Week God Option" : "Add New Week God Option"}
            </h3>
            <p className="text-xs text-gray-500 mb-5">
              Assign a deity or spiritual entity to a week day (supports multiple per day).
            </p>

            <form onSubmit={handleSaveWeekGod} className="space-y-4">
              {/* Day */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                  Day of Week <span className="text-red-500">*</span>
                </label>
                <select
                  value={weekGodForm.day}
                  onChange={(e) => setWeekGodForm({ ...weekGodForm, day: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 outline-none focus:border-blue-500"
                >
                  {ALL_DAYS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              {/* Category & Subcategory Picker */}
              <div className="p-3.5 bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-800/50 rounded-xl space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-blue-900 dark:text-blue-300 uppercase tracking-wider">
                      Select Category
                    </label>
                    <span className="text-[11px] text-blue-600 dark:text-blue-400 font-medium">
                      (e.g. God / Devotional)
                    </span>
                  </div>
                  <select
                    value={selectedCategoryId}
                    onChange={(e) => setSelectedCategoryId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-blue-200 dark:border-blue-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 outline-none focus:border-blue-500 font-medium"
                  >
                    {sortedCategoriesList.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name} ({cat.subcategories.length} subcategories)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Subcategory List to select God Name */}
                {selectedCategoryId && availableSubcategories.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-blue-900 dark:text-blue-300 uppercase tracking-wider">
                        Select Subcategory (God List)
                      </label>
                      <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                        Click to set God Name
                      </span>
                    </div>
                    <select
                      value={availableSubcategories.includes(weekGodForm.godName) ? weekGodForm.godName : ""}
                      onChange={(e) => {
                        if (e.target.value) {
                          setWeekGodForm((prev) => ({ ...prev, godName: e.target.value }));
                        }
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-emerald-50/50 dark:bg-emerald-950/20 text-sm text-gray-900 dark:text-gray-100 outline-none focus:border-emerald-500 font-semibold"
                    >
                      <option value="">-- Choose Deity / God ({availableSubcategories.length}) --</option>
                      {availableSubcategories.map((sub, idx) => (
                        <option key={`${sub}-${idx}`} value={sub}>
                          {sub}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {selectedCategoryId && availableSubcategories.length === 0 && (
                  <p className="text-[11px] text-amber-600 dark:text-amber-400">
                    No subcategories found in this category. You can type the God Name directly below.
                  </p>
                )}
              </div>

              {/* God Name */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    God Name <span className="text-red-500">*</span>
                  </label>
                  <span className="text-[11px] text-gray-400">
                    Selected from subcategory or type custom
                  </span>
                </div>
                <input
                  type="text"
                  placeholder="e.g. Lord Murugan, Allah, Lord Shiva..."
                  value={weekGodForm.godName}
                  onChange={(e) => setWeekGodForm({ ...weekGodForm, godName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 outline-none focus:border-blue-500 font-semibold"
                  required
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={closeWeekGodModal}
                  className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addWeekGodMutation.isPending || updateWeekGodMutation.isPending}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold shadow transition-all disabled:opacity-50"
                >
                  {editingWeekGod ? "Update Option" : "Save Option"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT SPECIAL DAY                                            */}
      {/* ========================================================================= */}
      {isSpecialDayModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <button
              onClick={closeSpecialDayModal}
              className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-amber-600" />
              {editingSpecialDay ? "Edit Special Day" : "Add New Special Day"}
            </h3>
            <p className="text-xs text-gray-500 mb-5">
              Set calendar dates for holidays and celebrations.
            </p>

            <form onSubmit={handleSaveSpecialDay} className="space-y-4">
              {/* Category & Subcategory Picker for Special Days */}
              <div className="p-3.5 bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/50 rounded-xl space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wider">
                      Select Category
                    </label>
                    <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                      (e.g. Festival, Diwali, Pongal...)
                    </span>
                  </div>
                  <select
                    value={specialDaySelectedCategoryId}
                    onChange={(e) => {
                      const selectedId = e.target.value;
                      setSpecialDaySelectedCategoryId(selectedId);
                      const cat = categoriesList.find((c) => String(c.id) === String(selectedId));
                      if (cat) {
                        if (!cat.subcategories || cat.subcategories.length === 0) {
                          setSpecialDayForm((prev) => ({ ...prev, name: cat.name }));
                        }
                      }
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-amber-200 dark:border-amber-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 outline-none focus:border-amber-500 font-medium"
                  >
                    {specialDaySortedCategories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name} ({cat.subcategories.length} subcategories)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Subcategory List if available */}
                {specialDaySelectedCategoryId && specialDayAvailableSubcategories.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wider">
                        Select Subcategory (Special Day List)
                      </label>
                      <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                        Click to set Special Day Name
                      </span>
                    </div>
                    <select
                      value={specialDayAvailableSubcategories.includes(specialDayForm.name) ? specialDayForm.name : ""}
                      onChange={(e) => {
                        if (e.target.value) {
                          setSpecialDayForm((prev) => ({ ...prev, name: e.target.value }));
                        }
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-emerald-50/50 dark:bg-emerald-950/20 text-sm text-gray-900 dark:text-gray-100 outline-none focus:border-emerald-500 font-semibold"
                    >
                      <option value="">-- Choose from Subcategory List ({specialDayAvailableSubcategories.length}) --</option>
                      {specialDayAvailableSubcategories.map((sub, idx) => (
                        <option key={`${sub}-${idx}`} value={sub}>
                          {sub}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Special Day Name */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Special Day Name <span className="text-red-500">*</span>
                  </label>
                  <span className="text-[11px] text-gray-400">
                    Selected from category/subcategory or type custom
                  </span>
                </div>
                <input
                  type="text"
                  placeholder="e.g. Diwali, New Year, Pongal..."
                  value={specialDayForm.name}
                  onChange={(e) => setSpecialDayForm({ ...specialDayForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 outline-none focus:border-amber-500 font-semibold"
                  required
                />
              </div>

              {/* Date Picker */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                  Calendar Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={specialDayForm.date}
                  onChange={(e) => setSpecialDayForm({ ...specialDayForm, date: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 outline-none focus:border-amber-500"
                  required
                />
              </div>

              {/* Yearly Recurring Checkbox */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isRecurringYearly"
                  checked={specialDayForm.isRecurringYearly}
                  onChange={(e) => setSpecialDayForm({ ...specialDayForm, isRecurringYearly: e.target.checked })}
                  className="w-4 h-4 text-amber-600 rounded border-gray-300 focus:ring-amber-500"
                />
                <label htmlFor="isRecurringYearly" className="text-xs font-semibold text-gray-700 dark:text-gray-300 cursor-pointer">
                  Yearly Recurring Event (Applies every year)
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={closeSpecialDayModal}
                  className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addSpecialDayMutation.isPending || updateSpecialDayMutation.isPending}
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-sm font-semibold shadow transition-all disabled:opacity-50"
                >
                  {editingSpecialDay ? "Update Special Day" : "Save Special Day"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
