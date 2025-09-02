class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    // 1) Filtering
    const queryObj = { ...this.queryString };
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

    // if await used, then query executes instantly. So later remains no way of including sorting or filtering or features like this. Hence after adding all of the methods we can await later.
    // const query = Tour.find(JSON.parse(queryStr));
    this.query.find(JSON.parse(queryStr));
    return this;
  }

  sort() {
    // Sorting: negative -query will be sorted as decending order
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(",").join(" ");
      this.query.sort(sortBy);
    } else {
      this.query.sort("-ratingsAverage"); // making it default sort
    }

    return this;
  }

  limitFields() {
    // Limiting Fields
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(",").join(" ");
      this.query.select(fields); // expects string like select("name duration price")
    } else {
      this.query.select("-__v -description");
    }

    return this;
  }

  paginate() {
    // Pagination
    const page = this.queryString.page * 1 || 1; // numbers in the query comes in string format
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;

    // page=3 1-10 page1, 11-20 page2, 21-30 page3 // on page 3 we need to skip 20 results

    // if (this.queryString.page) {
    //   const numTours = await Tour.countDocuments();
    //   if (skip >= numTours) throw new Error("This page does not exist!💥💥");
    // }
    this.query.skip(skip).limit(limit);

    return this;
  }
}

module.exports = APIFeatures;
