const { body, checkExact } = require("express-validator");
const validatorMiddleware = require("../../middleware/validatorMiddleware");

exports.addAddressValidator = [
  body("alias")
    .notEmpty()
    .withMessage("alias is required")
    .isLength({ min: 3 })
    .withMessage("alias must be 3 characters at least"),
  body("details")
    .notEmpty()
    .withMessage("details is required")
    .isLength({ min: 10 })
    .withMessage("details must be 10 characters at least"),
  body("phone")
    .isMobilePhone(["ar-EG"])
    .withMessage("only egyptian mobile numbers are allowed"),
  body("city").notEmpty().withMessage("city is required"),
  body("postalCode")
    .isPostalCode("any")
    .withMessage("Please enter a valid postal code"),
  checkExact(),
  validatorMiddleware,
];

exports.removeAddressValidator = [
  body("addressId").isMongoId().withMessage("invalid product id"),
  checkExact(),
  validatorMiddleware,
];
