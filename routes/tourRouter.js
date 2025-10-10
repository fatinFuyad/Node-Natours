const express = require("express");
const reveiwRouter = require("./reviewRouter");
const {
  getAllTours,
  getTour,
  createTour,
  updateTour,
  deleteTour,
  aliasTopTours,
  getToursStats,
  getToursPlan,
} = require("../controllers/tourController");
const { protect, restrictTo } = require("../controllers/authController");

const router = express.Router(); // router is also a middleware
// router.param("id", checkId); // checkId is a middleware that checks if the id is valid

router.use("/:tourId/reviews", reveiwRouter); // merged two router for specified path

router.route("/tours-stats").get(getToursStats);
router.route("/toursPlan/:year").get(getToursPlan);
router.route("/top-5-tours").get(aliasTopTours, getAllTours); // alias routing

router.route("/").get(protect, getAllTours).post(createTour);
router
  .route("/:id")
  .get(getTour)
  .patch(updateTour)
  .delete(protect, restrictTo("admin", "lead-guide"), deleteTour);

// POST Review: /tours/234329sde2/reivews
// GET All Review: /reivews
// GET Tour Reviews: /tours/234329sde2/reivews
// router
//   .route("/:tourId/reviews")
//   .post(protect, restrictTo("user"), createReview);

module.exports = router;
