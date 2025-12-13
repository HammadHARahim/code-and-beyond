// Supabase Client Configuration
// This file initializes the Supabase client for database operations

// Wait for Supabase CDN to load
const initSupabase = () => {
    // Supabase project credentials
    const supabaseUrl = 'https://bmixprymtehewxdakupf.supabase.co';
    const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJtaXhwcnltdGVoZXd4ZGFrdXBmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1ODMyMjksImV4cCI6MjA4MTE1OTIyOX0.zJYcf_OPmthDXBWuJShK3dSJRT2lZplz4DDZzdOin_0';

    // Check if credentials are set
    if (supabaseUrl.includes('REPLACE') || supabaseAnonKey.includes('REPLACE')) {
        console.error('⚠️ Supabase credentials not set! Please update supabase-client.js with your credentials.');
        console.error('Get them from: Supabase Dashboard → Settings → API');
    }

    // Create Supabase client using CDN
    return window.supabase.createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true
        }
    });
};

// Export supabase client
export const supabase = initSupabase();

// Helper function to check if user is authenticated
export async function isAuthenticated() {
    const { data: { session } } = await supabase.auth.getSession();
    return session !== null;
}

// Helper function to get current user
export async function getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
}

// Helper function to check if user is admin
export async function isAdmin() {
    const user = await getCurrentUser();
    return user?.user_metadata?.role === 'admin';
}
