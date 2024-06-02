const { Router } = require("express");
const {
  createCategory,
  deleteCategory,
  getCategories,
  getCategory,
  updateCategory,
  uploadCategoryImage,
  resizeCategoryImage,
} = require("../controller/category.controller");
const {
  createCategoryValidator,
  getCategoryValidator,
  deleteCategoryValidator,
  updateCategoryValidator,
} = require("../utils/validator/category.validator");
const { protect, allowedRoles } = require("../services/auth");
const roles = require("../config/roles");

const router = Router();

router
  .route("/")
  .post(
    protect,
    allowedRoles(roles.ADMIN),
    uploadCategoryImage,
    resizeCategoryImage,
    createCategoryValidator,
    createCategory
  )
  .get(getCategories);

router
  .route("/:id")
  .get(getCategoryValidator, getCategory)
  .put(
    protect,
    allowedRoles(roles.ADMIN),
    uploadCategoryImage,
    resizeCategoryImage,
    updateCategoryValidator,
    updateCategory
  )
  .delete(
    protect,
    allowedRoles(roles.ADMIN),
    deleteCategoryValidator,
    deleteCategory
  );

module.exports = router;
