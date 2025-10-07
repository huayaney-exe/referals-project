/**
 * DEPRECATED: Use @/lib/supabase-client instead
 *
 * This file re-exports the centralized Supabase client to maintain backwards compatibility.
 * All new code should import from '@/lib/supabase-client' directly.
 *
 * Migration: Replace all imports of this file with '@/lib/supabase-client'
 *
 * CRITICAL FIX: Previously this file created a SECOND Supabase client instance,
 * causing "Multiple GoTrueClient instances" warnings and auth state corruption.
 * Now it re-exports the single source of truth from supabase-client.ts
 */
export { supabase } from './supabase-client';
