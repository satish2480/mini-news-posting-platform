import React from "react";

function Pagination({ pagination, isLoading, onPrevious, onNext }) {
  return (
    <div className="pagination-bar">
      <span className="pagination-text">
        Page {pagination.page} of {pagination.totalPages} | {pagination.total} stories
      </span>
      <div className="pagination-actions">
        <button
          type="button"
          onClick={onPrevious}
          disabled={pagination.page === 1 || isLoading}
        >
          Previous
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={pagination.page >= pagination.totalPages || isLoading}
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default Pagination;

