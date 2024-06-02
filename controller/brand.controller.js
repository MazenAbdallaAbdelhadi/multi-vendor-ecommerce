const asyncHandler = require("express-async-handler");
const sharp = require("sharp");
const { v4: uuidV4 } = require("uuid");
const Brand = require("../models/brand.model");
const {
  createOne,
  getOne,
  paginate,
  updateOne,
  deleteOne,
} = require("../services/factory-handler");
const { uploadSingle } = require("../services/file-upload");

exports.uploadBrandImage = uploadSingle("image");

exports.resizeBrandImage = asyncHandler(async (req, res, next) => {
  if (req.file) {
    const filename = `Brand-${uuidV4()}-${Date.now()}.jpeg`;
    await sharp(req.file.buffer)
      .resize(600, 600)
      .toFormat("jpeg")
      .jpeg({ quality: 95 })
      .toFile(`uploads/brand/${filename}`);

    // save img to db
    req.body.image = filename;
  }
  next();
});

/**
 * @desc get brands
 * @path GET /v1/brands
 * @access public
 */
exports.getbrands = paginate(Brand, ["name"]);

/**
 * @desc get Brand by id
 * @path GET /v1/brands/:id
 * @access public
 */
exports.getBrand = getOne(Brand);

/**
 * @desc create new Brand
 * @path POST /v1/brands
 * @access private [admin]
 */
exports.createBrand = createOne(Brand);

/**
 * @desc update Brand by id
 * @path PUT /v1/brands/:id
 * @access private [admin]
 */
exports.updateBrand = updateOne(Brand);

/**
 * @desc delete Brand by id
 * @path DELETE /v1/brands/:id
 * @access private [admin]
 */
exports.deleteBrand = deleteOne(Brand);
