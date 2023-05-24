const express = require("express");
const router = express.Router();

const User = require("../models/User");
const Promoter = require("../models/Promoter");
const Ticket = require("../models/Ticket");
const Event = require("../models/Event");

const isAuthenticated = require("../middlewares/isAuthenticated");

router.post("/tickets/book", isAuthenticated, async (req, res) => {
  const { seats, category, mail, username, price, owner } = req.body;
  if (
    seats > 4 ||
    seats < 1 ||
    (category !== "orchestre" && category !== "mezzanine")
  ) {
    return res.status(400).json({
      error: {
        message: "Invalid request",
      },
    });
  } else {
    try {
      const event = await Event.findById(req.body.eventId);
      if (event) {
        if (isAfter(new Date(event.date), new Date())) {
          if (event.seats[category] >= seats) {
            event.seats[category] = event.seats[category] - seats;
            await event.save();
            const tickets = new Ticket({
              mail: mail,
              username: username,
              date: new Date(),
              category: category,
              seats: seats,
              price: price,
              event: req.body.eventId,
            });
            await tickets.save();
            res.json({
              message: `${seats} seat(s) successfully booked`,
            });
          } else {
            res.json({ message: "Not enought seats available" });
          }
        } else {
          res
            .status(400)
            .json({ message: "You cannot book tickets for a past event" });
        }
      } else {
        res.json({ message: "Event not found" });
      }
    } catch (error) {
      res.json({ message: error.message });
    }
  }
});

module.exports = router;
