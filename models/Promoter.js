const mongoose = require("mongoose");
const Promoter = mongoose.model("Promoter", {
  email: String,
  account: {
    username: String,
    avatar: Object,
  },

  token: String,
  hash: String,
  salt: String,
});

module.exports = Promoter;
