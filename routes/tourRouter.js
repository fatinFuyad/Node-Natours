const express = require("express");

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

const router = express.Router();
// router.param("id", checkId); // checkId is a middleware that checks if the id is valid

router.route("/tours-stats").get(getToursStats);
router.route("/toursPlan/:year").get(getToursPlan);
router.route("/top-5-tours").get(aliasTopTours, getAllTours); // alias routing
router.route("/").get(getAllTours).post(createTour);
router.route("/:id").get(getTour).patch(updateTour).delete(deleteTour);

module.exports = router;
