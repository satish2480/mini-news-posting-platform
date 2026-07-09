const DEFAULT_PAGE = 1;
const MAX_SEARCH_LENGTH = 100;
const MAX_FILTER_LENGTH = 80;

const parsePositiveInt = (value, fallback) => {
  const parsedValue = Number.parseInt(value, 10);

  if (Number.isNaN(parsedValue) || parsedValue < 1) {
    return fallback;
  }

  return parsedValue;
};

const parsePagination = (query, defaultLimit) => {
  const page = parsePositiveInt(query.page, DEFAULT_PAGE);
  const limit = Math.min(parsePositiveInt(query.limit, defaultLimit), 50);

  return {
    page,
    limit,
    skip: (page - 1) * limit
  };
};

const buildPaginationMeta = ({ page, limit, total }) => ({
  page,
  limit,
  total,
  totalPages: Math.max(Math.ceil(total / limit), 1)
});

const isValidDate = (value) => !Number.isNaN(new Date(value).getTime());

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const assertAllowedQueryParams = (query, allowedKeys) => {
  const unknownKeys = Object.keys(query).filter((key) => !allowedKeys.has(key));

  if (unknownKeys.length > 0) {
    const error = new Error(`Unsupported query parameter(s): ${unknownKeys.join(", ")}`);
    error.statusCode = 400;
    throw error;
  }
};

const normalizeQueryValue = (value, maxLength, fieldName) => {
  if (value === undefined || value === null || value === "") {
    return "";
  }

  if (typeof value !== "string") {
    const error = new Error(`${fieldName} must be a string`);
    error.statusCode = 400;
    throw error;
  }

  const trimmedValue = value.trim();

  if (trimmedValue.length > maxLength) {
    const error = new Error(`${fieldName} must be ${maxLength} characters or fewer`);
    error.statusCode = 400;
    throw error;
  }

  return trimmedValue;
};

const validateSort = (sort, validSorts) => {
  if (!sort) {
    return "";
  }

  if (!validSorts.has(sort)) {
    const error = new Error("Invalid sort value");
    error.statusCode = 400;
    throw error;
  }

  return sort;
};

const validateNewsListQuery = (query, validSorts) => {
  assertAllowedQueryParams(
    query,
    new Set(["search", "category", "sourceName", "startDate", "endDate", "sort", "page", "limit"])
  );

  return {
    search: normalizeQueryValue(query.search, MAX_SEARCH_LENGTH, "search"),
    category: normalizeQueryValue(query.category, MAX_FILTER_LENGTH, "category"),
    sourceName: normalizeQueryValue(query.sourceName, MAX_FILTER_LENGTH, "sourceName"),
    startDate: normalizeQueryValue(query.startDate, 32, "startDate"),
    endDate: normalizeQueryValue(query.endDate, 32, "endDate"),
    sort: validateSort(normalizeQueryValue(query.sort, 16, "sort"), validSorts),
    page: query.page,
    limit: query.limit
  };
};

const validateBreakingNewsQuery = (query, validSorts) => {
  assertAllowedQueryParams(
    query,
    new Set(["category", "sourceName", "sort", "page", "limit"])
  );

  return {
    category: normalizeQueryValue(query.category, MAX_FILTER_LENGTH, "category"),
    sourceName: normalizeQueryValue(query.sourceName, MAX_FILTER_LENGTH, "sourceName"),
    sort: validateSort(normalizeQueryValue(query.sort, 16, "sort"), validSorts),
    page: query.page,
    limit: query.limit
  };
};

module.exports = {
  assertAllowedQueryParams,
  buildPaginationMeta,
  escapeRegex,
  isValidDate,
  normalizeQueryValue,
  parsePagination,
  validateBreakingNewsQuery,
  validateNewsListQuery
};
