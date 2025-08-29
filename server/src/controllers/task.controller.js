const { body, query, param, validationResult } = require('express-validator');
const Task = require('../models/Task');
const { ok, created } = require('../utils/response');
const { USER_ROLES } = require('../utils/constants');

const createTaskValidator = [
  body('title').isString().trim().notEmpty(),
  body('description').optional().isString(),
  body('status').optional().isString(),
  body('priority').optional().isString(),
  body('dueDate').optional().isISO8601(),
  body('tags').optional().isArray(),
  body('assignee').optional().isString(),
];

const updateTaskValidator = [
  param('id').isMongoId(),
  body('title').optional().isString(),
  body('description').optional().isString(),
  body('status').optional().isString(),
  body('priority').optional().isString(),
  body('dueDate').optional().isISO8601(),
  body('tags').optional().isArray(),
  body('assignee').optional().isString(),
];

const listTasksValidator = [
  query('q').optional().isString(),
  query('status').optional().isString(),
  query('priority').optional().isString(),
  query('assignee').optional().isString(),
  query('sort').optional().isString(),
  query('page').optional().toInt(),
  query('limit').optional().toInt(),
];

async function createTask(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    const body = req.body;
    const assignee = body.assignee || req.user._id;
    const task = await Task.create({ ...body, assignee, activity: [{ type: 'create', by: req.user._id, changes: body }] });
    return created(res, { task });
  } catch (err) { next(err); }
}

async function listTasks(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    const { q, status, priority, assignee, sort = '-createdAt', page = 1, limit = 10 } = req.query;

    const filter = {};
    if (req.user.role !== USER_ROLES.ADMIN) {
      filter.assignee = req.user._id;
    } else if (assignee) {
      filter.assignee = assignee;
    }
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (q) filter.$text = { $search: q };

    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      Task.find(filter).sort(sort).skip(skip).limit(limit),
      Task.countDocuments(filter),
    ]);

    return ok(res, { items, total, page: Number(page), limit: Number(limit) });
  } catch (err) { next(err); }
}

async function getTask(req, res, next) {
  try {
    const { id } = req.params;
    const task = await Task.findById(id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    if (req.user.role !== USER_ROLES.ADMIN && task.assignee.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    return ok(res, { task });
  } catch (err) { next(err); }
}

async function updateTask(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    const { id } = req.params;
    const update = req.body;
    const task = await Task.findById(id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    if (req.user.role !== USER_ROLES.ADMIN && task.assignee.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    const old = task.toObject();
    Object.assign(task, update);
    task.activity.push({ type: 'update', by: req.user._id, changes: update });
    await task.save();

    return ok(res, { task });
  } catch (err) { next(err); }
}

async function deleteTask(req, res, next) {
  try {
    const { id } = req.params;
    const task = await Task.findById(id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    if (req.user.role !== USER_ROLES.ADMIN && task.assignee.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    task.activity.push({ type: 'delete', by: req.user._id, changes: {} });
    await task.deleteOne();
    return ok(res, { message: 'Deleted' });
  } catch (err) { next(err); }
}

module.exports = { createTask, listTasks, getTask, updateTask, deleteTask, createTaskValidator, updateTaskValidator, listTasksValidator };
