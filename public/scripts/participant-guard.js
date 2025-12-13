// Participant Route Guard - Supabase Version
// Protects participant routes from unauthorized access

import { supabase } from './supabase-client.js';

(async function () {
    try {
        // Check for active Supabase session
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
            console.error('Session check error:', error);
            redirectToLogin('Session error occurred');
            return;
        }

        if (!session) {
            redirectToLogin('No active session');
            return;
        }

        // Check user role
        const userRole = session.user.user_metadata?.role || 'participant';

        // If admin tries to access participant page, redirect to admin panel
        if (userRole === 'admin') {
            console.log('Admin detected, redirecting to admin panel');
            window.location.href = 'admin.html';
            return;
        }

        // Participant access granted
        console.log('Participant access granted:', session.user.email);

    } catch (error) {
        console.error('Participant guard error:', error);
        redirectToLogin('Authentication error');
    }
})();

function redirectToLogin(reason) {
    console.log('Redirecting to login:', reason);
    window.location.href = 'login.html';
}
