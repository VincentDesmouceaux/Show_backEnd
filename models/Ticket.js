const mongoose = require("mongoose");

const Ticket = mongoose.model("Ticket", {
  mail: String,
  username: String,
  date: String,
  category: String,
  seats: Number,
  price: Number,
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
