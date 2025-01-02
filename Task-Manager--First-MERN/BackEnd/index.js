require("./passport");
require("dotenv").config();
const express = require("express");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const authModel = require("./Models/Model");
const bcrypt = require("bcrypt");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const passport = require("passport");
const TodoRoutes = require("./Routes/TodoRoutes");
const NoteRoutes = require("./Routes/NoteRoutes");
const TaskRoutes = require("./Routes/TaskRoutes");
const profileRoutes = require("./routes/profile");
const mongoose = require("mongoose");

// Required for Multer GridFS Storage
const multer = require("multer");
const { GridFsStorage } = require("multer-gridfs-storage");
const gridfsStream = require("gridfs-stream");

const PORT = 8080;

const app = express();
app.use([
  cors({
    origin: "http://localhost:3000",
    credentials: true,
    methods: ["GET", "PUT", "PATCH", "PUT", "DELETE"],
  }),
  express.json(),
  express.urlencoded({ extended: true }),
]);

// Session and MongoDB setup
const sessionStore = new MongoStore({
  mongoUrl: process.env.MONGO_URI || "mongodb+srv://sharmamauli001:Sharma123@cluster0.nbi2l.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
  collectionName: "session",
});
app.use(
  session({
    secret: process.env.SESSION_SECRET || "waijdasdnkj123",
    resave: true,
    saveUninitialized: true,
    store: sessionStore,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Base Route
app.get("/", (req, res) => {
  res.json("Hello, welcome to the server!");
});

// Register Route
app.post("/register", async (req, res) => {
  const { userName, email, password } = req.body;
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  const newAuth = new authModel({
    userName: userName,
    email: email,
    password: hashedPassword,
  });

  try {
    const user = await authModel.findOne({ email: email });
    if (user) res.json("Already Registered");
    else {
      const savedUser = await newAuth.save();
      res.send(savedUser);
    }
  } catch (err) {
    res.status(400).send(err);
  }
});

// MongoDB connection setup for GridFS
const mongoURI = process.env.MONGO_URI || "mongodb+srv://sharmamauli001:Sharma123@cluster0.nbi2l.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// Use a single connection with retry logic
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 10000,  // Timeout after 10 seconds
  connectTimeoutMS: 15000,  // Connection timeout after 15 seconds
})
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB connection error:", err));


// Initialize GridFS
const conn = mongoose.connection;
let gfs;

conn.once("open", () => {
  gfs = gridfsStream(conn.db, mongoose.mongo);
  gfs.collection("uploads"); // Set the collection name for files
});

// Set up Multer GridFS storage
const storage = new GridFsStorage({
  url: mongoURI,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      const fileInfo = {
        filename: file.originalname,
        bucketName: "uploads", // GridFS collection
      };
      resolve(fileInfo);
    });
  },
});
const upload = multer({ storage });

// Route to upload an image to MongoDB (GridFS)
app.post("/upload", upload.single("file"), (req, res) => {
  res.json({
    file: req.file // Return file info (including ID, filename, etc.)
  });
});

// Route to serve an image from MongoDB (GridFS)
app.get("/file/:filename", (req, res) => {
  const filename = req.params.filename;

  gfs.files.findOne({ filename }, (err, file) => {
    if (err || !file) {
      return res.status(404).json({ err: "No such file exists" });
    }

    const readStream = gfs.createReadStream(file.filename);
    res.set("Content-Type", file.contentType);
    readStream.pipe(res); // Pipe the file content to the response
  });
});

// Google Authentication
app.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

app.get("/google/callback", passport.authenticate("google", {
  failureRedirect: process.env.FRONTEND_DOMAIN,
  successRedirect: `${process.env.FRONTEND_DOMAIN}/Home`,
}));

// Facebook Authentication
app.get("/facebook", passport.authenticate("facebook", { scope: ["email"] }));

app.get("/facebook/callback", passport.authenticate("facebook", {
  failureRedirect: process.env.FRONTEND_DOMAIN,
  successRedirect: `${process.env.FRONTEND_DOMAIN}/Home`,
}));

// Local Login
app.post("/login", passport.authenticate("local", { failureRedirect: process.env.FRONTEND_DOMAIN }), (req, res) => {
  res.json({ success: "Successfully logged in" });
});

// Logout
app.get("/logout", (req, res, next) => {
  req.logOut((err) => {
    if (err) res.send(err);
    else res.json({ success: "Logged out" });
  });
});

// Get User Information
app.get("/getUser", (req, res, next) => {
  if (req.user) {
    res.json(req.user);
  }
});

// Profile Routes
app.use("/api/profile", profileRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server Running On Port : ${PORT}`);
});

module.exports = app;
