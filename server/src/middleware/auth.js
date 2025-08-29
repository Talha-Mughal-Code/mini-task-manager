const jwt = require('jsonwebtoken');
const env = require('../config/env');
const User = require('../models/User');
const { USER_ROLES } = require('../utils/constants');

async function authenticate(req, res, next) {
  try {
    let token;
    if (env.useCookieAuth && req.cookies && req.cookies.token) {
      token = req.cookies.token;
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const payload = jwt.verify(token, env.jwtSecret);
    const user = await User.findById(payload.sub).select('-passwordHash');
    if (!user) return res.status(401).json({ success: false, message: 'Unauthorized' });

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
}

function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });
    if (allowedRoles.length === 0 || allowedRoles.includes(req.user.role)) return next();
    return res.status(403).json({ success: false, message: 'Forbidden' });
  };
}

module.exports = { authenticate, authorize, USER_ROLES };
