const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const HttpError = require("./models/http-error");
const ROUTES_PLACES = require("./routes/routes-places");
const ROUTES_USERS = require("./routes/routes-users");

const app = express(); // creates an instance of express

app.use(bodyParser.json());

app.use("/api/places", ROUTES_PLACES);
app.use("/api/users", ROUTES_USERS);

app.use((req, res, next) => {
  const error = new HttpError("Could not find this route", 404);
  throw error;
});

// special: error handling middleware
app.use((error, req, res, next) => {
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({ message: error.message || "An unknown error occured!" });
});
// insert more here...

mongoose
  .connect(
    "mongodb+srv://ghoul:falloutwinter@cluster0.fjqpomv.mongodb.net/?retryWrites=true&w=majority&appName=places"
  )
  .then(() => {
    app.listen(5000);
  })
  .catch((error) => {
    console.log(error);
  });
