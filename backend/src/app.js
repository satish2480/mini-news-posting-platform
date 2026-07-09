const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const path = require("path");
const rateLimit = require("express-rate-limit");
const newsRoutes = require("./routes/newsRoutes");
const errorHandler = require("./middleware/errorHandler");

const app = express();
const requestWindowMs = Number.parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000;
const maxRequestsPerWindow = Number.parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 200;
const slowRequestThresholdMs = Number.parseInt(process.env.REQUEST_LOG_SLOW_MS, 10) || 750;
const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  process.env.CLIENT_URL
].filter(Boolean);

app.disable("x-powered-by");

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
  })
);
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
    maxAge: 86400
  })
);
app.use(
  rateLimit({
    windowMs: requestWindowMs,
    limit: maxRequestsPerWindow,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many requests, please try again later" }
  })
);
app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: false, limit: "100kb" }));
app.use((req, res, next) => {
  const startTime = Date.now();

  res.on("finish", () => {
    const durationMs = Date.now() - startTime;
    const shouldLog =
      req.method === "GET" &&
      req.path.startsWith("/api/") &&
      (res.statusCode >= 400 || durationMs >= slowRequestThresholdMs);

    if (!shouldLog) {
      return;
    }

    console.warn(
      JSON.stringify({
        type: "api_request",
        method: req.method,
        path: req.originalUrl,
        statusCode: res.statusCode,
        durationMs,
        ip: req.ip,
        userAgent: req.get("user-agent") || "",
        querySize: new URLSearchParams(req.query || {}).toString().length
      })
    );
  });

  next();
});
app.use(
  "/uploads",
  express.static(path.join(process.cwd(), "uploads"), {
    dotfiles: "deny",
    index: false,
    fallthrough: false,
    setHeaders: (res) => {
      res.setHeader("X-Content-Type-Options", "nosniff");
      res.setHeader("Cache-Control", "public, max-age=86400, immutable");
    }
  })
);

app.get("/api/health", (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  res.json({ status: "ok" });
});

app.use("/api", newsRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use(errorHandler);

module.exports = app;
