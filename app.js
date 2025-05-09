const fs = require("fs");
const express = require("express");
const morgan = require("morgan");

const tourRouter = require("./routes/tourRouter");
const userRouter = require("./routes/userRouter");

// 1) MIDDLEWARES
const app = express();
app.use(morgan("dev"));
app.use(express.json());

// app.use((request, response, next) => {
//   console.log("Hello from the Middleware!🗃️");
//   next();
// });

app.use((request, response, next) => {
  request.requestTime = new Date().toISOString();
  next();
});

app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/users", userRouter);

module.exports = app;
