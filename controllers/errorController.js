const AppError = require("../utils/appError");

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;

  return new AppError(message, 400);
};

const handleDuplicateFieldDB = (err) => {
  const value = Object.values(err.keyValue)[0];
  const message = `Duplicate field value:${value}. Please try another one!`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errmsg = Object.values(err.errors)
    .map((el, i) => `${i + 1}) ${el.message}`)
    .join(". ");

  // console.log(errmsg);
  const message = `Invalid input data. ${errmsg}`;
  return new AppError(message, 400);
};

const handleJWTError = () =>
  new AppError("Invalid token. Please login again!", 401);

const handleJWTExpiredError = () =>
  new AppError("Your token has been expired. Please log in again.", 401);

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    // Programming, unknown or unexpected error: don't leak error details to client
    // 1) log error
    console.error("Error 💥💥", err);

    //2) send generic message
    res.status(500).json({
      status: "error",
      message: "Something went very wrong~!",
    });
  }
};

module.exports = function globalErrorHandler(err, req, res, next) {
  // console.log(err.stack);
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === "production") {
    // since modifying parameter is not ideal
    let error = { ...err }; // copies properties and loses conncetion to the prototype
    error = Object.create(err); // connect to prototype;

    // console.log("err", err.name);
    // console.log("error", error.name);
    // console.log(error.status, error.statusCode, error.message);

    if (error.name === "CastError") error = handleCastErrorDB(error);

    if (error.code === 11000) error = handleDuplicateFieldDB(error);
    // we don't get error.name in error object in console.**
    // error.name === "ValidationError"

    // if (error._message === "Validation failed")
    if (error.name === "ValidationError")
      error = handleValidationErrorDB(error);
    // console.log(error.name); // undefined as it has no name property

    if (error.name === "JsonWebTokenError") error = handleJWTError();
    if (error.name === "TokenExpiredError") error = handleJWTExpiredError();
    err.writer = "ME";
    error.author = "fatinFuyad";

    sendErrorProd(error, res);
  }
};
