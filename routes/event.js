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

router.get("/events", async (req, res) => {
  try {
    const { date, name } = req.query;

    let query = {};

    if (date) {
      query.date = date;
    }

    if (name) {
      query.name = new RegExp(name, "i");
    }

    const event = await Event.find(query).populate({
      path: "owner",
      select: "account.username account.avatar",
    });
    if (event.length > 0) {
      res.json(event);
    } else {
      res.json({ message: "No event with this name" });
    }
  } catch (error) {
    res.json({ message: error.message });
  }
});

router.get("/events/:id", async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate({
      path: "owner",
      select: "account.username account.avatar",
    });

    if (event) {
      res.json(event);
    } else {
      res.json({ message: "No event found" });
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
            orchestre: {
              quantity: 1164,
              price: 50,
            },
            mezzanine: {
              quantity: 824,
              price: 30,
            },
          },
          owner: req.user._id,
        });

        if (req.files?.image) {
          const result = await cloudinary.uploader.upload(
            convertToBase64(req.files.image),
            {
              folder: `/show/events/${newEvent._id}`,
              public_id: "image",
            }
          );
          newEvent.image = result;
        }

        await newEvent.save();
        await newEvent.populate("owner");
        res.json({ message: "Event successfully created", event: newEvent });
      }
    } catch (error) {
      res.json({ message: error.message });
    }
  }
);

router.put(
  "/event/modify/:id",

  fileUpload(),
  isAuthenticated,
  async (req, res) => {
    try {
      const eventId = req.params.id;
      const { date, name, orchestre, mezzanine } = req.body;
      const eventToModify = await Event.findById(eventId);

      if (date) eventToModify.date = date;
      if (name) eventToModify.name = name;

      if (orchestre) {
        if (orchestre.quantity)
          eventToModify.seats.orchestre.quantity = orchestre.quantity;
        if (orchestre.price)
          eventToModify.seats.orchestre.price = orchestre.price;
      }

      if (mezzanine) {
        if (mezzanine.quantity)
          eventToModify.seats.mezzanine.quantity = mezzanine.quantity;
        if (mezzanine.price)
          eventToModify.seats.mezzanine.price = mezzanine.price;
      }

      if (req.files?.image) {
        await cloudinary.uploader.destroy(eventToModify.image.public_id);

        const result = await cloudinary.uploader.upload(
          convertToBase64(req.files.image),
          {
            folder: `/show/events/${eventToModify._id}`,
            public_id: "image",
          }
        );

        eventToModify.image = result;
      }

      await eventToModify.save();
      res.status(200).json(eventToModify);
    } catch (error) {
      res.json({ message: error.message });
    }
  }
);

module.exports = router;
