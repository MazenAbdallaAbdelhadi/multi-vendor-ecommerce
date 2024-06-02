const { Router } = require("express");
const {
  createReview,
  deleteReview,
  getReview,
  getReviews,
  updateReview,
} = require("../controller/review.controller");
const {
  createReviewValidator,
  deleteReviewValidator,
  getReviewValidator,
  updateReviewValidator,
} = require("../utils/validator/review.validator");
const { protect } = require("../services/auth");

const router = Router();

router
  .route("/")
  .post(protect, createReviewValidator, createReview)
  .get(getReviews);

router
  .route("/:id")
  .get(getReviewValidator, getReview)
  .put(protect, updateReviewValidator, updateReview)
  .delete(protect, deleteReviewValidator, deleteReview);

module.exports = router;
