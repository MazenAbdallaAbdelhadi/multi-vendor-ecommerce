const mongoose = require("mongoose");
const { enumFormObject } = require("../utils/helper/enum-from-object");
const paymentMethods = require("../config/payment-methods");

const storeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 50,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 250,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    slug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    logo: {
      type: String,
      default: "default_store_logo.png",
    },
    banner: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    balance: {
      type: Number,
      default: 0.0,
      min: 0.0,
    },
    commissionRate: {
      type: Number,
      default: 0.1, // 10% commission for the platform
    },
    paymentMethods: {
      type: [Number],
      enum: enumFormObject(paymentMethods), // Add supported payment methods
      default: [paymentMethods["COD"]], // cash on delivery
    },
    shippingPolicy: {
      type: String,
      trim: true,
    },
    returnPolicy: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

// Method to add funds to the store's balance (can be used for payouts or manual adjustments)
storeSchema.methods.addFunds = function (amount) {
  this.balance += amount;
  return this.save();
};

// Method to deduct funds from the store's balance (can be used for processing payments and commissions)
storeSchema.methods.deductFunds = function (amount) {
  if (amount > this.balance) {
    throw new Error("Insufficient funds in store balance");
  }

  this.balance -= amount;
  return this.save();
};

const Store = mongoose.model("Store", storeSchema);
module.exports = Store;
