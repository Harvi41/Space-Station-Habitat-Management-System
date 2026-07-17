const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  try {
    // 1. Get token from header
    const authHeader = req.header("Authorization");

    if (!authHeader) {
      return res.status(401).json({ msg: "No token, access denied" });
    }

    // 2. Remove "Bearer " if present
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.replace("Bearer ", "")
      : authHeader;

    // 3. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4. Attach user info
    req.user = decoded;

    // 5. Continue
    next();

  } catch (err) {
    res.status(401).json({ msg: "Invalid token" });
  }
};

module.exports = auth;