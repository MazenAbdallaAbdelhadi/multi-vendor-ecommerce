const { Router } = require("express");
const {
  getSubCategories,
  getSubCategory,
  createSubCategory,
  updateSubCategory,
  deleteSubCategory,
} = require("../controller/sub-category.controller");
const {
  createSubCategoryValidator,
  getSubCategoryValidator,
  updateSubCategoryValidator,
  deleteSubCategoryValidator,
} = require("../utils/validator/sub-category.validator");
const { protect, allowedRoles } = require("../services/auth");
const roles = require("../config/roles");

const router = Router();

router
  .route("/")
  .post(
    protect,
    allowedRoles(roles.ADMIN),
    createSubCategoryValidator,
    createSubCategory
  )
  .get(getSubCategories);

router
  .route("/:id")
  .get(getSubCategoryValidator, getSubCategory)
  .put(
    protect,
    allowedRoles(roles.ADMIN),
    updateSubCategoryValidator,
    updateSubCategory
  )
  .delete(
    protect,
    allowedRoles(roles.ADMIN),
    deleteSubCategoryValidator,
    deleteSubCategory
  );

module.exports = router;
