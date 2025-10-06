import { z } from 'zod';
import { supabaseAdmin } from '../../config/supabase';
import { NotFoundError, BusinessLogicError } from '../types';

// Manual campaign schema (legacy)
const manualCampaignSchema = z.object({
  business_id: z.string().uuid(),
  name: z.string().min(3).max(255),
  message: z.string().min(1).max(1600),
  target_segment: z.object({
    min_stamps: z.number().int().min(0),
    max_stamps: z.number().int().nullable(),
  }),
  scheduled_for: z.string().datetime().optional(),
});

// Event-triggered campaign schema (frontend)
const eventCampaignSchema = z.object({
  business_id: z.string().uuid(),
  name: z.string().min(3).max(255),
  message_template: z.string().min(1).max(1600),
  trigger_type: z.enum(['customer_enrolled', 'stamps_reached', 'reward_unlocked', 'days_inactive']),
  trigger_config: z.object({
    type: z.string(),
    value: z.number().optional(),
  }),
  status: z.enum(['draft', 'active', 'paused']).default('draft'),
});

export type CreateManualCampaignInput = z.infer<typeof manualCampaignSchema>;
export type CreateEventCampaignInput = z.infer<typeof eventCampaignSchema>;
export type CreateCampaignInput = CreateManualCampaignInput | CreateEventCampaignInput;
export type CampaignStatus = 'draft' | 'active' | 'paused' | 'scheduled' | 'sending' | 'completed' | 'failed';

export interface Campaign {
  id: string;
  business_id: string;
  name: string;
  message: string;
  target_segment: { min_stamps: number; max_stamps: number | null };
  scheduled_for: string | null;
  status: CampaignStatus;
  sent_count: number;
  created_at: string;
  completed_at: string | null;
  metadata: Record<string, unknown>;
}

export class CampaignService {
  static async create(input: CreateCampaignInput): Promise<Campaign> {
    // Try event-triggered schema first
    const eventResult = eventCampaignSchema.safeParse(input);
    if (eventResult.success) {
      const { data, error } = await supabaseAdmin
        .from('campaigns')
        .insert(eventResult.data)
        .select()
        .single();

      if (error) throw error;
      return data as Campaign;
    }

    // Fall back to manual campaign schema
    const manualResult = manualCampaignSchema.safeParse(input);
    if (manualResult.success) {
      const { data, error } = await supabaseAdmin
        .from('campaigns')
        .insert({ ...manualResult.data, status: 'draft' })
        .select()
        .single();

      if (error) throw error;
      return data as Campaign;
    }

    // Neither schema matched
    throw new BusinessLogicError('Invalid campaign format');
  }

  static async findById(id: string): Promise<Campaign | null> {
    const { data, error } = await supabaseAdmin
      .from('campaigns')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data as Campaign | null;
  }

  static async findByBusiness(business_id: string, status?: CampaignStatus): Promise<Campaign[]> {
    let query = supabaseAdmin
      .from('campaigns')
      .select('*')
      .eq('business_id', business_id)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data as Campaign[]) || [];
  }

  static async schedule(id: string, scheduled_for: string): Promise<Campaign> {
    const campaign = await this.findById(id);
    if (!campaign) throw new NotFoundError('Campaign', id);

    if (campaign.status !== 'draft') {
      throw new BusinessLogicError('Can only schedule draft campaigns');
    }

    if (new Date(scheduled_for) <= new Date()) {
      throw new BusinessLogicError('Scheduled time must be in the future');
    }

    const { data, error } = await supabaseAdmin
      .from('campaigns')
      .update({ status: 'scheduled', scheduled_for })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Campaign;
  }

  static async markCompleted(id: string): Promise<Campaign> {
    const { data, error } = await supabaseAdmin
      .from('campaigns')
      .update({ status: 'completed', completed_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Campaign;
  }

  static async delete(id: string): Promise<void> {
    const campaign = await this.findById(id);
    if (!campaign) throw new NotFoundError('Campaign', id);

    if (campaign.status !== 'draft') {
      throw new BusinessLogicError('Can only delete draft campaigns');
    }

    const { error } = await supabaseAdmin.from('campaigns').delete().eq('id', id);
    if (error) throw error;
  }
}
