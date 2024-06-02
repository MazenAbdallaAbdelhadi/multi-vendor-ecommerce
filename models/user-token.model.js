const mongoose = require("mongoose");

const userTokenSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    token: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    expires: "30d",
  }
);

const UserToken = mongoose.model("UserToken", userTokenSchema);

module.exports = UserToken;
