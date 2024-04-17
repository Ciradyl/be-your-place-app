const express = require("express");
const bodyParser = require("body-parser");

// import routes
const ROUTES_PLACES = require("./routes/routes-places");

const app = express(); // creates an instance of express

// list of middlewares
app.use("/api/places", ROUTES_PLACES);

// special: error handling middleware
app.use((error, req, res, next) => {
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({ message: error.message || "An unknown error occured!" });
});

// insert more here...

app.listen(5000);
