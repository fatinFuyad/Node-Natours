const fs = require("fs");
const express = require("express");
const app = express();
app.use(express.json());
// The express.json() function is a built-in middleware in Express that is used for parsing incoming requests with JSON payload and making that data available in the req.body or further processing within the routes. Without using express.json, Express will not automatically parse the JSON data in the request body.

// app.get("/", (request, response) => {
//   response.status(200).json({ message: "Hello from the server~!", app: "application server" });
//   // send() // the method sends just strings & for sending json need to use json()
// });

// app.post("/", (request, response) => {
//   response.json({ message: "You can now post to the endpoint 📩" });
// });

const tours = JSON.parse(fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`, "utf-8"));
app.get("/api/v1/tours", (request, response) => {
  response.status(200).json({
    status: "success",
    results: tours.length,
    data: { tours: tours },
  });
});

app.get("/api/v1/tours/:id", (request, response) => {
  console.log(request.params);
  // // if a property has value of undefined then it's get removed in json

  const id = +request.params.id;
  const tour = tours.find((el) => el.id === id);

  // if (id > tours.length) {
  if (!tour) {
    return response.status(404).json({ status: "failed", messsage: "Invaild ID" });
  }

  response.status(200).json({ status: "success", data: { tour } });

  // response.status(200).json({
  //   status: "success",
  //   results: tours.length,
  //   data: { tours: tours },
  // });
});

app.post("/api/v1/tours", (request, response) => {
  // console.log(request.body);
  // response.send("Post action has been completed!");

  const newTourId = tours[tours.length - 1].id + 1;
  const newTour = Object.assign({ id: newTourId }, request.body);
  tours.push(newTour);
  console.log(newTour);

  fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json`, JSON.stringify(tours), (error) => {
    response.status(200).json({ status: "success", data: newTour });
  });
});

app.patch("/api/v1/tours/:id", (request, response) => {
  const id = parseInt(request.params.id);
  if (id > tours.length) {
    return response.status(404).json({ status: "failed", message: "Invaid ID" });
  }
  const updates = request.body;
  // if properties of object in an array is changed or value is reassigned then it will also updated in the array
  const tour = tours.find((el) => el.id === id);

  for (let key in updates) {
    if (!tour[key]) return;
    tour[key] = updates[key];
  }

  fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json`, JSON.stringify(tours), (error) => {
    response.status(200).json({ status: "success", data: { tour: tour } });
  });
});

app.delete("/api/v1/tours/:id", (request, response) => {
  const id = parseInt(request.params.id);
  if (id > tours.length) {
    return response.status(404).json({ status: "failed", message: "Invaid ID" });
  }

  const updatedTours = tours.filter((el) => el.id !== id);
  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(updatedTours),
    (error) => {
      response.status(204).json({ status: "success", data: null }); // delete: status is 204
    }
  );
});

const port = 8000;
app.listen(port, () => {
  console.log(`App is running on port:${port} 0__0`);
});
