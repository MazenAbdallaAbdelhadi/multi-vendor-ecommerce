const mongoose = require("mongoose");

mongoose.connect(process.env.DB_URI);

mongoose.connection.on("open", function () {
  console.log(`[DATABASE] connection established`);
});

mongoose.connection.on("error", function (err) {
  console.error(`[DATABASE] connection error `, err);
  process.exit(1);
});

module.exports = mongoose;
