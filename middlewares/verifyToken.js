const jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {
  const token = req.headers['authorization']?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  jwt.verify(token, 'your_secret_key_here', (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Failed to authenticate token' });
    }
    req.user = { userId: decoded.userId };
    next();
  });
}

module.exports = verifyToken;
