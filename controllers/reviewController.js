const catchAsync = require("../utils/catchAsync");
const Review = require("../models/reviewModel");

exports.getAllReviews = catchAsync(async (req, res) => {
  let filter = {};
  if (req.params.tourId) filter = { tour: req.params.tourId };
  const reviews = await Review.find(filter);

  res.status(200).json({
    status: "success",
    results: reviews.length,
    data: { reviews },
  });
});

exports.createReview = catchAsync(async (req, res) => {
  // Allow nested routes
  // Adding manually a review when user is not specified is absurd / but for dev
  // if (!req.body.tour) req.body.tour = req.params.tourId;
  // if (!req.body.user) req.body.user = req.user._id; // protect middleware adds user to req

  const newReview = await Review.create({
    ...req.body,
    tour: req.params.tourId,
    user: req.user._id,
  });

  res.status(201).json({
    status: "success",
    data: { newReview },
  });
});
