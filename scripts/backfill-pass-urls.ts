/**
 * Backfill Script: Generate pass_url for existing customers
 *
 * This script updates all customers who don't have a pass_url
 * with their card URL: {FRONTEND_URL}/card/{customer_id}
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function backfillPassUrls() {
  console.log('🚀 Starting pass_url backfill...');
  console.log(`📍 Frontend URL: ${frontendUrl}\n`);

  try {
    // Find all customers without pass_url
    const { data: customers, error: fetchError } = await supabase
      .from('customers')
      .select('id, name, phone, business_id, pass_url')
      .is('pass_url', null);

    if (fetchError) {
      throw new Error(`Failed to fetch customers: ${fetchError.message}`);
    }

    if (!customers || customers.length === 0) {
      console.log('✅ No customers need updating - all have pass_url');
      return;
    }

    console.log(`📊 Found ${customers.length} customers without pass_url`);
    console.log('🔄 Updating customers...\n');

    let successCount = 0;
    let errorCount = 0;

    for (const customer of customers) {
      const passUrl = `${frontendUrl}/card/${customer.id}`;

      const { error: updateError } = await supabase
        .from('customers')
        .update({ pass_url: passUrl })
        .eq('id', customer.id);

      if (updateError) {
        console.error(`❌ Failed to update customer ${customer.id}: ${updateError.message}`);
        errorCount++;
      } else {
        successCount++;
        console.log(`✅ [${successCount}/${customers.length}] Updated: ${customer.name} (${customer.phone})`);
      }
    }

    console.log('\n🎉 Backfill complete!');
    console.log(`✅ Success: ${successCount}`);
    if (errorCount > 0) {
      console.log(`❌ Errors: ${errorCount}`);
    }

  } catch (error) {
    console.error('❌ Backfill failed:', error);
    process.exit(1);
  }
}

// Run backfill
backfillPassUrls()
  .then(() => {
    console.log('\n✨ Script finished successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
