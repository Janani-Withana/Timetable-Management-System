// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const fs = require('fs');
const secretKeyPath = 'secret.key'

const authenticateUser = (req, res, next) => {
  const token = req.header('Authorization');
  const secretKey = fs.readFileSync(secretKeyPath, 'utf-8');
  console.log("secret key at authMiddleware:",secretKey)

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized - No token provided' });
  }

  try {
    const decoded = jwt.verify(token, secretKey); // Same secret key used for token generation
    console.log(decoded);
    req.userId = decoded.userId;
    req.userRole = decoded.role;
    next();
  } catch (error) {
    console.error('Authentication Error:', error);
    return res.status(401).json({ message: 'Unauthorized - Invalid token' });
  }
};

module.exports = authenticateUser;

