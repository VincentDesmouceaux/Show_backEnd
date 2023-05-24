const mongoose = require("mongoose");

const Event = mongoose.model("Event", {
  date: Date,
  name: String,
  image: { type: mongoose.Schema.Types.Mixed, default: {} },
  seats: {
    orchestre: {
      quantity: Number,
      price: Number,
    },
    mezzanine: {
      quantity: Number,
      price: Number,
    },
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Promoter",
  },
});
module.exports = Event;
