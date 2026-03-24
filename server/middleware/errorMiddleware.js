const ApiError = require("../utils/ApiError");

const errorHandler = (err, req, res, next) => {
  let { statusCode, message } = err;

  // If error is not an instance of ApiError, set to 500
  if (!(err instanceof ApiError)) {
    statusCode = err.statusCode || 500;
    message = err.message || "Internal Server Error";
  }

  const response = {
    success: false,
    message,
    errors: err.errors || [],
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  };

  res.status(statusCode).json(response);
};

module.exports = errorHandler;
