// note:
// const uuid = require("uuid/v4");
// v4 is no longer supported
const { v4: uuidv4 } = require("uuid");
const { validationResult } = require("express-validator");

const getCoordinatesForAddress = require("../util/util-coordinates.js");
const HttpError = require("../models/http-error");
const Place = require("../models/models-place.js");

let DUMMY_PLACES = [
  {
    id: "p1",
    title: "World Trade Center",
    description: "One of the most famous sky scrappers in the world!",
    address: "Manhattan, New York, NY 10001",
    coordinates: {
      lat: 40.71288220988469,
      lng: -74.01339054302295,
    },
    creatorId: "u1",
  },
];

const GET__placeById = (req, res, next) => {
  const placeId = req.params.pid;

  const place = DUMMY_PLACES.find((place) => {
    return place.id === placeId;
  });

  if (!place) {
    throw new HttpError("No Place found for the provided place ID.", 404); //no need return
  }

  res.json({ place });
};

const GET__placesByUserId = (req, res, next) => {
  const userId = req.params.uid;

  const places = DUMMY_PLACES.filter((place) => place.creatorId === userId);

  if (!places || places.length === 0) {
    return next(
      new HttpError("No Places found for the provided user ID.", 404)
    );
  }

  res.json({ places });
};

const POST__createPlace = async (req, res, next) => {
  const errors = validationResult(req); // detect validation errors
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );
  }

  const { title, description, address, creatorId } = req.body;

  //Geocoder API
  let coordinates;
  try {
    coordinates = await getCoordinatesForAddress(address);
  } catch (error) {
    return next(error);
  }

  // since getCoordinatesForAddress returns an array
  // we set the values of lat and lng
  // by getting them as objects
  const lat = coordinates[1];
  const lng = coordinates[0];

  const createdPlace = new Place({
    title,
    description,
    address,
    coordinates: {
      lat,
      lng,
    },
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/c/c5/World_Trade_Center%2C_New_York_City_-_aerial_view_%28March_2001%29.jpg",
    creatorId,
  });

  // note: store new document
  // a promise; needs async await
  try {
    await createdPlace.save();
  } catch (e) {
    const error = new HttpError(
      "Place creation failed, please try again.",
      500
    );
    console.log(createdPlace.save());
    console.log(coordinates);
    return next(error);
  }

  res.status(201).json({ place: createdPlace });
};

const PATCH__updatePlaceById = (req, res, next) => {
  const errors = validationResult(req); // detect validation errors
  if (!errors.isEmpty()) {
    console.log(errors);
    return next(
      new HttpError("Invalid inputs passed, pelase check your data.", 422)
    );
  }

  const { title, description } = req.body;
  const placeId = req.params.pid;

  const updatePlace = { ...DUMMY_PLACES.find((place) => place.id === placeId) };
  const placeIndex = DUMMY_PLACES.findIndex((place) => place.id === placeId);
  updatePlace.title = title;
  updatePlace.description = description;

  DUMMY_PLACES[placeIndex] = updatePlace;

  res.status(200).json({ place: updatePlace });
};

const DELETE__placeById = (req, res, next) => {
  const placeId = req.params.pid;

  if (DUMMY_PLACES.find((place) => place.id !== placeId)) {
    throw new HttpError("Could not find a place for that id.", 404);
  }

  DUMMY_PLACES = DUMMY_PLACES.filter((place) => place.id !== placeId);

  res.status(200).json({ message: "Deleted place." });
};

exports.GET__placeById = GET__placeById;
exports.GET__placesByUserId = GET__placesByUserId;
exports.POST__createPlace = POST__createPlace;
exports.PATCH__updatePlaceById = PATCH__updatePlaceById;
exports.DELETE__placeById = DELETE__placeById;
