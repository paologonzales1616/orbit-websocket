const mongoose = require("mongoose");

//Define notification Schema model
const notificationSchema = mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  user_id: mongoose.Schema.Types.ObjectId,
  admin_id: mongoose.Schema.Types.ObjectId,
  // 1 : Connected
  // 0 : Disconnected
  status: { type: String, enum: [1, 0] }
});

module.exports = mongoose.model("notification", notificationSchema);
