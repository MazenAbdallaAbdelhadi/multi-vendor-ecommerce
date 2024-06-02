const { body, param, checkExact } = require("express-validator");
const Coupon = require("../../models/coupon.model");
const validatorMiddleware = require("../../middleware/validatorMiddleware");
const roles = require("../../config/roles");
const { unAuthorized, recordNotFound } = require("../response/errors");

exports.getCouponsValidator = (req, _res, next) => {
  // if user is admin then send all coupons
  if (req.user.role === roles.ADMIN) return next();

  //   if user is vendor then send owned coupons only
  if (req.user.role === roles.VENDOR) {
    req.query.owner = req.user._id;
    return next();
  }
};

exports.getCouponValidator = [
  param("id").isMongoId().withMessage("Invalid coupon ID"),
  checkExact(),
  validatorMiddleware,
  // Check permissions for get (admin or owner)
  async (req, _res, next) => {
    if (req.user.role === roles.ADMIN) return next();
    if (req.user.role === roles.VENDOR) {
      const coupon = await Coupon.findById(req.params.id);
      if (!coupon) return next(recordNotFound({ message: "Coupon not found" }));

      if (coupon.owner.toString() !== req.user._id.toString()) {
        return next(
          unAuthorized({
            message: "your are not authorized to perform this action",
          })
        );
      }
    }

    return next();
  },
];

exports.createCouponValidator = [
  body("code")
    .notEmpty()
    .withMessage("Coupon code is required")
    .toUpperCase()
    .custom((val) => {
      return Coupon.findOne({ code: val }).then((coupon) => {
        if (coupon) {
          throw new Error("Coupon code already exists");
        }
        return true;
      });
    }),
  body("name")
    .notEmpty()
    .withMessage("Coupon name is required")
    .isLength({ min: 3, max: 50 }),
  body("description").optional().isLength({ max: 250 }),
  body("discountType")
    .notEmpty()
    .withMessage("Discount type is required")
    .isIn(["percentage", "fixedAmount"]),
  body("discountValue")
    .notEmpty()
    .withMessage("Discount value is required")
    .isNumeric()
    .custom((val, { req }) => {
      if (req.body.discountType === "percentage") {
        return val <= 100; // Maximum percentage limit
      }
      return true;
    }),
  body("maxDiscountValue")
    .optional()
    .isNumeric()
    .custom((val) => {
      if (val < 5) throw new Error("value must be at least 5");
      return true;
    }),
  body("minimumSpend")
    .optional()
    .isNumeric()
    .custom((val) => {
      if (val < 0) throw new Error("value must be at least 0");
      return true;
    }),
  body("isActive").optional().isBoolean(),
  body("startDate").optional().isISO8601(),
  body("endDate")
    .optional()
    .isISO8601()
    .custom((val, { req }) => {
      if (val && req.body.startDate && val < req.body.startDate) {
        throw new Error("End date cannot be earlier than start date");
      }
      return true;
    }),
  body("maximumUses")
    .optional()
    .isNumeric()
    .custom((val) => val > 0)
    .withMessage("maximumUses must be more than zero"),
  checkExact(),
  validatorMiddleware,
  // set owner as logged user
  (req, _res, next) => {
    req.body.owner = req.user._id;
    next();
  },
];

exports.updateCouponValidator = [
  param("id").isMongoId().withMessage("Invalid coupon ID"),
  body("code")
    .optional()
    .toUpperCase()
    .custom((val) => {
      return Coupon.findOne({ code: val }).then((coupon) => {
        if (coupon) {
          throw new Error("Coupon code already exists");
        }
        return true;
      });
    }),
  body("name").optional().isLength({ min: 3, max: 50 }),
  body("description").optional().isLength({ max: 250 }),
  body("discountType").optional().isIn(["percentage", "fixedAmount"]),
  body("discountValue")
    .optional()
    .isNumeric()
    .custom((val, { req }) => {
      if (req.body.discountType === "percentage") {
        return val <= 100;
      }
      return true;
    }),
  body("maxDiscountValue")
    .optional()
    .isNumeric()
    .custom((val) => {
      if (val < 5) throw new Error("value must be at least 5");
      return true;
    }),
  body("minimumSpend")
    .optional()
    .isNumeric()
    .custom((val) => {
      if (val < 0) throw new Error("value must be at least 0");
      return true;
    }),
  body("isActive").optional().isBoolean(),
  body("startDate").optional().isISO8601(),
  body("endDate")
    .optional()
    .isISO8601()
    .custom((val, { req }) => {
      if (val && req.body.startDate && val < req.body.startDate) {
        throw new Error("End date cannot be earlier than start date");
      }
      return true;
    }),
  body("maximumUses")
    .optional()
    .isNumeric()
    .custom((val) => val > 0)
    .withMessage("maximumUses must be more than zero"),
  checkExact(),
  validatorMiddleware,
  // Check permissions for update (admin or owner)
  async (req, _res, next) => {
    if (req.user.role === roles.ADMIN) return next();
    if (req.user.role === roles.VENDOR) {
      const coupon = await Coupon.findById(req.params.id);
      if (!coupon) return next(recordNotFound({ message: "Coupon not found" }));

      if (coupon.owner.toString() !== req.user._id.toString()) {
        return next(
          unAuthorized({
            message: "your are not authorized to perform this action",
          })
        );
      }
    }

    return next();
  },
];

exports.deleteCouponValidator = [
  param("id").isMongoId().withMessage("Invalid coupon ID"),
  checkExact(),
  validatorMiddleware,
  // Check permissions for delete (admin or owner)
  async (req, _res, next) => {
    if (req.user.role === roles.ADMIN) return next();
    if (req.user.role === roles.VENDOR) {
      const coupon = await Coupon.findById(req.params.id);
      if (!coupon) return next(recordNotFound({ message: "Coupon not found" }));

      if (coupon.owner.toString() !== req.user._id.toString()) {
        return next(
          unAuthorized({
            message: "your are not authorized to perform this action",
          })
        );
      }
    }

    return next();
  },
];
