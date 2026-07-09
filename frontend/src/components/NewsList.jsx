import React from "react";
import NewsCard from "./NewsCard";

function NewsSkeleton() {
  return (
    <section className="news-list" aria-label="Loading news">
      {Array.from({ length: 5 }).map((_, index) => (
        <article className="news-list-item skeleton-item" key={index}>
          <div className="news-list-image skeleton-block" />
          <div className="news-list-body">
            <div className="news-meta">
              <span className="skeleton-line skeleton-tag" />
              <span className="skeleton-line skeleton-date" />
            </div>
            <div className="skeleton-line skeleton-title" />
            <div className="skeleton-line skeleton-text" />
            <div className="skeleton-line skeleton-text short" />
          </div>
        </article>
      ))}
    </section>
  );
}

function NewsList({ items, isLoading, error }) {
  if (isLoading) {
    return <NewsSkeleton />;
  }

  if (error) {
    return <div className="state-box error-box">{error}</div>;
  }

  if (items.length === 0) {
    return <div className="state-box">No news items match the current filters.</div>;
  }

  return (
    <section className="news-list">
      {items.map((item) => (
        <NewsCard key={item._id} item={item} />
      ))}
    </section>
  );
}

export default NewsList;
