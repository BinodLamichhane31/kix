import { ChevronLeft, ChevronRight } from 'lucide-react';

export function Pagination({ pagination, onPageChange }) {
  const { currentPage, totalPages, hasNextPage, hasPreviousPage } = pagination;

  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      // Show all pages if total is less than max
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show smart pagination
      if (currentPage <= 3) {
        // Show first pages
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        // Show last pages
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Show middle pages
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  return (
    <div className="flex items-center justify-center gap-1 mt-16 pt-8 border-t border-gray-200 dark:border-white/10">
      {/* Previous Button */}
      <button
        onClick={() => hasPreviousPage && onPageChange(currentPage - 1)}
        disabled={!hasPreviousPage}
        className={`flex items-center justify-center w-10 h-10 rounded-lg font-semibold transition-all duration-200 ${
          hasPreviousPage
            ? 'text-gray-700 dark:text-gray-300 hover:text-brand-black dark:hover:text-brand-accent hover:bg-gray-100 dark:hover:bg-white/5'
            : 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
        }`}
        aria-label="Previous page"
      >
        <ChevronLeft size={20} />
      </button>

      {/* Page Numbers */}
      <div className="flex items-center gap-1">
        {getPageNumbers().map((page, index) => {
          if (page === '...') {
            return (
              <span
                key={`ellipsis-${index}`}
                className="px-2 py-1 text-gray-400 dark:text-gray-500 text-sm font-medium"
              >
                ...
              </span>
            );
          }

          const isActive = page === currentPage;
          return (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`w-10 h-10 rounded-lg font-bold text-sm transition-all duration-200 ${
                isActive
                  ? 'bg-brand-black dark:bg-brand-accent text-white dark:text-brand-black shadow-lg scale-105'
                  : 'text-gray-700 dark:text-gray-300 hover:text-brand-black dark:hover:text-brand-accent hover:bg-gray-100 dark:hover:bg-white/5'
              }`}
              aria-label={`Go to page ${page}`}
              aria-current={isActive ? 'page' : undefined}
            >
              {page}
            </button>
          );
        })}
      </div>

      {/* Next Button */}
      <button
        onClick={() => hasNextPage && onPageChange(currentPage + 1)}
        disabled={!hasNextPage}
        className={`flex items-center justify-center w-10 h-10 rounded-lg font-semibold transition-all duration-200 ${
          hasNextPage
            ? 'text-gray-700 dark:text-gray-300 hover:text-brand-black dark:hover:text-brand-accent hover:bg-gray-100 dark:hover:bg-white/5'
            : 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
        }`}
        aria-label="Next page"
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
}
