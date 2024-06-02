const Review = require("../models/review.model");
const factory = require("../services/factory-handler");

/**
 * @description get all reviews
 * @route GET /api/v1/review
 * @access public
 */
exports.getReviews = factory.paginate(Review, ["title"]);

/**
 * @description get Review by id
 * @route GET /api/v1/review/:id
 * @access public
 */
exports.getReview = factory.getOne(Review);

/**
 * @description create new Review
 * @route POST /api/v1/review
 * @access protected
 */
exports.createReview = factory.createOne(Review);

/**
 * @description update Review by id
 * @route PUT /api/v1/review/:id
 * @access protected owner
 */
exports.updateReview = factory.updateOne(Review);

/**
 * @description delete Review by id
 * @route DELETE /api/v1/review/:id
 * @access protected [owner | admin]
 */
exports.deleteReview = factory.deleteOne(Review);
