const express = require("express");
const rateLimit = require("express-rate-limit");
const {
  createNews,
  getNews,
  createBreakingNews,
  getBreakingNews
} = require("../controllers/newsController");
const upload = require("../middleware/upload");

const router = express.Router();
const readWindowMs = Number.parseInt(process.env.GET_RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000;
const searchLimit = Number.parseInt(process.env.GET_NEWS_RATE_LIMIT_MAX, 10) || 100;
const breakingNewsLimit = Number.parseInt(process.env.GET_BREAKING_NEWS_RATE_LIMIT_MAX, 10) || 150;

const createReadLimiter = (limit) =>
  rateLimit({
    windowMs: readWindowMs,
    limit,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many read requests, please slow down" }
  });

router.get("/news", createReadLimiter(searchLimit), getNews);
router.post("/news", upload.single("imageFile"), createNews);
router.get("/breaking-news", createReadLimiter(breakingNewsLimit), getBreakingNews);
router.post("/breaking-news", upload.single("imageFile"), createBreakingNews);

module.exports = router;
