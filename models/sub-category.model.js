const mongoose = require("mongoose");
const slugify = require("slugify");

const subCategorySchema = new mongoose.Schema(
  {
    category: {
      type: mongoose.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    name: {
      type: String,
      minLength: 3,
      required: true,
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
  },
  {
    timestamps: true,
  }
);

// Pre-save middleware to generate a unique slug based on sub-category name
subCategorySchema.pre("save", async function (next) {
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

const SubCategory = mongoose.model("SubCategory", subCategorySchema);

module.exports = SubCategory;
