const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  // 1. Get the token from the request header
  const token = req.header('Authorization');

  // 2. Check if no token is provided
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    // 3. Verify the token 
    const decoded = jwt.verify(token.split(' ')[1] || token, process.env.JWT_SECRET || 'fallback_secret_key');
    
    // 4. THE FIX: Intelligently grab the user data!
    // If it's a new token, it uses decoded.user. If it's your old stuck token, it just uses decoded.
    req.user = decoded.user || decoded;
    
    // Safety check to ensure we actually got the tenantId
    if (!req.user || !req.user.tenantId) {
      return res.status(401).json({ message: 'Invalid token structure. Please log in again.' });
    }

    next(); 
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};