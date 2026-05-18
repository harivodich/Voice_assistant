function notFound(req, res) {
  res.status(404).json({
    error: { code: "NOT_FOUND", message: "Route not found", path: req.originalUrl },
  });
}

module.exports = { notFound };

function notFound(req, res) {
  res.status(404).json({
    error: {
      code: "NOT_FOUND",
      message: "Route not found",
      path: req.originalUrl,
    },
  });
}

module.exports = { notFound };

