import axios from 'axios';

export interface EvolutionInstance {
  instanceName: string;
  status: string;
  serverUrl: string;
  apikey: string;
}

export interface ConnectionStatus {
  instance: string;
  state: string; // 'close', 'connecting', 'open'
  connected: boolean;
}

export interface QRCodeResponse {
  base64: string; // Full data URI: "data:image/png;base64,iVBORw0KG..."
  code: string; // WhatsApp pairing code: "2@..."
  pairingCode: string | null; // 8-digit code for phone pairing
}

export class EvolutionInstanceManager {
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
   * Generate unique instance name from business ID
   * Format: business_{uuid} (lowercase, no hyphens)
   * @param businessId - UUID of the business
   * @returns Instance name
   */
  generateInstanceName(businessId: string): string {
    // Remove hyphens and convert to lowercase
    const sanitized = businessId.replace(/-/g, '').toLowerCase();
    return `business_${sanitized}`;
  }

  /**
   * Create new Evolution API instance for a business
   * @param businessId - Business UUID
   * @returns Promise with instance details
   */
  async createInstance(businessId: string): Promise<EvolutionInstance> {
    const instanceName = this.generateInstanceName(businessId);

    try {
      const response = await this.client.post('/instance/create', {
        instanceName,
        qrcode: true,
        integration: 'WHATSAPP-BAILEYS', // Using Baileys (WhatsApp Web)
      });

      return {
        instanceName,
        status: response.data.instance?.state || 'created',
        serverUrl: response.data.instance?.serverUrl || process.env.EVOLUTION_API_URL || '',
        apikey: this.apiKey,
      };
    } catch (error: any) {
      if (error.response?.status === 409) {
        throw new Error('INSTANCE_ALREADY_EXISTS');
      }

      if (error.response?.status === 401) {
        throw new Error('INVALID_API_KEY');
      }

      throw new Error(`INSTANCE_CREATE_FAILED: ${error.message}`);
    }
  }

  /**
   * Get QR code for connecting WhatsApp to instance
   * Business owner scans this with their WhatsApp app
   * @param instanceName - Instance name
   * @returns Promise with QR code base64
   */
  async getQRCode(instanceName: string): Promise<string> {
    try {
      const response = await this.client.get(`/instance/connect/${instanceName}`);

      // Evolution API v2 returns: { base64: "data:image/png;base64,...", code: "2@...", pairingCode: null }
      // We need the base64 field which contains the complete data URI
      if (response.data?.base64) {
        // base64 field already includes "data:image/png;base64," prefix
        return response.data.base64.replace('data:image/png;base64,', ''); // Remove prefix, frontend adds it back
      }

      throw new Error('QR_CODE_NOT_AVAILABLE');
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error('INSTANCE_NOT_FOUND');
      }

      if (error.response?.status === 401) {
        throw new Error('INVALID_API_KEY');
      }

      if (error.message === 'QR_CODE_NOT_AVAILABLE') {
        throw error;
      }

      throw new Error(`QR_CODE_FETCH_FAILED: ${error.message}`);
    }
  }

  /**
   * Check connection status of instance
   * @param instanceName - Instance name
   * @returns Promise with connection status
   */
  async checkConnection(instanceName: string): Promise<ConnectionStatus> {
    try {
      const response = await this.client.get(`/instance/connectionState/${instanceName}`);

      const state = response.data?.instance?.state || response.data?.state || 'close';

      return {
        instance: instanceName,
        state,
        connected: state === 'open',
      };
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error('INSTANCE_NOT_FOUND');
      }

      if (error.response?.status === 401) {
        throw new Error('INVALID_API_KEY');
      }

      throw new Error(`CONNECTION_CHECK_FAILED: ${error.message}`);
    }
  }

  /**
   * Get connection status (alias for checkConnection for consistency)
   * @param instanceName - Instance name
   * @returns Promise with connection status
   */
  async getConnectionStatus(instanceName: string): Promise<ConnectionStatus> {
    return this.checkConnection(instanceName);
  }

  /**
   * Delete instance (when business cancels subscription)
   * @param instanceName - Instance name
   */
  async deleteInstance(instanceName: string): Promise<void> {
    try {
      await this.client.delete(`/instance/delete/${instanceName}`);
    } catch (error: any) {
      if (error.response?.status === 404) {
        // Instance already deleted, not an error
        return;
      }

      if (error.response?.status === 401) {
        throw new Error('INVALID_API_KEY');
      }

      throw new Error(`INSTANCE_DELETE_FAILED: ${error.message}`);
    }
  }

  /**
   * Set webhook URL for instance to receive events
   * @param instanceName - Instance name
   * @param webhookUrl - Webhook URL (defaults to API URL + /api/v1/webhooks/evolution)
   */
  async setWebhook(instanceName: string, webhookUrl?: string): Promise<void> {
    const url =
      webhookUrl ||
      `${process.env.FRONTEND_URL || 'http://localhost:3000'}/api/v1/webhooks/evolution`;

    try {
      await this.client.post(`/webhook/set/${instanceName}`, {
        enabled: true,
        url,
        webhookByEvents: true,
        events: ['MESSAGES_UPSERT', 'MESSAGES_UPDATE', 'SEND_MESSAGE', 'CONNECTION_UPDATE'],
      });
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error('INSTANCE_NOT_FOUND');
      }

      if (error.response?.status === 401) {
        throw new Error('INVALID_API_KEY');
      }

      throw new Error(`WEBHOOK_SETUP_FAILED: ${error.message}`);
    }
  }

  /**
   * Restart instance (useful for connection recovery)
   * @param instanceName - Instance name
   */
  async restartInstance(instanceName: string): Promise<void> {
    try {
      await this.client.put(`/instance/restart/${instanceName}`);
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error('INSTANCE_NOT_FOUND');
      }

      if (error.response?.status === 401) {
        throw new Error('INVALID_API_KEY');
      }

      throw new Error(`INSTANCE_RESTART_FAILED: ${error.message}`);
    }
  }
}

// Singleton instance
export const evolutionInstanceManager = new EvolutionInstanceManager();
