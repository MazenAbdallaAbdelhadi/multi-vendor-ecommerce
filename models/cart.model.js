const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema(
  {
    cartItems: [
      {
        product: {
          type: mongoose.Schema.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          default: 1,
        },
        price: {
          type: Number,
          required: true,
        },
      },
    ],
    totalCartPrice: Number,
    totalPriceAfterDiscount: Number,
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    couponInfo: {
      discountType: {
        type: String,
        required: [true, "Discount type is required"],
        enum: ["percentage", "fixedAmount"], // Allowed discount types
      },
      discountValue: {
        type: Number,
        required: [true, "Discount value is required"],
        min: 0, // Minimum discount value (can be 0 for free shipping)
      },
      maxDiscountValue: { type: Number, min: 5 },
    }
  },
  { timestamps: true }
);

// calc total cart price before saving
cartSchema.pre("save", function (next) {
  this.totalCartPrice = this.cartItems.reduce(
    (acc, item) => acc + item.quantity * item.price,
    0
  );
  next();
});

const Cart = mongoose.model("Cart", cartSchema);
module.exports = Cart;
