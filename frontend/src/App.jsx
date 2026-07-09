import React, { useEffect, useState } from "react";
import Filters from "./components/Filters";
import NewsForm from "./components/NewsForm";
import NewsList from "./components/NewsList";
import Pagination from "./components/Pagination";
import BreakingNewsBar from "./components/BreakingNewsBar";
import useNewsFeed from "./hooks/useNewsFeed";
import { createNews } from "./services/api";

const getCurrentPage = () => {
  const hash = window.location.hash.replace("#", "");
  return hash === "post" ? "post" : "news";
};

function App() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [view, setView] = useState(getCurrentPage);
  const {
    clearFilters,
    error,
    filters,
    goToNextPage,
    goToPreviousPage,
    handleCategoryChange,
    handleCustomModeChange,
    handleDateChange,
    handleDateRangeChange,
    handleSearchChange,
    handleSortChange,
    isLoading,
    items,
    pagination,
    refreshNews,
    search
  } = useNewsFeed();

  useEffect(() => {
    const handleHashChange = () => {
      setView(getCurrentPage());
    };

    window.addEventListener("hashchange", handleHashChange);

    if (!window.location.hash) {
      window.location.hash = "news";
    }

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  const handleCreateNews = async (payload) => {
    try {
      setIsSubmitting(true);
      setSubmitError("");
      setUploadProgress(0);
      await createNews(payload, {
        onUploadProgress: (progressValue) => {
          setUploadProgress(progressValue);
        }
      });
      await refreshNews();
      window.location.hash = "news";
      return true;
    } catch (submitError) {
      setSubmitError(submitError.message);
      return false;
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  return (
    <main className="app-shell">
      <header className="page-nav">
        <a
          className={view === "news" ? "nav-link active" : "nav-link"}
          href="#news"
        >
          News Feed
        </a>
        <a
          className={view === "post" ? "nav-link active" : "nav-link"}
          href="#post"
        >
          Post News
        </a>
      </header>

      {view === "post" ? (
        <NewsForm
          onSubmit={handleCreateNews}
          isSubmitting={isSubmitting}
          uploadProgress={uploadProgress}
          submitError={submitError}
        />
      ) : (
        <>
          <BreakingNewsBar items={items} isLoading={isLoading} />
          <Filters
            search={search}
            category={filters.category}
            sort={filters.sort}
            dateRange={filters.dateRange}
            customMode={filters.customMode}
            startDate={filters.startDate}
            endDate={filters.endDate}
            onCategoryChange={handleCategoryChange}
            onSortChange={handleSortChange}
            onSearchChange={handleSearchChange}
            onDateChange={handleDateChange}
            onCustomModeChange={handleCustomModeChange}
            onDateRangeChange={handleDateRangeChange}
            onClear={clearFilters}
          />
          <NewsList items={items} isLoading={isLoading} error={error} />
          <Pagination
            pagination={pagination}
            isLoading={isLoading}
            onPrevious={goToPreviousPage}
            onNext={goToNextPage}
          />
        </>
      )}
    </main>
  );
}

export default App;
