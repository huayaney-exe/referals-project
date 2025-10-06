import request from 'supertest';
import app from '../../../src/index';
import { supabaseAdmin } from '../../../src/config/supabase';

// Mock Evolution API key
process.env.EVOLUTION_API_KEY = 'test-evolution-key-123';

describe('Evolution Webhook Integration Tests', () => {
  let businessId: string;
  let customerId: string;
  let campaignSendId: string;

  beforeAll(async () => {
    // Create test business
    const { data: business } = await supabaseAdmin
      .from('businesses')
      .insert({
        email: 'webhook-test@example.com',
        name: 'Webhook Test Business',
        reward_structure: {
          stamps_required: 10,
          reward_description: '1 free coffee',
        },
        evolution_instance_name: 'business_webhooktest123',
        evolution_connected: false,
      })
      .select()
      .single();

    businessId = business.id;

    // Create test customer
    const { data: customer } = await supabaseAdmin
      .from('customers')
      .insert({
        business_id: businessId,
        phone: '+51 987 654 321',
        name: 'Test Customer',
        stamps_count: 5,
      })
      .select()
      .single();

    customerId = customer.id;

    // Create test campaign send
    const { data: campaignSend } = await supabaseAdmin
      .from('campaign_sends')
      .insert({
        customer_id: customerId,
        status: 'pending',
        evolution_message_id: 'test_msg_123',
      })
      .select()
      .single();

    campaignSendId = campaignSend.id;
  });

  afterAll(async () => {
    // Cleanup
    await supabaseAdmin.from('campaign_sends').delete().eq('id', campaignSendId);
    await supabaseAdmin.from('customers').delete().eq('id', customerId);
    await supabaseAdmin.from('businesses').delete().eq('id', businessId);
  });

  describe('POST /api/v1/webhooks/evolution', () => {
    it('should accept webhook with valid API key', async () => {
      const response = await request(app)
        .post('/api/v1/webhooks/evolution')
        .set('apikey', 'test-evolution-key-123')
        .send({
          event: 'MESSAGES_UPDATE',
          instance: 'business_webhooktest123',
          data: {
            key: {
              id: 'test_msg_123',
              remoteJid: '51987654321@s.whatsapp.net',
              fromMe: true,
            },
            status: 'DELIVERY_ACK',
          },
        });

      expect(response.status).toBe(200);
      expect(response.body.received).toBe(true);
      expect(response.body.event).toBe('MESSAGES_UPDATE');
    });

    it('should reject webhook with invalid API key', async () => {
      const response = await request(app)
        .post('/api/v1/webhooks/evolution')
        .set('apikey', 'invalid-key')
        .send({
          event: 'MESSAGES_UPDATE',
          instance: 'business_test123',
          data: {},
        });

      expect(response.status).toBe(401);
      expect(response.body.error.code).toBe('UNAUTHORIZED');
    });

    it('should reject webhook with missing fields', async () => {
      const response = await request(app)
        .post('/api/v1/webhooks/evolution')
        .set('apikey', 'test-evolution-key-123')
        .send({
          event: 'MESSAGES_UPDATE',
          // Missing instance and data
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('INVALID_PAYLOAD');
    });
  });

  describe('MESSAGES_UPDATE event', () => {
    it('should update campaign send status to delivered', async () => {
      const response = await request(app)
        .post('/api/v1/webhooks/evolution')
        .set('apikey', 'test-evolution-key-123')
        .send({
          event: 'MESSAGES_UPDATE',
          instance: 'business_webhooktest123',
          data: {
            key: {
              id: 'test_msg_123',
              remoteJid: '51987654321@s.whatsapp.net',
              fromMe: true,
            },
            status: 'DELIVERY_ACK',
          },
        });

      expect(response.status).toBe(200);

      // Verify database was updated
      const { data: campaignSend } = await supabaseAdmin
        .from('campaign_sends')
        .select('status, delivered_at')
        .eq('evolution_message_id', 'test_msg_123')
        .single();

      expect(campaignSend?.status).toBe('delivered');
      expect(campaignSend?.delivered_at).toBeTruthy();
    });

    it('should update campaign send status to read', async () => {
      const response = await request(app)
        .post('/api/v1/webhooks/evolution')
        .set('apikey', 'test-evolution-key-123')
        .send({
          event: 'MESSAGES_UPDATE',
          instance: 'business_webhooktest123',
          data: {
            key: {
              id: 'test_msg_123',
              remoteJid: '51987654321@s.whatsapp.net',
              fromMe: true,
            },
            status: 'READ',
          },
        });

      expect(response.status).toBe(200);

      // Verify database was updated
      const { data: campaignSend } = await supabaseAdmin
        .from('campaign_sends')
        .select('status, opened_at')
        .eq('evolution_message_id', 'test_msg_123')
        .single();

      expect(campaignSend?.status).toBe('read');
      expect(campaignSend?.opened_at).toBeTruthy();
    });
  });

  describe('CONNECTION_UPDATE event', () => {
    it('should update business connection status to connected', async () => {
      const response = await request(app)
        .post('/api/v1/webhooks/evolution')
        .set('apikey', 'test-evolution-key-123')
        .send({
          event: 'CONNECTION_UPDATE',
          instance: 'business_webhooktest123',
          data: {
            state: 'open',
          },
        });

      expect(response.status).toBe(200);

      // Verify database was updated
      const { data: business } = await supabaseAdmin
        .from('businesses')
        .select('evolution_connected, evolution_connected_at')
        .eq('evolution_instance_name', 'business_webhooktest123')
        .single();

      expect(business?.evolution_connected).toBe(true);
      expect(business?.evolution_connected_at).toBeTruthy();
    });

    it('should update business connection status to disconnected', async () => {
      const response = await request(app)
        .post('/api/v1/webhooks/evolution')
        .set('apikey', 'test-evolution-key-123')
        .send({
          event: 'CONNECTION_UPDATE',
          instance: 'business_webhooktest123',
          data: {
            state: 'close',
          },
        });

      expect(response.status).toBe(200);

      // Verify database was updated
      const { data: business } = await supabaseAdmin
        .from('businesses')
        .select('evolution_connected')
        .eq('evolution_instance_name', 'business_webhooktest123')
        .single();

      expect(business?.evolution_connected).toBe(false);
    });
  });

  describe('SEND_MESSAGE event', () => {
    it('should update campaign send status to sent', async () => {
      const response = await request(app)
        .post('/api/v1/webhooks/evolution')
        .set('apikey', 'test-evolution-key-123')
        .send({
          event: 'SEND_MESSAGE',
          instance: 'business_webhooktest123',
          data: {
            key: {
              id: 'test_msg_123',
              remoteJid: '51987654321@s.whatsapp.net',
              fromMe: true,
            },
          },
        });

      expect(response.status).toBe(200);

      // Verify database was updated
      const { data: campaignSend } = await supabaseAdmin
        .from('campaign_sends')
        .select('status, sent_at')
        .eq('evolution_message_id', 'test_msg_123')
        .single();

      expect(campaignSend?.status).toBe('sent');
      expect(campaignSend?.sent_at).toBeTruthy();
    });
  });

  describe('MESSAGES_UPSERT event', () => {
    it('should process incoming customer message', async () => {
      const response = await request(app)
        .post('/api/v1/webhooks/evolution')
        .set('apikey', 'test-evolution-key-123')
        .send({
          event: 'MESSAGES_UPSERT',
          instance: 'business_webhooktest123',
          data: {
            key: {
              id: 'incoming_msg_456',
              remoteJid: '51987654321@s.whatsapp.net',
              fromMe: false, // Customer sent this message
            },
            message: {
              conversation: 'Hola, quiero usar mi recompensa',
            },
            messageTimestamp: Date.now(),
          },
        });

      expect(response.status).toBe(200);
      // Note: Currently just logs the message, future feature will store it
    });

    it('should ignore messages sent by business (fromMe: true)', async () => {
      const response = await request(app)
        .post('/api/v1/webhooks/evolution')
        .set('apikey', 'test-evolution-key-123')
        .send({
          event: 'MESSAGES_UPSERT',
          instance: 'business_webhooktest123',
          data: {
            key: {
              id: 'outgoing_msg_789',
              remoteJid: '51987654321@s.whatsapp.net',
              fromMe: true, // We sent this message
            },
            message: {
              conversation: 'Message sent by us',
            },
          },
        });

      expect(response.status).toBe(200);
      // Should be ignored (not processed)
    });
  });

  describe('Error handling', () => {
    it('should always return 200 even if processing fails', async () => {
      const response = await request(app)
        .post('/api/v1/webhooks/evolution')
        .set('apikey', 'test-evolution-key-123')
        .send({
          event: 'MESSAGES_UPDATE',
          instance: 'business_webhooktest123',
          data: {
            key: {
              id: 'nonexistent_msg_id',
              remoteJid: '51987654321@s.whatsapp.net',
              fromMe: true,
            },
            status: 'DELIVERY_ACK',
          },
        });

      // Should still return 200 to prevent Evolution API from retrying
      expect(response.status).toBe(200);
      expect(response.body.received).toBe(true);
    });
  });
});
