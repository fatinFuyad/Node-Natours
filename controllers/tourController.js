const Tour = require("../models/toursModel");

exports.aliasTopTours = function (request, response, next) {
  request.query.limit = "5";
  request.query.sort = "-ratingsAverage,price";
  request.query.fields = "name,price,ratingsAverage,duration,summary";
  next();
};

exports.getAllTours = async (request, response) => {
  try {
    // 1) Filtering
    const queryObj = { ...request.query };
    const excluedFields = ["page", "limit", "sort", "fields"]; // not field
    excluedFields.forEach((el) => delete queryObj[el]); // operator 'delete' removes fields of obj

    // const tours = await Tour.find(queryObj); // returns promise
    // const tours = await Tour.find().where("duration").equals(5).where("price").gte(497);

    // 2) Advanced Filtering
    // { difficulty: 'easy', duration: { $gte: 5 } } // filtering in mongoDB
    // { difficulty: 'easy', duration: { gte: '5' } }// filter object from request

    // lt gt lte gte
    // we need to change these operators placing "$" before them. "\b" to match whole word.

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(lt|gt|lte|gte)\b/g, (match) => `$${match}`);
    // console.log(queryStr);

    // if await used, then query executes instantly. So later remains no way of including sorting or filtering or features like this. Hence after adding all of the methods we can await later.
    const query = Tour.find(JSON.parse(queryStr));

    // Sorting: negative -query will be sorted as decending order
    if (request.query.sort) {
      const sortBy = request.query.sort.split(",").join(" ");
      query.sort(sortBy);
    } else {
      query.sort("-ratingsAverage"); // making it default sort
    }

    // Limiting Fields
    if (request.query.fields) {
      const fields = request.query.fields.split(",").join(" ");
      query.select(fields); // expects string like select("name duration price")
    } else {
      query.select("-__v");
    }

    // Pagination
    const page = request.query.page * 1 || 1; // numbers in the query comes in string format
    const limit = request.query.limit * 1 || 100;
    const skip = (page - 1) * limit;

    // page=3 1-10 page1, 11-20 page2, 21-30 page3 // on page 3 we need to skip 20 results

    if (request.query.page) {
      const numTours = await Tour.countDocuments();
      if (skip >= numTours) throw new Error("This page does not exist!💥💥");
    }
    query.skip(skip).limit(limit);

    const tours = await query;
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
      runValidators: true,
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
