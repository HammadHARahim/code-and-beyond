// ========================================
// ADMIN ROUTE GUARD
// ========================================
// This script ensures only admins can access the admin panel

(function () {
    // Get current user from localStorage
    const currentUser = localStorage.getItem('currentUser');

    // If no user is logged in, redirect to login page
    if (!currentUser) {
        alert('Please login to access the admin panel');
        window.location.href = 'login.html';
        return;
    }

    // Parse user data
    let user;
    try {
        user = JSON.parse(currentUser);
    } catch (error) {
        console.error('Invalid user session data');
        localStorage.removeItem('currentUser');
        window.location.href = 'login.html';
        return;
    }

    // Check if user is admin
    if (user.role !== 'admin') {
        alert('Access denied. Admin privileges required.');
        console.error('Unauthorized access attempt by:', user.email);
        // Redirect participants back to their dashboard
        window.location.href = 'participant.html';
        return;
    }

    // Admin access granted
    window.currentUser = user;
    console.log('Admin access granted:', user.email);
})();
