// note:
// const uuid = require("uuid/v4");
// v4 is no longer supported
const { v4: uuidv4 } = require("uuid");
const { validationResult } = require("express-validator");
const mongoose = require("mongoose");

const getCoordinatesForAddress = require("../util/util-coordinates.js");
const HttpError = require("../models/http-error");
const Place = require("../models/models-place.js");
const User = require("../models//models-user.js");

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

  res.json({ places: place.toObject({ getters: true }) });
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
    image: req.file.path,
    creatorId,
  });

  // check if user id exists
  let user;
  try {
    user = await User.findById(creatorId);
  } catch (e) {
    const error = new HttpError(
      "Creating place failed, please try again later.",
      500
    );
    return next(error);
  }

  if (!user) {
    const error = new HttpError(
      "Could not find user for the provided id.",
      404
    );
    return next(error);
  }

  // note: store new document
  // a promise; needs async await
  try {
    const currentSession = await mongoose.startSession();
    currentSession.startTransaction();
    await createdPlace.save({ session: currentSession });

    user.places.push(createdPlace); // mongoose: establish a connection between two models
    await user.save({ session: currentSession });

    // once the transaction is committed
    // it will then save the created place
    await currentSession.commitTransaction();
  } catch (e) {
    const error = new HttpError(
      "Place creation failed, please try again.",
      500
    );
    return next(error);
  }

  res.status(201).json({ place: createdPlace });
};

const PATCH__updatePlaceById = async (req, res, next) => {
  const errors = validationResult(req); // detect validation errors
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
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
    place = await Place.findById(placeId).populate("creatorId"); //requires two ref between two models
  } catch (e) {
    const error = new HttpError(
      "Something went wrong, could not delete place.",
      500
    );
    return next(error);
  }

  if (!place) {
    const error = new HttpError("Could not find place for this id.", 404);
    return next(error);
  }

  try {
    const currentSession = await mongoose.startSession();
    currentSession.startTransaction();
    await place.deleteOne({ session: currentSession }); //old: place.remove()

    place.creatorId.places.pull(place); // mongoose: establish a connection between two models
    await place.creatorId.save({ session: currentSession });

    // once the transaction is committed
    // it will then save the created place
    await currentSession.commitTransaction();
  } catch (e) {
    const error = new HttpError(
      "Something went wrong, could not delete place.",
      500
    );
    return next(error);
  }

  res.status(200).json({ message: "Successfully deleted the place." });
};

exports.GET__placeById = GET__placeById;
exports.GET__placesByUserId = GET__placesByUserId;
exports.POST__createPlace = POST__createPlace;
exports.PATCH__updatePlaceById = PATCH__updatePlaceById;
exports.DELETE__placeById = DELETE__placeById;
