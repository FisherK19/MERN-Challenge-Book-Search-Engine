const jwt = require("jsonwebtoken");

// Set token secret and expiration date
const secret = 'mysecretsshhhhh';
const expiration = '2h';

module.exports = {
  authMiddleware: function ({ req }) {
    // Allows token to be sent via req.query or headers
    let token = req.body.token || req.query.token || req.headers.authorization;

    // Split token from Bearer string in header
    if (req.headers.authorization) {
      token = token.split(" ").pop().trim();
    }

    // Initialize an empty user object
    let user = null;

    // If no token, return the context without user data
    if (!token) {
      return { user };
    }

    // Verify token and get user data out of it
    try {
      const { data } = jwt.verify(token, secret, { maxAge: expiration });
      user = data;
    } catch {
      console.log("Invalid token");
    }

    // Return the modified request and user data for context
    return { user };
  },

  signToken: function ({ username, email, _id }) {
    const payload = { username, email, _id };
    return jwt.sign({ data: payload }, secret, { expiresIn: expiration });
  },
};
