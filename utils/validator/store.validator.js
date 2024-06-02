const { body, param, checkExact } = require("express-validator");
const slugify = require("slugify");
const Store = require("../../models/store.model");
const validatorMiddleware = require("../../middleware/validatorMiddleware");
const { enumFormObject } = require("../helper/enum-from-object");
const paymentMethods = require("../../config/payment-methods");
const roles = require("../../config/roles");
const { unAuthorized, recordNotFound } = require("../response/errors");

exports.createStoreValidator = [
  body("name")
    .notEmpty()
    .withMessage("Store name is required")
    .isLength({ min: 3, max: 50 })
    .withMessage("Store name must be between 3 and 50 characters")
    .custom(async (val) => {
      const storeExists = await Store.findOne({ name: val });
      if (storeExists) return Promise.reject("Store name already exists");
      return true;
    })
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  body("description")
    .notEmpty()
    .withMessage("Store description is required")
    .isLength({ max: 250 })
    .withMessage("Store description must be less than 250 characters"),
  body("slug"),
  body("logo").optional(),
  body("banner").optional(),
  body("paymentMethods")
    .optional()
    .isArray()
    .custom((val) =>
      val.every((method) =>
        enumFormObject(paymentMethods).includes(parseInt(method))
      )
    ),
  body("shippingPolicy").optional(),
  body("returnPolicy").optional(),
  checkExact(),
  validatorMiddleware,
  (req, _res, next) => {
    req.body.user = req.user._id;
    next();
  },
];

exports.getStoreValidator = [
  param("id").isMongoId().withMessage("invalid Store id"),
  checkExact(),
  validatorMiddleware,
];

exports.updateStoreValidator = [
  param("id").isMongoId().withMessage("invalid Store id"),
  body("name")
    .optional()
    .isLength({ min: 3, max: 50 })
    .withMessage("Store name must be between 3 and 50 characters")
    .custom(async (val) => {
      const storeExists = await Store.findOne({ name: val });
      if (storeExists) return Promise.reject("Store name already exists");
      return true;
    })
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  body("description")
    .optional()
    .isLength({ max: 250 })
    .withMessage("Store description must be less than 250 characters"),
  body("slug"),
  body("logo").optional(),
  body("banner").optional(),
  body("paymentMethods")
    .optional()
    .isArray()
    .custom((val) =>
      val.every((method) =>
        enumFormObject(paymentMethods).includes(parseInt(method))
      )
    ),
  body("shippingPolicy").optional(),
  body("returnPolicy").optional(),
  checkExact(),
  validatorMiddleware,
  async (req, _res, next) => {
    const store = await Store.findById(req.params.id);
    // check if store exists
    if (!store) {
      return next(recordNotFound({ message: "Store not found" }));
    }

    // check if user is the owner of the store
    if (store.user.toString() !== req.user._id.toString()) {
      return next(
        unAuthorized({
          message: "you are not allowed to perform this action",
        })
      );
    }

    return next();
  },
];

exports.deleteStoreValidator = [
  param("id").isMongoId().withMessage("invalid Store id"),
  checkExact(),
  validatorMiddleware,
  // check if user is the owner of the store or admin
  async (req, _res, next) => {
    if (req.user.role === roles.ADMIN) {
      return next();
    }

    if (req.user.role === roles.VENDOR) {
      const store = await Store.findById(req.params.id);
      if (!store) {
        return next(recordNotFound({ message: "Store not found" }));
      }
      if (store.user.toString() !== req.user._id.toString()) {
        return next(
          unAuthorized({
            message: "you are not allowed to perform this action",
          })
        );
      }

      next();
    }
  },
];
