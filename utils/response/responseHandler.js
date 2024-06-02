/**
 * responseHandler.js
 * @description :: exports all handlers for response format.
 */
const responseBody = require('./success');
const responseCode = require('./responseCode');

/**
 *
 * @param {obj} req : request from controller.
 * @param {obj} res : response from controller.
 * @param {*} next : executes the middleware succeeding the current middleware.
 */
const responseHandler = (req, res, next) => {
  res.success = (data = {}) => {
    res.status(responseCode.success).json(responseBody.success(data));
  };
  next();
};

module.exports = responseHandler;
