import { supabaseAdmin } from '../../config/supabase';

export interface EvolutionWebhookPayload {
  event: string;
  instance: string;
  data: {
    key: {
      remoteJid: string;
      fromMe: boolean;
      id: string;
    };
    message?: any;
    messageTimestamp?: number;
    status?: string;
    pushName?: string;
  };
  destination?: string;
  date_time?: string;
  sender?: string;
  server_url?: string;
  apikey?: string;
}

export class EvolutionWebhookHandler {
  /**
   * Handle MESSAGES_UPDATE event
   * Updates message delivery status in database
   */
  async handleMessagesUpdate(payload: EvolutionWebhookPayload): Promise<void> {
    try {
      const messageId = payload.data.key.id;
      const status = this.mapEvolutionStatus(payload.data.status);

      // Update campaign_sends table with delivery status
      const { error } = await supabaseAdmin
        .from('campaign_sends')
        .update({
          status,
          ...(status === 'delivered' && { delivered_at: new Date().toISOString() }),
          ...(status === 'read' && { opened_at: new Date().toISOString() }),
        })
        .eq('evolution_message_id', messageId);

      if (error) {
        console.error('Error updating message status:', error);
      }
    } catch (error) {
      console.error('Error in handleMessagesUpdate:', error);
      throw error;
    }
  }

  /**
   * Handle MESSAGES_UPSERT event
   * Processes incoming messages from customers
   */
  async handleMessagesUpsert(payload: EvolutionWebhookPayload): Promise<void> {
    try {
      // Only process messages from customers (not sent by us)
      if (payload.data.key.fromMe) {
        return;
      }

      const phoneNumber = this.extractPhoneNumber(payload.data.key.remoteJid);
      const messageText =
        payload.data.message?.conversation ||
        payload.data.message?.extendedTextMessage?.text ||
        '';

      // Find customer by phone number
      const { data: customer } = await supabaseAdmin
        .from('customers')
        .select('id, business_id, name')
        .eq('phone', phoneNumber)
        .single();

      if (!customer) {
        console.log('Customer not found for phone:', phoneNumber);
        return;
      }

      // Log customer reply (future feature: could trigger automated responses)
      console.log('Customer reply received:', {
        customerId: customer.id,
        businessId: customer.business_id,
        message: messageText,
        timestamp: payload.data.messageTimestamp,
      });

      // Future: Store customer replies in database for business owners to see
      // Future: Trigger automated responses based on keywords
    } catch (error) {
      console.error('Error in handleMessagesUpsert:', error);
      throw error;
    }
  }

  /**
   * Handle SEND_MESSAGE event
   * Confirms message was sent successfully
   */
  async handleSendMessage(payload: EvolutionWebhookPayload): Promise<void> {
    try {
      const messageId = payload.data.key.id;

      // Update campaign_sends with sent confirmation
      const { error } = await supabaseAdmin
        .from('campaign_sends')
        .update({
          status: 'sent',
          sent_at: new Date().toISOString(),
        })
        .eq('evolution_message_id', messageId);

      if (error) {
        console.error('Error updating sent status:', error);
      }
    } catch (error) {
      console.error('Error in handleSendMessage:', error);
      throw error;
    }
  }

  /**
   * Handle CONNECTION_UPDATE event
   * Updates business WhatsApp connection status
   */
  async handleConnectionUpdate(payload: EvolutionWebhookPayload): Promise<void> {
    try {
      const instanceName = payload.instance;
      const state = (payload.data as any).state || 'close';

      // Update businesses table with connection status
      const { error } = await supabaseAdmin
        .from('businesses')
        .update({
          evolution_connected: state === 'open',
          ...(state === 'open' && { evolution_connected_at: new Date().toISOString() }),
        })
        .eq('evolution_instance_name', instanceName);

      if (error) {
        console.error('Error updating connection status:', error);
      }

      console.log('Connection status updated:', {
        instance: instanceName,
        state,
        connected: state === 'open',
      });
    } catch (error) {
      console.error('Error in handleConnectionUpdate:', error);
      throw error;
    }
  }

  /**
   * Map Evolution API status to our internal status
   */
  private mapEvolutionStatus(status?: string): string {
    switch (status) {
      case 'SERVER_ACK':
        return 'sent';
      case 'DELIVERY_ACK':
        return 'delivered';
      case 'READ':
        return 'read';
      case 'PENDING':
        return 'pending';
      case 'ERROR':
        return 'failed';
      default:
        return 'queued';
    }
  }

  /**
   * Extract phone number from WhatsApp JID
   * Example: 51987654321@s.whatsapp.net → +51 987 654 321
   */
  private extractPhoneNumber(remoteJid: string): string {
    const phoneNumber = remoteJid.split('@')[0];

    // Format to Peru standard: +51 9XX XXX XXX
    if (phoneNumber.startsWith('51') && phoneNumber.length === 11) {
      return `+${phoneNumber.slice(0, 2)} ${phoneNumber.slice(2, 5)} ${phoneNumber.slice(5, 8)} ${phoneNumber.slice(8)}`;
    }

    return `+${phoneNumber}`;
  }
}

// Singleton instance
export const evolutionWebhookHandler = new EvolutionWebhookHandler();
