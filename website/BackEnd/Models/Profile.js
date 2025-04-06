// models/Profile.js
const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
  name: { type: String, required: true },
  relation: { type: String, required: true },
  link: { type: String, required: true }
});

const Profile = mongoose.model('Profile', ProfileSchema);

module.exports = Profile;
