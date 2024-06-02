const { Router } = require("express");
const {
  register,
  login,
  refresh,
  logout,
  forgotPassword,
  confirmOTP,
  resetPassword,
} = require("../controller/auth.controller");
const {
  uploadProfileImage,
  resizeProfileImage,
} = require("../controller/user.controller");
const {
  registerValidator,
  loginValidator,
  forgetPasswordValidator,
  confirmOTPValidator,
  resetPasswordValidator,
} = require("../utils/validator/auth.validator");

const router = Router();

router.post(
  "/register",
  uploadProfileImage,
  resizeProfileImage,
  registerValidator,
  register
);
router.post("/login", loginValidator, login);
router.get("/refresh", refresh);
router.delete("/logout", logout);
router.post("/forgot-password", forgetPasswordValidator, forgotPassword);
router.post("/confirm-otp", confirmOTPValidator, confirmOTP);
router.post("/reset-password", resetPasswordValidator, resetPassword);

module.exports = router;
