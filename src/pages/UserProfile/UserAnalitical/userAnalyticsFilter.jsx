import { useState, useEffect, useRef } from "react";
import { Calendar, Filter, X, Search, ChevronLeft, ChevronRight } from "lucide-react";

export default function UserAnalyticsFilter({ 
  filters, 
  activeTab, 
  onFilterChange, 
  onClearFilters, 
  hasActiveFilters,
  isLoading 
}) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [localFilters, setLocalFilters] = useState({
    startDate: null,
    endDate: null,
    type: "all",
    tab: activeTab
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [startDatePickerMonth, setStartDatePickerMonth] = useState(new Date());
  const [endDatePickerMonth, setEndDatePickerMonth] = useState(new Date());
  
  const startDatePickerRef = useRef(null);
  const endDatePickerRef = useRef(null);

  // Sync local filters with parent filters
  useEffect(() => {
    setLocalFilters({
      startDate: filters.startDate,
      endDate: filters.endDate,
      type: filters.type,
      tab: activeTab
    });
  }, [filters, activeTab]);

  // Close date pickers when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (startDatePickerRef.current && !startDatePickerRef.current.contains(event.target)) {
        setShowStartDatePicker(false);
      }
      if (endDatePickerRef.current && !endDatePickerRef.current.contains(event.target)) {
        setShowEndDatePicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleDateChange = (type, date) => {
    const newFilters = { 
      ...localFilters, 
      [type]: date 
    };
    setLocalFilters(newFilters);
    
    // Close the date picker
    if (type === 'startDate') {
      setShowStartDatePicker(false);
    } else {
      setShowEndDatePicker(false);
    }
  };

  const handleTypeChange = (value) => {
    const newFilters = { ...localFilters, type: value };
    setLocalFilters(newFilters);
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
  };

  const applyFilters = () => {
    onFilterChange(localFilters);
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      startDate: null,
      endDate: null,
      type: "all",
      tab: activeTab
    };
    setLocalFilters(clearedFilters);
    setSearchTerm("");
    onClearFilters();
  };

  // Calendar component
  const DatePicker = ({ selectedDate, onChange, month, setMonth, onClose, maxDate, minDate }) => {
    const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(month.getFullYear(), month.getMonth(), 1).getDay();
    
    const days = [];
    const today = new Date();
    
    // Previous month days
    const prevMonth = new Date(month.getFullYear(), month.getMonth() - 1, 1);
    const daysInPrevMonth = new Date(prevMonth.getFullYear(), prevMonth.getMonth() + 1, 0).getDate();
    
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i;
      days.push({
        date: new Date(prevMonth.getFullYear(), prevMonth.getMonth(), day),
        isCurrentMonth: false,
        isDisabled: true
      });
    }
    
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(month.getFullYear(), month.getMonth(), i);
      const isToday = date.getDate() === today.getDate() && 
                     date.getMonth() === today.getMonth() && 
                     date.getFullYear() === today.getFullYear();
      const isSelected = selectedDate && 
                        date.getDate() === selectedDate.getDate() && 
                        date.getMonth() === selectedDate.getMonth() && 
                        date.getFullYear() === selectedDate.getFullYear();
      const isDisabled = (maxDate && date > maxDate) || (minDate && date < minDate);
      
      days.push({
        date,
        isCurrentMonth: true,
        isToday,
        isSelected,
        isDisabled
      });
    }
    
    // Next month days
    const totalCells = 42; // 6 weeks
    while (days.length < totalCells) {
      const nextMonth = new Date(month.getFullYear(), month.getMonth() + 1, 1);
      const day = days.length - daysInMonth - firstDayOfMonth + 1;
      days.push({
        date: new Date(nextMonth.getFullYear(), nextMonth.getMonth(), day),
        isCurrentMonth: false,
        isDisabled: true
      });
    }
    
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    const changeMonth = (increment) => {
      const newMonth = new Date(month);
      newMonth.setMonth(newMonth.getMonth() + increment);
      setMonth(newMonth);
    };
    
    const selectDate = (date) => {
      if (!date.isDisabled) {
        onChange(date.date);
      }
    };
    
    return (
      <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 p-3 w-64">
        <div className="flex items-center justify-between mb-3">
          <button
            type="button"
            onClick={() => changeMonth(-1)}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-semibold text-sm">
            {monthNames[month.getMonth()]} {month.getFullYear()}
          </span>
          <button
            type="button"
            onClick={() => changeMonth(1)}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        
        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map(day => (
            <div key={day} className="text-center text-xs font-medium text-gray-500 dark:text-gray-400">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, index) => (
            <button
              key={index}
              type="button"
              onClick={() => selectDate(day)}
              disabled={day.isDisabled}
              className={`
                w-8 h-8 text-sm rounded flex items-center justify-center
                ${day.isSelected 
                  ? 'bg-blue-600 text-white' 
                  : day.isToday 
                    ? 'border border-blue-600 text-blue-600 dark:text-blue-400' 
                    : day.isCurrentMonth 
                      ? 'text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700' 
                      : 'text-gray-400 dark:text-gray-500'
                }
                ${day.isDisabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              {day.date.getDate()}
            </button>
          ))}
        </div>
        
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => onChange(null)}
              className="text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Filters</h3>
        </div>
        {/* <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1"
        >
          {showAdvanced ? "Hide Advanced" : "Show Advanced"}
        </button> */}
      </div>

      {/* Basic Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative" ref={startDatePickerRef}>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Start Date
          </label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowStartDatePicker(!showStartDatePicker)}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <Calendar className="w-5 h-5" />
            </button>
            <input
              type="text"
              readOnly
              value={localFilters.startDate ? localFilters.startDate.toLocaleDateString() : ''}
              onClick={() => setShowStartDatePicker(!showStartDatePicker)}
              placeholder="Select start date"
              className="w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            />
          </div>
          
          {showStartDatePicker && (
            <DatePicker
              selectedDate={localFilters.startDate}
              onChange={(date) => handleDateChange("startDate", date)}
              month={startDatePickerMonth}
              setMonth={setStartDatePickerMonth}
              onClose={() => setShowStartDatePicker(false)}
              maxDate={localFilters.endDate || new Date()}
            />
          )}
        </div>

        <div className="relative" ref={endDatePickerRef}>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            End Date
          </label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowEndDatePicker(!showEndDatePicker)}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <Calendar className="w-5 h-5" />
            </button>
            <input
              type="text"
              readOnly
              value={localFilters.endDate ? localFilters.endDate.toLocaleDateString() : ''}
              onClick={() => setShowEndDatePicker(!showEndDatePicker)}
              placeholder="Select end date"
              className="w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            />
          </div>
          
          {showEndDatePicker && (
            <DatePicker
              selectedDate={localFilters.endDate}
              onChange={(date) => handleDateChange("endDate", date)}
              month={endDatePickerMonth}
              setMonth={setEndDatePickerMonth}
              onClose={() => setShowEndDatePicker(false)}
              minDate={localFilters.startDate}
              maxDate={new Date()}
            />
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Content Type
          </label>
          <select
            value={localFilters.type}
            onChange={(e) => handleTypeChange(e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          >
            <option value="all">All Types</option>
            <option value="image">Images</option>
            <option value="video">Videos</option>
          </select>
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by title or description..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-4">
        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleClearFilters}
            disabled={isLoading}
            className="px-4 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X className="w-4 h-4" />
            Clear All
          </button>
        )}
        {/* <button
          type="button"
          onClick={applyFilters}
          disabled={isLoading}
          className="px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Applying...
            </>
          ) : (
            'Apply Filters'
          )}
        </button> */}
      </div>

      {/* Filter Status */}
      {(localFilters.startDate || localFilters.endDate || localFilters.type !== 'all') && (
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            <span className="font-medium">Active filters:</span>
            {localFilters.startDate && (
              <span className="ml-2">From: {localFilters.startDate.toLocaleDateString()}</span>
            )}
            {localFilters.endDate && (
              <span className="ml-2">To: {localFilters.endDate.toLocaleDateString()}</span>
            )}
            {localFilters.type !== 'all' && (
              <span className="ml-2">Type: {localFilters.type}</span>
            )}
          </p>
        </div>
      )}
    </div>
  );
}