# Supabase Setup Instructions

## Step 1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign in with GitHub
4. Click "New Project"
5. Fill in:
   - **Name**: code-and-beyond
   - **Database Password**: (choose a strong password)
   - **Region**: Select closest to Pakistan (Singapore recommended)
6. Click "Create new project" (takes ~2 minutes)

## Step 2: Get Your Credentials

1. In your Supabase project dashboard, click on ⚙️ **Settings** (bottom left)
2. Click on **API** in the sidebar
3. Copy these values:

```
Project URL: https://xxxxx.supabase.co
anon public key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Step 3: Create Environment File

Create `.env` file in the project root:

```bash
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

**Important**: Add `.env` to `.gitignore`!

## Step 4: Run Database Schema

1. In Supabase dashboard, click **SQL Editor** (left sidebar)
2. Click "New query"
3. Copy and paste the SQL from `supabase-schema.sql`
4. Click "Run" or press Ctrl+Enter
5. Verify tables were created in **Table Editor**

## Step 5: Set Up Row Level Security

1. Still in SQL Editor, create a new query
2. Copy and paste the RLS policies from `supabase-rls-policies.sql`
3. Click "Run"
4. Verify in Table Editor → select table → RLS tab

## Step 6: Create Admin User

1. In Supabase dashboard, click **Authentication** → **Users**
2. Click "Add user"
3. Fill in:
   - **Email**: admin@codebeyond.event
   - **Password**: CodeBeyond2025!
   - **Auto Confirm User**: ✅ (check this)
4. Click "Create user"
5. Click on the user, go to "User Metadata" section
6. Add metadata:
```json
{
  "role": "admin"
}
```
7. Click "Save"

## Step 7: Update Frontend Configuration

The `supabase-client.js` file will automatically read from `.env` file when using a bundler (Vite/Webpack).

For development without bundler, update `supabase-client.js` directly:

```javascript
const supabaseUrl = 'https://xxxxx.supabase.co';
const supabaseAnonKey = 'your_anon_key_here';
```

## Step 8: Test Connection

Open browser console and test:

```javascript
// In browser console
import { supabase } from './supabase-client.js';

// Test connection
const { data, error } = await supabase.from('participants').select('count');
console.log('Connected!', data);
```

## Next Steps

Once Supabase is set up:
1. Update registration form to use Supabase
2. Update login to use Supabase auth
3. Update admin panel to fetch from Supabase
4. Remove localStorage dependencies

## Troubleshooting

**Error: "Invalid API key"**
- Check that `.env` file exists
- Verify anon key is correct
- Restart dev server

**Error: "Row level security policy"**
- Make sure RLS policies are set up
- Check user is authenticated
- Verify user metadata has correct role

**Connection timeout**
- Check internet connection
- Verify Supabase project is not paused (free tier auto-pauses after 7 days of inactivity)
