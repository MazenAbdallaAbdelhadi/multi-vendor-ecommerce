const asyncHandler = require("express-async-handler");
const sharp = require("sharp");
const { v4: uuidV4 } = require("uuid");
const User = require("../models/user.model");
const {
  createOne,
  getOne,
  paginate,
  updateOne,
  deleteOne,
} = require("../services/factory-handler");
const { uploadSingle } = require("../services/file-upload");
const UserToken = require("../models/user-token.model");
const {
  generateAccessToken,
  setRefreshTokenCookie,
  generateRefreshToken,
} = require("../services/auth");

exports.uploadProfileImage = uploadSingle("profileImage");

exports.resizeProfileImage = asyncHandler(async (req, res, next) => {
  if (req.file) {
    const filename = `user-${uuidV4()}-${Date.now()}.jpeg`;
    await sharp(req.file.buffer)
      .resize(600, 600)
      .toFormat("jpeg")
      .jpeg({ quality: 95 })
      .toFile(`uploads/users/${filename}`);

    // save img to db
    req.body.profileImage = filename;
  }
  next();
});

/**
 * @desc create a new user
 * @path POST /v1/users
 * @access private ADMIN
 */
exports.createUser = createOne(User);

/**
 * @desc get users
 * @path GET /v1/users
 * @access private ADMIN
 */
exports.getUsers = paginate(User, ["name", "email"]);

/**
 * @desc get user by id
 * @path GET /v1/users/:id
 * @access private ADMIN
 */
exports.getUser = getOne(User);

/**
 * @desc update user by id
 * @path PUT /v1/users/:id
 * @access private ADMIN
 */
exports.updateUser = updateOne(User);

/**
 * @desc update user password by id
 * @path PUT /v1/users/:id/changePassword
 * @access private ADMIN
 */
exports.updateUserPassword = asyncHandler(async (req, res) => {
  // 1- get user from req object
  const user = await User.findById(req.params.id);

  // 2- update user password and save it to database
  user.password = req.body.newPassword;
  user.passwordChangedAt = Date.now();
  await user.save();

  // 3- delete all user tokens
  await UserToken.deleteMany({ user: user._id });

  // 6- send access token to user
  res.success({ message: "user password updated" });
});

/**
 * @desc delete user by id
 * @path DELETE /v1/users/:id
 * @access private ADMIN
 */
exports.deleteUser = deleteOne(User);

/**
 * @desc get logged user profile
 * @path GET /v1/users/getMe
 * @access protected
 */
exports.getLoggedUser = asyncHandler(async (req, res, next) => {
  req.params.id = req.user._id;
  next();
});

/**
 * @desc update logged user profile
 * @path GET /v1/users/updateMe
 * @access protected
 */
exports.updateLoggedUser = asyncHandler(async (req, res, next) => {
  req.params.id = req.user._id;
  next();
});

/**
 * @desc update logged user password
 * @path GET /v1/users/updateMyPassword
 * @access protected
 */
exports.updateLoggedUserPassword = asyncHandler(async (req, res) => {
  // 1- get user from req object
  const { user } = req;

  // 2- update user password and save it to database
  user.password = req.body.newPassword;
  user.passwordChangedAt = Date.now();
  await user.save();

  // 3- delete all user tokens
  await UserToken.deleteMany({ user: user._id });

  // 4- generate new access and refresh token for user
  const accessToken = generateAccessToken({ userId: user._id });
  const refreshToken = generateRefreshToken({ userId: user._id });

  await UserToken.create({ user: user._id, token: refreshToken });

  // 5- set refresh token in header
  setRefreshTokenCookie(res, refreshToken);

  // 6- send access token to user
  res.success({ data: { token: accessToken } });
});

/**
 * @desc delete logged user profile
 * @path GET /v1/users/deleteMe
 * @access protected
 */
exports.deleteLoggedUser = asyncHandler(async (req, res, next) => {
  req.params.id = req.user._id;
  next();
});
