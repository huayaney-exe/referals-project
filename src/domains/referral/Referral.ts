import { z } from 'zod';
import { supabaseAdmin } from '../../config/supabase';
import { BusinessLogicError } from '../types';

const referralSchema = z.object({
  business_id: z.string().uuid(),
  referrer_customer_id: z.string().uuid(),
  referred_phone: z.string().optional(),
  bonus_stamps: z.number().int().min(0).optional(),
});

export type CreateReferralInput = z.infer<typeof referralSchema>;
export type ReferralStatus = 'pending' | 'completed' | 'expired';

export interface Referral {
  id: string;
  business_id: string;
  referrer_customer_id: string;
  referred_customer_id: string | null;
  referral_code: string;
  referred_phone: string | null;
  status: ReferralStatus;
  bonus_stamps: number;
  created_at: string;
  completed_at: string | null;
  expires_at: string | null;
}

export class ReferralService {
  static async create(input: CreateReferralInput): Promise<Referral> {
    const validated = referralSchema.parse(input);

    // Generate unique 8-character code
    const referral_code = this.generateCode();

    // Set expiration to 30 days
    const expires_at = new Date();
    expires_at.setDate(expires_at.getDate() + 30);

    const { data, error } = await supabaseAdmin
      .from('referrals')
      .insert({
        ...validated,
        bonus_stamps: validated.bonus_stamps || 1,
        referral_code,
        status: 'pending',
        expires_at: expires_at.toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data as Referral;
  }

  static async findByCode(referral_code: string): Promise<Referral | null> {
    const { data, error } = await supabaseAdmin
      .from('referrals')
      .select('*')
      .eq('referral_code', referral_code)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data as Referral | null;
  }

  static async complete(id: string, referred_customer_id: string): Promise<Referral> {
    const referral = await supabaseAdmin.from('referrals').select('*').eq('id', id).single();

    if (!referral.data) throw new BusinessLogicError('Referral not found');
    if (referral.data.status === 'completed') {
      throw new BusinessLogicError('Referral already completed');
    }
    if (new Date(referral.data.expires_at) < new Date()) {
      throw new BusinessLogicError('Referral expired');
    }

    // Update referral
    const { data, error } = await supabaseAdmin
      .from('referrals')
      .update({
        referred_customer_id,
        status: 'completed',
        completed_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Grant bonus stamps to referrer
    await supabaseAdmin.rpc('add_stamp_with_outbox', {
      p_customer_id: referral.data.referrer_customer_id,
      p_business_id: referral.data.business_id,
      p_stamped_by: 'referral_bonus',
    });

    return data as Referral;
  }

  private static generateCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  static async getByCustomer(customer_id: string): Promise<Referral[]> {
    const { data, error } = await supabaseAdmin
      .from('referrals')
      .select('*')
      .eq('referrer_customer_id', customer_id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data as Referral[]) || [];
  }
}
