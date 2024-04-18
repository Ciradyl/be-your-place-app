// note:
// const uuid = require("uuid/v4");
// v4 is no longer supported
const { v4: uuidv4 } = require("uuid");
const { validationResult } = require("express-validator");

const HttpError = require("../models/http-error");

DUMMY_USERS = [
  {
    id: "u1",
    name: "John Smith",
    emailAddress: "john.smith@gmail.com",
    password: "test12345",
  },
];

const GET__users = (req, res, next) => {
  res.status(200).json({ users: DUMMY_USERS });
};

const POST__signup = (req, res, next) => {
  const errors = validationResult(req); // detect validation errors
  if (!errors.isEmpty()) {
    console.log(errors);
    throw new HttpError("Invalid inputs passed, pelase check your data.", 422);
  }
  const { name, emailAddress, password } = req.body;

  const hasUser = DUMMY_USERS.find(
    (user) => user.emailAddress === emailAddress
  );
  if (hasUser) {
    throw new HttpError("user already exists", 422);
  }

  const createdUser = {
    id: uuidv4(),
    name,
    emailAddress,
    password,
  };

  DUMMY_USERS.push(createdUser);

  res.status(201).json({ user: createdUser });
};

const POST__login = (req, res, next) => {
  const { emailAddress, password } = req.body;

  const identifiedUser = DUMMY_USERS.find(
    (user) => user.emailAddress === emailAddress
  );
  if (!identifiedUser || identifiedUser.password !== password) {
    throw new HttpError("Could not find identified user.", 401);
  }

  res.json({ message: "logged in!" });
};

exports.GET__users = GET__users;
exports.POST__signup = POST__signup;
exports.POST__login = POST__login;
