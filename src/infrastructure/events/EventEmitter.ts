import { EventEmitter as NodeEventEmitter } from 'events';

export type CustomerEvent =
  | 'customer.enrolled'
  | 'stamps.reached'
  | 'reward.unlocked'
  | 'customer.inactive';

export interface EventPayload {
  businessId: string;
  customerId: string;
  metadata?: Record<string, any>;
}

class CampaignEventEmitter extends NodeEventEmitter {
  private static instance: CampaignEventEmitter;

  private constructor() {
    super();
  }

  static getInstance(): CampaignEventEmitter {
    if (!CampaignEventEmitter.instance) {
      CampaignEventEmitter.instance = new CampaignEventEmitter();
    }
    return CampaignEventEmitter.instance;
  }

  emitCustomerEnrolled(businessId: string, customerId: string, metadata?: Record<string, any>) {
    this.emit('customer.enrolled', { businessId, customerId, metadata });
  }

  emitStampsReached(businessId: string, customerId: string, stampsCount: number) {
    this.emit('stamps.reached', { businessId, customerId, metadata: { stampsCount } });
  }

  emitRewardUnlocked(businessId: string, customerId: string, rewardDescription: string) {
    this.emit('reward.unlocked', { businessId, customerId, metadata: { rewardDescription } });
  }

  emitCustomerInactive(businessId: string, customerId: string, daysSinceLastActivity: number) {
    this.emit('customer.inactive', { businessId, customerId, metadata: { daysSinceLastActivity } });
  }
}

export const campaignEventEmitter = CampaignEventEmitter.getInstance();
