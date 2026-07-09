import React, { useState } from "react";
import categoryImages from "../constants/categoryImages";
import { resolveImageUrl } from "../utils/imageUrl";
import { sanitizeRichText } from "../utils/richText";

function NewsCard({ item }) {
  const [imageFailed, setImageFailed] = useState(false);
  const formattedDate = new Date(item.timestamp).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
  const fallbackImage = categoryImages[item.category] || "";
  const imageSource = !imageFailed && item.imageUrl
    ? resolveImageUrl(item.imageUrl)
    : fallbackImage;

  return (
    <article className="news-list-item">
      <div className="news-list-image">
        {imageSource ? (
          <img
            src={imageSource}
            alt={item.headline}
            loading="lazy"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div className="image-fallback">{item.category}</div>
        )}
      </div>
      <div className="news-list-body">
        <div className="news-meta">
          <span>{item.category}</span>
          <span>{formattedDate}</span>
        </div>
        <h3>{item.headline}</h3>
        <div
          className="news-content"
          dangerouslySetInnerHTML={{ __html: sanitizeRichText(item.content) }}
        />
        {item.sourceName ? (
          <div className="news-source">
            Source:{" "}
            {item.sourceUrl ? (
              <a href={item.sourceUrl} target="_blank" rel="noreferrer">
                {item.sourceName}
              </a>
            ) : (
              <span>{item.sourceName}</span>
            )}
          </div>
        ) : null}
      </div>
    </article>
  );
}

export default NewsCard;
