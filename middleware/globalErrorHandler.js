const errors = require("../utils/response/errors");

// eslint-disable-next-line no-unused-vars
const globalErrorHandler = async (err, req, res, _next) => {
  const statusCode = err.statusCode || 500;
  const body =
    err.body ||
    errors.internalServerError({
      data: process.env.NODE_ENV === "production" ? null : err.stack,
    }).body;

  res.status(statusCode).json(body);
};

module.exports = globalErrorHandler;
