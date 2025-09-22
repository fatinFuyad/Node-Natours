const express = require("express");
const morgan = require("morgan");

const tourRouter = require("./routes/tourRouter");
const userRouter = require("./routes/userRouter");
const AppError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorController");

// 1) MIDDLEWARES
const app = express();

// console.log(process.env.NODE_ENV);
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use(express.json());
app.use(express.static(`${__dirname}/public`));
// app.use((req, res, next) => {
//   console.log("Hello from the Middleware!🗃️");
//   next();
// });

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.headers);
  next();
});

app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/users", userRouter);
app.all("*", (req, res, next) => {
  // res.status(404).json({
  //   status: "fail",
  //   message: `Can't find requested url: ${req.originalUrl} 💥`,
  // });

  // const err = new Error(
  //   `Can't find requested url: ${req.originalUrl} on the server 💥💥`,
  // );

  // err.statusCode = 404;
  // err.status = "fail";
  // next();

  /** when passing arg in next, epress will assume an err has occurred and pass the err
   * to the global err handling middleware,surpassing all other middlewares from the
   * stack
   */
  const message = `Can't find requested url: ${req.originalUrl} on the server 💥💥`;
  const statusCode = 404;

  next(new AppError(message, statusCode));
});

app.use(globalErrorHandler);

module.exports = app;

/**
 * The req.query property is no longer a writable property and is instead a getter.
 * The default query parser has been changed from “extended” to “simple”.
 * app.set('query parser', extended")
 * For aliasRouting modify the req.url and that will be reflected on the req.query
 * when two response is sent at the same time ⬇️
 * Error [ERR_HTTP_HEADERS_SENT]:Cannot set headers after they are sent to the client ❌
 */
