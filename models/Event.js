const mongoose = require("mongoose");

const Event = mongoose.model("Event", {
  date: String,
  name: String,
  image: { type: mongoose.Schema.Types.Mixed, default: {} },
  seats: {
    orchestre: Number,
    mezzanine: Number,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Promoter",
  },
});
module.exports = Event;
