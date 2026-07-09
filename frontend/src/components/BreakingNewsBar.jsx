import React, { useEffect, useState } from "react";
import categoryImages from "../constants/categoryImages";
import { resolveImageUrl } from "../utils/imageUrl";
import { sanitizeRichText } from "../utils/richText";

function BreakingNewsBar({ items, isLoading }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const breakingItems = items.slice(0, 4);

  useEffect(() => {
    setActiveIndex(0);
  }, [breakingItems.length]);

  useEffect(() => {
    if (breakingItems.length === 0) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % breakingItems.length);
    }, 4500);

    return () => {
      window.clearInterval(timer);
    };
  }, [breakingItems.length]);

  if (isLoading || breakingItems.length === 0) {
    return null;
  }

  const activeItem = breakingItems[activeIndex % breakingItems.length];
  const timestamp = new Date(activeItem.timestamp);
  const displayImage =
    resolveImageUrl(activeItem.imageUrl) || categoryImages[activeItem.category] || "";

  return (
    <section className="breaking-bar" aria-label="Breaking news">
      <div className="breaking-header">
        <div className="breaking-label">
          <span className="breaking-live-dot" />
          Breaking News
        </div>
        <div className="breaking-subtitle">Latest stories moving across the desk</div>
      </div>

      <article className="breaking-spotlight" key={activeItem._id}>
        <div className="breaking-card-image">
          {displayImage ? (
            <img src={displayImage} alt={activeItem.headline} loading="lazy" />
          ) : (
            <div className="image-fallback">{activeItem.category}</div>
          )}
        </div>

        <div className="breaking-spotlight-body">
          <div className="breaking-card-meta">
            <span>{activeItem.category}</span>
            <span>
              {timestamp.toLocaleDateString(undefined, {
                day: "2-digit",
                month: "short"
              })}{" "}
              |{" "}
              {timestamp.toLocaleTimeString(undefined, {
                hour: "2-digit",
                minute: "2-digit"
              })}
            </span>
          </div>

          <h2>{activeItem.headline}</h2>
          <div
            className="breaking-content"
            dangerouslySetInnerHTML={{ __html: sanitizeRichText(activeItem.content) }}
          />

          <div className="breaking-controls">
            <button
              type="button"
              className="breaking-nav-button"
              onClick={() =>
                setActiveIndex((current) =>
                  current === 0 ? breakingItems.length - 1 : current - 1
                )
              }
            >
              Previous
            </button>

            <div className="breaking-indicators">
              {breakingItems.map((item, index) => (
                <button
                  key={item._id}
                  type="button"
                  className={
                    index === activeIndex
                      ? "breaking-indicator active"
                      : "breaking-indicator"
                  }
                  onClick={() => setActiveIndex(index)}
                  aria-label={`Show breaking story ${index + 1}`}
                />
              ))}
            </div>

            <button
              type="button"
              className="breaking-nav-button"
              onClick={() =>
                setActiveIndex((current) => (current + 1) % breakingItems.length)
              }
            >
              Next
            </button>
          </div>
        </div>
      </article>
    </section>
  );
}

export default BreakingNewsBar;
