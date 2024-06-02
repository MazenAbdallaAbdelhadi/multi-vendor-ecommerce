const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const {
  generateAccessToken,
  generateRefreshToken,
  setRefreshTokenCookie,
  generateOTP,
  encodeOTP,
} = require("../services/auth");
const UserToken = require("../models/user-token.model");
const {
  unAuthorized,
  failure,
  badRequest,
  recordNotFound,
} = require("../utils/response/errors");
const sendEmail = require("../services/email");

/**
 * @desc register new user
 * @path POST api/v1/auth/register
 * @access public
 */
exports.register = asyncHandler(async (req, res) => {
  // 1- create a new user
  const user = await User.create(req.body);

  // 2- create access and refresh tokens for new user
  const accessToken = generateAccessToken({ userId: user._id });
  const refreshToken = generateRefreshToken({ userId: user._id });

  // 3- save refrehs token in database
  await UserToken.create({ user: user._id, token: refreshToken });

  // 4- set refresh token as httpOnly cookie
  setRefreshTokenCookie(res, refreshToken);

  // 5- send access token to user
  res.success({ data: { token: accessToken } });
});

/**
 * @desc login user
 * @path POST api/v1/auth/login
 * @access public
 */
exports.login = asyncHandler(async (req, res, next) => {
  // 1- check if user's email exists and password is correct
  const user = await User.findOne({ email: req.body.email });

  if (!user || !(await user.verifyPassword(req.body.password))) {
    return next(unAuthorized({ message: "incorrect email or password" }));
  }

  // 2- generate new access and refresh tokens for the user
  const accessToken = generateAccessToken({ userId: user._id });
  const refreshToken = generateRefreshToken({ userId: user._id });

  // 3- save refrehs token in database
  await UserToken.create({ user: user._id, token: refreshToken });

  // 4- set refresh token as httpOnly cookie
  setRefreshTokenCookie(res, refreshToken);

  // 5- send access token to user
  res.success({ data: { token: accessToken } });
});

/**
 * @desc get new access token usnig refresh token
 * @path GET api/v1/auth/refresh
 * @access public
 */
exports.refresh = asyncHandler(async (req, res, next) => {
  // 1- get refresh token from cookie
  const jwtToken = req.cookies["jwt"];

  // 2- check if refresh token is valid
  let decoded;
  try {
    decoded = jwt.verify(jwtToken, process.env.REFRESH_TOKEN_SECRET, {
      algorithms: ["HS256"],
    });
  } catch (error) {
    return next(unAuthorized({ message: error.message }));
  }

  // 3- check if token exists
  const tokenExists = await UserToken.findOne({
    token: jwtToken,
    user: decoded.userId,
  });

  if (!tokenExists) {
    return next(unAuthorized({ message: "token not found" }));
  }

  // 4- check if user exists
  const userExists = await User.findById(decoded.userId);

  if (!userExists) {
    return next(unAuthorized({ message: "user not found" }));
  }

  // 5- generate new access and refresh tokens for the user
  const accessToken = generateAccessToken({ userId: decoded.userId });
  const refreshToken = generateRefreshToken({ userId: decoded.userId });

  // 6- save refrehs token in database and delete old one
  await tokenExists.deleteOne();
  await UserToken.create({ user: decoded.userId, token: refreshToken });

  // 7- set refresh token as httpOnly cookie
  setRefreshTokenCookie(res, refreshToken);

  // 8- send access token to user
  res.success({ data: { token: accessToken } });
});

/**
 * @desc logout user
 * @path DELETE api/v1/auth/logout
 * @access public
 */
exports.logout = asyncHandler(async (req, res, next) => {
  // 1- get refresh token from cookie
  const jwtToken = req.cookies["jwt"];

  // 2- check if token exists
  if (!jwtToken) {
    return next(failure({ message: "Token not found" }));
  }

  // 3- check if token exists
  const decoded = jwt.decode(jwtToken);
  const tokenExist = await UserToken.findOne({
    token: jwtToken,
    user: decoded.userId,
  });

  if (!tokenExist) {
    return next(badRequest({ message: "Token not found" }));
  }

  // 4- check if user exists
  const userExists = await User.findById(decoded.userId);

  if (!userExists) {
    return next(badRequest({ message: "User not found" }));
  }

  // 5- clear the token from cookies
  res.clearCookie("jwt", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });

  res.success();
});

/**
 * @desc forgot password
 * @path POST api/v1/auth/forgot-password
 * @access public
 */
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  // 1- check if user exists
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(recordNotFound());
  }

  // 2- generate otp and expireTime (20 min)
  const { otp: resetCode, otpHash: resetCodeHash } = generateOTP();
  const expireTime = Date.now() + 20 * 60 * 1000;

  // 3- set reset code hash in database
  user.passwordResetSecret = resetCodeHash;
  user.passwordResetExpires = expireTime;
  user.passwordResetVerified = false;

  await user.save();

  // 4- send email to user with reset code
  const mailOptions = {
    to: req.body.email,
    subject: "OTP forgot password",
    template: "/views/OTP.ejs",
    data: {
      username: user.name,
      otp: resetCode,
      expire: 20,
    },
  };
  await sendEmail(mailOptions);

  // 5- send response to user
  res.success({ message: "Check your email For ResetCode" });
});

/**
 * @desc confirm OTP
 * @path POST api/v1/auth/confirm-otp
 * @access public
 */
exports.confirmOTP = asyncHandler(async (req, res, next) => {
  // 1- creat hash for reset code
  const resetCodeHash = encodeOTP(req.body.resetCode);

  // 2- find user with hashed reset code and update reset secret to undefined and reset verified to true
  const user = await User.findOneAndUpdate(
    {
      passwordResetSecret: resetCodeHash,
      passwordResetExpires: { $gt: Date.now() },
    },
    {
      passwordResetVerified: true,
      passwordResetSecret: undefined,
    }
  );

  // 3- check if user exists
  if (!user) {
    return next(badRequest());
  }

  // 4- send response to user
  res.success();
});

/**
 * @desc reset password
 * @path POST api/v1/auth/reset-password
 * @access public
 */
exports.resetPassword = asyncHandler(async (req, res, next) => {
  // 1- find user by email
  const user = await User.findOne({ email: req.body.email });

  // 2- check if user exist
  if (!user) {
    return next(recordNotFound());
  }

  // 3- check if password reset expires
  if (user.passwordResetExpires.getTime() < Date.now()) {
    return next(badRequest({ message: "reset password expired" }));
  }

  // 4- check if reset code is verified
  if (!user.passwordResetVerified) {
    return next(badRequest({ message: "reset code is not verified" }));
  }

  // 5- reset user password
  user.password = req.body.password;
  user.passwordChangedAt = Date.now();
  user.passwordResetVerified = undefined;
  user.passwordResetExpires = undefined;

  await user.save();

  // 6- send response to user
  res.success({ message: "Password reset successfully. please login again." });
});
