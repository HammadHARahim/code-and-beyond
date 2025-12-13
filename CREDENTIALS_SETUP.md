# Quick Fix: Update Supabase Credentials

## Step 1: Get Your Supabase Credentials

1. Go to your Supabase project dashboard
2. Click **Settings** (⚙️) in the left sidebar
3. Click **API**
4. Copy these two values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon public** key (the long string starting with `eyJ...`)

## Step 2: Update supabase-client.js

Open: `public/scripts/supabase-client.js`

Replace lines 6-7:
```javascript
// BEFORE:
const supabaseUrl = 'REPLACE_WITH_YOUR_SUPABASE_URL';
const supabaseAnonKey = 'REPLACE_WITH_YOUR_SUPABASE_ANON_KEY';

// AFTER (with your actual credentials):
const supabaseUrl = 'https://your-project-id.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your-actual-key-here';
```

## Step 3: Set Admin Metadata (if not done)

Run this in Supabase SQL Editor:
```sql
UPDATE auth.users
SET raw_user_meta_data = '{"role": "admin"}'::jsonb
WHERE email = 'admin@codebeyond.event';
```

## Step 4: Test

1. Refresh the page
2. Go to: http://localhost:8000/test-supabase.html
3. All tests should pass ✅

## What Changed?

We switched from npm imports to CDN-based Supabase:
- ✅ No bundler needed
- ✅ Works directly in browser
- ✅ Added CDN script tags to all HTML files
- ✅ Faster setup

## Troubleshooting

**Still seeing errors?**
- Make sure to hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
- Check browser console for the credentials warning
- Verify you replaced BOTH the URL AND the anon key

**Can't find credentials?**
- Supabase Dashboard → Settings → API → Project URL
- Supabase Dashboard → Settings → API → Project API keys → anon public
