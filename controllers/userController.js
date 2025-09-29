const User = require("../models/usersModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

const filteredObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) {
      newObj[el] = obj[el];
    }
  });
  return newObj;
};

exports.getAllUsers = catchAsync(async (req, res) => {
  const users = await User.find();
  res.status(200).json({
    status: "success",
    results: users.length,
    data: { users },
  });
});

exports.updateMe = catchAsync(async (req, res, next) => {
  // 1) Create error if user POSTs password
  if (req.body.password || req.body.passwordConfirm)
    return next(
      new AppError(
        "This route is not for password updates. Please go to /updateMyPassword",
        400
      )
    );

  // 2) Update user document
  // all validators run by default, only on .create() and .save()
  // only the validators related to the fields we pass to .findByIdAndUpdate run, and only when we specify runValidators: true
  //⚠️ Don't allow all fields coming from req.body as anyone can modify role to admin or any other fields

  // Filter out unwanted field names that are not allowed to be updated
  const filteredBody = filteredObj(req.body, "name", "email");
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true, // for returning updated user
    runValidators: true,
  });
  res.status(200).json({
    status: "success",
    data: {
      user: updatedUser,
    },
  });
});

exports.deleteMe = catchAsync(async (req, res) => {
  // The General Data Protection Regulation (GDPR) aims to enhance individuals' control over their personal data and unify data protection laws.
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: "success",
    data: null,
  });
});

exports.getUser = (req, res) => {
  res.status(500).json({
    status: "Internal Server Error!💥💥",
    message: "This route has not been defined yet",
  });
};

exports.createUser = (req, res) => {
  res.status(500).json({
    status: "Internal Server Error!💥💥",
    message: "This route has not been defined yet",
  });
};

exports.updateUser = (req, res) => {
  res.status(500).json({
    status: "Internal Server Error!💥💥",
    message: "This route has not been defined yet",
  });
};

exports.deleteUser = (req, res) => {
  res.status(500).json({
    status: "Internal Server Error!💥💥",
    message: "This route has not been defined yet",
  });
};
