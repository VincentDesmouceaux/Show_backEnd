const express = require("express");
const router = express.Router();
const { isAfter } = require("date-fns");

const User = require("../models/User");
const Promoter = require("../models/Promoter");
const Ticket = require("../models/Ticket");
const Event = require("../models/Event");

const isAuthenticated = require("../middlewares/isAuthenticated");

router.post("/tickets/book", isAuthenticated, async (req, res) => {
  const { seats, category, eventId } = req.body;
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
      const event = await Event.findById(eventId);

      if (event) {
        if (isAfter(new Date(event.date), new Date())) {
          if (event.seats[category].quantity >= seats) {
            event.seats[category].quantity =
              event.seats[category].quantity - seats;
            await event.save();
            const tickets = new Ticket({
              date: new Date(),
              category: category,
              seats: seats,
              event: eventId,
              owner: req.user._id,
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

router.post("/tickets", isAuthenticated, async (req, res) => {
  try {
    const userId = req.user._id;
    const tickets = await Ticket.find({ owner: userId }).populate("event");
    if (tickets.length > 0) {
      const events = tickets.map((ticket) => ticket.event);
      const totalSeats = tickets.reduce((acc, ticket) => acc + ticket.seats, 0);
      res.json({ events, totalSeats: totalSeats });
    } else {
      res.json({ message: "No reservations for this user" });
    }
  } catch (error) {
    res.json({ message: error.message });
  }
});

module.exports = router;
