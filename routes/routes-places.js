const express = require("express");

const router = express.Router();

const DUMMY_PLACES = [
  {
    id: "p1",
    title: "World Trade Center",
    description: "One of the most famous sky scrappers in the world!",
    address: "Manhattan, New York, NY 10001",
    coordinates: {
      lat: 40.71288220988469,
      lng: -74.01339054302295,
    },
    creatorId: "u1",
  },
];

// note: order matters when traversing through paths
router.get("/:pid", (req, res, next) => {
  const placeId = req.params.pid;
  const place = DUMMY_PLACES.find((place) => {
    return place.id === placeId;
  });
  if (!place) {
    return res
      .status(404)
      .json({ message: "No Place found for the provided place ID." });
  }
  res.json({ place });
});

router.get("/user/:uid", (req, res, next) => {
  const userId = req.params.uid;
  const place = DUMMY_PLACES.find((place) => {
    return place.creatorId === userId;
  });
  if (!place) {
    return res
      .status(404)
      .json({ message: "No Place found for the provided user ID." });
  }
  res.json({ place });
});
// insert more here...

module.exports = router;
