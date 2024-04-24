// note:
// const uuid = require("uuid/v4");
// v4 is no longer supported
const { v4: uuidv4 } = require("uuid");
const { validationResult } = require("express-validator");

const HttpError = require("../models/http-error");
const User = require("../models/models-user.js");

DUMMY_USERS = [
  {
    id: "u1",
    name: "John Smith",
    emailAddress: "john.smith@gmail.com",
    password: "test12345",
  },
];

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
    console.log(errors);
    return next(
      new HttpError("Invalid inputs passed, pelase check your data.", 422)
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

  const createdUser = new User({
    name,
    emailAddress,
    password,
    image:
      "https://www.gravatar.com/avatar/205e460b479e2e5b48aec07710c08d50?s=200",
    places: [],
  });

  // note: store new document
  // a promise; needs async await
  try {
    await createdUser.save();
  } catch (e) {
    const error = new HttpError("Signup failed, please try again.", 500);
    console.log(createdUser.save());
    return next(error);
  }

  res.status(201).json({ user: createdUser.toObject({ getters: true }) });
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

  if (!existingUser || existingUser.password !== password) {
    console.log(existingUser, existingUser.password, password);
    const error = new HttpError(
      "You have entered an invalid credential, please try again.",
      401
    );
    return next(error);
  }

  res.json({ message: "logged in!" });
};

exports.GET__users = GET__users;
exports.POST__signup = POST__signup;
exports.POST__login = POST__login;
