import { supabaseAdmin } from '../src/infrastructure/supabase/supabaseAdmin';
import * as fs from 'fs';
import * as path from 'path';

async function applyTriggerFix() {
  const sql = fs.readFileSync('/tmp/fix_trigger.sql', 'utf8');

  try {
    const { data, error } = await supabaseAdmin.rpc('exec_sql', { sql_query: sql });

    if (error) {
      console.error('❌ Error applying trigger fix:', error);
      process.exit(1);
    }

    console.log('✅ Trigger fix applied successfully!');
    console.log('Testing enrollment now...');
    process.exit(0);
  } catch (err) {
    console.error('❌ Failed to apply fix:', err);
    process.exit(1);
  }
}

applyTriggerFix();
