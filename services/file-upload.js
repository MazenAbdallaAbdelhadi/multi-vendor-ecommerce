const multer = require("multer");
const errors = require("../utils/response/errors");

const storage = multer.memoryStorage();

const filter = function (req, file, cb) {
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      errors.validationError({
        message: "Invalid file type. Only JPEG, JPG and PNG files are allowed.",
      }),
      false
    );
  }
};

const upload = multer({ storage: storage, fileFilter: filter });

exports.uploadSingle = (fieldname) => upload.single(fieldname);

exports.uploadMix = (arrayOfFields) => upload.fields(arrayOfFields);
