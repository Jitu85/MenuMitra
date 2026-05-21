const jwt = require('jsonwebtoken');

// Authenticate generic token (both owners and admins)
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token missing. Authentication required.' });
  }

  // Try parsing as Owner secret or Admin secret
  let decodedUser = null;

  try {
    // Attempt parsing as Owner token
    decodedUser = jwt.verify(token, process.env.JWT_SECRET);
    decodedUser.role = 'owner';
  } catch (ownerErr) {
    try {
      // Attempt parsing as Admin token
      decodedUser = jwt.verify(token, process.env.JWT_ADMIN_SECRET);
      decodedUser.role = 'admin';
    } catch (adminErr) {
      return res.status(403).json({ message: 'Invalid or expired authentication token.' });
    }
  }

  req.user = decodedUser;
  next();
};

// Require Business Owner role
const requireOwner = (req, res, next) => {
  if (req.user && req.user.role === 'owner') {
    return next();
  }
  return res.status(403).json({ message: 'Access denied. Business Owner role required.' });
};

// Require Super Admin role
const requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({ message: 'Access denied. Super Admin role required.' });
};

module.exports = {
  authenticateToken,
  requireOwner,
  requireAdmin
};
