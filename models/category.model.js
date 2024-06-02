const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      minLength: 3,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
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
  doc.image = `${process.env.BASE_URL}/category/${doc.image}`;
};

categorySchema.post("init", function (doc) {
  setImageURL(doc);
});

const Category = mongoose.model("Category", categorySchema);

module.exports = Category;
