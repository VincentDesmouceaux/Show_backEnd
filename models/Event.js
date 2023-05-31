const mongoose = require("mongoose");

const Event = mongoose.model("Event", {
  date: {
    type: Date,
    set: function (value) {
      return new Date(value);
    },
  },
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
