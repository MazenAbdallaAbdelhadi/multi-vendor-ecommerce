const { Router } = require("express");
const {
  createProduct,
  deleteProduct,
  getProduct,
  getProducts,
  updateProduct,
  uploadProductImages,
  resizeProductImages,
} = require("../controller/product.controller");
const {
  createStoreValidator,
  deleteProductValidator,
  getProductValidator,
  updateProductValidator,
} = require("../utils/validator/product.validator");
const { protect, allowedRoles } = require("../services/auth");
const roles = require("../config/roles");

const router = Router();

router
  .route("/")
  .post(
    protect,
    allowedRoles(roles.VENDOR),
    uploadProductImages,
    resizeProductImages,
    createStoreValidator,
    createProduct
  )
  .get(getProducts);

router
  .route("/:id")
  .get(getProductValidator, getProduct)
  .put(
    protect,
    allowedRoles(roles.VENDOR),
    uploadProductImages,
    resizeProductImages,
    updateProductValidator,
    updateProduct
  )
  .delete(
    protect,
    allowedRoles(roles.ADMIN, roles.VENDOR),
    deleteProductValidator,
    deleteProduct
  );

module.exports = router;
