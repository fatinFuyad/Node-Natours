const mongoose = require("mongoose");

// In Mongoose, a schema is used to define the structure of documents within a MongoDB collection. It specifies the fields, their data types, default values, and validation rules.
// Anything that is present in the posted request data but not in the Schema will not be included in the database collection.
const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "A tour must have a name!"],
    unique: true,
    trim: true,
  },
  duration: {
    type: Number,
    required: [true, "A tour must have a duration"],
  },
  maxGroupSize: {
    type: Number,
    required: [true, "A tour must have a group size"],
  },
  difficulty: {
    type: String,
    required: [true, "A tour must have a difficulty level"],
  },
  ratingsAverage: {
    type: Number,
    default: 4.5,
  },
  ratingsQuantity: {
    type: Number,
    default: 0,
  },
  price: {
    type: Number,
    required: [true, "A tour must have a price!"],
  },
  priceDiscount: Number,
  summary: {
    type: String,
    trim: true, // trims white space at the beginning and ending of a stirng
    required: [true, "A tour must have a summary"],
  },
  description: {
    type: String,
    trim: true,
  },
  imageCover: {
    type: String,
    required: [true, "A tour must a cover image"],
  },
  images: [String], // expexcts an [arr of image string]
  createdAt: {
    type: Date,
    default: Date.now(),
    select: false, // prevents from exposing this field / better for sensitive data
  },
  startDates: [Date],
});

// the model name and variable should be as convention in capitalize
// it's now like a class defination and it's instances will have access of some methods
const Tour = mongoose.model("Tour", tourSchema);

// testTour is an instance of the Tour schema model
// const testTour = new Tour({
//   name: "The Forest Hiker",
//   ratings: 4.7,
//   price: 697,
// });

// after saving it will send the data to the database and send a a promise
// testTour
//   .save()
//   .then((doc) => {
//     console.log(doc);
//   })
//   .catch((err) => {
//     console.log("Error 💥💥: " + err);
//   });

module.exports = Tour;
