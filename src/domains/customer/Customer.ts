import { z } from 'zod';
import { supabaseAdmin } from '../../config/supabase';
import { ConflictError, ConcurrencyError } from '../types';
import { campaignEventEmitter } from '../../infrastructure/events/EventEmitter';

const customerSchema = z.object({
  business_id: z.string().uuid(),
  phone: z.string().regex(/^\+\d{1,4}\d{9}$/, 'Invalid phone format'),
  name: z.string().min(1, 'Name is required').max(255),
  email: z.string().email('Invalid email').optional(),
  email_opt_in: z.boolean().default(true),
  pass_serial_number: z.string().optional(),
  pass_url: z.string().url().optional(),
});

export type CreateCustomerInput = z.infer<typeof customerSchema>;
export type UpdateCustomerInput = Partial<Omit<CreateCustomerInput, 'business_id' | 'phone'>>;

export interface Customer {
  id: string;
  business_id: string;
  phone: string;
  name: string;
  email?: string | null;
  email_opt_in: boolean;
  stamps_count: number;
  total_rewards_earned: number;
  enrolled_at: string;
  last_stamp_at: string | null;
  pass_serial_number: string | null;
  pass_url: string | null;
  version: number;
}

export class CustomerService {
  static async create(input: CreateCustomerInput): Promise<Customer> {
    const validated = customerSchema.parse(input);

    // Check for duplicate (business_id + phone is unique)
    const existing = await this.findByPhone(validated.business_id, validated.phone);
    if (existing) {
      throw new ConflictError('Customer already enrolled with this phone number');
    }

    const { data, error } = await supabaseAdmin
      .from('customers')
      .insert(validated)
      .select()
      .single();

    if (error) throw error;

    // Emit customer enrolled event
    campaignEventEmitter.emitCustomerEnrolled(
      validated.business_id,
      data.id,
      { name: validated.name, phone: validated.phone }
    );

    return data as Customer;
  }

  static async findById(id: string): Promise<Customer | null> {
    const { data, error } = await supabaseAdmin
      .from('customers')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data as Customer | null;
  }

  static async findByPhone(business_id: string, phone: string): Promise<Customer | null> {
    const { data, error } = await supabaseAdmin
      .from('customers')
      .select('*')
      .eq('business_id', business_id)
      .eq('phone', phone)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data as Customer | null;
  }

  static async findByBusiness(business_id: string): Promise<Customer[]> {
    const { data, error } = await supabaseAdmin
      .from('customers')
      .select('*')
      .eq('business_id', business_id)
      .order('enrolled_at', { ascending: false });

    if (error) throw error;
    return (data as Customer[]) || [];
  }

  static async update(
    id: string,
    input: UpdateCustomerInput,
    version: number
  ): Promise<Customer> {
    if (Object.keys(input).length > 0) {
      const partialSchema = customerSchema.partial().omit({ business_id: true, phone: true });
      partialSchema.parse(input);
    }

    const { data, error } = await supabaseAdmin
      .from('customers')
      .update({ ...input, version: version + 1 })
      .eq('id', id)
      .eq('version', version)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new ConcurrencyError('Customer was modified by another request');
      }
      throw error;
    }

    return data as Customer;
  }

  static async count(business_id: string): Promise<number> {
    const { count, error } = await supabaseAdmin
      .from('customers')
      .select('id', { count: 'exact', head: true })
      .eq('business_id', business_id);

    if (error) throw error;
    return count || 0;
  }
}
