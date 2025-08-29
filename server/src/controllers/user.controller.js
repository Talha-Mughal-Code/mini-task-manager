const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { USER_ROLES } = require('../utils/constants');
const { ok } = require('../utils/response');

const updateRoleValidator = [
  body('role').isIn(Object.values(USER_ROLES)),
];

async function getUsers(req, res, next) {
  try {
    const users = await User.find().select('-passwordHash');
    return ok(res, { users });
  } catch (err) { next(err); }
}

async function updateUserRole(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    const { id } = req.params;
    const { role } = req.body;

    const user = await User.findByIdAndUpdate(id, { role }, { new: true }).select('-passwordHash');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    return ok(res, { user });
  } catch (err) { next(err); }
}

module.exports = { getUsers, updateUserRole, updateRoleValidator };
