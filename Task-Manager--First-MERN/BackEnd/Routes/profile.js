const express = require("express");
const router = express.Router();

// Route to add a profile with name, relation, and link (image URL)
router.post("/add", async (req, res) => {
  const { name, relation, link } = req.body; // Get profile data from the request

  // Ensure all required fields are present
  if (!name || !relation || !link) {
    return res.status(400).json({ error: "Please fill all fields." });
  }

  // Create the profile object with the provided fields
  const profileData = {
    name,
    relation,
    link, // Store the image URL link
  };

  try {
    const Profile = require('../models/Profile');
    const newProfile = new Profile(profileData);
    await newProfile.save();

    res.json({
      success: true,
      message: "Profile created successfully",
      profile: newProfile, // Send the newly created profile
    });
  } catch (error) {
    console.error("Error saving profile", error);
    res.status(500).json({ error: "Failed to save profile" });
  }
});

module.exports = router;
