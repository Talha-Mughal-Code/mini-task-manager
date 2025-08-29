const router = require('express').Router();
const { authenticate, authorize, USER_ROLES } = require('../middleware/auth');
const { getUsers, updateUserRole, updateRoleValidator } = require('../controllers/user.controller');

router.use(authenticate, authorize(USER_ROLES.ADMIN));
router.get('/', getUsers);
router.patch('/:id/role', updateRoleValidator, updateUserRole);

module.exports = router;
