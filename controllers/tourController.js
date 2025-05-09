const fs = require("fs");

// In File System the (./) indicates the directory from where the script is running.
// and var __dirname indicates the directory where it is located
// but for importing (./) indicates the current directory location
// fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`, "utf-8")

const tours = JSON.parse(fs.readFileSync("./dev-data/data/tours-simple.json", "utf-8"));

exports.getAllTours = (request, response) => {
  response.status(200).json({
    status: "success",
    results: tours.length,
    data: { tours: tours },
  });
};

exports.getTour = (request, response) => {
  const id = +request.params.id;
  const tour = tours.find((el) => el.id === id);
  if (!tour) {
    return response.status(404).json({ status: "failed", messsage: "Invaild ID" });
  }

  response
    .status(200)
    .json({ status: "success", requestedAt: request.requestTime, data: { tour } });
};

exports.createTour = (request, response) => {
  const newTourId = tours[tours.length - 1].id + 1;
  const newTour = Object.assign({ id: newTourId }, request.body);
  tours.push(newTour);

  fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json`, JSON.stringify(tours), (error) => {
    response.status(200).json({ status: "success", data: newTour });
  });
};

exports.updateTour = (request, response) => {
  const id = parseInt(request.params.id);
  if (id > tours.length) {
    return response.status(404).json({ status: "failed", message: "Invaid ID" });
  }
  const updates = request.body;
  const tour = tours.find((el) => el.id === id);

  for (let key in updates) {
    if (!tour[key]) return;
    tour[key] = updates[key];
  }

  fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json`, JSON.stringify(tours), (error) => {
    response.status(200).json({ status: "success", data: { tour: tour } });
  });
};

exports.deleteTour = (request, response) => {
  const id = parseInt(request.params.id);
  if (id > tours.length) {
    return response.status(204).json({ status: "failed", message: "Invaid ID" });
  }

  const updatedTours = tours.filter((el) => el.id !== id);
  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(updatedTours),
    (error) => {
      response.status(204).json({ status: "success", data: null }); // delete: status is 204
    }
  );
};
