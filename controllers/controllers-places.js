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

const GET__placeById = async (req, res, next) => {
  const placeId = req.params.pid;

  let place;
  try {
    place = await Place.findById(placeId);
  } catch (e) {
    const error = new HttpError(
      "Something went wrong, could not find a place.",
      500
    );
    return next(error);
  }

  if (!place) {
    const error = new HttpError(
      "No Place found for the provided place ID.",
      404
    );
    return next(error);
  }

  res.json({ place: place.toObject({ getters: true }) });
};

const GET__placesByUserId = async (req, res, next) => {
  const userId = req.params.uid;

  let places;
  try {
    places = await Place.find({ creatorId: userId });
  } catch (e) {
    const error = new HttpError(
      "Something went wrong, could not find places for that user.",
      500
    );
    return next(error);
  }

  if (!places || places.length === 0) {
    const error = new HttpError(
      "No Places found for the provided user ID.",
      404
    );
    return next(error);
  }

  res.json({
    places: places.map((place) => place.toObject({ getters: true })),
  });
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

const PATCH__updatePlaceById = async (req, res, next) => {
  const errors = validationResult(req); // detect validation errors
  if (!errors.isEmpty()) {
    console.log(errors);
    return next(
      new HttpError("Invalid inputs passed, pelase check your data.", 422)
    );
  }

  const { title, description } = req.body;
  const placeId = req.params.pid;

  let place;
  try {
    place = await Place.findById(placeId);
  } catch (e) {
    const error = new HttpError(
      "Something went wrong, could not update place.",
      500
    );
    return next(error);
  }

  place.title = title;
  place.description = description;

  try {
    await place.save();
  } catch (e) {
    const error = new HttpError(
      "Something went wrong, could not update place.",
      500
    );
    return next(error);
  }

  res.status(200).json({ place: place.toObject({ getters: true }) });
};

const DELETE__placeById = async (req, res, next) => {
  const placeId = req.params.pid;

  let place;
  try {
    place = await Place.findById(placeId);
  } catch (e) {
    console.log(e);
    const error = new HttpError(
      "Something went wrong, could not delete place.",
      500
    );
    return next(error);
  }

  try {
    await place.deleteOne() //old: place.remove()
  } catch (e) {
    console.log(e);
    const error = new HttpError(
      "Something went wrong, could not delete place.",
      500
    );
    return next(error)
  }

  res.status(200).json({ message: "Successfully deleted the place." });
};

exports.GET__placeById = GET__placeById;
exports.GET__placesByUserId = GET__placesByUserId;
exports.POST__createPlace = POST__createPlace;
exports.PATCH__updatePlaceById = PATCH__updatePlaceById;
exports.DELETE__placeById = DELETE__placeById;
