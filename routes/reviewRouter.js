const express = require("express");
const {
  getAllReviews,
  createReview,
} = require("../controllers/reviewController");
const { protect, restrictTo } = require("../controllers/authController");

const router = express.Router({ mergeParams: true }); // Preserves params from parent router

// before creating review user needs to be authenticated and
// this action is only limited to users.
router
  .route("/")
  .get(getAllReviews)
  .post(protect, restrictTo("user"), createReview);

module.exports = router;
