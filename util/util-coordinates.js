const axios = require("axios");

const HttpError = require("../models/http-error");
require("dotenv").config();

const getCoordinatesForAddress = async (address) => {
  const ENCODED_ADDRESS_URI = encodeURIComponent(address);
  const ENCODED_MAPBOX_ACCESS_TOKEN_URI = encodeURIComponent(process.env.MAPBOX_ACCESS_TOKEN)

  // Forward Geocoding API
  // Looks for address then converts it into coordinates
  // default: has autoComplete on
  const response = await axios.get(
    `https://api.mapbox.com/search/geocode/v6/forward?q=${ENCODED_ADDRESS_URI}&access_token=${ENCODED_MAPBOX_ACCESS_TOKEN_URI}`
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

module.exports = getCoordinatesForAddress;
