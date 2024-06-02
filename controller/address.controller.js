const asyncHandler = require("express-async-handler");

const User = require("../models/user.model");

/**
 * @desc    Add address to user addresses list
 * @route   POST /v1/addresses
 * @access  protected
 */
exports.addAddress = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $addToSet: { addresses: req.body },
    },
    { new: true }
  );

  res.success({
    message: "Address added successfully.",
    data: user.addresses,
  });
});

/**
 * @desc    Remove address from user addresses list
 * @route   DELETE /api/v1/addresses
 * @access  protected
 */
exports.removeAddress = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $pull: { addresses: { _id: req.body.addressId } },
    },
    { new: true }
  );

  res.success({
    message: "Address removed successfully.",
    data: user.addresses,
  });
});

/**
 * @desc    Get logged user addresses list
 * @route   GET /api/v1/addresses
 * @access  protected
 */
exports.getLoggedUserAddresses = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate("addresses");

  res.success({
    data: {
      addresses: user.addresses,
      results: user.addresses.length,
    },
  });
});
