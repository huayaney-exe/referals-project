import { supabaseAdmin } from '../../config/supabase';
import { EventPayload } from './EventEmitter';
import { CampaignWorker } from '../workers/CampaignWorker';

export interface TriggerConfig {
  type: 'customer_enrolled' | 'stamps_reached' | 'reward_unlocked' | 'days_inactive';
  value?: number;
}

export class TriggerEvaluator {
  private campaignWorker: CampaignWorker;

  constructor() {
    this.campaignWorker = new CampaignWorker();
  }

  async evaluateCustomerEnrolled(payload: EventPayload) {
    const { businessId, customerId } = payload;

    // Find active campaigns with customer_enrolled trigger
    const { data: campaigns } = await supabaseAdmin
      .from('campaigns')
      .select('*')
      .eq('business_id', businessId)
      .eq('trigger_type', 'customer_enrolled')
      .eq('status', 'active');

    if (!campaigns || campaigns.length === 0) return;

    // Get customer details for message personalization
    const { data: customer } = await supabaseAdmin
      .from('customers')
      .select('*')
      .eq('id', customerId)
      .single();

    if (!customer) return;

    // Queue messages for each matching campaign
    for (const campaign of campaigns) {
      await this.campaignWorker.queueCampaignMessage({
        campaignId: campaign.id,
        customerId: customer.id,
        customerName: customer.name,
        customerPhone: customer.phone,
        messageTemplate: campaign.message_template,
        variables: {
          nombre: customer.name,
          sellos: customer.stamps_count || 0,
          recompensa: '', // Will be filled if applicable
        },
      });
    }
  }

  async evaluateStampsReached(payload: EventPayload) {
    const { businessId, customerId, metadata } = payload;
    const stampsCount = metadata?.stampsCount || 0;

    // Find active campaigns with stamps_reached trigger matching the count
    const { data: campaigns } = await supabaseAdmin
      .from('campaigns')
      .select('*')
      .eq('business_id', businessId)
      .eq('trigger_type', 'stamps_reached')
      .eq('status', 'active');

    if (!campaigns || campaigns.length === 0) return;

    // Filter campaigns where trigger value matches stamps count
    const matchingCampaigns = campaigns.filter(
      (c: any) => c.trigger_config?.value === stampsCount
    );

    if (matchingCampaigns.length === 0) return;

    // Get customer details
    const { data: customer } = await supabaseAdmin
      .from('customers')
      .select('*')
      .eq('id', customerId)
      .single();

    if (!customer) return;

    // Queue messages for matching campaigns
    for (const campaign of matchingCampaigns) {
      await this.campaignWorker.queueCampaignMessage({
        campaignId: campaign.id,
        customerId: customer.id,
        customerName: customer.name,
        customerPhone: customer.phone,
        messageTemplate: campaign.message_template,
        variables: {
          nombre: customer.name,
          sellos: stampsCount,
          recompensa: '', // Will be filled if reward unlocked
        },
      });
    }
  }

  async evaluateRewardUnlocked(payload: EventPayload) {
    const { businessId, customerId, metadata } = payload;
    const rewardDescription = metadata?.rewardDescription || '';

    // Find active campaigns with reward_unlocked trigger
    const { data: campaigns } = await supabaseAdmin
      .from('campaigns')
      .select('*')
      .eq('business_id', businessId)
      .eq('trigger_type', 'reward_unlocked')
      .eq('status', 'active');

    if (!campaigns || campaigns.length === 0) return;

    // Get customer details
    const { data: customer } = await supabaseAdmin
      .from('customers')
      .select('*')
      .eq('id', customerId)
      .single();

    if (!customer) return;

    // Queue messages for each matching campaign
    for (const campaign of campaigns) {
      await this.campaignWorker.queueCampaignMessage({
        campaignId: campaign.id,
        customerId: customer.id,
        customerName: customer.name,
        customerPhone: customer.phone,
        messageTemplate: campaign.message_template,
        variables: {
          nombre: customer.name,
          sellos: customer.stamps_count || 0,
          recompensa: rewardDescription,
        },
      });
    }
  }

  async evaluateCustomerInactive(payload: EventPayload) {
    const { businessId, customerId, metadata } = payload;
    const daysSinceLastActivity = metadata?.daysSinceLastActivity || 0;

    // Find active campaigns with days_inactive trigger matching the count
    const { data: campaigns } = await supabaseAdmin
      .from('campaigns')
      .select('*')
      .eq('business_id', businessId)
      .eq('trigger_type', 'days_inactive')
      .eq('status', 'active');

    if (!campaigns || campaigns.length === 0) return;

    // Filter campaigns where trigger value matches days
    const matchingCampaigns = campaigns.filter(
      (c: any) => c.trigger_config?.value === daysSinceLastActivity
    );

    if (matchingCampaigns.length === 0) return;

    // Get customer details
    const { data: customer } = await supabaseAdmin
      .from('customers')
      .select('*')
      .eq('id', customerId)
      .single();

    if (!customer) return;

    // Queue messages for matching campaigns
    for (const campaign of matchingCampaigns) {
      await this.campaignWorker.queueCampaignMessage({
        campaignId: campaign.id,
        customerId: customer.id,
        customerName: customer.name,
        customerPhone: customer.phone,
        messageTemplate: campaign.message_template,
        variables: {
          nombre: customer.name,
          sellos: customer.stamps_count || 0,
          recompensa: '',
        },
      });
    }
  }
}
