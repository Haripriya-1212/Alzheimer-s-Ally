const passport = require("passport");
require("dotenv").config();
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;
const LocalStrategy = require("passport-local").Strategy;
const authModel = require("./Models/Model");
const bcrypt = require("bcrypt");

// Validate required environment variables
if (!(process.env.FACEBOOK_CLIENT_ID) || !(process.env.FACEBOOK_CLIENT_SECRET)) {
  throw new Error("Missing Google OAuth environment variables");
}
if (!process.env.FACEBOOK_CLIENT_ID || !process.env.FACEBOOK_CLIENT_SECRET) {
  throw new Error("Missing Facebook OAuth environment variables");
}

// Google OAuth Credentials
const googleCredentials = {
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "http://localhost:8080/google/callback",
};

// Facebook OAuth Credentials
const fbCredentials = {
  clientID: process.env.FACEBOOK_CLIENT_ID,
  clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
  callbackURL: "http://localhost:8080/facebook/callback",
  profileFields: ["id", "email", "displayName", "picture.type(large)"],
};

// Google OAuth Callback
const googleCallback = async (accessToken, refreshToken, profile, done) => {
  const newUser = {
    userName: profile.displayName,
    email: profile.emails[0].value,
    googleId: profile.id,
    picUrl: profile.photos[0].value,
  };
  try {
    let user = await authModel.findOne({ googleId: profile.id });
    if (!user) user = await authModel.create(newUser);
    done(null, user);
  } catch (err) {
    done(err);
  }
};

// Facebook OAuth Callback
const facebookCallback = async (accessToken, refreshToken, profile, done) => {
  const newUser = {
    userName: profile.displayName,
    fbId: profile.id,
    email: profile.emails ? profile.emails[0].value : null, // Handle missing email
    picUrl: profile.photos[0].value,
  };
  try {
    let user = await authModel.findOne({ fbId: profile.id });
    if (!user) user = await authModel.create(newUser);
    done(null, user);
  } catch (err) {
    done(err);
  }
};

// Local Authentication Callback
const localStrategyCallback = async (email, password, done) => {
  try {
    const user = await authModel.findOne({ email });
    if (!user) return done(null, false, { message: "No user found" });

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return done(null, false, { message: "Incorrect password" });

    done(null, user);
  } catch (err) {
    done(err);
  }
};

// Use Passport Strategies
passport.use(new GoogleStrategy(googleCredentials, googleCallback));
passport.use(new FacebookStrategy(fbCredentials, facebookCallback));
passport.use(
  new LocalStrategy({ usernameField: "email" }, localStrategyCallback)
);

// Serialize User
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize User
passport.deserializeUser(async (id, done) => {
  try {
    const user = await authModel.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

module.exports = passport;
