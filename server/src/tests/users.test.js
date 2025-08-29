const request = require('supertest');
const app = require('../app');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const env = require('../config/env');
const { USER_ROLES } = require('../utils/constants');

describe('Users', () => {
  let adminToken;
  let memberToken;
  let adminUser;
  let memberUser;

  beforeEach(async () => {
    // Create admin user
    adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      passwordHash: '$2b$10$test.hash.for.testing',
      role: USER_ROLES.ADMIN
    });

    // Create member user
    memberUser = await User.create({
      name: 'Member User',
      email: 'member@example.com',
      passwordHash: '$2b$10$test.hash.for.testing',
      role: USER_ROLES.MEMBER
    });

    // Generate tokens
    adminToken = jwt.sign(
      { sub: adminUser._id.toString(), role: USER_ROLES.ADMIN },
      env.jwtSecret,
      { expiresIn: '1h' }
    );

    memberToken = jwt.sign(
      { sub: memberUser._id.toString(), role: USER_ROLES.MEMBER },
      env.jwtSecret,
      { expiresIn: '1h' }
    );
  });

  describe('GET /users', () => {
    it('should return all users for admin', async () => {
      const response = await request(app)
        .get('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.users).toHaveLength(2);
      expect(response.body.data.users).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            name: 'Admin User',
            email: 'admin@example.com',
            role: USER_ROLES.ADMIN
          }),
          expect.objectContaining({
            name: 'Member User',
            email: 'member@example.com',
            role: USER_ROLES.MEMBER
          })
        ])
      );
    });

    it('should not return password hashes', async () => {
      const response = await request(app)
        .get('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      response.body.data.users.forEach(user => {
        expect(user).not.toHaveProperty('passwordHash');
      });
    });

    it('should require admin role', async () => {
      const response = await request(app)
        .get('/users')
        .set('Authorization', `Bearer ${memberToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Forbidden');
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get('/users')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Unauthorized');
    });
  });

  describe('PATCH /users/:id/role', () => {
    it('should update user role for admin', async () => {
      const response = await request(app)
        .patch(`/users/${memberUser._id}/role`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ role: USER_ROLES.ADMIN })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.role).toBe(USER_ROLES.ADMIN);

      // Verify in database
      const updatedUser = await User.findById(memberUser._id);
      expect(updatedUser.role).toBe(USER_ROLES.ADMIN);
    });

    it('should validate role values', async () => {
      const response = await request(app)
        .patch(`/users/${memberUser._id}/role`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ role: 'invalid-role' })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should require admin role', async () => {
      const response = await request(app)
        .patch(`/users/${adminUser._id}/role`)
        .set('Authorization', `Bearer ${memberToken}`)
        .send({ role: USER_ROLES.MEMBER })
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Forbidden');
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .patch(`/users/${memberUser._id}/role`)
        .send({ role: USER_ROLES.ADMIN })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should return 404 for non-existent user', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .patch(`/users/${fakeId}/role`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ role: USER_ROLES.ADMIN })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('User not found');
    });
  });

  describe('Role-based access control', () => {
    it('should prevent member from accessing admin routes', async () => {
      // Try to get users
      const getUsersResponse = await request(app)
        .get('/users')
        .set('Authorization', `Bearer ${memberToken}`)
        .expect(403);

      // Try to update role
      const updateRoleResponse = await request(app)
        .patch(`/users/${adminUser._id}/role`)
        .set('Authorization', `Bearer ${memberToken}`)
        .send({ role: USER_ROLES.MEMBER })
        .expect(403);

      expect(getUsersResponse.body.message).toBe('Forbidden');
      expect(updateRoleResponse.body.message).toBe('Forbidden');
    });

    it('should allow admin to access all routes', async () => {
      // Get users
      const getUsersResponse = await request(app)
        .get('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      // Update role
      const updateRoleResponse = await request(app)
        .patch(`/users/${memberUser._id}/role`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ role: USER_ROLES.ADMIN })
        .expect(200);

      expect(getUsersResponse.body.success).toBe(true);
      expect(updateRoleResponse.body.success).toBe(true);
    });
  });
});
