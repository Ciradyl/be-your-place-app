const express = require("express");
const { check } = require("express-validator");

const USER_CONTROLLERS = require("../controllers/controllers-users");
const fileUpload = require("../middleware/middleware-file-upload");

const router = express.Router();

// note: order matters when traversing through paths
router.get("/", USER_CONTROLLERS.GET__users);

router.post(
  "/signup",
  fileUpload.single('image'),
  [
    check("name").not().isEmpty(),
    check("emailAddress").normalizeEmail().isEmail(),
    check("password").isLength({ min: 8 }),
  ],
  USER_CONTROLLERS.POST__signup
);

router.post("/login", USER_CONTROLLERS.POST__login);

// insert more here...

module.exports = router;
