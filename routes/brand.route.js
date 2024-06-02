const { Router } = require("express");
const {
  createBrand,
  deleteBrand,
  getBrand,
  getbrands,
  updateBrand,
  resizeBrandImage,
  uploadBrandImage,
} = require("../controller/brand.controller");
const {
  createBrandValidator,
  deleteBrandValidator,
  getBrandValidator,
  updateBrandValidator,
} = require("../utils/validator/brand.validator");
const { protect, allowedRoles } = require("../services/auth");
const roles = require("../config/roles");

const router = Router();

router
  .route("/")
  .post(
    protect,
    allowedRoles(roles.ADMIN),
    uploadBrandImage,
    resizeBrandImage,
    createBrandValidator,
    createBrand
  )
  .get(getbrands);

router
  .route("/:id")
  .get(getBrandValidator, getBrand)
  .put(
    protect,
    allowedRoles(roles.ADMIN),
    uploadBrandImage,
    resizeBrandImage,
    updateBrandValidator,
    updateBrand
  )
  .delete(
    protect,
    allowedRoles(roles.ADMIN),
    deleteBrandValidator,
    deleteBrand
  );

module.exports = router;
