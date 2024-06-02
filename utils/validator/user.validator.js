const { body, param, checkExact } = require("express-validator");
const roles = require("../../config/roles");
const User = require("../../models/user.model");
const validatorMiddleware = require("../../middleware/validatorMiddleware");

const validateRole = (val) => {
  const numericRole = parseInt(val);

  if (isNaN(numericRole)) {
    throw new Error("Role must be a number");
  }

  if (![roles.ADMIN, roles.CUSTOMER, roles.VENDOR].includes(numericRole)) {
    throw new Error("invalid role");
  }

  return true;
};

const validateLoggedUserRole = (val) => {
  const numericRole = parseInt(val);

  if (isNaN(numericRole)) {
    throw new Error("Role must be a number");
  }

  if (![roles.CUSTOMER, roles.VENDOR].includes(numericRole)) {
    throw new Error("invalid role");
  }

  return true;
};

exports.createUserValidator = [
  body("name")
    .notEmpty()
    .withMessage("user name is required")
    .isLength({ min: 3, max: 50 })
    .withMessage("user name must be between 3 to 50 characters")
    .trim(),
  body("email")
    .notEmpty()
    .withMessage("email is required")
    .isEmail()
    .withMessage("user email must be valid")
    .custom(async (input) => {
      const userExist = await User.findOne({ email: input });

      if (userExist) return Promise.reject("Email already exists");

      return true;
    })
    .toLowerCase(),
  body("password")
    .notEmpty()
    .withMessage("password is required")
    .isLength({ min: 8 })
    .withMessage("password must be at least 8 characters"),
  body("role").optional().custom(validateRole),
  body("profileImage").optional(),
  body("bio").optional(),
  checkExact(),
  validatorMiddleware,
];

exports.updateUserValidator = [
  body("name")
    .optional()
    .isLength({ min: 3, max: 50 })
    .withMessage("user name must be between 3 to 50 characters")
    .trim(),
  body("role").optional().custom(validateRole),
  body("profileImage").optional(),
  body("bio").optional(),
  checkExact(),
  validatorMiddleware,
];

exports.updateUserPasswordValidator = [
  body("newPassword")
    .notEmpty()
    .withMessage("new password is required")
    .isLength({ min: 8 }),
  body("newPasswordConfirm")
    .notEmpty()
    .withMessage("new password confirm is required")
    .custom((val, { req }) => {
      if (val !== req.body.newPassword)
        return Promise.reject("wrong password confirmation");

      return true;
    }),
  checkExact(),
  validatorMiddleware,
];

exports.updateLoggedUserPasswordValidator = [
  body("oldPassword")
    .notEmpty()
    .withMessage("old password is required")
    .custom(async (val, { req }) => {
      const user = req.user;
      const isValid = await user.verifyPassword(val);

      if (!isValid) {
        return Promise.reject("old password is wrong");
      }

      return true;
    }),
  body("newPassword")
    .notEmpty()
    .withMessage("new password is required")
    .isLength({ min: 8 }),
  body("newPasswordConfirm")
    .notEmpty()
    .withMessage("new password confirm is required")
    .custom((val, { req }) => {
      if (val !== req.body.newPassword)
        return Promise.reject("wrong password confirmation");

      return true;
    }),
  checkExact(),
  validatorMiddleware,
];

exports.getUserValidator = [
  param("id").isMongoId().withMessage("invalid id"),
  checkExact(),
  validatorMiddleware,
];

exports.deleteUserValidator = [
  param("id").isMongoId().withMessage("invalid id"),
  checkExact(),
  validatorMiddleware,
];

exports.updateLoggedUserValidator = [
  body("name")
    .optional()
    .isLength({ min: 3, max: 50 })
    .withMessage("user name must be between 3 to 50 characters")
    .trim(),
  body("role").optional().custom(validateLoggedUserRole),
  body("profileImage").optional(),
  body("bio").optional(),
  checkExact(),
  validatorMiddleware,
];
