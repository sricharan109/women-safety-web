// server/models/SOSAlert.js
const mongoose = require('mongoose');

const sosAlertSchema = new mongoose.Schema({
  name: String,
  contact: String,
  location: String,
  lat: Number,
  lon: Number,
  time: Date
});

module.exports = mongoose.model('SOSAlert', sosAlertSchema);
