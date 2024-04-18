const express = require("express");

const USER_CONTROLLERS = require("../controllers/controllers-users");

const router = express.Router();

// note: order matters when traversing through paths
router.get("/", USER_CONTROLLERS.GET__users);

router.post("/signup", USER_CONTROLLERS.POST__signup);

router.post("/login", USER_CONTROLLERS.POST__login);

// insert more here...

module.exports = router;
