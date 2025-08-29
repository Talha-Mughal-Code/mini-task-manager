const request = require('supertest');
const app = require('../app');
const User = require('../models/User');
const Task = require('../models/Task');
const jwt = require('jsonwebtoken');
const env = require('../config/env');
const dayjs = require('dayjs');

describe('Stats', () => {
  let authToken;
  let testUser;

  beforeEach(async () => {
    // Create test user
    testUser = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      passwordHash: '$2b$10$test.hash.for.testing'
    });

    // Generate auth token
    authToken = jwt.sign(
      { sub: testUser._id.toString(), role: testUser.role },
      env.jwtSecret,
      { expiresIn: '1h' }
    );
  });

  describe('GET /stats/overview', () => {
    beforeEach(async () => {
      // Create test tasks with different statuses, priorities, and due dates
      const now = dayjs();
      const overdueDate = now.subtract(1, 'day');
      const futureDate = now.add(1, 'day');

      await Task.create([
        {
          title: 'Overdue Task 1',
          status: 'todo',
          priority: 'high',
          userId: testUser._id,
          dueDate: overdueDate.toDate()
        },
        {
          title: 'Overdue Task 2',
          status: 'in-progress',
          priority: 'medium',
          userId: testUser._id,
          dueDate: overdueDate.toDate()
        },
        {
          title: 'Current Task 1',
          status: 'todo',
          priority: 'low',
          userId: testUser._id,
          dueDate: futureDate.toDate()
        },
        {
          title: 'Current Task 2',
          status: 'in-progress',
          priority: 'high',
          userId: testUser._id,
          dueDate: futureDate.toDate()
        },
        {
          title: 'Completed Task',
          status: 'done',
          priority: 'medium',
          userId: testUser._id,
          dueDate: futureDate.toDate()
        }
      ]);
    });

    it('should return stats for authenticated user', async () => {
      const response = await request(app)
        .get('/stats/overview')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('overdue');
      expect(response.body.data).toHaveProperty('byStatus');
      expect(response.body.data).toHaveProperty('byPriority');
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get('/stats/overview')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Unauthorized');
    });

    it('should count overdue tasks correctly', async () => {
      const response = await request(app)
        .get('/stats/overview')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data.overdue).toBe(2);
    });

    it('should count tasks by status correctly', async () => {
      const response = await request(app)
        .get('/stats/overview')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const byStatus = response.body.data.byStatus;
      
      // Find counts for each status
      const todoCount = byStatus.find(s => s._id === 'todo')?.count || 0;
      const inProgressCount = byStatus.find(s => s._id === 'in-progress')?.count || 0;
      const doneCount = byStatus.find(s => s._id === 'done')?.count || 0;

      expect(todoCount).toBe(2); // Overdue Task 1 + Current Task 1
      expect(inProgressCount).toBe(2); // Overdue Task 2 + Current Task 2
      expect(doneCount).toBe(1); // Completed Task
    });

    it('should count tasks by priority correctly', async () => {
      const response = await request(app)
        .get('/stats/overview')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const byPriority = response.body.data.byPriority;
      
      // Find counts for each priority
      const highCount = byPriority.find(p => p._id === 'high')?.count || 0;
      const mediumCount = byPriority.find(p => p._id === 'medium')?.count || 0;
      const lowCount = byPriority.find(p => p._id === 'low')?.count || 0;

      expect(highCount).toBe(2); // Overdue Task 1 + Current Task 2
      expect(mediumCount).toBe(2); // Overdue Task 2 + Completed Task
      expect(lowCount).toBe(1); // Current Task 1
    });

    it('should only return stats for the authenticated user', async () => {
      // Create another user with tasks
      const otherUser = await User.create({
        name: 'Other User',
        email: 'other@example.com',
        passwordHash: '$2b$10$test.hash.for.testing'
      });

      await Task.create({
        title: 'Other User Task',
        status: 'todo',
        priority: 'high',
        userId: otherUser._id
      });

      const response = await request(app)
        .get('/stats/overview')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Should not include other user's task
      expect(response.body.data.overdue).toBe(2);
      
      const byStatus = response.body.data.byStatus;
      const todoCount = byStatus.find(s => s._id === 'todo')?.count || 0;
      expect(todoCount).toBe(2); // Only current user's tasks
    });

    it('should handle empty task list', async () => {
      // Clear all tasks
      await Task.deleteMany({});

      const response = await request(app)
        .get('/stats/overview')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data.overdue).toBe(0);
      expect(response.body.data.byStatus).toHaveLength(0);
      expect(response.body.data.byPriority).toHaveLength(0);
    });
  });
});
