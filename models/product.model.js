const mongoose = require("mongoose");
const slugify = require("slugify");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 100,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0.01, // Minimum non-zero price
    },
    coverImage: {
      type: String,
      required: true,
      trim: true,
    },
    images: {
      type: [String],
      max: 5,
      trim: true, // Ensure image URLs are trimmed
    },
    salePrice: {
      type: Number,
      min: 0.01, // Minimum non-zero sale price
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    sold: {
      type: Number,
      default: 0,
    },
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    subCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubCategory",
      required: true,
    },
    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand",
    },

    isActive: {
      type: Boolean,
      default: true,
    },
    ratingsAverage: {
      type: Number,
      min: [1, "Rating must be above or equal 1.0"],
      max: [5, "Rating must be below or equal 5.0"],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true, // to enable virtual populate
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

productSchema.virtual("reviews", {
  ref: "Review",
  foreignField: "product",
  localField: "_id",
});

// Virtual property for calculating discount percentage (if applicable)
productSchema.virtual("discountPercentage").get(function () {
  if (this.salePrice && this.price) {
    return Math.round(((this.price - this.salePrice) / this.price) * 100);
  }
  return 0;
});

// Pre-save middleware to generate a unique slug based on product name
productSchema.pre("save", async function (next) {
  if (!this.isModified("slug")) {
    return next();
  }

  let existingSlug = await this.constructor.findOne({ slug: this.slug });
  let count = 0;
  while (existingSlug && existingSlug._id.toString() !== this._id.toString()) {
    this.slug = `${slugify(this.name)}-${count++}`;
    existingSlug = await this.constructor.findOne({ slug: this.slug });
  }

  next();
});

// Pre-save hook to ensure sale price is less than or equal to regular price
productSchema.pre("save", function (next) {
  if (this.salePrice && this.price && this.salePrice > this.price) {
    return next(new Error("Sale price cannot be greater than regular price"));
  }
  next();
});

// Pre-find hook to populate category name
productSchema.pre(/^find/, function (next) {
  this.populate({
    path: "category",
    select: "name",
  });
  next();
});

const setImageURL = (doc) => {
  if (doc.imageCover) {
    const imageUrl = `${process.env.BASE_URL}/products/${doc.imageCover}`;
    doc.imageCover = imageUrl;
  }
  if (doc.images) {
    const imagesList = [];
    doc.images.forEach((image) => {
      const imageUrl = `${process.env.BASE_URL}/products/${image}`;
      imagesList.push(imageUrl);
    });
    doc.images = imagesList;
  }
};

// findOne, findAll and update
productSchema.post("init", (doc) => {
  setImageURL(doc);
});

const Product = mongoose.model("Product", productSchema);
module.exports = Product;
