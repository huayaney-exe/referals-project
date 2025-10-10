import { CustomerService } from '../../src/domains/customer/Customer';
import { supabaseAdmin } from '../../src/config/supabase';

/**
 * Unit Tests: CustomerService pass_url generation
 */

describe('CustomerService - pass_url generation', () => {
  beforeAll(() => {
    // Set FRONTEND_URL for tests
    process.env.FRONTEND_URL = 'http://localhost:3001';
  });

  describe('create()', () => {
    it('should generate pass_url when creating a new customer', async () => {
      const testPhone = `+51${Date.now().toString().slice(-9)}`;

      const input = {
        business_id: 'existing-business-id', // Replace with actual test business ID
        phone: testPhone,
        name: 'Test Customer',
        email_opt_in: true,
      };

      try {
        const customer = await CustomerService.create(input);

        // Assert pass_url was generated
        expect(customer.pass_url).toBeDefined();
        expect(customer.pass_url).toContain('/card/');
        expect(customer.pass_url).toContain(customer.id);

        // Assert correct format
        const expectedUrl = `http://localhost:3001/card/${customer.id}`;
        expect(customer.pass_url).toBe(expectedUrl);

        // Cleanup
        await supabaseAdmin
          .from('customers')
          .delete()
          .eq('id', customer.id);

        console.log('✅ pass_url generation test passed');
      } catch (error: any) {
        console.error('❌ Test failed:', error.message);
        throw error;
      }
    });

    it('should use default FRONTEND_URL if env var not set', async () => {
      const originalUrl = process.env.FRONTEND_URL;
      delete process.env.FRONTEND_URL;

      const testPhone = `+51${Date.now().toString().slice(-9)}`;

      const input = {
        business_id: 'existing-business-id',
        phone: testPhone,
        name: 'Test Default URL',
        email_opt_in: true,
      };

      try {
        const customer = await CustomerService.create(input);

        // Should fall back to localhost:3001
        expect(customer.pass_url).toContain('http://localhost:3001/card/');

        // Cleanup
        await supabaseAdmin
          .from('customers')
          .delete()
          .eq('id', customer.id);

        console.log('✅ Default URL test passed');
      } catch (error: any) {
        console.error('❌ Test failed:', error.message);
        throw error;
      } finally {
        process.env.FRONTEND_URL = originalUrl;
      }
    });
  });

  describe('findById()', () => {
    it('should return customer with pass_url', async () => {
      // Create a test customer first
      const testPhone = `+51${Date.now().toString().slice(-9)}`;

      const created = await CustomerService.create({
        business_id: 'existing-business-id',
        phone: testPhone,
        name: 'Test Find Customer',
        email_opt_in: true,
      });

      try {
        // Find by ID
        const found = await CustomerService.findById(created.id);

        expect(found).toBeDefined();
        expect(found?.pass_url).toBeDefined();
        expect(found?.pass_url).toContain(created.id);

        console.log('✅ findById with pass_url test passed');
      } finally {
        // Cleanup
        await supabaseAdmin
          .from('customers')
          .delete()
          .eq('id', created.id);
      }
    });
  });
});
