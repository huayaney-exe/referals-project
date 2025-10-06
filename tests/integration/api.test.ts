import request from 'supertest';
import app from '../../src/index';
import { supabaseAdmin } from '../../src/config/supabase';

describe('API Integration Tests', () => {
  let authToken: string;
  let businessId: string;
  let customerId: string;

  beforeAll(async () => {
    // Clean up test data - delete auth users first
    try {
      const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
      const testUser = existingUsers?.users.find((u) => u.email === 'api-test@example.com');
      if (testUser) {
        await supabaseAdmin.auth.admin.deleteUser(testUser.id);
      }
    } catch (error) {
      console.log('No existing auth user to clean up');
    }

    // Then delete business records
    await supabaseAdmin.from('businesses').delete().like('email', '%api-test@example.com%');
  });

  afterAll(async () => {
    // Clean up after tests
    if (businessId) {
      await supabaseAdmin.from('businesses').delete().eq('id', businessId);
    }

    // Clean up auth user
    try {
      const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
      const testUser = existingUsers?.users.find((u) => u.email === 'api-test@example.com');
      if (testUser) {
        await supabaseAdmin.auth.admin.deleteUser(testUser.id);
      }
    } catch (error) {
      console.log('Error cleaning up auth user');
    }
  });

  describe('Auth API', () => {
    it('should register a new business', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'api-test@example.com',
          password: 'SecurePass123',
          businessName: 'Test Business API',
          rewardStructure: {
            stamps_required: 10,
            reward_description: '1 free coffee',
          },
        });

      expect(response.status).toBe(201);
      expect(response.body.user.email).toBe('api-test@example.com');
      expect(response.body.business.name).toBe('Test Business API');
      businessId = response.body.business.id;
    });

    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'api-test@example.com',
          password: 'SecurePass123',
        });

      expect(response.status).toBe(200);
      expect(response.body.access_token).toBeDefined();
      authToken = response.body.access_token;
    });
  });

  describe('Enrollment API', () => {
    it('should enroll a new customer', async () => {
      const response = await request(app)
        .post('/api/v1/enrollments')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          phone: '+51 987 654 321',
          name: 'Test Customer',
        });

      expect(response.status).toBe(201);
      expect(response.body.customer.phone).toBe('+51 987 654 321');
      expect(response.body.customer.stamps_count).toBe(0);
      customerId = response.body.customer.id;
    });

    it('should check if customer exists', async () => {
      const response = await request(app)
        .get('/api/v1/enrollments/check?phone=%2B51%20987%20654%20321')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.exists).toBe(true);
      expect(response.body.customer.phone).toBe('+51 987 654 321');
    });
  });

  describe('Stamps API', () => {
    it('should add a stamp to customer', async () => {
      const response = await request(app)
        .post('/api/v1/stamps')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          customer_id: customerId,
        });

      expect(response.status).toBe(201);
      expect(response.body.stamp.new_stamps_count).toBe(1);
      expect(response.body.stamp.is_reward_earned).toBe(false);
    });

    it('should get stamp history', async () => {
      const response = await request(app)
        .get(`/api/v1/stamps/history/${customerId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.stamps).toHaveLength(1);
    });
  });

  describe('Customers API', () => {
    it('should list all customers', async () => {
      const response = await request(app)
        .get('/api/v1/customers')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.customers).toHaveLength(1);
      expect(response.body.customers[0].stamps_count).toBe(1);
    });

    it('should get customer by ID', async () => {
      const response = await request(app)
        .get(`/api/v1/customers/${customerId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.customer.id).toBe(customerId);
      expect(response.body.customer.stamps_count).toBe(1);
    });
  });

  describe('Health Checks', () => {
    it('should return alive status', async () => {
      const response = await request(app).get('/health/live');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('alive');
    });

    it('should return ready status', async () => {
      const response = await request(app).get('/health/ready');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('ready');
      expect(response.body.services.database).toBe('connected');
    });
  });
});
