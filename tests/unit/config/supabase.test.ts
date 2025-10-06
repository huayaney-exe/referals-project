import { supabase, supabaseAdmin } from '../../../src/config/supabase';

describe('Supabase Configuration', () => {
  it('should create supabase client instance', () => {
    expect(supabase).toBeDefined();
    expect(supabase.auth).toBeDefined();
  });

  it('should create supabaseAdmin client instance', () => {
    expect(supabaseAdmin).toBeDefined();
    expect(supabaseAdmin.auth).toBeDefined();
  });

  it('should have different clients for public and admin', () => {
    expect(supabase).not.toBe(supabaseAdmin);
  });
});
