const Tour = require("../models/toursModel");
const AppError = require("../utils/appError");
// const APIFeatures = require("../utils/apiFeatures");
// const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const factory = require("./handlerFactory");

exports.aliasTopTours = function (req, res, next) {
  req.query.limit = "5";
  req.query.sort = "-ratingsAverage,price";
  req.query.fields = "name,price,ratingsAverage,duration,summary";
  next();
};

exports.getAllTours = factory.getAll(Tour);
exports.getTour = factory.getOne(Tour, { path: "reviews" });

// const newTour  = new Tour({})
// this is instance object process where new object will have save method for creating data
// <modelName>.create() method is used for creating tour object directly from model schema
exports.createTour = factory.createOne(Tour);
exports.updateTour = factory.updateOne(Tour);

// delete: status is 204 and not to send any data to the client if delete operation
exports.deleteTour = factory.deleteOne(Tour);

exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(",");

  if (!lat || !lng) {
    next(
      new AppError(
        "Please provide latitude and longitude in the format lat,lng.",
        400
      )
    );
  }

  const radius = unit === "mi" ? distance / 3963.2 : distance / 6378.1;
  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });

  res.status(200).json({
    status: "success",
    results: tours.length,
    data: {
      tours,
    },
  });
});

exports.getTourDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(",");

  if (!lat || !lng) {
    next(
      new AppError(
        "Please provide latitude and longitude in the format lat,lng.",
        400
      )
    );
  }

  const multiplier = unit === "mi" ? 0.00062 : 0.001;
  const toursWithinDistance = await Tour.aggregate([
    {
      $geoNear: {
        // it requires a field containing geoSpatial index for calculations
        near: {
          type: "Point",
          coordinates: [lng * 1, lat * 1],
        },
        distanceField: "distance",
        distanceMultiplier: multiplier,
      },
    },
    {
      $project: {
        name: 1,
        ratingsAverage: 1,
        price: 1,
        distance: 1,
      },
    },
  ]);

  res.status(200).json({
    status: "success",
    results: toursWithinDistance.length,
    data: {
      tours: toursWithinDistance,
    },
  });
});

// Adding Aggregation Pipeline
exports.getToursStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    { $match: { ratingsAverage: { $gte: 4.5 } } },
    {
      $group: {
        // _id: null,
        _id: { $toUpper: "$difficulty" },
        numTours: { $sum: 1 },
        numRatings: { $sum: "$ratingsQuantity" },
        avgRatings: { $avg: "$ratingsAverage" },
        avgPrice: { $avg: "$price" },
        minPrice: { $min: "$price" },
        maxPrice: { $max: "$price" },
      },
    },
    {
      $addFields: {
        avgRatings: {
          $round: ["$avgRatings", 2],
        },
        avgPrice: {
          $trunc: "$avgPrice",
        },
      },
    },
    {
      $sort: {
        _id: 1,
        // avgPrice: 1,
      },
    },
  ]);
  // {
  //   $match: {
  //     _id: { $ne: "DIFFICULT" },
  //   },
  // },

  res.status(200).json({
    status: "success",
    data: { stats },
  });
});

// to find the busiest month where much more tours are booked
exports.getToursPlan = catchAsync(async (req, res, next) => {
  const { year } = req.params; // 2021;

  const tours = await Tour.aggregate([
    { $unwind: "$startDates" },
    {
      $match: {
        // we are matching from jan 1 to dec 31 of the same year
        // $gte or $lte expects actual date string
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: "$startDates" }, // $month expects a date string not date object
        numTours: { $sum: 1 }, // sums by 1 as docs go through the pipeline
        tours: { $push: "$name" }, // making an arr[] of name fields
      },
    },
    {
      $addFields: {
        month: "$_id",
      },
    },
    {
      $project: {
        _id: 0,
        // eliminates _id field when set to 0.
        // if the field is set to 1, all other fields will be removed except this one
      },
    },
    { $sort: { numTours: -1, month: 1 } },
    // { $limit: 6 },
  ]);

  res.status(200).json({
    status: "success",
    data: { tours },
  });
});
