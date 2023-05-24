const mongoose = require("mongoose");

const Ticket = mongoose.model("Ticket", {
  date: String,
  category: String,
  seats: Number,

  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event",
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

module.exports = Ticket;
