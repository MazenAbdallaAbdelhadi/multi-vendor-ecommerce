const asyncHandler = require("express-async-handler");
const User = require("../models/user.model");

/**
 * @desc Add product to wishlist
 * @path POST /v1/wishlist
 * @access protected
 */
exports.addProductToWishlist = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $addToSet: {
        wishlist: req.body.productId,
      },
    },
    {
      new: true,
    }
  ).populate("wishlist");

  res.success({
    data: user.wishlist,
    message: "Product added successfully to your wishlist.",
  });
});

/**
 * @desc Remove product to wishlist
 * @path DELETE /v1/wishlist
 * @access protected
 */
exports.removeProductFromWishlist = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $pull: {
        wishlist: req.body.productId,
      },
    },
    {
      new: true,
    }
  ).populate("wishlist");

  res.success({
    data: user.wishlist,
    message: "Product removed successfully from your wishlist.",
  });
});

/**
 * @desc get logged  wishlist
 * @path GET /v1/wishlist
 * @access protected
 */
exports.getLoggedUserWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate("wishlist");

  res.success({
    data: { wishlist: user.wishlist, results: user.wishlist.length },
  });
});
