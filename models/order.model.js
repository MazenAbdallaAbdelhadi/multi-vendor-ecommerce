const mongoose = require("mongoose");
const paymentMethods = require("../config/payment-methods");
const { enumFormObject } = require("../utils/helper/enum-from-object");

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    cartItems: [
      {
        product: {
          type: mongoose.Types.ObjectId,
          ref: "Product",
        },
        quantity: Number,
        price: Number,
      },
    ],
    taxPrice: {
      type: Number,
      default: 0,
    },
    shippingPrice: {
      type: Number,
      default: 0,
    },
    shippingAddress: {
      details: String,
      phone: String,
      city: String,
      postalCode: String,
    },
    totalOrderPrice: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: Number,
      enum: enumFormObject(paymentMethods),
      default: paymentMethods["COD"],
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    payedAt: Date,
    isDelivered: {
      type: Boolean,
      default: false,
    },
    deliveredAt: Date,
  },
  {
    timestamps: true,
  }
);

orderSchema.pre(/^find/, function (next) {
  this.populate({
    path: "user",
    select: "name profileImg email",
  }).populate({
    path: "cartItems.product",
    select: "title imageCover store",
  });

  next();
});

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;
