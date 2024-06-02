const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Types.ObjectId,
    ref: "User",
    required: true,
  },
  code: {
    type: String,
    required: [true, "Coupon code is required"],
    unique: true,
    uppercase: true, // Store coupon codes in uppercase for case-insensitive validation
    trim: true,
  },
  name: {
    type: String,
    required: [true, "Coupon name is required"],
  },
  description: {
    type: String,
    trim: true,
  },
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
  minimumSpend: {
    type: Number,
    default: 0, // Minimum order amount required to use the coupon
    min: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  startDate: {
    type: Date,
    default: Date.now, // Set default start date to current time
  },
  endDate: {
    type: Date,
  },
  uses: {
    type: Number,
    default: 0,
  },
  maximumUses: {
    type: Number,
    default: null, // Allow unlimited uses by default (optional)
  },
  usersUsedBy: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "User",
  }, // Array of user IDs who have used the coupon
});

const Coupon = mongoose.model("Coupon", couponSchema);
module.exports = Coupon;
