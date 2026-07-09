const ALLOWED_TAGS = new Set(["P", "BR", "STRONG", "EM", "UL", "OL", "LI", "BLOCKQUOTE"]);

const unwrapNode = (node) => {
  const parent = node.parentNode;

  if (!parent) {
    return;
  }

  while (node.firstChild) {
    parent.insertBefore(node.firstChild, node);
  }

  parent.removeChild(node);
};

export const sanitizeRichText = (value = "") => {
  if (!value) {
    return "";
  }

  if (typeof window === "undefined") {
    return value;
  }

  const parser = new window.DOMParser();
  const document = parser.parseFromString(`<div>${value}</div>`, "text/html");
  const root = document.body.firstElementChild;

  if (!root) {
    return "";
  }

  Array.from(root.querySelectorAll("*")).forEach((element) => {
    if (!ALLOWED_TAGS.has(element.tagName)) {
      unwrapNode(element);
      return;
    }

    Array.from(element.attributes).forEach((attribute) => {
      element.removeAttribute(attribute.name);
    });
  });

  return root.innerHTML
    .replace(/<p><\/p>/g, "")
    .replace(/<p><br><\/p>/g, "")
    .trim();
};

export const toPlainText = (value = "") => {
  if (!value) {
    return "";
  }

  if (typeof window === "undefined") {
    return value.replace(/<[^>]+>/g, " ");
  }

  const container = window.document.createElement("div");
  container.innerHTML = value;
  return (container.textContent || container.innerText || "").trim();
};

export const normalizeEditorValue = (value = "") => {
  const sanitized = sanitizeRichText(value);

  if (!sanitized) {
    return "";
  }

  return sanitized;
};
