const express = require("express");
const bodyParser = require("body-parser");

// import routes
const ROUTES_PLACES = require("./routes/routes-places");

const app = express(); // creates an instance of express

// handling of middlewares
app.use("/api/places", ROUTES_PLACES);

// insert more here...

app.listen(5000);
