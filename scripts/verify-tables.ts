import { supabaseAdmin } from '../src/config/supabase';

async function verifyTables(): Promise<void> {
  console.log('🔍 Verifying database tables...\n');

  const tables = [
    'businesses',
    'customers',
    'stamps',
    'campaigns',
    'campaign_sends',
    'referrals',
    'analytics_events',
    'outbox_events',
  ];

  for (const table of tables) {
    try {
      const { error, count } = await supabaseAdmin
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.log(`❌ ${table}: ${error.message}`);
      } else {
        console.log(`✅ ${table}: ${count ?? 0} rows`);
      }
    } catch (err) {
      console.log(`❌ ${table}: ${err}`);
    }
  }

  console.log('\n📊 All tables verified!');
}

verifyTables()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Error:', err);
    process.exit(1);
  });
