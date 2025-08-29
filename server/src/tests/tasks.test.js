const request = require('supertest');
const app = require('../app');
const User = require('../models/User');
const Task = require('../models/Task');
const jwt = require('jsonwebtoken');
const env = require('../config/env');

describe('Tasks', () => {
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

  describe('GET /tasks', () => {
    beforeEach(async () => {
      // Create test tasks
      await Task.create([
        { title: 'Task 1', status: 'todo', priority: 'high', userId: testUser._id },
        { title: 'Task 2', status: 'in-progress', priority: 'medium', userId: testUser._id },
        { title: 'Task 3', status: 'done', priority: 'low', userId: testUser._id }
      ]);
    });

    it('should return tasks for authenticated user', async () => {
      const response = await request(app)
        .get('/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.items).toHaveLength(3);
      expect(response.body.data.total).toBe(3);
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get('/tasks')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Unauthorized');
    });

    it('should filter by status', async () => {
      const response = await request(app)
        .get('/tasks?status=todo')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data.items).toHaveLength(1);
      expect(response.body.data.items[0].status).toBe('todo');
    });

    it('should filter by priority', async () => {
      const response = await request(app)
        .get('/tasks?priority=high')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data.items).toHaveLength(1);
      expect(response.body.data.items[0].priority).toBe('high');
    });

    it('should search by title', async () => {
      const response = await request(app)
        .get('/tasks?q=Task 1')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data.items).toHaveLength(1);
      expect(response.body.data.items[0].title).toBe('Task 1');
    });

    it('should paginate results', async () => {
      const response = await request(app)
        .get('/tasks?page=1&limit=2')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data.items).toHaveLength(2);
      expect(response.body.data.total).toBe(3);
    });
  });

  describe('POST /tasks', () => {
    it('should create a new task', async () => {
      const taskData = {
        title: 'New Task',
        description: 'Task description',
        status: 'todo',
        priority: 'medium'
      };

      const response = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send(taskData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.task.title).toBe(taskData.title);
      expect(response.body.data.task.userId).toBe(testUser._id.toString());
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .post('/tasks')
        .send({ title: 'New Task' })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /tasks/:id', () => {
    let testTask;

    beforeEach(async () => {
      testTask = await Task.create({
        title: 'Test Task',
        description: 'Test description',
        status: 'todo',
        priority: 'high',
        userId: testUser._id
      });
    });

    it('should return task by id', async () => {
      const response = await request(app)
        .get(`/tasks/${testTask._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.task.title).toBe('Test Task');
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get(`/tasks/${testTask._id}`)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should return 404 for non-existent task', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .get(`/tasks/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PATCH /tasks/:id', () => {
    let testTask;

    beforeEach(async () => {
      testTask = await Task.create({
        title: 'Test Task',
        status: 'todo',
        priority: 'low',
        userId: testUser._id
      });
    });

    it('should update task', async () => {
      const updates = {
        title: 'Updated Task',
        status: 'in-progress',
        priority: 'high'
      };

      const response = await request(app)
        .patch(`/tasks/${testTask._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updates)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.task.title).toBe(updates.title);
      expect(response.body.data.task.status).toBe(updates.status);
      expect(response.body.data.task.priority).toBe(updates.priority);
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .patch(`/tasks/${testTask._id}`)
        .send({ title: 'Updated' })
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /tasks/:id', () => {
    let testTask;

    beforeEach(async () => {
      testTask = await Task.create({
        title: 'Test Task',
        status: 'todo',
        priority: 'low',
        userId: testUser._id
      });
    });

    it('should delete task', async () => {
      const response = await request(app)
        .delete(`/tasks/${testTask._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Task deleted');

      // Verify task is deleted
      const deletedTask = await Task.findById(testTask._id);
      expect(deletedTask).toBeNull();
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .delete(`/tasks/${testTask._id}`)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });
});
