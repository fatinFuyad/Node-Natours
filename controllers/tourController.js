const Tour = require("../models/toursModel");
const APIFeatures = require("../utils/apiFeatures");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

exports.aliasTopTours = function (req, res, next) {
  req.query.limit = "5";
  req.query.sort = "-ratingsAverage,price";
  req.query.fields = "name,price,ratingsAverage,duration,summary";
  next();
};

exports.getAllTours = catchAsync(async (req, res) => {
  // Tour.find() will create query object onto that we can call methods
  const queryFeature = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const tours = await queryFeature.query;
  res.status(200).json({
    status: "success",
    results: tours.length,
    data: { tours },
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id).populate("reviews");

  // Tour.findOne({filterObject})
  if (!tour) {
    // it's important to return otherwise below response will be delivered
    return next(new AppError("Invalid ID or the tour is not found", 404));
  }
  res.status(200).json({
    status: "success",
    requestedAt: req.requestTime,
    data: { tour },
  });
});

// const newTour  = new Tour({})
// this is instance object process where new object will have save method for creating data
// <modelName>.create() method is used for creating tour object directly from model schema

exports.createTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.create(req.body); // it will return a promise

  if (!tour) {
    return next(new AppError("Invalid ID or the tour is not found", 404));
  }
  res.status(200).json({
    status: "success",
    data: { tour },
  });
});

exports.updateTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true, // this validators run from schema while updating
  });

  if (!tour) {
    return next(new AppError("Invalid ID or the tour is not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: { tour },
  });
});

// delete: status is 204 and not to send any data to the client if delete operation
exports.deleteTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndDelete(req.params.id); // deleted tour is returned

  if (!tour) {
    return next(new AppError("Invalid ID or the tour is not found", 404));
  }

  res.status(204).json({
    status: "success",
    data: null,
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
