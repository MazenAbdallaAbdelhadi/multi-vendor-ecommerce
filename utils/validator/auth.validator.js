const { body, checkExact } = require("express-validator");
const User = require("../../models/user.model");
const validatorMiddleware = require("../../middleware/validatorMiddleware");

exports.registerValidator = [
  body("name")
    .notEmpty()
    .withMessage("name is required")
    .isLength({ min: 3 })
    .withMessage("name must be at least 3 characters")
    .trim(),
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Email must be a valid Email address")
    .custom(async (input) => {
      const userExist = await User.findOne({ email: input });

      if (userExist) return Promise.reject("Email already exists");

      return true;
    }),
  body("password")
    .notEmpty()
    .withMessage("password is required")
    .isLength({ min: 8 })
    .withMessage("password must be at least 8 characters"),
  body("bio").optional(),
  body("profileImage").optional(),
  checkExact(),
  validatorMiddleware,
];

exports.loginValidator = [
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Email must be a valid Email address"),
  body("password").notEmpty().withMessage("password is required"),
  checkExact(),
  validatorMiddleware,
];

exports.forgetPasswordValidator = [
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Email must be a valid email address"),
  checkExact(),
  validatorMiddleware,
];

exports.confirmOTPValidator = [
  body("resetCode")
    .notEmpty()
    .withMessage("reset code is required")
    .isLength({ max: 6, min: 6 })
    .withMessage("reset code must be 6 numbers"),
  checkExact(),
  validatorMiddleware,
];

exports.resetPasswordValidator = [
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Email must be valid"),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8 })
    .withMessage("Too Short Password"),
  body("passwordConfirm")
    .notEmpty()
    .withMessage("confirm password is required")
    .custom((input, { req }) => {
      return req.body.password === input;
    }),
  checkExact(),
  validatorMiddleware,
];
