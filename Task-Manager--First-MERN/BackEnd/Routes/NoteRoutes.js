const express = require("express");
const multer = require("multer");
const path = require("path");
const noteRoutes = express.Router();
const dataModel = require("../Models/DataModel");
const authenticator = require("../middleware/authenticator");  // Use authenticator middleware

// Set up multer for file uploading
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads'); // Store files in the 'uploads' directory
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Append timestamp to avoid name conflicts
  }
});

const upload = multer({ storage });

// Add a profile to a specific note
noteRoutes.post("/addProfile/:noteId", authenticator, upload.single('picture'), async (req, res) => {
  try {
    const { noteId } = req.params;
    const { name, relation } = req.body;

    const profile = {
      name,
      relation,
      picture: req.file ? `/uploads/${req.file.filename}` : null, // Save the uploaded file path
    };

    const updatedNote = await dataModel.findOneAndUpdate(
      { "notes.id": noteId },
      { $push: { "notes.$.profiles": profile } },
      { new: true }
    );

    res.json({ success: "Profile added successfully", updatedNote });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error adding profile" });
  }
});

// Serve static files (uploaded images)
noteRoutes.use('/uploads', express.static('uploads'));

module.exports = noteRoutes;
