const express = require("express");

const PLACE_CONTROLLERS = require("../controllers/controllers-places");

const router = express.Router();

// note: order matters when traversing through paths
router.get("/:pid", PLACE_CONTROLLERS.GET__placeById);

router.get("/user/:uid", PLACE_CONTROLLERS.GET__placesByUserId);

router.post("/", PLACE_CONTROLLERS.POST__createPlace);

router.patch("/:pid", PLACE_CONTROLLERS.PATCH__updatePlaceById);

router.delete("/:pid", PLACE_CONTROLLERS.DELETE__placeById);

// insert more here...

module.exports = router;
