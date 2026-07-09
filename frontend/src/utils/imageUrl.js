import { API_BASE_URL } from "../services/api";

const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, "");

export const resolveImageUrl = (imageUrl) => {
  if (!imageUrl) {
    return "";
  }

  if (/^https?:\/\//i.test(imageUrl) || imageUrl.startsWith("data:")) {
    return imageUrl;
  }

  if (imageUrl.startsWith("/")) {
    return `${API_ORIGIN}${imageUrl}`;
  }

  return imageUrl;
};
