/**
 * Type-safe Supabase client with standardized error handling
 *
 * Usage:
 * ```typescript
 * import { supabase, queryWithErrorHandling, type Tables } from '@/lib/supabase-client';
 *
 * // Type-safe table access
 * type Customer = Tables<'customers'>;
 *
 * // Standardized error handling
 * const customers = await queryWithErrorHandling(() =>
 *   supabase.from('customers').select('*').eq('business_id', businessId)
 * );
 * ```
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';
import { DatabaseError } from './errors';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

/**
 * Type-safe Supabase client instance
 */
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  db: {
    schema: 'public',
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

/**
 * Type-safe query helper with standardized error handling
 *
 * @param queryFn - Supabase query function
 * @param context - Additional context for error logging
 * @returns Query data
 * @throws {DatabaseError} If query fails
 *
 * @example
 * ```typescript
 * const customers = await queryWithErrorHandling(
 *   () => supabase.from('customers').select('*').eq('business_id', businessId),
 *   'useCustomers.fetchAll'
 * );
 * ```
 */
export async function queryWithErrorHandling<T>(
  queryFn: () => Promise<{ data: T | null; error: any }>,
  context?: string
): Promise<T> {
  const { data, error } = await queryFn();

  if (error) {
    // Log error with context for monitoring
    console.error(`[Supabase Error]${context ? ` ${context}:` : ''}`, {
      code: error.code,
      message: error.message,
      hint: error.hint,
      details: error.details,
    });

    throw new DatabaseError(
      error.message || 'Database operation failed',
      error.code,
      error.hint,
      error.details
    );
  }

  if (data === null) {
    throw new DatabaseError('No data returned from query', 'PGRST116');
  }

  return data;
}

/**
 * Type-safe mutation helper with standardized error handling
 *
 * @param mutationFn - Supabase mutation function
 * @param context - Additional context for error logging
 * @returns Mutation data
 * @throws {DatabaseError} If mutation fails
 *
 * @example
 * ```typescript
 * const newCustomer = await mutationWithErrorHandling(
 *   () => supabase.from('customers').insert([customerData]).select().single(),
 *   'useCreateCustomer'
 * );
 * ```
 */
export async function mutationWithErrorHandling<T>(
  mutationFn: () => Promise<{ data: T | null; error: any }>,
  context?: string
): Promise<T> {
  return queryWithErrorHandling(mutationFn, context);
}

/**
 * Type-safe RPC (remote procedure call) helper
 *
 * @param procedureName - Name of the database function
 * @param params - Function parameters
 * @param context - Additional context for error logging
 * @returns Function result
 * @throws {DatabaseError} If RPC fails
 *
 * @example
 * ```typescript
 * const result = await rpcWithErrorHandling(
 *   'add_stamp_with_outbox',
 *   { p_customer_id: customerId, p_business_id: businessId },
 *   'useAddStamp'
 * );
 * ```
 */
export async function rpcWithErrorHandling<T>(
  procedureName: keyof Database['public']['Functions'] | string,
  params?: Record<string, unknown>,
  context?: string
): Promise<T> {
  const { data, error } = await (supabase.rpc as any)(procedureName, params);

  if (error) {
    console.error(`[Supabase RPC Error]${context ? ` ${context}:` : ''}`, {
      procedure: procedureName,
      params,
      code: error.code,
      message: error.message,
      hint: error.hint,
      details: error.details,
    });

    throw new DatabaseError(
      `RPC ${procedureName} failed: ${error.message}`,
      error.code,
      error.hint,
      error.details
    );
  }

  return data as T;
}

/**
 * Type-safe realtime subscription helper
 *
 * @param channelName - Unique channel name
 * @param config - Subscription configuration
 * @returns Realtime channel
 *
 * @example
 * ```typescript
 * const channel = createRealtimeChannel('customers', {
 *   table: 'customers',
 *   filter: `business_id=eq.${businessId}`,
 *   event: 'INSERT',
 *   callback: (payload) => console.log('New customer:', payload.new),
 * });
 *
 * // Cleanup
 * return () => channel.unsubscribe();
 * ```
 */
export function createRealtimeChannel(
  channelName: string,
  config: {
    table: keyof Database['public']['Tables'];
    filter?: string;
    event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
    callback: (payload: any) => void;
    onError?: (error: Error) => void;
  }
) {
  const channel = supabase
    .channel(channelName)
    .on(
      'postgres_changes',
      {
        event: config.event || '*',
        schema: 'public',
        table: config.table,
        filter: config.filter,
      },
      (payload) => {
        try {
          config.callback(payload);
        } catch (error) {
          console.error(`[Realtime Callback Error] ${channelName}:`, error);
          if (config.onError && error instanceof Error) {
            config.onError(error);
          }
        }
      }
    )
    .on('system', {}, (status) => {
      console.log(`[Realtime] ${channelName} status:`, status);
    })
    .subscribe((status, err) => {
      if (err) {
        console.error(`[Realtime Subscription Error] ${channelName}:`, err);
        if (config.onError) {
          config.onError(new Error(`Subscription failed: ${err.message}`));
        }
      } else {
        console.log(`[Realtime] ${channelName} subscribed:`, status);
      }
    });

  return channel;
}

/**
 * Type exports for convenience
 */
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];

export type TablesInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];

export type TablesUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];

/**
 * Get current authenticated user
 */
export async function getCurrentUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    throw new DatabaseError('Failed to get current user', error.message);
  }

  return user;
}

/**
 * Get current session
 */
export async function getCurrentSession() {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    throw new DatabaseError('Failed to get session', error.message);
  }

  return session;
}
