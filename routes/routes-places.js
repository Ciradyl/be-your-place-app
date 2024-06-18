const express = require("express");
const { check } = require("express-validator"); // destructered

const PLACE_CONTROLLERS = require("../controllers/controllers-places");
const fileUpload = require("../middleware/middleware-file-upload");
const checkAuth = require("../middleware/middleware-auth");

const router = express.Router();

// note: order matters when traversing through paths
router.get("/:pid", PLACE_CONTROLLERS.GET__placeById);

router.get("/user/:uid", PLACE_CONTROLLERS.GET__placesByUserId);

router.use(checkAuth);

router.post(
  "/",
  fileUpload.single("image"),
  [
    check("title").not().isEmpty(),
    check("description").isLength({ min: 5 }),
    // check("coordinates").not().isEmpty(),
  ],
  PLACE_CONTROLLERS.POST__createPlace
);

router.patch(
  "/:pid",
  [check("title").not().isEmpty(), check("description").isLength({ min: 5 })],
  PLACE_CONTROLLERS.PATCH__updatePlaceById
);

router.delete("/:pid", PLACE_CONTROLLERS.DELETE__placeById);

// insert more here...

module.exports = router;
