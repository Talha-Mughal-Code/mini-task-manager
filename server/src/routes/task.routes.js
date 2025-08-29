const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const { createTask, listTasks, getTask, updateTask, deleteTask, createTaskValidator, updateTaskValidator, listTasksValidator } = require('../controllers/task.controller');

router.use(authenticate);
router.get('/', listTasksValidator, listTasks);
router.post('/', createTaskValidator, createTask);
router.get('/:id', getTask);
router.patch('/:id', updateTaskValidator, updateTask);
router.delete('/:id', deleteTask);

module.exports = router;
