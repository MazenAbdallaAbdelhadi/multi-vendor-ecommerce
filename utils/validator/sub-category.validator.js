const { body, param, checkExact } = require("express-validator");
const slugify = require("slugify");
const SubCategory = require("../../models/sub-category.model");
const Category = require("../../models/category.model");
const validatorMiddleware = require("../../middleware/validatorMiddleware");

exports.createSubCategoryValidator = [
  body("category")
    .isMongoId()
    .withMessage("invalid category id")
    .custom(async (val) => {
      const categoryExists = await Category.findById(val);
      if (!categoryExists) return Promise.reject("category does not exist");

      return true;
    }),
  body("name")
    .notEmpty()
    .withMessage("name is required")
    .isLength({ min: 3, max: 125 })
    .withMessage("name must be between 3 and 125 characters")
    .trim()
    .custom(async (val, { req }) => {
      const SubCategoryExists = await SubCategory.findOne({
        name: val,
        category: req.body.category,
      });

      if (SubCategoryExists)
        return Promise.reject("SubCategory already exists");

      return true;
    })
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  body("description")
    .notEmpty()
    .withMessage("description is required")
    .isLength({ min: 25 })
    .withMessage("description must be 25 characters at least")
    .trim(),
  body("slug"),
  checkExact(),
  validatorMiddleware,
];

exports.getSubCategoryValidator = [
  param("id").isMongoId().withMessage("invalid id"),
  validatorMiddleware,
];

exports.updateSubCategoryValidator = [
  param("id").isMongoId().withMessage("invalid id"),

  body("category")
    .isMongoId()
    .withMessage("invalid category id")
    .custom(async (val) => {
      const categoryExists = await Category.findById(val);
      if (!categoryExists) return Promise.reject("category does not exist");

      return true;
    }),
  body("name")
    .optional()
    .isLength({ min: 3, max: 125 })
    .withMessage("name must be between 3 and 125 characters")
    .trim()
    .custom(async (val, { req }) => {
      const SubCategoryExists = await SubCategory.findOne({
        name: val,
        category: req.body.category,
      });

      if (SubCategoryExists)
        return Promise.reject("SubCategory already exists");

      return true;
    })
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  body("description")
    .optional()
    .isLength({ min: 25 })
    .withMessage("description must be 25 characters at least")
    .trim(),
  body("slug"),
  checkExact(),
  validatorMiddleware,
];

exports.deleteSubCategoryValidator = [
  param("id").isMongoId().withMessage("invalid id"),
  validatorMiddleware,
];
