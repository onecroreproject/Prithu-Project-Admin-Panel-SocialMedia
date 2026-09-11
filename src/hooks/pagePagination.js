import { useState, useMemo, useEffect, useCallback } from "react";

/**
 * Enhanced pagination hook supporting dynamic page size (itemsPerPage),
 * page navigation, boundary clamping, and 'all' display mode.
 *
 * @param {Array} items - Source array of items to paginate
 * @param {number|string} initialItemsPerPage - Default items per page (default: 10)
 */
export default function usePagination(items = [], initialItemsPerPage = 10) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSizeState] = useState(initialItemsPerPage);

  // Sync internal pageSize when initialItemsPerPage changes externally (e.g. view mode switch)
  useEffect(() => {
    setPageSizeState(initialItemsPerPage);
  }, [initialItemsPerPage]);

  // Calculate total pages safely
  const totalPages = useMemo(() => {
    if (!items || items.length === 0) return 1;
    if (pageSize === "all" || pageSize === 0) return 1;
    const size = Number(pageSize) || 10;
    return Math.max(1, Math.ceil(items.length / size));
  }, [items, pageSize]);

  // Prevent page index out of bounds when items or totalPages change
  useEffect(() => {
    if (page > totalPages && totalPages > 0) {
      setPage(totalPages);
    }
  }, [totalPages, page]);

  // Slice items based on current page and pageSize
  const currentItems = useMemo(() => {
    if (!items || items.length === 0) return [];
    if (pageSize === "all" || pageSize === 0) return items;
    const size = Number(pageSize) || 10;
    const start = (page - 1) * size;
    return items.slice(start, start + size);
  }, [items, page, pageSize]);

  const nextPage = useCallback(() => {
    setPage((p) => Math.min(p + 1, totalPages));
  }, [totalPages]);

  const prevPage = useCallback(() => {
    setPage((p) => Math.max(p - 1, 1));
  }, []);

  const resetPage = useCallback(() => {
    setPage(1);
  }, []);

  const setPageSize = useCallback((newSize) => {
    setPageSizeState(newSize);
    setPage(1);
  }, []);

  // Helpful display bounds (e.g. "Showing startIndex to endIndex of totalItems")
  const totalItems = items ? items.length : 0;
  const startIndex = totalItems === 0
    ? 0
    : pageSize === "all"
    ? 1
    : (page - 1) * (Number(pageSize) || 10) + 1;

  const endIndex = totalItems === 0
    ? 0
    : pageSize === "all"
    ? totalItems
    : Math.min(page * (Number(pageSize) || 10), totalItems);

  return {
    page,
    setPage,
    totalPages,
    currentItems,
    nextPage,
    prevPage,
    resetPage,
    // Page size controls & aliases
    pageSize,
    setPageSize,
    itemsPerPage: pageSize,
    setItemsPerPage: setPageSize,
    changePageSize: setPageSize,
    // Pagination metrics
    totalItems,
    startIndex,
    endIndex,
    isFirstPage: page === 1,
    isLastPage: page >= totalPages,
  };
}

