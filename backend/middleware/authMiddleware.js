const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  // 1. Get the token from the request header
  const token = req.header('Authorization');

  // 2. Check if no token is provided
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    // 3. Verify the token (Expects the format "Bearer <token>")
    const decoded = jwt.verify(token.split(' ')[1] || token, process.env.JWT_SECRET || 'fallback_secret_key');
    
    // 4. Attach the user payload to the request object
    req.user = decoded.user;
    next(); // Move on to the next function/route
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};