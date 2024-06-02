const { body, param, checkExact } = require("express-validator");
const slugify = require("slugify");
const Product = require("../../models/product.model");
const Store = require("../../models/store.model");
const Category = require("../../models/category.model");
const SubCategory = require("../../models/sub-category.model");
const validatorMiddleware = require("../../middleware/validatorMiddleware");
const { recordNotFound, unAuthorized } = require("../response/errors");
const roles = require("../../config/roles");

exports.createStoreValidator = [
  body("name")
    .notEmpty()
    .withMessage("Product name is required")
    .isLength({ min: 3, max: 50 })
    .withMessage("Product name must be between 3 and 50 characters")
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  body("slug"),
  body("description")
    .notEmpty()
    .withMessage("Product description is required")
    .isLength({ min: 25 })
    .withMessage("Product description must be at least 25 characters"),
  body("price")
    .notEmpty()
    .withMessage("Product price is required")
    .custom((val, { req }) => {
      const num = parseFloat(val);
      if (isNaN(num)) return false;
      req.body.price = num;
      return true;
    })
    .withMessage("Product price must be  a number")
    .custom((val) => val >= 0.01)
    .withMessage("Product price must be more than 0.01"),
  body("coverImage").notEmpty().withMessage("Product cover image is required"),
  body("images").optional().isArray({ max: 5 }),
  body("salePrice")
    .optional()
    .custom((val) => {
      if (val < 0.01) return false;
      return true;
    })
    .withMessage("Product sale price must be more than 0.01")
    .custom((val, { req }) => {
      if (val > req.body.price) return false;
      return true;
    })
    .withMessage("Product sale price must be less than price"),
  body("quantity")
    .notEmpty()
    .withMessage("Product quantity is required")
    .custom((val, { req }) => {
      const num = parseInt(val, 0);
      if (isNaN(num)) return false;
      req.body.quantity = num;
      return true;
    })
    .withMessage("Product quantity must be  a number"),
  body("store")
    .notEmpty()
    .withMessage("Store id is required")
    .isMongoId()
    .withMessage("invalid Store id")
    // find store made by user with id
    .custom(async (val, { req }) => {
      const storeExists = await Store.findOne({
        _id: val,
        user: req?.user._id,
      });
      if (!storeExists) return Promise.reject("Store does not exist");
      return true;
    }),
  body("category")
    .notEmpty()
    .withMessage("Category id is required")
    .isMongoId()
    .withMessage("invalid Category id")
    .custom(async (val) => {
      const categoryExists = await Category.findById(val);
      if (!categoryExists) return Promise.reject("Category does not exist");
      return true;
    }),
  body("subCategory")
    .notEmpty()
    .withMessage("SubCategory id is required")
    .isMongoId()
    .withMessage("invalid SubCategory id")
    .custom(async (val, { req }) => {
      const subCategoryExists = await SubCategory.findOne({
        _id: val,
        category: req.body.category,
      });
      if (!subCategoryExists)
        return Promise.reject(
          "SubCategory does not exist on the selected Category"
        );
      return true;
    }),
  body("brand").optional().isMongoId().withMessage("invalid Brand id"),
  body("isActive")
    .optional()
    .custom((val, { req }) => {
      req.body.isActive = val.toLowerCase() === "true";
      return true;
    }),
  checkExact(),
  validatorMiddleware,
];

exports.getProductValidator = [
  param("id").isMongoId().withMessage("invalid product id"),
  checkExact(),
  validatorMiddleware,
];

exports.updateProductValidator = [
  param("id").isMongoId().withMessage("invalid product id"),
  body("name")
    .optional()
    .isLength({ min: 3, max: 50 })
    .withMessage("Product name must be between 3 and 50 characters")
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  body("slug"),
  body("description")
    .optional()
    .isLength({ min: 25 })
    .withMessage("Product description must be at least 25 characters"),
  body("price")
    .optional()
    .custom((val, { req }) => {
      const num = parseFloat(val);
      if (isNaN(num)) return false;
      req.body.price = num;
      return true;
    })
    .withMessage("Product price must be  a number")
    .custom((val) => val >= 0.01)
    .withMessage("Product price must be more than 0.01"),
  body("coverImage").optional(),
  body("images").optional().isArray({ max: 5 }),
  body("salePrice")
    .optional()
    .custom((val) => {
      if (val < 0.01) return false;
      return true;
    })
    .withMessage("Product sale price must be more than 0.01")
    .custom((val, { req }) => {
      if (val > req.body.price) return false;
      return true;
    })
    .withMessage("Product sale price must be less than price"),
  body("quantity")
    .optional()
    .custom((val, { req }) => {
      const num = parseInt(val);
      if (isNaN(num)) return false;
      req.body.quantity = num;
      return true;
    })
    .withMessage("Product quantity must be  a number"),
  body("category")
    .optional()
    .isMongoId()
    .withMessage("invalid Category id")
    .custom(async (val) => {
      const categoryExists = await Category.findById(val);
      if (!categoryExists) return Promise.reject("Category does not exist");
      return true;
    }),
  body("subCategory")
    .optional()
    .isMongoId()
    .withMessage("invalid SubCategory id")
    .custom(async (val, { req }) => {
      const subCategoryExists = await SubCategory.findOne({
        _id: val,
        category: req.body.category,
      });
      if (!subCategoryExists)
        return Promise.reject(
          "SubCategory does not exist on the selected Category"
        );
      return true;
    }),
  body("brand").optional().isMongoId().withMessage("invalid Brand id"),
  body("isActive")
    .optional()
    .custom((val, { req }) => {
      req.body.isActive = req.body.isActive = val.toLowerCase() === "true";
      return true;
    }),
  checkExact(),
  validatorMiddleware,
  // check if user is the owner of the store
  async (req, _res, next) => {
    const product = await Product.findById(req.params.id).populate("store");
    if (product.store.user.toString() !== req.user._id.toString())
      return next(
        unAuthorized({
          message: "you are not allowed to delete this product",
        })
      );

    return next();
  },
];

exports.deleteProductValidator = [
  param("id").isMongoId().withMessage("invalid product id"),
  checkExact(),
  validatorMiddleware,
  // check if the user is admin or owner of the store
  async (req, _res, next) => {
    if (req.user.role === roles.ADMIN) {
      return next();
    }

    if (req.user.role === roles.VENDOR) {
      const product = await Product.findById(req.params.id).populate("store");
      if (!product)
        return next(recordNotFound({ message: "product not found" }));

      if (product.store.user.toString() !== req.user._id.toString())
        return next(
          unAuthorized({
            message: "you are not allowed to delete this product",
          })
        );
    }

    next();
  },
];
