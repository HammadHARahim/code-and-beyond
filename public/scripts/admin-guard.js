// ========================================
// ADMIN ROUTE GUARD
// ========================================// Admin Route Guard - Supabase Version
// Protects admin routes from unauthorized access

import { supabase } from './supabase-client.js';

(async function () {
    try {
        // Check for active Supabase session
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
            // console.error('Session check error:', error);
            redirectToLogin('Session error occurred');
            return;
        }

        if (!session) {
            redirectToLogin('No active session');
            return;
        }

        // Verify user role from metadata
        const userRole = session.user.user_metadata?.role || 'participant';

        if (userRole !== 'admin') {
            alert('Access denied. Admin privileges required.');
            // console.error('Unauthorized access attempt by:', session.user.email);
            // Redirect participants to their dashboard
            window.location.href = 'participant.html';
            return;
        }

        // Admin access granted
        // console.log('Admin access granted:', session.user.email);

    } catch (error) {
        // console.error('Admin guard error:', error);
        redirectToLogin('Authentication error');
    }
})();

function redirectToLogin(reason) {
    // console.log('Redirecting to login:', reason);
    window.location.href = 'login.html';
}
