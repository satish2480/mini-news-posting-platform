const ALLOWED_PROTOCOLS = new Set(["http:", "https:"]);
const ALLOWED_RICH_TEXT_TAGS = new Set([
  "p",
  "br",
  "strong",
  "em",
  "ul",
  "ol",
  "li",
  "blockquote"
]);

const escapeHtml = (value) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const normalizeString = (value, maxLength) => {
  const normalized = typeof value === "string" ? value.trim() : "";

  if (!normalized) {
    return "";
  }

  return normalized.slice(0, maxLength);
};

const sanitizePlainText = (value, maxLength) => escapeHtml(normalizeString(value, maxLength));

const sanitizeRichText = (value) => {
  const input = typeof value === "string" ? value : "";

  if (!input) {
    return "";
  }

  return input
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, "")
    .replace(/<\/?([a-z0-9]+)(?:\s[^>]*)?>/gi, (match, tagName) => {
      const normalizedTagName = tagName.toLowerCase();
      return ALLOWED_RICH_TEXT_TAGS.has(normalizedTagName) ? `<${match.startsWith("</") ? "/" : ""}${normalizedTagName}>` : "";
    })
    .trim();
};

const sanitizeUrl = (value, { allowRelative = false } = {}) => {
  const normalized = normalizeString(value, 2048);

  if (!normalized) {
    return "";
  }

  if (allowRelative && normalized.startsWith("/")) {
    return normalized;
  }

  try {
    const parsedUrl = new URL(normalized);

    if (!ALLOWED_PROTOCOLS.has(parsedUrl.protocol)) {
      return "";
    }

    return parsedUrl.toString();
  } catch (_error) {
    return "";
  }
};

module.exports = {
  sanitizePlainText,
  sanitizeRichText,
  sanitizeUrl
};
