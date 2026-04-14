import { useState, useMemo } from 'react';

export function usePagination<T>(items: T[], pageSize = 20) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedItems = useMemo(
    () => items.slice((safeCurrentPage - 1) * pageSize, safeCurrentPage * pageSize),
    [items, safeCurrentPage, pageSize]
  );

  const goToPage = (page: number) => setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  const nextPage = () => goToPage(safeCurrentPage + 1);
  const prevPage = () => goToPage(safeCurrentPage - 1);
  const resetPage = () => setCurrentPage(1);

  return {
    currentPage: safeCurrentPage,
    totalPages,
    paginatedItems,
    totalItems: items.length,
    goToPage,
    nextPage,
    prevPage,
    resetPage,
    hasNextPage: safeCurrentPage < totalPages,
    hasPrevPage: safeCurrentPage > 1,
  };
}
