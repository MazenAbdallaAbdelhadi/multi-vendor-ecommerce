const mongoose = require("mongoose");

const brandSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      minLength: 3,
      required: true,
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    image: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const setImageURL = (doc) => {
  doc.image = `${process.env.BASE_URL}/brand/${doc.image}`;
};

brandSchema.post("init", function (doc) {
  setImageURL(doc);
});

const Brand = mongoose.model("Brand", brandSchema);

module.exports = Brand;
