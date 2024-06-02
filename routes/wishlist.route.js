const express = require("express");

const { protect } = require("../services/auth");

const {
  addProductToWishlist,
  removeProductFromWishlist,
  getLoggedUserWishlist,
} = require("../controller/wishlist.controller");
const {
  addProductToWishlistValidator,
  removeProductFromWishlistValidator,
} = require("../utils/validator/wishlist.validator");

const router = express.Router();

router.use(protect);

router
  .route("/")
  .post(addProductToWishlistValidator, addProductToWishlist)
  .delete(removeProductFromWishlistValidator, removeProductFromWishlist)
  .get(getLoggedUserWishlist);

module.exports = router;
