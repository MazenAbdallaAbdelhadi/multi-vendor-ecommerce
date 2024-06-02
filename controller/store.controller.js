const asyncHandler = require("express-async-handler");
const sharp = require("sharp");
const { v4: uuidV4 } = require("uuid");
const Store = require("../models/store.model");
const {
  createOne,
  getOne,
  paginate,
  updateOne,
  deleteOne,
} = require("../services/factory-handler");
const { uploadMix } = require("../services/file-upload");

exports.uploadStoreImages = uploadMix([
  {
    name: "logo",
    maxCount: 1,
  },
  {
    name: "banner",
    maxCount: 1,
  },
]);

exports.resizeStoreImages = asyncHandler(async (req, res, next) => {
  if (req.files?.logo) {
    const logoFileName = `store-${uuidV4()}-${Date.now()}-logo.png`;

    await sharp(req.files.logo[0].buffer)
      .resize(500, 500)
      .toFormat("png")
      .png({ quality: 95 })
      .toFile(`uploads/stores/${logoFileName}`);

    // Save image into our db
    req.body.logo = logoFileName;
  }

  if (req.files?.banner) {
    const bannerFileName = `store-${uuidV4()}-${Date.now()}-banner.jpeg`;

    await sharp(req.files.banner[0].buffer)
      .resize(2000, 1333)
      .toFormat("jpeg")
      .jpeg({ quality: 95 })
      .toFile(`uploads/stores/${bannerFileName}`);

    // Save image into our db
    req.body.banner = bannerFileName;
  }

  next();
});

/**
 * @desc get stores
 * @path GET /v1/stores
 * @access public
 */
exports.getStores = paginate(Store, ["name", "description"]);

/**
 * @desc get store by id
 * @path GET /v1/stores/:id
 * @access public
 */
exports.getStore = getOne(Store);

/**
 * @desc create new store
 * @path POST /v1/stores
 * @access private [vendor]
 */
exports.createStore = createOne(Store);

/**
 * @desc update store by id
 * @path PUT /v1/store/:id
 * @access private [owner]
 */
exports.updateStore = updateOne(Store);

/**
 * @desc delete store by id
 * @path DELETE /v1/store/:id
 * @access private [admin | owner]
 */
exports.deleteStore = deleteOne(Store);
