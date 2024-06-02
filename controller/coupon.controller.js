const Coupon = require("../models/coupon.model");
const {
  createOne,
  getOne,
  paginate,
  updateOne,
  deleteOne,
} = require("../services/factory-handler");

/**
 * @desc get coupons
 * @path GET /v1/coupon
 * @access private [admin | owner]
 */
exports.getCoupons = paginate(Coupon, ["name", "code"]);

/**
 * @desc get coupon by id
 * @path GET /v1/coupon/:id
 * @access private [admin | owner]
 */
exports.getCoupon = getOne(Coupon);

/**
 * @desc create new coupon
 * @path POST /v1/coupon
 * @access private [admin | vendor]
 */
exports.createCoupon = createOne(Coupon);

/**
 * @desc update coupon by id
 * @path PUT /v1/coupon/:id
 * @access private [admin | owner]
 */
exports.updateCoupon = updateOne(Coupon);

/**
 * @desc delete coupon by id
 * @path DELETE /v1/coupon/:id
 * @access private [admin | owner]
 */
exports.deleteCoupon = deleteOne(Coupon);
