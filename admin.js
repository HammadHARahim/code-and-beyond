// ========================================
// ADMIN DASHBOARD - INTERACTIVE FEATURES
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initTableActions();
    initNotifications();
});

// ========================================
// NAVIGATION
// ========================================

function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();

            // Remove active class from all items
            navItems.forEach(nav => nav.classList.remove('active'));

            // Add active class to clicked item
            item.classList.add('active');

            // Get the section
            const section = item.getAttribute('href').substring(1);
            console.log(`Navigated to: ${section}`);

            // You can add section switching logic here
        });
    });
}

// ========================================
// TABLE ACTIONS
// ========================================

function initTableActions() {
    const viewButtons = document.querySelectorAll('.btn-table-action');
    const rows = document.querySelectorAll('.data-table tbody tr');

    // Add click handlers to table rows
    rows.forEach(row => {
        row.addEventListener('click', (e) => {
            // Don't trigger if clicking on action buttons
            if (e.target.closest('.btn-table-action')) {
                return;
            }

            // Highlight selected row
            rows.forEach(r => r.style.background = '');
            row.style.background = 'var(--color-bg-tertiary)';
        });
    });

    // View button action
    viewButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            const row = button.closest('tr');
            const projectId = row.querySelector('td:first-child').textContent;
            const projectTitle = row.querySelector('td:nth-child(3)').textContent;

            console.log(`Viewing project ${projectId}: ${projectTitle}`);
            alert(`Project Details:\n${projectTitle}\nID: ${projectId}`);
        });
    });
}

// ========================================
// PAGINATION
// ========================================

function initPagination() {
    const paginationButtons = document.querySelectorAll('.pagination-btn');

    paginationButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (button.disabled) return;

            // Remove active class from all
            paginationButtons.forEach(btn => {
                if (!isNaN(btn.textContent)) {
                    btn.classList.remove('active');
                }
            });

            // Add active to clicked
            if (!isNaN(button.textContent)) {
                button.classList.add('active');
            }

            console.log(`Page changed to: ${button.textContent}`);
        });
    });
}

initPagination();

// ========================================
// NOTIFICATIONS
// ========================================

function initNotifications() {
    const notificationBtn = document.querySelector('.btn-icon');

    if (notificationBtn) {
        notificationBtn.addEventListener('click', () => {
            console.log('Notifications clicked');
            alert('You have 3 new notifications:\n\n• New project submission\n• Review pending\n• System update available');
        });
    }
}

// ========================================
// SEARCH & FILTER
// ========================================

const searchBtn = document.querySelector('.btn-secondary');
const filterBtn = document.querySelectorAll('.btn-secondary')[1];

if (searchBtn) {
    searchBtn.addEventListener('click', () => {
        const searchTerm = prompt('Search projects:');
        if (searchTerm) {
            console.log(`Searching for: ${searchTerm}`);
            // Add search logic here
        }
    });
}

if (filterBtn) {
    filterBtn.addEventListener('click', () => {
        console.log('Filter clicked');
        alert('Filter by:\n• Status\n• Category\n• Date Range');
    });
}

// ========================================
// REAL-TIME UPDATES (Simulation)
// ========================================

function simulateRealtimeUpdates() {
    // Update traffic count every 5 seconds
    setInterval(() => {
        const trafficValue = document.querySelector('.stat-card:last-child .stat-value');
        if (trafficValue) {
            const currentValue = parseInt(trafficValue.textContent.replace(',', ''));
            const newValue = currentValue + Math.floor(Math.random() * 10);
            trafficValue.textContent = newValue.toLocaleString();
        }
    }, 5000);
}

// Uncomment to enable realtime updates simulation
// simulateRealtimeUpdates();

// ========================================
// UTILITIES
// ========================================

// Format numbers with commas
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// Get current date/time
function getCurrentDateTime() {
    return new Date().toLocaleString();
}

console.log('Admin Dashboard loaded successfully');
console.log(`Current time: ${getCurrentDateTime()}`);
