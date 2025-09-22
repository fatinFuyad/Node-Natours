const User = require("../models/usersModel");
const catchAsync = require("../utils/catchAsync");

exports.getAllUsers = catchAsync(async (req, res) => {
  const users = await User.find();
  res.status(200).json({
    status: "success",
    results: users.length,
    data: { users },
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
