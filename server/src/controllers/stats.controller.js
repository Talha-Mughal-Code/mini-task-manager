const Task = require('../models/Task');
const { ok } = require('../utils/response');

async function overview(req, res, next) {
  try {
    const match = req.user.role === 'admin' ? {} : { assignee: req.user._id };

    const [byStatus, byPriority, overdue] = await Promise.all([
      Task.aggregate([{ $match: match }, { $group: { _id: '$status', count: { $sum: 1 } } }]),
      Task.aggregate([{ $match: match }, { $group: { _id: '$priority', count: { $sum: 1 } } }]),
      Task.countDocuments({ ...match, dueDate: { $lt: new Date() }, status: { $ne: 'done' } }),
    ]);

    return ok(res, { byStatus, byPriority, overdue });
  } catch (err) { next(err); }
}

module.exports = { overview };
