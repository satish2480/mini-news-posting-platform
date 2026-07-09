import React from "react";

const categoryOptions = [
  "Politics",
  "Business",
  "Science",
  "Sports",
  "Weather",
  "Infrastructure",
  "Education",
  "Health",
  "Technology",
  "Travel",
  "Environment",
  "Agriculture",
  "Finance"
];

function Filters({
  search,
  category,
  sort,
  dateRange,
  customMode,
  startDate,
  endDate,
  onCategoryChange,
  onSortChange,
  onSearchChange,
  onDateChange,
  onCustomModeChange,
  onDateRangeChange,
  onClear
}) {
  const hasActiveFilters = Boolean(
    search || category || dateRange || startDate || endDate || sort !== "newest"
  );
  const customDateValue =
    customMode === "single" ? startDate || endDate : "";

  return (
    <section className="panel filters-panel">
      <div className="filters-header">
        <div>
          <div className="section-label">Filter Feed</div>
          <div className="filters-title">Search and narrow the latest coverage</div>
        </div>
        {hasActiveFilters ? (
          <button type="button" className="filters-clear-button" onClick={onClear}>
            Clear all
          </button>
        ) : null}
      </div>

      <div className="filters-grid">
        <label className="filter-field filter-field-wide">
          <span className="filter-label">Keyword</span>
          <input
            className="filter-input search-input"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search headline, article, or topic"
          />
        </label>

        <label className="filter-field">
          <span className="filter-label">Category</span>
          <select
            className="filter-input"
            value={category}
            onChange={(event) => onCategoryChange(event.target.value)}
          >
            <option value="">All categories</option>
            {categoryOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label className="filter-field">
          <span className="filter-label">Sort</span>
          <select
            className="filter-input"
            value={sort}
            onChange={(event) => onSortChange(event.target.value)}
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </select>
        </label>

        <label className="filter-field">
          <span className="filter-label">Date Range</span>
          <select
            className="filter-input"
            value={dateRange}
            onChange={(event) => onDateRangeChange(event.target.value)}
          >
            <option value="">Any time</option>
            <option value="today">Today</option>
            <option value="last7">Last 7 days</option>
            <option value="last30">Last 30 days</option>
            <option value="custom">Custom</option>
          </select>
        </label>
      </div>

      {dateRange === "custom" ? (
        <div className="filters-custom-row">
          <label className="filter-field">
            <span className="filter-label">Mode</span>
            <select
              className="filter-input"
              value={customMode}
              onChange={(event) => onCustomModeChange(event.target.value)}
            >
              <option value="single">Exact date</option>
              <option value="range">Date range</option>
            </select>
          </label>

          {customMode === "single" ? (
            <label className="filter-field">
              <span className="filter-label">Date</span>
              <input
                className="filter-input"
                type="date"
                value={customDateValue}
                onChange={(event) => onDateChange("startDate", event.target.value)}
              />
            </label>
          ) : (
            <>
              <label className="filter-field">
                <span className="filter-label">From</span>
                <input
                  className="filter-input"
                  type="date"
                  value={startDate}
                  onChange={(event) => onDateChange("startDate", event.target.value)}
                />
              </label>

              <label className="filter-field">
                <span className="filter-label">To</span>
                <input
                  className="filter-input"
                  type="date"
                  value={endDate}
                  onChange={(event) => onDateChange("endDate", event.target.value)}
                />
              </label>
            </>
          )}
        </div>
      ) : null}
    </section>
  );
}

export default Filters;
