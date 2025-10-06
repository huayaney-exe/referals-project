import { z } from 'zod';
import { supabaseAdmin } from '../../config/supabase';
import { NotFoundError, BusinessLogicError } from '../types';

const campaignSchema = z.object({
  business_id: z.string().uuid(),
  name: z.string().min(3).max(255),
  message: z.string().min(1).max(1600),
  target_segment: z.object({
    min_stamps: z.number().int().min(0),
    max_stamps: z.number().int().nullable(),
  }),
  scheduled_for: z.string().datetime().optional(),
});

export type CreateCampaignInput = z.infer<typeof campaignSchema>;
export type CampaignStatus = 'draft' | 'scheduled' | 'sending' | 'completed' | 'failed';

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
    const validated = campaignSchema.parse(input);

    const { data, error } = await supabaseAdmin
      .from('campaigns')
      .insert({ ...validated, status: 'draft' })
      .select()
      .single();

    if (error) throw error;
    return data as Campaign;
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
