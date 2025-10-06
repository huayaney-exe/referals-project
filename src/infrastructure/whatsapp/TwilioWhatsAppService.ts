import twilio from 'twilio';

export interface WhatsAppMessage {
  to: string;
  body: string;
  mediaUrl?: string;
}

export interface WhatsAppResponse {
  sid: string;
  status: string;
  to: string;
  from: string;
  dateSent: Date | null;
}

export class TwilioWhatsAppService {
  private client: twilio.Twilio;
  private fromNumber: string;

  constructor() {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    this.fromNumber = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886';

    if (!accountSid || !authToken) {
      throw new Error('TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN must be set');
    }

    this.client = twilio(accountSid, authToken);
  }

  /**
   * Send a WhatsApp message
   * @param message - WhatsApp message details
   * @returns Promise with message response
   */
  async sendMessage(message: WhatsAppMessage): Promise<WhatsAppResponse> {
    try {
      // Format phone number for WhatsApp
      const toWhatsApp = message.to.startsWith('whatsapp:')
        ? message.to
        : `whatsapp:${message.to.replace(/\s/g, '')}`;

      const twilioMessage = await this.client.messages.create({
        from: this.fromNumber,
        to: toWhatsApp,
        body: message.body,
        ...(message.mediaUrl && { mediaUrl: [message.mediaUrl] }),
      });

      return {
        sid: twilioMessage.sid,
        status: twilioMessage.status,
        to: twilioMessage.to,
        from: twilioMessage.from,
        dateSent: twilioMessage.dateSent,
      };
    } catch (error: any) {
      // Handle rate limiting (429)
      if (error.code === 429 || error.status === 429) {
        throw new Error('RATE_LIMIT_EXCEEDED');
      }

      // Handle invalid phone number (400)
      if (error.code === 21211 || error.status === 400) {
        throw new Error('INVALID_PHONE_NUMBER');
      }

      // Handle other errors
      throw new Error(`TWILIO_ERROR: ${error.message}`);
    }
  }

  /**
   * Send WhatsApp message with retry logic
   * @param message - WhatsApp message details
   * @param maxRetries - Maximum number of retries (default: 3)
   * @returns Promise with message response
   */
  async sendMessageWithRetry(
    message: WhatsAppMessage,
    maxRetries: number = 3
  ): Promise<WhatsAppResponse> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await this.sendMessage(message);
      } catch (error: any) {
        lastError = error;

        // Don't retry on invalid phone number
        if (error.message === 'INVALID_PHONE_NUMBER') {
          throw error;
        }

        // For rate limiting, wait with exponential backoff
        if (error.message === 'RATE_LIMIT_EXCEEDED' && attempt < maxRetries) {
          const delay = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }

        // For other errors, retry with short delay
        if (attempt < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          continue;
        }
      }
    }

    throw lastError || new Error('UNKNOWN_ERROR');
  }

  /**
   * Validate phone number format for Peru
   * @param phone - Phone number to validate
   * @returns boolean indicating if valid
   */
  isValidPeruPhone(phone: string): boolean {
    const peruPhoneRegex = /^\+51\s?9\d{2}\s?\d{3}\s?\d{3}$/;
    return peruPhoneRegex.test(phone);
  }
}

// Singleton instance
export const twilioWhatsAppService = new TwilioWhatsAppService();
