const mongoose = require("mongoose");

module.exports = () => {
  // connect to our database
  mongoose.connect(
    process.env.MONGO_URI,
    { useNewUrlParser: true, useUnifiedTopology: true },
    err =>
      err
        ? console.error(err)
        : console.log("Database connection established...")
  );
};
