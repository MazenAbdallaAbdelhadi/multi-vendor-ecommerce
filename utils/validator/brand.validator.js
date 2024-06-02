const { body, param, checkExact } = require("express-validator");
const slugify = require("slugify");
const Brand = require("../../models/brand.model");
const validatorMiddleware = require("../../middleware/validatorMiddleware");

exports.createBrandValidator = [
  body("name")
    .notEmpty()
    .withMessage("name is required")
    .isLength({ min: 3, max: 125 })
    .withMessage("name must be between 3 and 125 characters")
    .trim()
    .custom(async (val) => {
      const brandExists = await Brand.findOne({ name: val });

      if (brandExists) return Promise.reject("Brand already exists");

      return true;
    })
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  body("image").notEmpty().withMessage("image is required"),
  body("slug"),
  checkExact(),
  validatorMiddleware,
];

exports.getBrandValidator = [
  param("id").isMongoId().withMessage("invalid id"),
  validatorMiddleware,
];

exports.updateBrandValidator = [
  param("id").isMongoId().withMessage("invalid id"),

  body("name")
    .optional()
    .isLength({ min: 3, max: 125 })
    .withMessage("name must be between 3 and 125 characters")
    .trim()
    .custom(async (val) => {
      const brandExists = await Brand.findOne({ name: val });

      if (brandExists) return Promise.reject("Brand already exists");

      return true;
    })
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  body("image").optional(),
  body("slug"),
  checkExact(),
  validatorMiddleware,
];

exports.deleteBrandValidator = [
  param("id").isMongoId().withMessage("invalid id"),
  validatorMiddleware,
];
