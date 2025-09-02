const Tour = require("../models/toursModel");
const APIFeatures = require("../utils/apiFeatures");

exports.aliasTopTours = function (request, response, next) {
  request.query.limit = "5";
  request.query.sort = "-ratingsAverage,price";
  request.query.fields = "name,price,ratingsAverage,duration,summary";
  next();
};

exports.getAllTours = async (request, response) => {
  try {
    // Tour.find() will create query object onto that we can call methods
    const queryFeature = new APIFeatures(Tour.find(), request.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const tours = await queryFeature.query;
    response.status(200).json({
      status: "success",
      results: tours.length,
      data: { tours },
    });
  } catch (error) {
    response.status(404).json({
      status: "fail",
      message: error,
    });
  }
};

exports.getTour = async (request, response) => {
  try {
    const tour = await Tour.findById(request.params.id);
    // Tour.findOne({filterObject})
    response.status(200).json({
      status: "success",
      requestedAt: request.requestTime,
      data: { tour },
    });
  } catch (error) {
    response.status(400).json({
      status: "fail",
      message: error,
    });
  }
};

// const newTour  = new Tour({})
// this is instance object process where new object will have save method for creating data
// <modelName>.create() method is used for creating tour object directly from model schema
exports.createTour = async (request, response) => {
  try {
    const newTour = await Tour.create(request.body); // it will return a promise

    response.status(200).json({
      status: "success",
      data: newTour,
    });
  } catch (error) {
    response.status(400).json({
      status: "fail",
      message: error + "💥💥",
    });
  }
};

exports.updateTour = async (request, response) => {
  try {
    const tour = await Tour.findByIdAndUpdate(request.params.id, request.body, {
      new: true,
      runValidators: true, // this validators run from schema while updating
    });
    response.status(200).json({
      status: "success",
      data: { tour },
    });
  } catch (error) {
    response.status(400).json({
      status: "fail",
      message: error + "💥💥",
    });
  }
};

// delete: status is 204 and not to send any data to the client if delete operation
exports.deleteTour = async (request, response) => {
  try {
    await Tour.findByIdAndDelete(request.params.id);
    response.status(204).json({
      status: "success",
      data: null,
    });
  } catch (error) {
    response.status(400).json({
      status: "fail",
      message: error + "💥💥",
    });
  }
};

// Adding Aggregation Pipeline
exports.getToursStats = async function (request, response) {
  try {
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

    response.status(200).json({
      status: "success",
      data: { stats },
    });
  } catch (error) {
    response.status(400).json({
      status: "fail",
      message: error + "💥💥",
    });
  }
};

exports.getToursPlan = async function (request, response) {
  try {
    const { year } = request.params; // 2021;

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
      { $sort: { numTours: -1 } },
      // { $limit: 6 },
    ]);

    response.status(200).json({
      status: "success",
      data: { tours },
    });
  } catch (error) {
    response.status(400).json({
      status: "fail",
      message: error + "💥💥",
    });
  }
};
