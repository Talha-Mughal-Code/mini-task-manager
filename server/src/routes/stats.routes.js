const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const { overview } = require('../controllers/stats.controller');

router.use(authenticate);
router.get('/overview', overview);

module.exports = router;
