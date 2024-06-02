const { Router } = require("express");

const router = Router();

router.use("/api/v1/users", require("./user.route"));
router.use("/api/v1/auth", require("./auth.route"));
router.use("/api/v1/categories", require("./category.route"));
router.use("/api/v1/sub-category", require("./sub-category.route"));
router.use("/api/v1/brand", require("./brand.route"));
router.use("/api/v1/store", require("./store.route"));
router.use("/api/v1/product", require("./product.route"));
router.use("/api/v1/review", require("./review.route"));
router.use("/api/v1/wishlist", require("./wishlist.route"));
router.use("/api/v1/coupon", require("./coupon.route"));
router.use("/api/v1/cart", require("./cart.route"));
router.use("/api/v1/address", require("./address.route"));
router.use("/api/v1/order", require("./order.route"));
// TODO: these routes
// router.use("/api/v1/payout", require("./payout.route"));

module.exports = router;
