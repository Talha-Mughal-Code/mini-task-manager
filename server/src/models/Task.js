const mongoose = require('mongoose');
const { TASK_STATUSES, TASK_PRIORITIES } = require('../utils/constants');

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    status: { type: String, enum: TASK_STATUSES, default: 'todo' },
    priority: { type: String, enum: TASK_PRIORITIES, default: 'medium' },
    dueDate: { type: Date },
    tags: { type: [String], default: [] },
    assignee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    activity: [
      {
        type: { type: String, enum: ['create', 'update', 'delete'] },
        at: { type: Date, default: Date.now },
        by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        changes: { type: Object },
      },
    ],
  },
  { timestamps: true }
);

// Useful indexes for filtering
taskSchema.index({ assignee: 1, status: 1, priority: 1, dueDate: 1 });
taskSchema.index({ title: 'text', description: 'text', tags: 'text' });

const Task = mongoose.model('Task', taskSchema);
module.exports = Task;
