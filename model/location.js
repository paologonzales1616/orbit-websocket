const mongoose = require("mongoose");

//Define locationSchema model
const locationSchema = mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  user_id: mongoose.Schema.Types.ObjectId,
  admin_id: mongoose.Schema.Types.ObjectId,
  lat: Number,
  lng: Number
});

module.exports = mongoose.model("location", locationSchema);
