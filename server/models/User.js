const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  address: String,
  phoneNumber: String
});

module.exports = mongoose.model('User', UserSchema);
