import { useState } from "react";

export default function useFeedFilter() {
  const [filters, setFilters] = useState({
    type: "",
    startDate: "",
    endDate: "",
  });

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () =>
    setFilters({
      type: "",
      startDate: "",
      endDate: "",
    });

  const applyFilters = (feeds = []) => {
    return feeds.filter((feed) => {
      const matchesType =
        !filters.type || feed.type.toLowerCase() === filters.type.toLowerCase();

      const matchesDate =
        (!filters.startDate ||
          new Date(feed.createdAt) >= new Date(filters.startDate)) &&
        (!filters.endDate ||
          new Date(feed.createdAt) <= new Date(filters.endDate));

      return matchesType && matchesDate;
    });
  };

  return {
    filters,
    handleFilterChange,
    resetFilters,
    applyFilters,
  };
}
