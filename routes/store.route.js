const { Router } = require("express");
const {
  createStore,
  deleteStore,
  getStore,
  getStores,
  updateStore,
  resizeStoreImages,
  uploadStoreImages,
} = require("../controller/store.controller");
const {
  createStoreValidator,
  deleteStoreValidator,
  getStoreValidator,
  updateStoreValidator,
} = require("../utils/validator/store.validator");
const { protect, allowedRoles } = require("../services/auth");
const roles = require("../config/roles");

const router = Router();

router
  .route("/")
  .post(
    protect,
    allowedRoles(roles.VENDOR),
    uploadStoreImages,
    resizeStoreImages,
    createStoreValidator,
    createStore
  )
  .get(getStores);

router
  .route("/:id")
  .get(getStoreValidator, getStore)
  .put(
    protect,
    allowedRoles(roles.VENDOR),
    uploadStoreImages,
    resizeStoreImages,
    updateStoreValidator,
    updateStore
  )
  .delete(
    protect,
    allowedRoles(roles.ADMIN, roles.VENDOR),
    deleteStoreValidator,
    deleteStore
  );

module.exports = router;
