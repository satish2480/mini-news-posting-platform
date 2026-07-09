const errorHandler = (error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  if (error.name === "MulterError" && error.code === "LIMIT_FILE_SIZE") {
    error.statusCode = 400;
    error.message = "Image upload must be 5 MB or smaller";
  }

  console.error(error);

  return res.status(error.statusCode || 500).json({
    message: error.message || "Internal server error"
  });
};

module.exports = errorHandler;
