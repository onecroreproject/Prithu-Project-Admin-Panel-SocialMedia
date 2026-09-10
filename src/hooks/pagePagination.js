import { useState, useMemo } from "react";

export default function usePagination(items = [], itemsPerPage = 10) {
  const [page, setPage] = useState(1);

  const totalPages = Math.ceil(items.length / itemsPerPage);

  const currentItems = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    return items.slice(start, start + itemsPerPage);
  }, [items, page, itemsPerPage]);

  const nextPage = () => setPage((p) => Math.min(p + 1, totalPages));
  const prevPage = () => setPage((p) => Math.max(p - 1, 1));
  const resetPage = () => setPage(1);

  return {
    page,
    totalPages,
    currentItems,
    nextPage,
    prevPage,
    resetPage,
  };
}
