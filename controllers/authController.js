// eslint-disable-next-line
const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const User = require("../models/usersModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

const signToken = function (id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  // ⚠️⚠️ prevent users playing admin role
  // const newUser = await User.create(req.body);
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
  });
  const token = signToken(newUser._id);
  res.status(201).json({
    status: "success",
    token,
    data: {
      newUser,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  // 1) check if email & password exist
  if (!email || !password) {
    return next(new AppError("Please provide your email and password!", 400));
  }

  // 2) check if user exists & password is correct
  // once password is encrypted it can't be converted to original form
  // so to compare, first encrypt the sent password then compare both encrypted password

  const user = await User.findOne({ email }).select("+password"); // manual select
  // const correct = user && (await user.correctPassword(password, user.password));

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Invalid email or password", 401)); // unauthorized
    // not explicitly mention whether the email or password is incorrect as potential attacker will know then which was correct email or password
  }

  // 3) if everything is ok, send the token to the client
  const token = signToken(user._id);
  res.status(200).json({
    status: "success",
    token,
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  // 1) getting token and check if it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  // console.log(token);

  if (!token) {
    return next(
      new AppError("You're not logged in! Please log in to get access.", 401)
    );
  }
  // 2) verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  // console.log(decoded);
  // 3) check if user still exists
  // after login, user might change password and then the token also needs to be changed
  // otherwise if someone gets the jwt token he can have access.
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError("The user belonging to the token does no longer exist", 401)
    );
  }

  // 4) check if user changed password after token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError("User recently changed password! Please log in again.", 401)
    );
  }

  // 🆗grant access to the protected routes
  req.user = currentUser;
  next();
});
