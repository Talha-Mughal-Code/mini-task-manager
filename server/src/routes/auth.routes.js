const router = require('express').Router();
const { register, login, logout, registerValidator, loginValidator } = require('../controllers/auth.controller');

router.post('/register', registerValidator, register);
router.post('/login', loginValidator, login);
router.post('/logout', logout);

module.exports = router;
