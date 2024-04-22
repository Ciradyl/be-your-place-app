const axios = require("axios");

const HttpError = require("../models/http-error");

const MAPBOX_ACCESS_TOKEN =
  "pk.eyJ1Ijoia2Vya3phcnQiLCJhIjoiY2x1MjRoNWg4MHRjeTJrbjBtMnVwNDFjeiJ9.--nVupO0004ghQeRW1USYw";

const getCoordinatesForAddress = async (address) => {
  // Forward Geocoding API
  // Looks for address then converts it into coordinates
  // default: has autoComplete on
  const response = await axios.get(
    `https://api.mapbox.com/search/geocode/v6/forward?q=${encodeURIComponent(address)}&access_token=${MAPBOX_ACCESS_TOKEN}`
  );
  const data = response.data;

  if (!data) {
    const error = new HttpError(
      "Could not find location for the given coordinates",
      422
    );
    throw error;
  }

  // the results are stored in a Feature collection as an object
  const coordinates = data.features[0].geometry.coordinates;

  return coordinates;
};

module.exports = getCoordinatesForAddress