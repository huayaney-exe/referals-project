import request from 'supertest';
import nock from 'nock';
import app from '../../src/index';
import { supabaseAdmin } from '../../src/config/supabase';

// Mock Evolution API credentials
process.env.EVOLUTION_API_URL = 'https://test-evolution-api.com';
process.env.EVOLUTION_API_KEY = 'test-evolution-key-123';

describe('Auth Registration with Evolution API Integration Tests', () => {
  let testBusinessEmail: string;
  let testBusinessId: string;

  beforeEach(() => {
    testBusinessEmail = `test-${Date.now()}@example.com`;
    nock.cleanAll();
  });

  afterEach(async () => {
    // Cleanup test data
    if (testBusinessId) {
      await supabaseAdmin.from('businesses').delete().eq('id', testBusinessId);
      await supabaseAdmin.auth.admin.deleteUser(testBusinessId);
    }
  });

  describe('POST /api/v1/auth/register', () => {
    it('should register business and create Evolution instance with QR code', async () => {
      // Mock Evolution API responses
      nock('https://test-evolution-api.com')
        .post('/instance/create', (body) => {
          return (
            body.instanceName.startsWith('business_') &&
            body.qrcode === true &&
            body.integration === 'WHATSAPP-BAILEYS'
          );
        })
        .reply(201, {
          instance: {
            instanceName: 'business_test123',
            state: 'created',
            serverUrl: 'https://test-evolution-api.com',
          },
        });

      nock('https://test-evolution-api.com')
        .get(/\/instance\/connect\/business_.*/)
        .reply(200, {
          qrcode: {
            base64:
              'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
            code: 'test-qr-code-string',
          },
        });

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: testBusinessEmail,
          password: 'SecurePass123!',
          businessName: 'Test Cafe',
          phone: '+51 987 654 321',
          rewardStructure: {
            stamps_required: 10,
            reward_description: '1 free coffee',
          },
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('business');
      expect(response.body).toHaveProperty('whatsapp');

      // Validate user data
      expect(response.body.user.email).toBe(testBusinessEmail);
      expect(response.body.user.businessId).toBeTruthy();

      // Validate business data
      expect(response.body.business.name).toBe('Test Cafe');
      expect(response.body.business.email).toBe(testBusinessEmail);

      // Validate WhatsApp instance data
      expect(response.body.whatsapp.status).toBe('awaiting_connection');
      expect(response.body.whatsapp.instance_name).toMatch(/^business_[a-f0-9]{32}$/);
      expect(response.body.whatsapp.qr_code).toContain('data:image/png;base64');
      expect(response.body.whatsapp.instructions).toBeTruthy();

      testBusinessId = response.body.business.id;

      // Verify database was updated with Evolution instance details
      const { data: business } = await supabaseAdmin
        .from('businesses')
        .select('evolution_instance_name, evolution_qr_code, evolution_connected')
        .eq('id', testBusinessId)
        .single();

      expect(business?.evolution_instance_name).toMatch(/^business_[a-f0-9]{32}$/);
      expect(business?.evolution_qr_code).toContain('data:image/png;base64');
      expect(business?.evolution_connected).toBe(false);
    });

    it('should register business successfully even if Evolution API fails', async () => {
      // Mock Evolution API to fail
      nock('https://test-evolution-api.com')
        .post('/instance/create')
        .reply(500, { message: 'Internal server error' });

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: testBusinessEmail,
          password: 'SecurePass123!',
          businessName: 'Test Restaurant',
          rewardStructure: {
            stamps_required: 8,
            reward_description: '1 free meal',
          },
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('business');
      expect(response.body).toHaveProperty('whatsapp');

      // WhatsApp setup should indicate failure but not block registration
      expect(response.body.whatsapp.status).toBe('setup_failed');
      expect(response.body.whatsapp.message).toContain('retry from settings');

      testBusinessId = response.body.business.id;
    });

    it('should reject registration with invalid email format', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'invalid-email',
          password: 'SecurePass123!',
          businessName: 'Test Cafe',
          rewardStructure: {
            stamps_required: 10,
            reward_description: '1 free coffee',
          },
        });

      expect(response.status).toBe(400);
    });

    it('should reject registration with weak password', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: testBusinessEmail,
          password: 'weak',
          businessName: 'Test Cafe',
          rewardStructure: {
            stamps_required: 10,
            reward_description: '1 free coffee',
          },
        });

      expect(response.status).toBe(400);
    });

    it('should reject registration with missing reward structure', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: testBusinessEmail,
          password: 'SecurePass123!',
          businessName: 'Test Cafe',
        });

      expect(response.status).toBe(400);
    });

    it('should handle Evolution API instance already exists error', async () => {
      // Mock Evolution API to return 409 Conflict
      nock('https://test-evolution-api.com')
        .post('/instance/create')
        .reply(409, { message: 'Instance already exists' });

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: testBusinessEmail,
          password: 'SecurePass123!',
          businessName: 'Test Shop',
          rewardStructure: {
            stamps_required: 12,
            reward_description: '10% discount',
          },
        });

      expect(response.status).toBe(201);
      expect(response.body.whatsapp.status).toBe('setup_failed');
      expect(response.body.whatsapp.error).toContain('INSTANCE_ALREADY_EXISTS');

      testBusinessId = response.body.business.id;
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('should login successfully with valid credentials', async () => {
      // First create a test user
      const registerEmail = `login-test-${Date.now()}@example.com`;

      nock('https://test-evolution-api.com').post('/instance/create').reply(201, {});
      nock('https://test-evolution-api.com').get(/\/instance\/connect\/.*/).reply(200, {
        qrcode: { base64: 'test-qr', code: 'test' },
      });

      const registerResponse = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: registerEmail,
          password: 'TestPassword123!',
          businessName: 'Login Test Cafe',
          rewardStructure: {
            stamps_required: 10,
            reward_description: '1 free coffee',
          },
        });

      testBusinessId = registerResponse.body.business.id;

      // Now test login
      const loginResponse = await request(app).post('/api/v1/auth/login').send({
        email: registerEmail,
        password: 'TestPassword123!',
      });

      expect(loginResponse.status).toBe(200);
      expect(loginResponse.body).toHaveProperty('access_token');
      expect(loginResponse.body).toHaveProperty('refresh_token');
      expect(loginResponse.body).toHaveProperty('expires_in');
      expect(loginResponse.body.user.email).toBe(registerEmail);
    });

    it('should reject login with invalid credentials', async () => {
      const response = await request(app).post('/api/v1/auth/login').send({
        email: 'nonexistent@example.com',
        password: 'WrongPassword123!',
      });

      expect(response.status).toBe(401);
      expect(response.body.error.code).toBe('INVALID_CREDENTIALS');
    });

    it('should reject login with invalid email format', async () => {
      const response = await request(app).post('/api/v1/auth/login').send({
        email: 'invalid-email',
        password: 'Password123!',
      });

      expect(response.status).toBe(400);
    });
  });
});
