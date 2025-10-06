import axios from 'axios';

export interface SendMessageParams {
  instanceName: string;
  phone: string;
  text: string;
  delay?: number;
}

export interface SendMediaParams {
  instanceName: string;
  phone: string;
  mediaUrl: string;
  caption?: string;
  mediaType?: 'image' | 'document' | 'video' | 'audio';
}

export interface EvolutionMessageResponse {
  key: {
    remoteJid: string;
    fromMe: boolean;
    id: string;
  };
  message: {
    conversation?: string;
    extendedTextMessage?: any;
  };
  messageTimestamp: number;
  status?: string;
}

export class EvolutionWhatsAppService {
  private client: any;
  private apiKey: string;

  constructor() {
    const baseURL = process.env.EVOLUTION_API_URL;
    this.apiKey = process.env.EVOLUTION_API_KEY || '';

    if (!baseURL || !this.apiKey) {
      throw new Error('EVOLUTION_API_URL and EVOLUTION_API_KEY must be set');
    }

    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
        apikey: this.apiKey,
      },
      timeout: 30000,
    });
  }

  /**
   * Send a text message via WhatsApp
   * @param params - Message parameters
   * @returns Promise with message response
   */
  async sendMessage(params: SendMessageParams): Promise<EvolutionMessageResponse> {
    try {
      // Format phone number for Evolution API
      const formattedNumber = this.formatPhoneNumber(params.phone);

      const payload = {
        number: formattedNumber,
        options: {
          delay: params.delay || 1200,
          presence: 'composing',
          linkPreview: false,
        },
        textMessage: {
          text: params.text,
        },
      };

      const response = await this.client.post(
        `/message/sendText/${params.instanceName}`,
        payload
      );

      return response.data;
    } catch (error: any) {
      // Handle specific errors
      if (error.response?.status === 404) {
        throw new Error('INSTANCE_NOT_FOUND');
      }

      if (error.response?.status === 401) {
        throw new Error('INVALID_API_KEY');
      }

      if (error.response?.status === 400) {
        throw new Error('INVALID_PHONE_NUMBER');
      }

      if (error.code === 'ECONNABORTED') {
        throw new Error('REQUEST_TIMEOUT');
      }

      if (error.response?.data?.message?.includes('not connected')) {
        throw new Error('INSTANCE_NOT_CONNECTED');
      }

      throw new Error(`EVOLUTION_API_ERROR: ${error.message}`);
    }
  }

  /**
   * Send message with retry logic (exponential backoff)
   * @param params - Message parameters
   * @param maxRetries - Maximum retry attempts (default: 3)
   * @returns Promise with message response
   */
  async sendMessageWithRetry(
    params: SendMessageParams,
    maxRetries: number = 3
  ): Promise<EvolutionMessageResponse> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await this.sendMessage(params);
      } catch (error: any) {
        lastError = error;

        // Don't retry on these errors
        const noRetryErrors = [
          'INVALID_PHONE_NUMBER',
          'INVALID_API_KEY',
          'INSTANCE_NOT_FOUND',
        ];

        if (noRetryErrors.some((err) => error.message.includes(err))) {
          throw error;
        }

        // Retry with exponential backoff
        if (attempt < maxRetries) {
          const delay = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }
      }
    }

    throw lastError || new Error('UNKNOWN_ERROR');
  }

  /**
   * Send media message (image, document, video, audio)
   * @param params - Media message parameters
   * @returns Promise with message response
   */
  async sendMediaMessage(params: SendMediaParams): Promise<EvolutionMessageResponse> {
    try {
      const formattedNumber = this.formatPhoneNumber(params.phone);

      const payload = {
        number: formattedNumber,
        options: {
          delay: 1200,
          presence: 'composing',
        },
        mediaMessage: {
          mediatype: params.mediaType || 'image',
          media: params.mediaUrl,
          ...(params.caption && { caption: params.caption }),
        },
      };

      const response = await this.client.post(
        `/message/sendMedia/${params.instanceName}`,
        payload
      );

      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error('INSTANCE_NOT_FOUND');
      }

      if (error.response?.status === 401) {
        throw new Error('INVALID_API_KEY');
      }

      if (error.response?.status === 400) {
        throw new Error('INVALID_MEDIA_URL');
      }

      throw new Error(`MEDIA_SEND_FAILED: ${error.message}`);
    }
  }

  /**
   * Format phone number for Evolution API
   * Peru format: +51 987 654 321 → 51987654321
   * @param phone - Phone number in any format
   * @returns Formatted phone number (no spaces, no +)
   */
  formatPhoneNumber(phone: string): string {
    // Remove all non-numeric characters except +
    let cleaned = phone.replace(/[^\d+]/g, '');

    // Remove + sign
    cleaned = cleaned.replace(/\+/g, '');

    // Validate it starts with country code
    if (!cleaned.startsWith('51')) {
      // If it starts with 9 (Peru mobile), add country code
      if (cleaned.startsWith('9') && cleaned.length === 9) {
        return `51${cleaned}`;
      }

      throw new Error('INVALID_PHONE_FORMAT');
    }

    // Validate Peru mobile format: 51 + 9XX XXX XXX
    if (cleaned.length !== 11 || !cleaned.startsWith('519')) {
      throw new Error('INVALID_PERU_PHONE_FORMAT');
    }

    return cleaned;
  }

  /**
   * Validate Peru phone number format
   * Accepts: +51 9XX XXX XXX or variants
   * @param phone - Phone number to validate
   * @returns boolean
   */
  isValidPeruPhone(phone: string): boolean {
    const peruPhoneRegex = /^\+?51\s?9\d{2}\s?\d{3}\s?\d{3}$/;
    return peruPhoneRegex.test(phone);
  }

  /**
   * Check instance connection status
   * @param instanceName - Instance name
   * @returns Promise with connection status
   */
  async getInstanceStatus(instanceName: string): Promise<{
    connected: boolean;
    state: string;
  }> {
    try {
      const response = await this.client.get(`/instance/connectionState/${instanceName}`);

      const state = response.data?.instance?.state || response.data?.state || 'close';

      return {
        connected: state === 'open',
        state,
      };
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error('INSTANCE_NOT_FOUND');
      }

      throw new Error(`STATUS_CHECK_FAILED: ${error.message}`);
    }
  }
}

// Singleton instance
export const evolutionWhatsAppService = new EvolutionWhatsAppService();
