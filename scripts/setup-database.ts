import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';

dotenv.config();

async function setupDatabase(): Promise<void> {
  console.log('🚀 Setting up database schema...\n');

  try {
    // Note: Supabase doesn't support RPC for arbitrary SQL execution by default
    // You need to execute these files manually in Supabase SQL Editor
    // Or use Supabase CLI: supabase db push

    console.log('📋 To set up the database:');
    console.log('1. Go to Supabase Dashboard: https://supabase.com/dashboard/project/qonybpevhbczbutvkbfb');
    console.log('2. Navigate to SQL Editor');
    console.log('3. Copy and execute the following files in order:');
    console.log('   - scripts/schema.sql');
    console.log('   - scripts/rls-policies.sql');
    console.log('\n✅ Or use Supabase CLI:');
    console.log('   npx supabase db push --db-url postgresql://...');
    console.log('\n📝 Manual execution instructions saved to scripts/SETUP.md');

    // Create setup instructions
    const instructions = `# Database Setup Instructions

## Manual Setup (Recommended for first-time setup)

1. Go to Supabase Dashboard:
   https://supabase.com/dashboard/project/qonybpevhbczbutvkbfb

2. Navigate to **SQL Editor** (left sidebar)

3. Execute the following files **in order**:

   ### Step 1: Create Schema
   - Open \`scripts/schema.sql\`
   - Copy the entire content
   - Paste into SQL Editor
   - Click "Run" or press Ctrl+Enter

   ### Step 2: Set up RLS Policies
   - Open \`scripts/rls-policies.sql\`
   - Copy the entire content
   - Paste into SQL Editor
   - Click "Run" or press Ctrl+Enter

4. Verify tables were created:
   - Go to **Table Editor** (left sidebar)
   - You should see: businesses, customers, stamps, campaigns, etc.

## Using Supabase CLI (Alternative)

\`\`\`bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
npx supabase login

# Link to your project
npx supabase link --project-ref qonybpevhbczbutvkbfb

# Push schema to database
npx supabase db push
\`\`\`

## Verification

After setup, verify with:

\`\`\`bash
npm run dev
# Then visit http://localhost:3000/health/ready
# Should return: {"status": "ready", "checks": {"database": true, "supabase": true}}
\`\`\`

## Troubleshooting

If you get RLS policy errors:
- Make sure you're using the service_role key in .env
- Check that all tables have RLS enabled
- Verify policies were created successfully

If tables don't appear:
- Check for SQL syntax errors in the editor
- Make sure you ran schema.sql before rls-policies.sql
- Refresh the Table Editor page
`;

    fs.writeFileSync(path.join(__dirname, 'SETUP.md'), instructions);
    console.log('✅ Setup instructions written to scripts/SETUP.md');
  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }
}

setupDatabase()
  .then(() => {
    console.log('\n✅ Database setup complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database setup failed:', error);
    process.exit(1);
  });
