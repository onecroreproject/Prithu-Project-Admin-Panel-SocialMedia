import { useState } from "react";

export default function useFeedFilter() {
  const [filters, setFilters] = useState({
    type: "",
    startDate: "",
    endDate: "",
    categoryId: "",
    isToday: false,
  });

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () =>
    setFilters({
      type: "",
      startDate: "",
      endDate: "",
      categoryId: "",
      isToday: false,
    });

  const applyFilters = (feeds = []) => {
    return feeds.filter((feed) => {
      const matchesType =
        !filters.type || feed.type?.toLowerCase() === filters.type?.toLowerCase();

      const feedDate = new Date(feed.createdAt);

      const matchesDate =
        (!filters.startDate ||
          feedDate >= new Date(filters.startDate)) &&
        (!filters.endDate ||
          feedDate <= new Date(new Date(filters.endDate).setHours(23, 59, 59, 999)));

      const matchesCategory =
        !filters.categoryId ||
        (feed.categories && feed.categories.some((cat) => cat.id === filters.categoryId));

      const matchesToday =
        !filters.isToday ||
        feedDate.toDateString() === new Date().toDateString();

      return matchesType && matchesDate && matchesCategory && matchesToday;
    });
  };

  return {
    filters,
    handleFilterChange,
    resetFilters,
    applyFilters,
  };
}
