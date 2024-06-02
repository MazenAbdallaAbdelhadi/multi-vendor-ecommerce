const { validationResult } = require("express-validator");
const { validationError } = require("../utils/response/errors");

// @desc  Finds the validation errors in this request and wraps them in an object with handy functions
const validatorMiddleware = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    next(validationError({ data: errors.array() }));
  }
  next();
};

module.exports = validatorMiddleware;
