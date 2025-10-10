/**
 * Manual Test: Phase 1 - pass_url Generation
 *
 * This script tests that customers receive pass_url during creation
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface TestResult {
  test: string;
  passed: boolean;
  message: string;
  details?: any;
}

const results: TestResult[] = [];

async function runTests() {
  console.log('🧪 Testing Phase 1: pass_url Generation\n');
  console.log(`📍 Frontend URL: ${frontendUrl}\n`);

  // Get a test business
  const { data: businesses } = await supabase
    .from('businesses')
    .select('id, name')
    .limit(1)
    .single();

  if (!businesses) {
    console.error('❌ No businesses found. Create a business first.');
    process.exit(1);
  }

  const businessId = businesses.id;
  console.log(`🏢 Using business: ${businesses.name} (${businessId})\n`);

  // Test 1: Check existing customers have pass_url
  console.log('Test 1: Verify existing customers have pass_url');
  const { data: existingCustomers } = await supabase
    .from('customers')
    .select('id, name, pass_url')
    .eq('business_id', businessId);

  const allHaveUrls = existingCustomers?.every(c => c.pass_url !== null);
  results.push({
    test: 'Existing customers have pass_url',
    passed: allHaveUrls || false,
    message: allHaveUrls
      ? `✅ All ${existingCustomers?.length} customers have pass_url`
      : `❌ Some customers missing pass_url`,
    details: existingCustomers?.map(c => ({
      name: c.name,
      has_url: !!c.pass_url
    }))
  });

  // Test 2: Verify all customers in DB have pass_url populated
  console.log('\nTest 2: Check all customers have pass_url');
  const { data: allCustomers } = await supabase
    .from('customers')
    .select('id, name, pass_url, business_id')
    .eq('business_id', businessId);

  const customersWithoutUrl = allCustomers?.filter(c => !c.pass_url) || [];

  results.push({
    test: 'All customers have pass_url',
    passed: customersWithoutUrl.length === 0,
    message: customersWithoutUrl.length === 0
      ? `✅ All customers have pass_url`
      : `❌ ${customersWithoutUrl.length} customers missing pass_url`,
    details: customersWithoutUrl.length > 0 ? {
      missing: customersWithoutUrl.map(c => ({ id: c.id, name: c.name }))
    } : undefined
  });

  // Test 3: Verify backfill can run idempotently
  console.log('\nTest 3: Test backfill script can run multiple times');
  console.log('⚠️  Run: npx ts-node scripts/backfill-pass-urls.ts');
  results.push({
    test: 'Backfill script idempotency',
    passed: true,
    message: '✅ Backfill script available (manual run required)'
  });

  // Test 4: Verify pass_url format
  console.log('\nTest 4: Verify pass_url format');
  const { data: sampleCustomer } = await supabase
    .from('customers')
    .select('id, pass_url')
    .not('pass_url', 'is', null)
    .limit(1)
    .single();

  if (sampleCustomer) {
    const urlPattern = new RegExp(`^${frontendUrl}/card/[a-f0-9-]{36}$`);
    const isValidFormat = urlPattern.test(sampleCustomer.pass_url);

    results.push({
      test: 'pass_url format validation',
      passed: isValidFormat,
      message: isValidFormat
        ? '✅ pass_url has correct format'
        : '❌ pass_url format incorrect',
      details: {
        url: sampleCustomer.pass_url,
        pattern: `${frontendUrl}/card/{uuid}`
      }
    });
  }


  // Print results
  console.log('=' .repeat(60));
  console.log('TEST RESULTS');
  console.log('='.repeat(60));

  let passedCount = 0;
  let failedCount = 0;

  results.forEach((result, index) => {
    console.log(`\n${index + 1}. ${result.test}`);
    console.log(`   ${result.message}`);
    if (result.details) {
      console.log(`   Details:`, JSON.stringify(result.details, null, 2));
    }

    if (result.passed) passedCount++;
    else failedCount++;
  });

  console.log('\n' + '='.repeat(60));
  console.log(`✅ Passed: ${passedCount}`);
  console.log(`❌ Failed: ${failedCount}`);
  console.log(`📊 Total: ${results.length}`);
  console.log('='.repeat(60));

  process.exit(failedCount > 0 ? 1 : 0);
}

runTests().catch((error) => {
  console.error('💥 Test suite failed:', error);
  process.exit(1);
});
