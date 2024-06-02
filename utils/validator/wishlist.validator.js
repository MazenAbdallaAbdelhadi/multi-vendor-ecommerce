const { body, checkExact } = require("express-validator");
const validatorMiddleware = require("../../middleware/validatorMiddleware");
const Product = require("../../models/product.model");

exports.addProductToWishlistValidator = [
  body("productId")
    .isMongoId()
    .withMessage("invalid product id")
    .custom(async (val) => {
      const productExists = await Product.findById(val);
      if (!productExists) return Promise.reject("product does not exist");
      return true;
    }),
  checkExact(),
  validatorMiddleware,
];

exports.removeProductFromWishlistValidator = [
  body("productId").isMongoId().withMessage("invalid product id"),
  checkExact(),
  validatorMiddleware,
];
