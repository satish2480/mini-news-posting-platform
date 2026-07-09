const News = require("../models/News");
const {
  indexNewsItem,
  isElasticsearchAvailable,
  searchNews
} = require("../services/searchService");
const {
  buildPaginationMeta,
  escapeRegex,
  isValidDate,
  parsePagination,
  validateBreakingNewsQuery,
  validateNewsListQuery
} = require("../utils/queryHelpers");
const {
  sanitizePlainText,
  sanitizeRichText,
  sanitizeUrl
} = require("../utils/sanitizeInput");

const VALID_SORTS = new Set(["newest", "oldest"]);

const buildSearchFilter = ({ search, startDate, endDate, category, sourceName }) => {
  const filter = {};

  if (search) {
    const safeSearch = escapeRegex(search.trim());
    filter.$or = [
      { headline: { $regex: safeSearch, $options: "i" } },
      { content: { $regex: safeSearch, $options: "i" } },
      { category: { $regex: safeSearch, $options: "i" } }
    ];
  }

  if (category) {
    filter.category = {
      $regex: `^${escapeRegex(category.trim())}$`,
      $options: "i"
    };
  }

  if (sourceName) {
    filter.sourceName = {
      $regex: `^${escapeRegex(sourceName.trim())}$`,
      $options: "i"
    };
  }

  if (startDate || endDate) {
    filter.timestamp = {};

    if (startDate) {
      if (!isValidDate(startDate)) {
        const error = new Error("Invalid startDate");
        error.statusCode = 400;
        throw error;
      }

      filter.timestamp.$gte = new Date(startDate);
    }

    if (endDate) {
      if (!isValidDate(endDate)) {
        const error = new Error("Invalid endDate");
        error.statusCode = 400;
        throw error;
      }

      const inclusiveEndDate = new Date(endDate);
      inclusiveEndDate.setHours(23, 59, 59, 999);
      filter.timestamp.$lte = inclusiveEndDate;
    }
  }

  return filter;
};

const parseSortOrder = (sort) => {
  if (!sort || !VALID_SORTS.has(sort)) {
    return -1;
  }

  return sort === "oldest" ? 1 : -1;
};

const createHttpError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const normalizeNewsPayload = (body) => {
  const headline = sanitizePlainText(body.headline || body.title || "", 180);
  const content = sanitizeRichText(body.content || "");
  const category = sanitizePlainText(body.category || "", 80);
  const imageUrl = sanitizeUrl(body.imageUrl || "", { allowRelative: true });
  const sourceName = sanitizePlainText(body.sourceName || "", 120);
  const sourceUrl = sanitizeUrl(body.sourceUrl || "");

  if (!headline || !content || !category) {
    throw createHttpError(400, "headline/title, content, and category are required");
  }

  if (body.imageUrl && !imageUrl) {
    throw createHttpError(400, "imageUrl must be a valid http(s) URL");
  }

  if (body.sourceUrl && !sourceUrl) {
    throw createHttpError(400, "sourceUrl must be a valid http(s) URL");
  }

  return {
    headline,
    content,
    category,
    imageUrl,
    sourceName,
    sourceUrl,
    timestamp: body.timestamp
  };
};

const buildUploadedImagePath = (file) => {
  if (!file?.filename) {
    return "";
  }

  return `/uploads/${file.filename}`;
};

const fetchPaginatedNews = async ({ filter, page, limit, skip, sort, mapItems }) => {
  const sortOrder = parseSortOrder(sort);
  const [items, total] = await Promise.all([
    News.find(filter)
      .sort({ timestamp: sortOrder })
      .skip(skip)
      .limit(limit)
      .lean(),
    News.countDocuments(filter)
  ]);

  return {
    items: mapItems ? items.map(mapItems) : items,
    pagination: buildPaginationMeta({ page, limit, total })
  };
};

const createNews = async (req, res) => {
  try {
    const payload = normalizeNewsPayload(req.body);

    if (req.file) {
      payload.imageUrl = buildUploadedImagePath(req.file);
    }

    const news = await News.create(payload);
    await indexNewsItem(news);

    return res.status(201).json(news);
  } catch (error) {
    return res
      .status(error.statusCode || 500)
      .json({ message: error.message || "Failed to create news item" });
  }
};

const getNews = async (req, res) => {
  try {
    const validatedQuery = validateNewsListQuery(req.query, VALID_SORTS);
    const { page, limit, skip } = parsePagination(validatedQuery, 8);
    let result;

    if (validatedQuery.search && isElasticsearchAvailable()) {
      const elasticResult = await searchNews({
        search: validatedQuery.search,
        category: validatedQuery.category,
        sourceName: validatedQuery.sourceName,
        startDate: validatedQuery.startDate,
        endDate: validatedQuery.endDate,
        sort: validatedQuery.sort,
        page,
        limit
      });

      result = {
        items: elasticResult.items,
        pagination: buildPaginationMeta({
          page,
          limit,
          total: elasticResult.total
        })
      };
    } else {
      const filter = buildSearchFilter(validatedQuery);
      result = await fetchPaginatedNews({
        filter,
        page,
        limit,
        skip,
        sort: validatedQuery.sort
      });
    }

    res.setHeader("Cache-Control", "private, no-store");
    return res.json(result);
  } catch (error) {
    return res
      .status(error.statusCode || 500)
      .json({ message: error.message || "Failed to fetch news items" });
  }
};

const createBreakingNews = async (req, res) => {
  return createNews(req, res);
};

const getBreakingNews = async (req, res) => {
  try {
    const validatedQuery = validateBreakingNewsQuery(req.query, VALID_SORTS);
    const { page, limit, skip } = parsePagination(validatedQuery, 10);
    const filter = buildSearchFilter({
      category: validatedQuery.category,
      sourceName: validatedQuery.sourceName
    });
    const result = await fetchPaginatedNews({
      filter,
      page,
      limit,
      skip,
      sort: validatedQuery.sort,
      mapItems: (item) => ({
        ...item,
        title: item.headline
      })
    });

    res.setHeader("Cache-Control", "public, max-age=60, s-maxage=300, stale-while-revalidate=300");
    res.setHeader("Vary", "Origin");
    return res.json(result);
  } catch (error) {
    return res
      .status(error.statusCode || 500)
      .json({ message: error.message || "Failed to fetch breaking news" });
  }
};

module.exports = {
  createNews,
  getNews,
  createBreakingNews,
  getBreakingNews
};
