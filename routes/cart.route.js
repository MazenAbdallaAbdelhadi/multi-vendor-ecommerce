const { Router } = require("express");
const {
  addProductToCart,
  clearCart,
  getLoggedUserCart,
  removeSpecificCartItem,
  updateCartItemQuantity,
  applyCoupon,
} = require("../controller/cart.controller");

const { protect } = require("../services/auth");

const router = Router();

router.use(protect);

router
  .route("/")
  .post(addProductToCart)
  .get(getLoggedUserCart)
  .delete(clearCart);

router.put("/applyCoupon", applyCoupon);

router
  .route("/:itemId")
  .put(updateCartItemQuantity)
  .delete(removeSpecificCartItem);

module.exports = router;
