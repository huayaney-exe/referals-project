# Database Setup Instructions

## Manual Setup (Recommended for first-time setup)

1. Go to Supabase Dashboard:
   https://supabase.com/dashboard/project/qonybpevhbczbutvkbfb

2. Navigate to **SQL Editor** (left sidebar)

3. Execute the following files **in order**:

   ### Step 1: Create Schema
   - Open `scripts/schema.sql`
   - Copy the entire content
   - Paste into SQL Editor
   - Click "Run" or press Ctrl+Enter

   ### Step 2: Set up RLS Policies
   - Open `scripts/rls-policies.sql`
   - Copy the entire content
   - Paste into SQL Editor
   - Click "Run" or press Ctrl+Enter

4. Verify tables were created:
   - Go to **Table Editor** (left sidebar)
   - You should see: businesses, customers, stamps, campaigns, etc.

## Using Supabase CLI (Alternative)

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
npx supabase login

# Link to your project
npx supabase link --project-ref qonybpevhbczbutvkbfb

# Push schema to database
npx supabase db push
```

## Verification

After setup, verify with:

```bash
npm run dev
# Then visit http://localhost:3000/health/ready
# Should return: {"status": "ready", "checks": {"database": true, "supabase": true}}
```

## Troubleshooting

If you get RLS policy errors:
- Make sure you're using the service_role key in .env
- Check that all tables have RLS enabled
- Verify policies were created successfully

If tables don't appear:
- Check for SQL syntax errors in the editor
- Make sure you ran schema.sql before rls-policies.sql
- Refresh the Table Editor page
