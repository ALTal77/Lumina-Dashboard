// 404 handler for unmatched routes.
function notFound(req, res, next) {
  res.status(404).json({ error: "Not found", path: req.originalUrl });
}

// Centralized error handler. Keep JSON responses consistent everywhere.
function errorHandler(err, req, res, next) {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({
    error: err.publicMessage || "Something went wrong. Please try again.",
  });
}

module.exports = { notFound, errorHandler };
