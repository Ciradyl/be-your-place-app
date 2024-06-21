const jwt = require("jsonwebtoken");

const HttpError = require("../models/http-error");

module.exports = (req, res, next) => {
  if (req.method === "OPTIONS") {
    return next();
  }
  try {
    const token = req.headers.authorization.split(" ")[1];
    if (!token) {
      throw new Error("Authentication failed!");
    }
    const decodedToken = jwt.verify(token, "supersecret_secret_secrets");
    req.userData = { userId: decodedToken.userId };
    next();
  } catch (e) {
    const error = new HttpError("Authorization failed!", 403);
    return next(error);
  }
};
