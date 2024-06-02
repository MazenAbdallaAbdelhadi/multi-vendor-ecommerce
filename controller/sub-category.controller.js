const SubCategory = require("../models/sub-category.model");
const {
  createOne,
  getOne,
  paginate,
  updateOne,
  deleteOne,
} = require("../services/factory-handler");

/**
 * @desc get sub-categories
 * @path GET /v1/sub-category
 * @access public
 */
exports.getSubCategories = paginate(SubCategory, ["name"]);

/**
 * @desc get sub-category by id
 * @path GET /v1/sub-category/:id
 * @access public
 */
exports.getSubCategory = getOne(SubCategory);

/**
 * @desc create new sub-category
 * @path POST /v1/sub-category
 * @access private [admin]
 */
exports.createSubCategory = createOne(SubCategory);

/**
 * @desc update sub-category by id
 * @path PUT /v1/sub-category/:id
 * @access private [admin]
 */
exports.updateSubCategory = updateOne(SubCategory);

/**
 * @desc delete sub-category by id
 * @path DELETE /v1/sub-category/:id
 * @access private [admin]
 */
exports.deleteSubCategory = deleteOne(SubCategory);
