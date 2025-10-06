import nock from 'nock';
import { EvolutionWhatsAppService } from '../../src/infrastructure/whatsapp/EvolutionWhatsAppService';

// Mock environment variables
process.env.EVOLUTION_API_URL = 'https://test-evolution-api.com';
process.env.EVOLUTION_API_KEY = 'test-api-key-123';

describe('Evolution WhatsApp Service Integration Tests', () => {
  let service: EvolutionWhatsAppService;

  beforeEach(() => {
    service = new EvolutionWhatsAppService();
    nock.cleanAll();
  });

  afterEach(() => {
    nock.cleanAll();
  });

  describe('sendMessage', () => {
    it('should send WhatsApp message successfully', async () => {
      const mockResponse = {
        key: {
          remoteJid: '51987654321@s.whatsapp.net',
          fromMe: true,
          id: 'msg_123456789',
        },
        message: {
          conversation: '¡Hola! Tu sello ha sido agregado.',
        },
        messageTimestamp: Date.now(),
        status: 'pending',
      };

      nock('https://test-evolution-api.com')
        .post('/message/sendText/business_test123', (body) => {
          return (
            body.number === '51987654321' &&
            body.textMessage.text === '¡Hola! Tu sello ha sido agregado.'
          );
        })
        .reply(201, mockResponse);

      const result = await service.sendMessage({
        instanceName: 'business_test123',
        phone: '+51 987 654 321',
        text: '¡Hola! Tu sello ha sido agregado.',
      });

      expect(result.key.id).toBe('msg_123456789');
      expect(result.key.remoteJid).toBe('51987654321@s.whatsapp.net');
    });

    it('should throw INSTANCE_NOT_FOUND on 404', async () => {
      nock('https://test-evolution-api.com')
        .post('/message/sendText/nonexistent_instance')
        .reply(404, { message: 'Instance not found' });

      await expect(
        service.sendMessage({
          instanceName: 'nonexistent_instance',
          phone: '+51 987 654 321',
          text: 'Test message',
        })
      ).rejects.toThrow('INSTANCE_NOT_FOUND');
    });

    it('should throw INVALID_API_KEY on 401', async () => {
      nock('https://test-evolution-api.com')
        .post('/message/sendText/business_test123')
        .reply(401, { message: 'Unauthorized' });

      await expect(
        service.sendMessage({
          instanceName: 'business_test123',
          phone: '+51 987 654 321',
          text: 'Test message',
        })
      ).rejects.toThrow('INVALID_API_KEY');
    });

    it('should throw INVALID_PHONE_NUMBER on 400', async () => {
      nock('https://test-evolution-api.com')
        .post('/message/sendText/business_test123')
        .reply(400, { message: 'Invalid phone number' });

      await expect(
        service.sendMessage({
          instanceName: 'business_test123',
          phone: 'invalid-phone',
          text: 'Test message',
        })
      ).rejects.toThrow('INVALID_PHONE_NUMBER');
    });

    it('should throw INSTANCE_NOT_CONNECTED when instance is not connected', async () => {
      nock('https://test-evolution-api.com')
        .post('/message/sendText/business_test123')
        .reply(400, { message: 'Instance is not connected' });

      await expect(
        service.sendMessage({
          instanceName: 'business_test123',
          phone: '+51 987 654 321',
          text: 'Test message',
        })
      ).rejects.toThrow('INSTANCE_NOT_CONNECTED');
    });
  });

  describe('formatPhoneNumber', () => {
    it('should format Peru phone numbers correctly', () => {
      expect(service.formatPhoneNumber('+51 987 654 321')).toBe('51987654321');
      expect(service.formatPhoneNumber('+51987654321')).toBe('51987654321');
      expect(service.formatPhoneNumber('51 987 654 321')).toBe('51987654321');
      expect(service.formatPhoneNumber('51987654321')).toBe('51987654321');
    });

    it('should add country code to numbers starting with 9', () => {
      expect(service.formatPhoneNumber('987654321')).toBe('51987654321');
    });

    it('should throw error for invalid phone format', () => {
      expect(() => service.formatPhoneNumber('+1 555 123 4567')).toThrow('INVALID_PHONE_FORMAT');
      expect(() => service.formatPhoneNumber('123456789')).toThrow('INVALID_PHONE_FORMAT');
    });

    it('should throw error for non-Peru mobile numbers', () => {
      expect(() => service.formatPhoneNumber('+51 812 345 678')).toThrow(
        'INVALID_PERU_PHONE_FORMAT'
      );
      expect(() => service.formatPhoneNumber('51812345678')).toThrow('INVALID_PERU_PHONE_FORMAT');
    });
  });

  describe('isValidPeruPhone', () => {
    it('should validate correct Peru phone formats', () => {
      expect(service.isValidPeruPhone('+51 987 654 321')).toBe(true);
      expect(service.isValidPeruPhone('+51987654321')).toBe(true);
      expect(service.isValidPeruPhone('51 987 654 321')).toBe(true);
      expect(service.isValidPeruPhone('+51 912 345 678')).toBe(true);
    });

    it('should reject invalid Peru phone formats', () => {
      expect(service.isValidPeruPhone('+1 555 123 4567')).toBe(false);
      expect(service.isValidPeruPhone('+51 812 345 678')).toBe(false); // Must start with 9
      expect(service.isValidPeruPhone('987654321')).toBe(false); // Missing country code
      expect(service.isValidPeruPhone('+51 987 654')).toBe(false); // Too short
    });
  });

  describe('sendMessageWithRetry', () => {
    it('should retry on temporary failures and succeed', async () => {
      const mockResponse = {
        key: {
          remoteJid: '51987654321@s.whatsapp.net',
          fromMe: true,
          id: 'msg_retry_success',
        },
        message: {
          conversation: 'Test message',
        },
        messageTimestamp: Date.now(),
      };

      // First attempt fails with timeout
      nock('https://test-evolution-api.com')
        .post('/message/sendText/business_test123')
        .replyWithError({ code: 'ECONNABORTED', message: 'Timeout' });

      // Second attempt succeeds
      nock('https://test-evolution-api.com')
        .post('/message/sendText/business_test123')
        .reply(201, mockResponse);

      const result = await service.sendMessageWithRetry({
        instanceName: 'business_test123',
        phone: '+51 987 654 321',
        text: 'Test message',
      });

      expect(result.key.id).toBe('msg_retry_success');
    }, 10000); // Increase timeout for retry delays

    it('should not retry on invalid phone number', async () => {
      nock('https://test-evolution-api.com')
        .post('/message/sendText/business_test123')
        .reply(400, { message: 'Invalid phone number' });

      await expect(
        service.sendMessageWithRetry({
          instanceName: 'business_test123',
          phone: 'invalid-phone',
          text: 'Test message',
        })
      ).rejects.toThrow('INVALID_PHONE_NUMBER');
    });

    it('should not retry on instance not found', async () => {
      nock('https://test-evolution-api.com')
        .post('/message/sendText/nonexistent')
        .reply(404, { message: 'Instance not found' });

      await expect(
        service.sendMessageWithRetry({
          instanceName: 'nonexistent',
          phone: '+51 987 654 321',
          text: 'Test message',
        })
      ).rejects.toThrow('INSTANCE_NOT_FOUND');
    });
  });

  describe('sendMediaMessage', () => {
    it('should send media message successfully', async () => {
      const mockResponse = {
        key: {
          remoteJid: '51987654321@s.whatsapp.net',
          fromMe: true,
          id: 'msg_media_123',
        },
        message: {},
        messageTimestamp: Date.now(),
      };

      nock('https://test-evolution-api.com')
        .post('/message/sendMedia/business_test123', (body) => {
          return (
            body.number === '51987654321' &&
            body.mediaMessage.media === 'https://example.com/image.jpg' &&
            body.mediaMessage.mediatype === 'image'
          );
        })
        .reply(201, mockResponse);

      const result = await service.sendMediaMessage({
        instanceName: 'business_test123',
        phone: '+51 987 654 321',
        mediaUrl: 'https://example.com/image.jpg',
        caption: 'Test image',
        mediaType: 'image',
      });

      expect(result.key.id).toBe('msg_media_123');
    });

    it('should throw INVALID_MEDIA_URL on 400', async () => {
      nock('https://test-evolution-api.com')
        .post('/message/sendMedia/business_test123')
        .reply(400, { message: 'Invalid media URL' });

      await expect(
        service.sendMediaMessage({
          instanceName: 'business_test123',
          phone: '+51 987 654 321',
          mediaUrl: 'invalid-url',
        })
      ).rejects.toThrow('INVALID_MEDIA_URL');
    });
  });

  describe('getInstanceStatus', () => {
    it('should return connected status when instance is open', async () => {
      nock('https://test-evolution-api.com')
        .get('/instance/connectionState/business_test123')
        .reply(200, {
          instance: {
            state: 'open',
          },
        });

      const status = await service.getInstanceStatus('business_test123');

      expect(status.connected).toBe(true);
      expect(status.state).toBe('open');
    });

    it('should return not connected when instance is closed', async () => {
      nock('https://test-evolution-api.com')
        .get('/instance/connectionState/business_test123')
        .reply(200, {
          instance: {
            state: 'close',
          },
        });

      const status = await service.getInstanceStatus('business_test123');

      expect(status.connected).toBe(false);
      expect(status.state).toBe('close');
    });

    it('should throw INSTANCE_NOT_FOUND on 404', async () => {
      nock('https://test-evolution-api.com')
        .get('/instance/connectionState/nonexistent')
        .reply(404, { message: 'Instance not found' });

      await expect(service.getInstanceStatus('nonexistent')).rejects.toThrow('INSTANCE_NOT_FOUND');
    });
  });
});
