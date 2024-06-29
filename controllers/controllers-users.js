// note:
// const uuid = require("uuid/v4");
// v4 is no longer supported
const { v4: uuidv4 } = require("uuid");
const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const HttpError = require("../models/http-error");
const User = require("../models/models-user.js");

const GET__users = async (req, res, next) => {
  let users;
  try {
    users = await User.find({}, "-password"); //excludes the password object
  } catch (e) {
    const error = new HttpError(
      "Fetching users failed, please try again.",
      500
    );
    return next(error);
  }

  res.json({ users: users.map((user) => user.toObject({ getters: true })) });
};

const POST__signup = async (req, res, next) => {
  const errors = validationResult(req); // detect validation errors
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );
  }

  const { name, emailAddress, password } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ emailAddress: emailAddress });
  } catch (e) {
    const error = new HttpError("Signup failed, please try again later.", 500);
    return next(error);
  }

  if (existingUser) {
    const error = new HttpError("This user already exists.", 422);
    return next(error);
  }

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (e) {
    const error = new HttpError(
      "Could not create user, please try again.",
      500
    );
    return next(error);
  }
  const createdUser = new User({
    name,
    emailAddress,
    password: hashedPassword,
    image: req.file.path,
    places: [],
  });
  // note: store new document
  // a promise; needs async await
  try {
    await createdUser.save();
  } catch (e) {
    const error = new HttpError("Signup failed, please try again.", 500);
    return next(error);
  }

  let token;
  try {
    token = jwt.sign(
      {
        userId: createdUser.id,
        emailAddress: createdUser.emailAddress,
      },
      process.env.JWT_KEY,
      { expiresIn: "1h" }
    );
  } catch (e) {
    const error = new HttpError("Signup failed, please try again.", 500);
    return next(error);
  }

  res.status(201).json({
    userId: createdUser.id,
    emailAddress: createdUser.emailAddress,
    token: token,
  });
};

const POST__login = async (req, res, next) => {
  const { emailAddress, password } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ emailAddress: emailAddress });
  } catch (e) {
    const error = new HttpError("Login failed, please try again later.", 500);
    return next(error);
  }

  if (!existingUser) {
    const error = new HttpError(
      "You have entered an invalid credential, please try again.",
      403
    );
    return next(error);
  }

  let isValidPassword = false;
  try {
    isValidPassword = await bcrypt.compare(password, existingUser.password);
  } catch (e) {
    const error = new HttpError(
      "Could not login, Please check your credentials and try again.",
      500
    );
    return next(error);
  }

  if (!isValidPassword) {
    const error = new HttpError(
      "You have entered an invalid credential, please try again.",
      403
    );
    return next(error);
  }

  let token;
  try {
    token = jwt.sign(
      {
        userId: existingUser.id,
        emailAddress: existingUser.emailAddress,
      },
      process.env.JWT_KEY,
      { expiresIn: "1h" }
    );
  } catch (e) {
    const error = new HttpError("Login failed, please try again.", 500);
    return next(error);
  }

  res.json({
    message: "logged in!",
    userId: existingUser.id,
    emailAddress: existingUser.emailAddress,
    token: token,
  });
};

exports.GET__users = GET__users;
exports.POST__signup = POST__signup;
exports.POST__login = POST__login;
