const dotenv = require("dotenv");
const mongoose = require("mongoose");

dotenv.config({ path: "./config.env" });

const app = require("./app");

const database = process.env.DATABASE.replace(
  "<db_password>",
  process.env.DATABASE_PASSWORD,
);

// console.log(process.env);
// mongoose previous options
//  {
// useNewUrlParser: true,
// useUnifiedTopology: true,
// useCreateIndex: true,
// useFindAndModify: false,
// }

mongoose.connect(database).then(() => {
  // console.log(connectionObj.connections);
  console.log("Database connection is successfull");
});

const port = 8000;
app.listen(port, () => {
  console.log(`App is running on port:${port} 0__0`);
});
