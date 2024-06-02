const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");
const Product = require("../models/product.model");
const Cart = require("../models/cart.model");
const {
  recordNotFound,
  validationError,
  badRequest,
} = require("../utils/response/errors");
const Coupon = require("../models/coupon.model");

/**
 * @desc    Add product to cart
 * @route   POST /v1/cart
 * @access  protected
 */
exports.addProductToCart = asyncHandler(async (req, res, next) => {
  const { productId } = req.body;

  if (!productId)
    return next(validationError({ message: "product id is required" }));

  const product = await Product.findById(productId);

  //   check if the product exists
  if (!product) return next(recordNotFound({ message: "Product not found" }));

  // 1) Get Cart for logged user
  let cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    // create cart fot logged user with product
    cart = await Cart.create({
      user: req.user._id,
      cartItems: [{ product: productId, price: product.price }],
    });
  } else {
    // product exist in cart, update product quantity
    const productIndex = cart.cartItems.findIndex(
      (item) => item.product.toString() === productId
    );

    if (productIndex > -1) {
      const cartItem = cart.cartItems[productIndex];
      cartItem.quantity += 1;

      cart.cartItems[productIndex] = cartItem;
    } else {
      // product not exist in cart,  push product to cartItems array
      cart.cartItems.push({ product: productId, price: product.price });
    }
  }

  await cart.save();

  res.success({
    message: "Product added to cart successfully",
    numOfCartItems: cart.cartItems.length,
    data: { cart, numOfCartItems: cart.cartItems.length },
  });
});

/**
 * @desc    Get logged user cart
 * @route   GET /v1/cart
 * @access  protected
 */
exports.getLoggedUserCart = asyncHandler(async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    return next(
      recordNotFound({
        message: `There is no cart for this user id : ${req.user._id}`,
      })
    );
  }

  res.success({
    numOfCartItems: cart.cartItems.length,
    data: {
      cart,
      numOfCartItems: cart.cartItems.length,
    },
  });
});

/**
 * @desc    Remove specific cart item
 * @route   DELETE /v1/cart/:itemId
 * @access  protected [owner]
 */
exports.removeSpecificCartItem = asyncHandler(async (req, res, next) => {
  const cart = await Cart.findOneAndUpdate(
    { user: req.user._id },
    {
      $pull: { cartItems: { _id: req.params.itemId } },
    },
    { new: true }
  );

  //   check if cart exists
  if (!cart) return next(recordNotFound({ message: "Cart not found" }));

  //   trigger save to update total price
  await cart.save();

  res.success({
    data: {
      cart,
      numOfCartItems: cart.cartItems.length,
    },
  });
});

/**
 * @desc    clear logged user cart
 * @route   DELETE /v1/cart
 * @access  protected [owner]
 */
exports.clearCart = asyncHandler(async (req, res, next) => {
  const cart = await Cart.findOneAndDelete({ user: req.user._id });

  //   check if cart exists
  if (!cart) return next(recordNotFound({ message: "Cart not found" }));

  res.success();
});

/**
 * @desc    Update specific cart item quantity
 * @route   Put /v1/cart/:itemId
 * @access  protected [owner]
 */
exports.updateCartItemQuantity = asyncHandler(async (req, res, next) => {
  const { quantity } = req.body;

  if (!quantity || isNaN(Number(quantity)))
    return next(validationError({ message: "quantity must be a number" }));

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    return next(
      recordNotFound({ message: `there is no cart for user ${req.user._id}` })
    );
  }

  const itemIndex = cart.cartItems.findIndex(
    (item) => item._id.toString() === req.params.itemId
  );
  if (itemIndex > -1) {
    const cartItem = cart.cartItems[itemIndex];
    cartItem.quantity = quantity;
    cart.cartItems[itemIndex] = cartItem;
  } else {
    return next(
      recordNotFound({
        message: `there is no item for this id :${req.params.itemId}`,
      })
    );
  }

  await cart.save();

  res.success({
    data: {
      cart,
      numOfCartItems: cart.cartItems.length,
    },
  });
});

/**
 * @desc    Apply coupon on logged user cart
 * @route   Put /v1/cart/applyCoupon
 * @access  protected [owner]
 */
exports.applyCoupon = asyncHandler(async (req, res, next) => {
  const { couponCode } = req.body;
  const userId = req.user._id; // Assuming user ID from request

  // Find the user's cart and populate product details
  const cart = await Cart.findOne({ user: userId }).populate(
    "cartItems.product"
  );

  if (!cart) {
    return next(recordNotFound({ message: "Cart not found" }));
  }

  // Validate coupon code and retrieve details
  const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() }); // Convert to uppercase for case-insensitive matching

  if (!coupon) {
    return next(recordNotFound({ message: "invalid Coupon code" }));
  }

  // Validate coupon applicability (active, minimum spend, etc.)
  if (!coupon.isActive) {
    return next(badRequest({ message: "coupon is not active" }));
  }

  if (cart.totalCartPrice < coupon.minimumSpend) {
    return next(
      badRequest({
        message: `Minimum order amount of ${coupon.minimumSpend} required to use this coupon`,
      })
    );
  }

  if (coupon.uses === coupon.maximumUses) {
    return next(badRequest({ message: "coupon max reaced max uses" }));
  }

  // Calculate discount based on coupon type and value
  let discountAmount = 0;
  if (coupon.discountType === "percentage") {
    const maxDiscountValue = coupon.maxDiscountValue || 0;
    discountAmount = Math.min(
      cart.totalCartPrice * (coupon.discountValue / 100),
      maxDiscountValue
    ); // Limit to max discount value
  } else if (coupon.discountType === "fixedAmount") {
    discountAmount = Math.min(coupon.discountValue, cart.totalCartPrice); // Limit discount to cart total
  }

  // start mongoose session
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    // Apply discount and update cart (consider transactions)
    cart.totalPriceAfterDiscount = cart.totalCartPrice - discountAmount;
    cart.couponInfo = {
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      maxDiscountValue: coupon.maxDiscountValue,
    };
    await cart.save({ session: session });

    // add user to usersUsedBy
    coupon.usersUsedBy.push(req.user._id);
    // inc uses number
    coupon.uses = coupon.uses + 1;
    await coupon.save({ session: session });

    // commit Transaction
    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    console.log("transaction error", error);
    throw error;
  } finally {
    session.endSession();
  }

  res.success({
    message: "Coupon applied successfully",
    data: {
      cart,
      numOfCartItems: cart.cartItems.length,
    },
  });
});
