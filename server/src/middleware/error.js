const createError = require('http-errors');

function notFound(req, res, next) {
  next(createError(404, 'Not Found'));
}

function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  const details = err.errors || undefined;

  res.status(status).json({ success: false, message, details });
}

module.exports = { notFound, errorHandler };
