import { z } from 'zod';
import { supabaseAdmin } from '../../config/supabase';
import { NotFoundError, ConflictError, ConcurrencyError } from '../types';

// Peru phone regex: +51 9XX XXX XXX
const PERU_PHONE_REGEX = /^\+51 9\d{2} \d{3} \d{3}$/;

// Zod validation schema
const rewardStructureSchema = z.object({
  stamps_required: z.number().int().min(1, 'Must require at least 1 stamp'),
  reward_description: z.string().min(1, 'Reward description is required').max(500),
});

const businessSchema = z.object({
  email: z.string().email('Invalid email format'),
  name: z.string().min(1, 'Name is required').max(255),
  phone: z
    .string()
    .regex(PERU_PHONE_REGEX, 'Invalid Peru phone format (+51 9XX XXX XXX)')
    .optional(),
  category: z.string().max(100).optional(),
  reward_structure: rewardStructureSchema,
  logo_url: z.string().url('Invalid URL format').optional(),
});

export type CreateBusinessInput = z.infer<typeof businessSchema>;
export type UpdateBusinessInput = Partial<Omit<CreateBusinessInput, 'email'>>;

export interface Business {
  id: string;
  email: string;
  name: string;
  phone?: string | null;
  category?: string | null;
  reward_structure: {
    stamps_required: number;
    reward_description: string;
  };
  logo_url?: string | null;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  version: number;
}

export class BusinessService {
  /**
   * Create a new business
   */
  static async create(input: CreateBusinessInput): Promise<Business> {
    // Validate input
    const validated = businessSchema.parse(input);

    // Check for duplicate email
    const existing = await this.findByEmail(validated.email);
    if (existing) {
      throw new ConflictError('Business with this email already exists');
    }

    // Insert into database
    const { data, error } = await supabaseAdmin
      .from('businesses')
      .insert(validated)
      .select()
      .single();

    if (error) throw error;
    return data as Business;
  }

  /**
   * Find business by ID
   */
  static async findById(id: string): Promise<Business | null> {
    const { data, error } = await supabaseAdmin
      .from('businesses')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data as Business | null;
  }

  /**
   * Find business by email
   */
  static async findByEmail(email: string): Promise<Business | null> {
    const { data, error } = await supabaseAdmin
      .from('businesses')
      .select('*')
      .eq('email', email)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data as Business | null;
  }

  /**
   * List all active businesses
   */
  static async listActive(): Promise<Business[]> {
    const { data, error } = await supabaseAdmin
      .from('businesses')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data as Business[]) || [];
  }

  /**
   * Update business with optimistic locking
   */
  static async update(
    id: string,
    input: UpdateBusinessInput,
    version: number
  ): Promise<Business> {
    // Validate input if provided
    if (Object.keys(input).length > 0) {
      const partialSchema = businessSchema.partial().omit({ email: true });
      partialSchema.parse(input);
    }

    // Optimistic locking: check version
    const { data, error } = await supabaseAdmin
      .from('businesses')
      .update({ ...input, version: version + 1 })
      .eq('id', id)
      .eq('version', version)
      .select()
      .single();

    if (error) {
      // PGRST116 = no rows returned (version mismatch)
      if (error.code === 'PGRST116') {
        throw new ConcurrencyError('Business was modified by another request');
      }
      throw error;
    }

    return data as Business;
  }

  /**
   * Deactivate business (soft delete)
   */
  static async deactivate(id: string): Promise<void> {
    const business = await this.findById(id);
    if (!business) {
      throw new NotFoundError('Business', id);
    }

    const { error } = await supabaseAdmin
      .from('businesses')
      .update({ is_active: false })
      .eq('id', id);

    if (error) throw error;
  }

  /**
   * Reactivate business
   */
  static async reactivate(id: string): Promise<void> {
    const business = await this.findById(id);
    if (!business) {
      throw new NotFoundError('Business', id);
    }

    const { error } = await supabaseAdmin
      .from('businesses')
      .update({ is_active: true })
      .eq('id', id);

    if (error) throw error;
  }

  /**
   * Delete business permanently (use with caution)
   */
  static async delete(id: string): Promise<void> {
    const { error } = await supabaseAdmin.from('businesses').delete().eq('id', id);

    if (error) throw error;
  }

  /**
   * Count total businesses
   */
  static async count(activeOnly = false): Promise<number> {
    let query = supabaseAdmin.from('businesses').select('id', { count: 'exact', head: true });

    if (activeOnly) {
      query = query.eq('is_active', true);
    }

    const { count, error } = await query;

    if (error) throw error;
    return count || 0;
  }
}
