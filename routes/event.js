const express = require("express");
const router = express.Router();
const fileUpload = require("express-fileupload");
const convertToBase64 = require("../utils/convertToBase64");
const cloudinary = require("cloudinary").v2;

const User = require("../models/User");
const Promoter = require("../models/Promoter");
const Ticket = require("../models/Ticket");
const Event = require("../models/Event");

const isAuthenticated = require("../middlewares/promoterAuthenticated");

router.get("/events/availabilities", async (req, res) => {
  try {
    const event = await Event.find({ date: req.query.date });
    if (event.length > 0) {
      res.json(event);
    } else {
      res.json({ message: "No event with this name" });
    }
  } catch (error) {
    res.json({ message: error.message });
  }
});

router.post(
  "/events/create",
  isAuthenticated,
  fileUpload(),
  async (req, res) => {
    try {
      const { date, name } = req.body;

      const event = await Event.findOne({ date, name });
      if (event) {
        res.json({ message: "The same event at the same date already exists" });
      } else {
        const newEvent = new Event({
          date: date,
          name: name,
          seats: {
            orchestre: 1164,
            mezzanine: 824,
          },
        });

        await newEvent.save();
        res.json({ message: "Event successfully created" });
      }
    } catch (error) {}
    res.json({ message: error.message });
  }
);

module.exports = router;
