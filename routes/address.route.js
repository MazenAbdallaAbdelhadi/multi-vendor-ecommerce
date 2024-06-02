const express = require("express");

const { protect } = require("../services/auth");

const {
  addAddress,
  getLoggedUserAddresses,
  removeAddress,
} = require("../controller/address.controller");

const {
  addAddressValidator,
  removeAddressValidator
} = require("../utils/validator/address.validator");

const router = express.Router();

router.use(protect);

router
  .route("/")
  .post(addAddressValidator, addAddress)
  .delete(removeAddressValidator, removeAddress)
  .get(getLoggedUserAddresses);

module.exports = router;
