import nock from 'nock';
import { EvolutionInstanceManager } from '../../../src/infrastructure/whatsapp/EvolutionInstanceManager';

// Mock environment variables
process.env.EVOLUTION_API_URL = 'https://test-evolution-api.com';
process.env.EVOLUTION_API_KEY = 'test-api-key-123';
process.env.FRONTEND_URL = 'https://test-api.com';

describe('EvolutionInstanceManager', () => {
  let manager: EvolutionInstanceManager;

  beforeEach(() => {
    manager = new EvolutionInstanceManager();
    nock.cleanAll();
  });

  afterEach(() => {
    nock.cleanAll();
  });

  describe('generateInstanceName', () => {
    it('should generate unique instance name from business ID', () => {
      const businessId = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
      const instanceName = manager.generateInstanceName(businessId);

      expect(instanceName).toBe('business_a1b2c3d4e5f67890abcdef1234567890');
      expect(instanceName).not.toContain('-');
      expect(instanceName).toMatch(/^business_[a-f0-9]{32}$/);
    });

    it('should handle UUID with uppercase letters', () => {
      const businessId = 'A1B2C3D4-E5F6-7890-ABCD-EF1234567890';
      const instanceName = manager.generateInstanceName(businessId);

      expect(instanceName).toBe('business_a1b2c3d4e5f67890abcdef1234567890');
      expect(instanceName).toMatch(/^[a-z0-9_]+$/); // all lowercase
    });
  });

  describe('createInstance', () => {
    it('should create Evolution API instance successfully', async () => {
      const businessId = 'test-business-123';

      nock('https://test-evolution-api.com')
        .post('/instance/create', {
          instanceName: 'business_testbusiness123',
          qrcode: true,
          integration: 'WHATSAPP-BAILEYS',
        })
        .reply(201, {
          instance: {
            instanceName: 'business_testbusiness123',
            state: 'created',
            serverUrl: 'https://test-evolution-api.com',
          },
        });

      const result = await manager.createInstance(businessId);

      expect(result.instanceName).toBe('business_testbusiness123');
      expect(result.status).toBe('created');
      expect(result.apikey).toBe('test-api-key-123');
    });

    it('should throw INSTANCE_ALREADY_EXISTS on 409 conflict', async () => {
      const businessId = 'existing-business';

      nock('https://test-evolution-api.com')
        .post('/instance/create')
        .reply(409, { message: 'Instance already exists' });

      await expect(manager.createInstance(businessId)).rejects.toThrow('INSTANCE_ALREADY_EXISTS');
    });

    it('should throw INVALID_API_KEY on 401 unauthorized', async () => {
      const businessId = 'test-business';

      nock('https://test-evolution-api.com')
        .post('/instance/create')
        .reply(401, { message: 'Unauthorized' });

      await expect(manager.createInstance(businessId)).rejects.toThrow('INVALID_API_KEY');
    });
  });

  describe('getQRCode', () => {
    it('should fetch QR code for instance', async () => {
      const instanceName = 'business_test123';
      const mockQRCode = 'data:image/png;base64,iVBORw0KGgoAAAANS';

      nock('https://test-evolution-api.com')
        .get(`/instance/connect/${instanceName}`)
        .reply(200, {
          qrcode: {
            base64: mockQRCode,
            code: 'some-qr-code-string',
          },
        });

      const qrCode = await manager.getQRCode(instanceName);

      expect(qrCode).toBe(mockQRCode);
    });

    it('should throw INSTANCE_NOT_FOUND on 404', async () => {
      const instanceName = 'nonexistent_instance';

      nock('https://test-evolution-api.com')
        .get(`/instance/connect/${instanceName}`)
        .reply(404, { message: 'Instance not found' });

      await expect(manager.getQRCode(instanceName)).rejects.toThrow('INSTANCE_NOT_FOUND');
    });

    it('should throw QR_CODE_NOT_AVAILABLE if no QR in response', async () => {
      const instanceName = 'business_test123';

      nock('https://test-evolution-api.com')
        .get(`/instance/connect/${instanceName}`)
        .reply(200, { instance: { state: 'open' } });

      await expect(manager.getQRCode(instanceName)).rejects.toThrow('QR_CODE_NOT_AVAILABLE');
    });
  });

  describe('checkConnection', () => {
    it('should return connected status when state is open', async () => {
      const instanceName = 'business_test123';

      nock('https://test-evolution-api.com')
        .get(`/instance/connectionState/${instanceName}`)
        .reply(200, {
          instance: {
            state: 'open',
          },
        });

      const status = await manager.checkConnection(instanceName);

      expect(status.instance).toBe(instanceName);
      expect(status.state).toBe('open');
      expect(status.connected).toBe(true);
    });

    it('should return not connected when state is close', async () => {
      const instanceName = 'business_test123';

      nock('https://test-evolution-api.com')
        .get(`/instance/connectionState/${instanceName}`)
        .reply(200, {
          instance: {
            state: 'close',
          },
        });

      const status = await manager.checkConnection(instanceName);

      expect(status.connected).toBe(false);
      expect(status.state).toBe('close');
    });

    it('should throw INSTANCE_NOT_FOUND on 404', async () => {
      const instanceName = 'nonexistent_instance';

      nock('https://test-evolution-api.com')
        .get(`/instance/connectionState/${instanceName}`)
        .reply(404, { message: 'Instance not found' });

      await expect(manager.checkConnection(instanceName)).rejects.toThrow('INSTANCE_NOT_FOUND');
    });
  });

  describe('setWebhook', () => {
    it('should configure webhook for instance', async () => {
      const instanceName = 'business_test123';

      nock('https://test-evolution-api.com')
        .post(`/webhook/set/${instanceName}`, {
          enabled: true,
          url: 'https://test-api.com/api/v1/webhooks/evolution',
          webhookByEvents: true,
          events: ['MESSAGES_UPSERT', 'MESSAGES_UPDATE', 'SEND_MESSAGE', 'CONNECTION_UPDATE'],
        })
        .reply(200, { message: 'Webhook configured' });

      await expect(manager.setWebhook(instanceName)).resolves.not.toThrow();
    });

    it('should allow custom webhook URL', async () => {
      const instanceName = 'business_test123';
      const customUrl = 'https://custom-webhook.com/hook';

      nock('https://test-evolution-api.com')
        .post(`/webhook/set/${instanceName}`, (body) => {
          return body.url === customUrl;
        })
        .reply(200);

      await expect(manager.setWebhook(instanceName, customUrl)).resolves.not.toThrow();
    });

    it('should throw INSTANCE_NOT_FOUND on 404', async () => {
      const instanceName = 'nonexistent_instance';

      nock('https://test-evolution-api.com')
        .post(`/webhook/set/${instanceName}`)
        .reply(404, { message: 'Instance not found' });

      await expect(manager.setWebhook(instanceName)).rejects.toThrow('INSTANCE_NOT_FOUND');
    });
  });

  describe('deleteInstance', () => {
    it('should delete instance successfully', async () => {
      const instanceName = 'business_test123';

      nock('https://test-evolution-api.com')
        .delete(`/instance/delete/${instanceName}`)
        .reply(200, { message: 'Instance deleted' });

      await expect(manager.deleteInstance(instanceName)).resolves.not.toThrow();
    });

    it('should not throw error if instance already deleted (404)', async () => {
      const instanceName = 'already_deleted';

      nock('https://test-evolution-api.com')
        .delete(`/instance/delete/${instanceName}`)
        .reply(404, { message: 'Instance not found' });

      await expect(manager.deleteInstance(instanceName)).resolves.not.toThrow();
    });

    it('should throw INVALID_API_KEY on 401', async () => {
      const instanceName = 'business_test123';

      nock('https://test-evolution-api.com')
        .delete(`/instance/delete/${instanceName}`)
        .reply(401, { message: 'Unauthorized' });

      await expect(manager.deleteInstance(instanceName)).rejects.toThrow('INVALID_API_KEY');
    });
  });
});
