// ========================================
// PARTICIPANT ROUTE GUARD
// ========================================
// This script ensures only participants can access the participant dashboard

(function () {
    // Get current user from localStorage
    const currentUser = localStorage.getItem('currentUser');

    // If no user is logged in, redirect to login page
    if (!currentUser) {
        alert('Please login to access your dashboard');
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

    // Check if user is a participant
    if (user.role !== 'participant') {
        alert('Access denied. This page is for participants only.');
        console.error('Unauthorized access attempt by:', user.email);
        // Redirect admins back to admin panel
        window.location.href = 'admin.html';
        return;
    }

    // Participant access granted
    window.currentUser = user;
    console.log('Participant access granted:', user.email);
})();
