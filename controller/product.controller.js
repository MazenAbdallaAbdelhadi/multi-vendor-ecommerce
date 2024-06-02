const asyncHandler = require("express-async-handler");
const sharp = require("sharp");
const { v4: uuidV4 } = require("uuid");
const Product = require("../models/product.model");
const {
  createOne,
  getOne,
  paginate,
  updateOne,
  deleteOne,
} = require("../services/factory-handler");
const { uploadMix } = require("../services/file-upload");

exports.uploadProductImages = uploadMix([
  {
    name: "coverImage",
    maxCount: 1,
  },
  {
    name: "images",
    maxCount: 5,
  },
]);

exports.resizeProductImages = asyncHandler(async (req, res, next) => {
  if (req.files?.coverImage) {
    const coverImageFileName = `product-${uuidV4()}-${Date.now()}-coverImage.jpeg`;

    await sharp(req.files.coverImage[0].buffer)
      .resize(2000, 1333)
      .toFormat("jpeg")
      .jpeg({ quality: 95 })
      .toFile(`uploads/products/${coverImageFileName}`);

    // Save image into our db
    req.body.coverImage = coverImageFileName;
  }

  if (req.files?.images) {
    req.body.images = [];
    await Promise.all(
      req.files.images.map(async (img, index) => {
        const imageName = `product-${uuidV4()}-${Date.now()}-${index}.jpeg`;

        await sharp(img.buffer)
          .resize(2000, 1333)
          .toFormat("jpeg")
          .jpeg({ quality: 95 })
          .toFile(`uploads/products/${imageName}`);

        // Save image into our db
        req.body.images.push(imageName);
      })
    );
  }

  next();
});

/**
 * @desc get stores
 * @path GET /v1/product
 * @access public
 */
exports.getProducts = paginate(Product, ["name", "description"]);

/**
 * @desc get product by id
 * @path GET /v1/product/:id
 * @access public
 */
exports.getProduct = getOne(Product);

/**
 * @desc create new product
 * @path POST /v1/product
 * @access private [vendor]
 */
exports.createProduct = createOne(Product);

/**
 * @desc update product by id
 * @path PUT /v1/product/:id
 * @access private [owner]
 */
exports.updateProduct = updateOne(Product);

/**
 * @desc delete product by id
 * @path DELETE /v1/product/:id
 * @access private [admin | owner]
 */
exports.deleteProduct = deleteOne(Product);
