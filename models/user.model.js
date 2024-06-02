const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const roles = require("../config/roles");
const { enumFormObject } = require("../utils/helper/enum-from-object");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    profileImage: String,
    bio: String,
    password: String,
    passwordChangedAt: Date,
    passwordResetSecret: String,
    passwordResetExpires: Date,
    passwordResetVerified: Boolean,
    role: {
      type: Number,
      enum: enumFormObject(roles),
      default: roles.CUSTOMER,
    },
    // child reference (one to many)
    wishlist: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "Product",
      },
    ],
    addresses: [
      {
        id: { type: mongoose.Schema.ObjectId },
        alias: String,
        details: String,
        phone: String,
        city: String,
        postalCode: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

const setImageURL = (doc) => {
  if (doc.profileImage) {
    const imageUrl = `${process.env.BASE_URL}/users/${doc.profileImage}`;
    doc.profileImage = imageUrl;
  }
};

userSchema.post("init", function (doc) {
  setImageURL(doc);
});

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 12);
  }
  next();
});

userSchema.methods.verifyPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

const User = mongoose.model("User", userSchema);

module.exports = User;
