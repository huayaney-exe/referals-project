import { campaignEventEmitter, EventPayload } from './EventEmitter';
import { TriggerEvaluator } from './TriggerEvaluator';

export class EventListener {
  private triggerEvaluator: TriggerEvaluator;

  constructor() {
    this.triggerEvaluator = new TriggerEvaluator();
    this.setupListeners();
  }

  private setupListeners() {
    campaignEventEmitter.on('customer.enrolled', async (payload: EventPayload) => {
      try {
        await this.triggerEvaluator.evaluateCustomerEnrolled(payload);
      } catch (error) {
        console.error('Error processing customer.enrolled event:', error);
      }
    });

    campaignEventEmitter.on('stamps.reached', async (payload: EventPayload) => {
      try {
        await this.triggerEvaluator.evaluateStampsReached(payload);
      } catch (error) {
        console.error('Error processing stamps.reached event:', error);
      }
    });

    campaignEventEmitter.on('reward.unlocked', async (payload: EventPayload) => {
      try {
        await this.triggerEvaluator.evaluateRewardUnlocked(payload);
      } catch (error) {
        console.error('Error processing reward.unlocked event:', error);
      }
    });

    campaignEventEmitter.on('customer.inactive', async (payload: EventPayload) => {
      try {
        await this.triggerEvaluator.evaluateCustomerInactive(payload);
      } catch (error) {
        console.error('Error processing customer.inactive event:', error);
      }
    });
  }
}

// Initialize event listener on module load
export const eventListener = new EventListener();
