// middleware/authenticator.js
const authenticator = (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Login required" });
    }
    next();
  };
  
  module.exports = authenticator;
  