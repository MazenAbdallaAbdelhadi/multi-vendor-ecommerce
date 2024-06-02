const asyncHandler = require("express-async-handler");
const errors = require("../utils/response/errors");
const ApiFeatures = require("./api-features");

exports.createOne = (Model) =>
  asyncHandler(async (req, res) => {
    const document = await Model.create(req.body);
    res.success({ data: document });
  });

exports.getOne = (Model) =>
  asyncHandler(async (req, res, next) => {
    const document = await Model.findById(req.params.id);

    if (!document) return next(errors.recordNotFound());

    res.success({ data: document });
  });

exports.getAll = (Model) =>
  asyncHandler(async (req, res) => {
    const documents = await Model.find();
    res.success(documents);
  });

exports.paginate = (Model, searchFields) =>
  asyncHandler(async (req, res) => {
    const { mongooseQuery: countQuery } = new ApiFeatures(
      Model.find({}),
      req.query
    )
      .filter()
      .search(...searchFields);

    const countDocs = await countQuery.countDocuments();

    const { mongooseQuery, paginationResult } = new ApiFeatures(
      Model.find({}),
      req.query
    )
      .filter()
      .search(...searchFields)
      .limitFields()
      .sort()
      .paginate(countDocs);

    const docs = await mongooseQuery;

    res.success({
      data: {
        results: docs.length,
        paginationResult,
        docs,
      },
    });
  });

exports.updateOne = (Model) =>
  asyncHandler(async (req, res, next) => {
    const document = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!document) return next(errors.recordNotFound());

    res.success({ data: document });
  });

exports.deleteOne = (Model) =>
  asyncHandler(async (req, res, next) => {
    const document = await Model.findByIdAndDelete(req.params.id);

    if (!document) return next(errors.recordNotFound());

    res.success();
  });
