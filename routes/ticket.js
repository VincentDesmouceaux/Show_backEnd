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
          const existingTickets = await Ticket.find({
            event: eventId,
            owner: req.user._id,
            category: category,
          }).sort({ createdAt: 1 });

          const totalReservedSeats = existingTickets.reduce(
            (total, ticket) => total + ticket.seats,
            0
          );

          const remainingSeats = 4 - totalReservedSeats;
          const availableSeats = Math.min(seats, remainingSeats);

          if (availableSeats === 0) {
            return res.status(400).json({
              error: {
                message:
                  "You have already reserved the maximum number of tickets",
              },
            });
          }
          if (event.seats[category].quantity >= seats) {
            if (seats > remainingSeats) {
              return res.json({
                message: `The limit is four seats per event. You can reserve only ${availableSeats} seat(s) for this event`,
              });
            }

            if (event.seats[category].quantity >= seats) {
              event.seats[category].quantity =
                event.seats[category].quantity - seats;
              await event.save();

              if (existingTickets.length > 0) {
                existingTickets[0].seats += availableSeats;
                await existingTickets[0].save();
              } else {
                const newTicket = new Ticket({
                  date: new Date(),
                  category: category,
                  seats: availableSeats,
                  event: eventId,
                  owner: req.user._id,
                });
                await newTicket.save();
              }

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
      const events = tickets.map((ticket) => ({
        event: ticket.event,
        reservedSeats: ticket.seats,
      }));

      res.json(events);
    } else {
      res.json({ message: "No reservations for this user" });
    }
  } catch (error) {
    res.json({ message: error.message });
  }
});

router.delete("/ticket/delete/:id", isAuthenticated, async (req, res) => {
  try {
    const ticketId = req.params.id;
    const ticketToDelete = await Ticket.findById(ticketId);

    const eventToUpdate = await Event.findById(ticketToDelete.event);
    eventToUpdate.seats[ticketToDelete.category].quantity +=
      ticketToDelete.seats;
    await Ticket.deleteOne({ _id: ticketId });
    await eventToUpdate.save();
    res.status(200).json({ message: "Ticket cancelled and event updated" });
  } catch (error) {
    res.json({ message: error.message });
  }
});

module.exports = router;
