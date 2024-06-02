require("dotenv/config");
const app = require("./app");

// CONNECT TO DATABASE
require("./config/database");

// START SERVER
const PORT = process.env.PORT || 8000;
const server = app.listen(PORT, () => {
  console.log(`[SERVER] listening on ${PORT}`);
});

// HANDLE UNCAUGHT EXEPTION
process.on("uncaughtException", function (err, origin) {
  console.error(`[ERROR] error: ${err}`, origin);
  server.close(() => {
    console.log(`[SERVER] closing server`);
    process.exit(1);
  });
});

// HANDLE UNHANDLED REJECTIONS
process.on("unhandledRejection", function (reason, promise) {
  console.error(`[ERROR] reason: `, reason, " at promise: ", promise);
  server.close(() => {
    console.log(`[SERVER] closing server`);
    process.exit(1);
  });
});
