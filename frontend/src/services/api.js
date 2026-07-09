export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5000/api";
const NEWS_QUERY_KEYS = new Set([
  "search",
  "category",
  "sourceName",
  "startDate",
  "endDate",
  "sort",
  "page",
  "limit"
]);

const buildQueryString = (params = {}, allowedKeys) => {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (allowedKeys && !allowedKeys.has(key)) {
      return;
    }

    if (value !== undefined && value !== null && value !== "") {
      query.set(key, String(value));
    }
  });

  return query.toString();
};

const parseResponse = async (response, fallbackMessage) => {
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || fallbackMessage);
  }

  return data;
};

export const fetchNews = async (params = {}) => {
  const queryString = buildQueryString(params, NEWS_QUERY_KEYS);
  const response = await fetch(`${API_BASE_URL}/news?${queryString}`);

  return parseResponse(response, "Failed to load news");
};

const uploadWithProgress = (url, formData, onUploadProgress) =>
  new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();

    request.open("POST", url);
    request.responseType = "json";

    request.upload.onprogress = (event) => {
      if (!event.lengthComputable || typeof onUploadProgress !== "function") {
        return;
      }

      onUploadProgress(Math.round((event.loaded / event.total) * 100));
    };

    request.onload = () => {
      const data = request.response || null;

      if (request.status >= 200 && request.status < 300) {
        resolve(data);
        return;
      }

      reject(new Error(data?.message || "Failed to create news"));
    };

    request.onerror = () => {
      reject(new Error("Failed to create news"));
    };

    request.send(formData);
  });

export const createNews = async (payload, options = {}) => {
  const hasUploadFile =
    typeof File !== "undefined" && payload.imageFile instanceof File;
  let requestOptions;

  if (hasUploadFile) {
    const formData = new FormData();

    Object.entries(payload).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "" || key === "imageFile") {
        return;
      }

      formData.append(key, value);
    });

    formData.append("imageFile", payload.imageFile);
    return uploadWithProgress(
      `${API_BASE_URL}/news`,
      formData,
      options.onUploadProgress
    );
  } else {
    const { imageFile, ...jsonPayload } = payload;

    requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(jsonPayload)
    };
  }

  const response = await fetch(`${API_BASE_URL}/news`, requestOptions);

  return parseResponse(response, "Failed to create news");
};
