const express = require("express");
const morgan = require("morgan");

const tourRouter = require("./routes/tourRouter");
const userRouter = require("./routes/userRouter");

// 1) MIDDLEWARES
const app = express();

// console.log(process.env.NODE_ENV);
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use(express.json());
app.use(express.static(`${__dirname}/public`));
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
app.all("*", (req, res) => {
  res.status(404).json({
    status: "fail",
    message: `Can't find requested url: ${req.originalUrl} 💥`,
  });
});

module.exports = app;

/**
 * The req.query property is no longer a writable property and is instead a getter.
 * The default query parser has been changed from “extended” to “simple”.
 * app.set('query parser',"extended")
 * For aliasRouting modify the req.url and that will be reflected on the req.query
 */
