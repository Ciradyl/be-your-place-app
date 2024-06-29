const fs = require("fs");
const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const HttpError = require("./models/http-error");
const ROUTES_PLACES = require("./routes/routes-places");
const ROUTES_USERS = require("./routes/routes-users");

require("dotenv").config();

const app = express(); // creates an instance of express

app.use(bodyParser.json());

app.use("/uploads/images", express.static(path.join("uploads", "images")));

app.use((req, res, next) => {
  // initalize headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");

  next();
});

app.use("/api/places", ROUTES_PLACES);
app.use("/api/users", ROUTES_USERS);

app.use((req, res, next) => {
  const error = new HttpError("Could not find this route", 404);
  throw error;
});

// special: error handling middleware
app.use((error, req, res, next) => {
  if (req.file) {
    fs.unlink(req.file.path, (error) => {
      console.log(error);
    });
  }
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({ message: error.message || "An unknown error occured!" });
});
// insert more here...

mongoose
  .connect(
    `mongodb+srv://${process.env.YOUR_PLACE_DB_USER}:${process.env.YOUR_PLACE_DB_PASSWORD}@cluster0.bfxxivc.mongodb.net/${process.env.YOUR_PLACE_DB_NAME}?retryWrites=true&w=majority&appName=Cluster0`
  )
  .then(() => {
    app.listen(5000);
  })
  .catch((error) => {
    console.log(error);
  });
