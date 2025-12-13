// ========================================
// ADMIN PANEL - INITIALIZATION
// ========================================

let allParticipants = [];
let filteredParticipants = [];

document.addEventListener('DOMContentLoaded', () => {
    loadParticipants();
    initializeEventListeners();
    initializeNavigation();
});

// ========================================
// NAVIGATION
// ========================================

function initializeNavigation() {
    const navItems = document.querySelectorAll('.nav-item');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();

            // Remove active from all nav items
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');

            const href = item.getAttribute('href');

            // Get sections
            const statsGrid = document.querySelector('.stats-grid');
            const tableSection = document.querySelector('.table-section');

            // Always show projects section (since it's the only one now)
            if (statsGrid) statsGrid.style.display = 'grid';
            if (tableSection) tableSection.style.display = 'block';
        });
    });
}


// ========================================
// LOAD PARTICIPANTS DATA
// ========================================

function loadParticipants() {
    const users = JSON.parse(localStorage.getItem('codeAndBeyondUsers') || '[]');
    allParticipants = users.map(user => ({
        email: user.email,
        status: user.status || 'pending',
        rejectionReason: user.rejectionReason || '',
        adminNotes: user.adminNotes || '',
        statusUpdatedAt: user.statusUpdatedAt || '',
        ...user.registrationData,
        registeredAt: user.registeredAt
    }));

    filteredParticipants = [...allParticipants];

    updateStatistics();
    populateTable();
}

function updateStatistics() {
    const total = allParticipants.length;
    const pending = allParticipants.filter(p => p.status === 'pending').length;
    const rejected = allParticipants.filter(p => p.status === 'rejected').length;

    const statTotal = document.getElementById('stat-total');
    const statPending = document.getElementById('stat-pending');
    const statRejected = document.getElementById('stat-rejected');

    if (statTotal) statTotal.textContent = total;
    if (statPending) statPending.textContent = pending;
    if (statRejected) statRejected.textContent = rejected || '0';
}

function populateTable() {
    const tbody = document.getElementById('participants-tbody');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (filteredParticipants.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 2rem; color: rgba(255, 255, 255, 0.5);">
                    No participants found
                </td>
            </tr>
        `;
        return;
    }

    filteredParticipants.forEach((participant, index) => {
        const row = document.createElement('tr');
        row.dataset.email = participant.email;

        const statusBadge = getStatusBadge(participant.status);
        const formattedDate = formatDate(participant.registeredAt);

        row.innerHTML = `
            <td>
                <input type="checkbox" class="table-checkbox row-checkbox" data-email="${participant.email}" />
            </td>
            <td>#${String(index + 1).padStart(3, '0')}</td>
            <td>${participant.teamLead || 'N/A'}</td>
            <td>${participant.projectTitle || 'N/A'}</td>
            <td>${formatCategory(participant.category)}</td>
            <td>${formattedDate}</td>
            <td>${statusBadge}</td>
            <td>
                <button class="btn-table-action" onclick="viewParticipant('${participant.email}')" title="View">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M1 8C1 8 3 3 8 3C13 3 15 8 15 8C15 8 13 13 8 13C3 13 1 8 1 8Z"
                            stroke="currentColor" stroke-width="2" />
                        <circle cx="8" cy="8" r="2" stroke="currentColor" stroke-width="2" />
                    </svg>
                </button>
                <button class="btn-table-action" onclick="openEditModal('${participant.email}')" title="Edit">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M11.5 1.5L14.5 4.5L5 14H2V11L11.5 1.5Z" stroke="currentColor" stroke-width="2"/>
                    </svg>
                </button>
                ${participant.status === 'pending' ? `
                    <button class="btn-table-action btn-approve" onclick="approveParticipant('${participant.email}')" title="Approve">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M3 8L6 11L13 4" stroke="currentColor" stroke-width="2" />
                        </svg>
                    </button>
                    <button class="btn-table-action btn-reject" onclick="showRejectModal('${participant.email}')" title="Reject">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" stroke-width="2" />
                        </svg>
                    </button>
                ` : ''}
                <button class="btn-table-action btn-delete" onclick="deleteParticipant('${participant.email}')" title="Delete">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M2 4H14M5 4V2H11V4M6 7V11M10 7V11" stroke="currentColor" stroke-width="2"/>
                        <path d="M4 4H12V14H4V4Z" stroke="currentColor" stroke-width="2"/>
                    </svg>
                </button>
            </td>
        `;

        tbody.appendChild(row);
    });
}

function getStatusBadge(status) {
    const badges = {
        'pending': '<span class="badge badge-pending">Pending</span>',
        'approved': '<span class="badge badge-approved">Approved</span>',
        'rejected': '<span class="badge badge-rejected">Rejected</span>'
    };
    return badges[status] || badges['pending'];
}

function formatCategory(category) {
    const categoryMap = {
        'ai': 'AI',
        'web': 'Web Dev',
        'mobile': 'Mobile',
        'blockchain': 'Blockchain',
        'iot': 'IoT',
        'data': 'Data Science',
        'cybersecurity': 'Cybersecurity',
        'other': 'Other'
    };
    return categoryMap[category] || category || 'N/A';
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

// ========================================
// APPROVE/REJECT FUNCTIONS
// ========================================

function approveParticipant(email) {
    if (confirm('Approve this participant?')) {
        updateParticipantStatus(email, 'approved', '');
    }
}

function showRejectModal(email) {
    const modal = document.getElementById('reject-modal');
    if (modal) {
        modal.dataset.email = email;
        modal.dataset.bulk = 'false'; // Ensure it's not bulk mode
        modal.style.display = 'flex';
    }
}

// ========================================
// EVENT LISTENERS
// ========================================

function initializeEventListeners() {
    window.addEventListener('click', (e) => {
        const rejectModal = document.getElementById('reject-modal');
        if (rejectModal && e.target === rejectModal) {
            closeRejectModal();
        }
    });

    // Search input
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            applyFilters();
        });
    }

    // Status filter
    const statusFilter = document.getElementById('status-filter');
    if (statusFilter) {
        statusFilter.addEventListener('change', () => {
            applyFilters();
        });
    }

    // Category filter
    const categoryFilter = document.getElementById('category-filter');
    if (categoryFilter) {
        categoryFilter.addEventListener('change', () => {
            applyFilters();
        });
    }

    // Clear filters button
    const clearFiltersBtn = document.getElementById('clear-filters');
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', () => {
            clearFilters();
        });
    }

    // Edit form submit
    const editForm = document.getElementById('edit-form');
    if (editForm) {
        editForm.addEventListener('submit', saveParticipantEdits);
    }

    // Close modals on outside click
    window.addEventListener('click', (e) => {
        const editModal = document.getElementById('edit-modal');
        const deleteModal = document.getElementById('delete-modal');
        const detailModal = document.getElementById('detail-modal');

        if (e.target === editModal) closeEditModal();
        if (e.target === deleteModal) closeDeleteModal();
        if (e.target === detailModal) closeDetailModal();
    });

    // Export button
    const exportBtn = document.getElementById('export-btn');
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            exportToCSV();
        });
    }

    // Select all checkbox
    const selectAllCheckbox = document.getElementById('select-all');
    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', (e) => {
            const rowCheckboxes = document.querySelectorAll('.row-checkbox');
            rowCheckboxes.forEach(checkbox => {
                checkbox.checked = e.target.checked;
            });
            updateBulkActionsVisibility();
        });
    }

    // Row checkboxes (delegated)
    document.addEventListener('change', (e) => {
        if (e.target.classList.contains('row-checkbox')) {
            updateBulkActionsVisibility();
        }
    });
}

function updateBulkActionsVisibility() {
    const selected = getSelectedEmails();
    const bulkActions = document.getElementById('bulk-actions');
    const bulkCount = document.getElementById('bulk-selected-count');

    if (selected.length > 0) {
        bulkActions.style.display = 'flex';
        bulkCount.textContent = `${selected.length} selected`;
    } else {
        bulkActions.style.display = 'none';
    }

    // Update select-all checkbox state
    const rowCheckboxes = document.querySelectorAll('.row-checkbox');
    const selectAllCheckbox = document.getElementById('select-all');
    if (selectAllCheckbox && rowCheckboxes.length > 0) {
        const allChecked = Array.from(rowCheckboxes).every(cb => cb.checked);
        selectAllCheckbox.checked = allChecked;
    }
}

function getSelectedEmails() {
    const checkboxes = document.querySelectorAll('.row-checkbox:checked');
    return Array.from(checkboxes).map(cb => cb.dataset.email);
}

function clearSelections() {
    document.querySelectorAll('.row-checkbox').forEach(cb => cb.checked = false);
    const selectAll = document.getElementById('select-all');
    if (selectAll) selectAll.checked = false;
    updateBulkActionsVisibility();
}

// ========================================
// EXPORT TO CSV
// ========================================

function exportToCSV() {
    const dataToExport = filteredParticipants.length > 0 ? filteredParticipants : allParticipants;

    if (dataToExport.length === 0) {
        alert('No data to export');
        return;
    }

    // CSV Headers
    const headers = [
        'ID',
        'Email',
        'Status',
        'Team Name',
        'Team Lead',
        'University',
        'Department',
        'Phone',
        'Team Size',
        'Project Title',
        'Category',
        'Tech Stack',
        'Problem Solved',
        'Project URL',
        'Video URL',
        'Accommodation Required',
        'Accommodation Type',
        'Accommodation Duration',
        'Registered Date'
    ];

    // Convert data to CSV rows
    const rows = dataToExport.map((participant, index) => {
        return [
            `#${String(index + 1).padStart(3, '0')}`,
            participant.email || '',
            participant.status || 'pending',
            participant.teamName || '',
            participant.teamLead || '',
            participant.university || '',
            participant.department || '',
            participant.phone || '',
            participant.teamSize || '',
            participant.projectTitle || '',
            formatCategory(participant.category) || '',
            participant.techStack || '',
            participant.problemSolved || '',
            participant.projectUrl || '',
            participant.videoUrl || '',
            participant.accommodation?.required ? 'Yes' : 'No',
            participant.accommodation?.type || '',
            participant.accommodation?.duration || '',
            formatDate(participant.registeredAt) || ''
        ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(',');
    });

    // Combine headers and rows
    const csvContent = [
        headers.map(h => `"${h}"`).join(','),
        ...rows
    ].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `participants_export_${timestamp}.csv`;

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    const count = dataToExport.length;
    const filterActive = count < allParticipants.length;
    const message = filterActive
        ? `Exported ${count} filtered participants to ${filename}`
        : `Exported all ${count} participants to ${filename}`;

    alert(message);
}

// ========================================
// BULK OPERATIONS
// ========================================

function bulkApprove() {
    const emails = getSelectedEmails();
    if (emails.length === 0) return;

    if (!confirm(`Approve ${emails.length} participants?`)) return;

    const users = JSON.parse(localStorage.getItem('codeAndBeyondUsers') || '[]');

    emails.forEach(email => {
        const userIndex = users.findIndex(u => u.email === email);
        if (userIndex >= 0) {
            users[userIndex].status = 'approved';
            users[userIndex].statusUpdatedAt = new Date().toISOString();
        }
    });

    localStorage.setItem('codeAndBeyondUsers', JSON.stringify(users));
    loadParticipants();
    clearSelections();
    alert(`${emails.length} participants approved!`);
}

function showBulkRejectModal() {
    const emails = getSelectedEmails();
    if (emails.length === 0) return;

    const modal = document.getElementById('reject-modal');
    if (modal) {
        modal.dataset.emails = JSON.stringify(emails);
        modal.dataset.bulk = 'true';
        modal.style.display = 'flex';

        const subtitle = modal.querySelector('.modal-subtitle');
        if (subtitle) {
            subtitle.textContent = `Rejecting ${emails.length} participants. Provide a reason (visible to all selected participants)`;
        }
    }
}

function bulkDelete() {
    const emails = getSelectedEmails();
    if (emails.length === 0) return;

    if (!confirm(`Delete ${emails.length} participants? This cannot be undone.`)) return;

    const users = JSON.parse(localStorage.getItem('codeAndBeyondUsers') || '[]');
    const filteredUsers = users.filter(u => !emails.includes(u.email));

    localStorage.setItem('codeAndBeyondUsers', JSON.stringify(filteredUsers));
    loadParticipants();
    clearSelections();
    alert(`${emails.length} participants deleted!`);
}

// Helper function for updating participant status
function updateParticipantStatus(email, status, reason) {
    const users = JSON.parse(localStorage.getItem('codeAndBeyondUsers') || '[]');
    const userIndex = users.findIndex(u => u.email === email);

    if (userIndex >= 0) {
        users[userIndex].status = status;
        users[userIndex].rejectionReason = reason;
        users[userIndex].statusUpdatedAt = new Date().toISOString();

        localStorage.setItem('codeAndBeyondUsers', JSON.stringify(users));
        loadParticipants();

        alert(`Participant ${status}!`);
    }
}

// Unified rejectParticipant function (handles both single and bulk)
function rejectParticipant() {
    const modal = document.getElementById('reject-modal');
    const reasonInput = document.getElementById('rejection-reason');
    if (!modal || !reasonInput) return;

    const reason = reasonInput.value.trim();

    if (!reason) {
        alert('Please provide a reason for rejection');
        return;
    }

    const isBulk = modal.dataset.bulk === 'true';

    if (isBulk) {
        const emails = JSON.parse(modal.dataset.emails || '[]');
        const users = JSON.parse(localStorage.getItem('codeAndBeyondUsers') || '[]');

        emails.forEach(email => {
            const userIndex = users.findIndex(u => u.email === email);
            if (userIndex >= 0) {
                users[userIndex].status = 'rejected';
                users[userIndex].rejectionReason = reason;
                users[userIndex].statusUpdatedAt = new Date().toISOString();
            }
        });

        localStorage.setItem('codeAndBeyondUsers', JSON.stringify(users));
        loadParticipants();
        clearSelections();
        alert(`${emails.length} participants rejected!`);
    } else {
        const email = modal.dataset.email;
        updateParticipantStatus(email, 'rejected', reason);
    }

    closeRejectModal();
}

function closeRejectModal() {
    const modal = document.getElementById('reject-modal');
    const reasonInput = document.getElementById('rejection-reason');
    const subtitle = modal?.querySelector('.modal-subtitle');

    if (modal) {
        modal.style.display = 'none';
        modal.dataset.bulk = 'false';
        modal.dataset.emails = '[]';
    }
    if (reasonInput) reasonInput.value = '';
    if (subtitle) subtitle.textContent = 'Please provide a reason for rejection (visible to participant)';
}

// ========================================
// SEARCH AND FILTER FUNCTIONS
// ========================================

function applyFilters() {
    const searchQuery = document.getElementById('search-input')?.value.toLowerCase() || '';
    const statusFilter = document.getElementById('status-filter')?.value || '';
    const categoryFilter = document.getElementById('category-filter')?.value || '';

    filteredParticipants = allParticipants.filter(participant => {
        // Search filter
        const matchesSearch = !searchQuery ||
            (participant.teamLead && participant.teamLead.toLowerCase().includes(searchQuery)) ||
            (participant.email && participant.email.toLowerCase().includes(searchQuery)) ||
            (participant.projectTitle && participant.projectTitle.toLowerCase().includes(searchQuery)) ||
            (participant.university && participant.university.toLowerCase().includes(searchQuery)) ||
            (participant.teamName && participant.teamName.toLowerCase().includes(searchQuery));

        // Status filter
        const matchesStatus = !statusFilter || participant.status === statusFilter;

        // Category filter
        const matchesCategory = !categoryFilter || participant.category === categoryFilter;

        return matchesSearch && matchesStatus && matchesCategory;
    });

    populateTable();
    updateFilterCount();
}

function clearFilters() {
    const searchInput = document.getElementById('search-input');
    const statusFilter = document.getElementById('status-filter');
    const categoryFilter = document.getElementById('category-filter');

    if (searchInput) searchInput.value = '';
    if (statusFilter) statusFilter.value = '';
    if (categoryFilter) categoryFilter.value = '';

    applyFilters();
}

function updateFilterCount() {
    const titleElement = document.querySelector('.section-title');
    if (titleElement) {
        const count = filteredParticipants.length;
        const total = allParticipants.length;

        if (count < total) {
            titleElement.textContent = `Registered Participants (${count} of ${total})`;
        } else {
            titleElement.textContent = 'Registered Participants';
        }
    }
}

// ========================================
// Make functions globally available
// ========================================
window.viewParticipant = viewParticipant;
window.approveParticipant = approveParticipant;
window.showRejectModal = showRejectModal;
window.rejectParticipant = rejectParticipant;
window.closeRejectModal = closeRejectModal;
window.applyFilters = applyFilters;
window.clearFilters = clearFilters;
window.updateFilterCount = updateFilterCount;
window.openEditModal = openEditModal;
window.closeEditModal = closeEditModal;
window.saveParticipantEdits = saveParticipantEdits;
window.deleteParticipant = deleteParticipant;
window.closeDeleteModal = closeDeleteModal;
window.confirmDelete = confirmDelete;
window.exportToCSV = exportToCSV;
window.closeDetailModal = closeDetailModal;
window.bulkApprove = bulkApprove;
window.showBulkRejectModal = showBulkRejectModal;
window.bulkDelete = bulkDelete;
window.getSelectedEmails = getSelectedEmails;
window.clearSelections = clearSelections;
window.updateBulkActionsVisibility = updateBulkActionsVisibility;

// ========================================
// EDIT PARTICIPANT FUNCTIONALITY
// ========================================

let currentEditEmail = '';

function openEditModal(email) {
    const participant = allParticipants.find(p => p.email === email);
    if (!participant) return;

    currentEditEmail = email;
    const modal = document.getElementById('edit-modal');

    // Pre-fill form with current data
    document.getElementById('edit-team-name').value = participant.teamName || '';
    document.getElementById('edit-team-lead').value = participant.teamLead || '';
    document.getElementById('edit-university').value = participant.university || '';
    document.getElementById('edit-department').value = participant.department || '';
    document.getElementById('edit-phone').value = participant.phone || '';
    document.getElementById('edit-team-size').value = participant.teamSize || '';
    document.getElementById('edit-project-title').value = participant.projectTitle || '';
    document.getElementById('edit-category').value = participant.category || '';

    if (modal) modal.style.display = 'flex';
}

function closeEditModal() {
    const modal = document.getElementById('edit-modal');
    if (modal) modal.style.display = 'none';
    currentEditEmail = '';
}

function saveParticipantEdits(e) {
    e.preventDefault();

    const users = JSON.parse(localStorage.getItem('codeAndBeyondUsers') || '[]');
    const userIndex = users.findIndex(u => u.email === currentEditEmail);

    if (userIndex < 0) {
        alert('Participant not found!');
        return;
    }

    // Update participant data
    users[userIndex].registrationData = {
        ...users[userIndex].registrationData,
        teamName: document.getElementById('edit-team-name').value,
        teamLead: document.getElementById('edit-team-lead').value,
        university: document.getElementById('edit-university').value,
        department: document.getElementById('edit-department').value,
        phone: document.getElementById('edit-phone').value,
        teamSize: document.getElementById('edit-team-size').value,
        projectTitle: document.getElementById('edit-project-title').value,
        category: document.getElementById('edit-category').value
    };

    localStorage.setItem('codeAndBeyondUsers', JSON.stringify(users));
    loadParticipants();
    closeEditModal();
    alert('Participant updated successfully!');
}

// ========================================
// DELETE PARTICIPANT FUNCTIONALITY
// ========================================

let currentDeleteEmail = '';

function deleteParticipant(email) {
    const participant = allParticipants.find(p => p.email === email);
    if (!participant) return;

    currentDeleteEmail = email;
    const modal = document.getElementById('delete-modal');

    // Show participant info in delete modal
    document.getElementById('delete-team-lead').textContent = participant.teamLead || 'N/A';
    document.getElementById('delete-project').textContent = participant.projectTitle || 'N/A';

    if (modal) modal.style.display = 'flex';
}

function closeDeleteModal() {
    const modal = document.getElementById('delete-modal');
    if (modal) modal.style.display = 'none';
    currentDeleteEmail = '';
}

function confirmDelete() {
    const users = JSON.parse(localStorage.getItem('codeAndBeyondUsers') || '[]');
    const filteredUsers = users.filter(u => u.email !== currentDeleteEmail);

    localStorage.setItem('codeAndBeyondUsers', JSON.stringify(filteredUsers));
    loadParticipants();
    closeDeleteModal();
    alert('Participant deleted successfully!');
}

// ========================================
// VIEW PARTICIPANT DETAILS
// ========================================

function viewParticipant(email) {
    const participant = allParticipants.find(p => p.email === email);
    if (!participant) return;

    // Status
    const statusBadge = document.getElementById('detail-status-badge');
    if (statusBadge) {
        statusBadge.className = `badge badge-${participant.status || 'pending'}`;
        statusBadge.textContent = participant.status ? participant.status.charAt(0).toUpperCase() + participant.status.slice(1) : 'Pending';
    }

    // Rejection reason
    const rejectionContainer = document.getElementById('detail-rejection-reason');
    const rejectionText = document.getElementById('detail-rejection-text');
    if (participant.status === 'rejected' && participant.rejectionReason) {
        if (rejectionText) rejectionText.textContent = participant.rejectionReason;
        if (rejectionContainer) rejectionContainer.style.display = 'block';
    } else {
        if (rejectionContainer) rejectionContainer.style.display = 'none';
    }

    // Team Information
    document.getElementById('detail-team-name').textContent = participant.teamName || 'N/A';
    document.getElementById('detail-team-lead').textContent = participant.teamLead || 'N/A';
    document.getElementById('detail-email').textContent = participant.email || 'N/A';
    document.getElementById('detail-phone').textContent = participant.phone || 'N/A';
    document.getElementById('detail-university').textContent = participant.university || 'N/A';
    document.getElementById('detail-department').textContent = participant.department || 'N/A';
    document.getElementById('detail-team-size').textContent = participant.teamSize ? `${participant.teamSize} ${participant.teamSize === '1' ? 'Member' : 'Members'}` : 'N/A';

    // Project Details
    document.getElementById('detail-project-title').textContent = participant.projectTitle || 'N/A';
    document.getElementById('detail-category').textContent = formatCategory(participant.category);
    document.getElementById('detail-description').textContent = participant.projectDescription || 'N/A';
    document.getElementById('detail-problem').textContent = participant.problemSolved || 'N/A';
    document.getElementById('detail-tech').textContent = participant.techStack || 'N/A';

    // URLs
    const urlContainer = document.getElementById('detail-url-container');
    const videoContainer = document.getElementById('detail-video-container');

    if (participant.projectUrl) {
        const urlLink = document.getElementById('detail-url');
        urlLink.href = participant.projectUrl;
        urlLink.textContent = participant.projectUrl;
        urlContainer.style.display = 'block';
    } else {
        urlContainer.style.display = 'none';
    }

    if (participant.videoUrl) {
        const videoLink = document.getElementById('detail-video');
        videoLink.href = participant.videoUrl;
        videoLink.textContent = participant.videoUrl;
        videoContainer.style.display = 'block';
    } else {
        videoContainer.style.display = 'none';
    }

    // Registration Info
    document.getElementById('detail-registered').textContent = formatDate(participant.registeredAt);
    const accommodation = participant.accommodation?.required
        ? `Yes (${participant.accommodation.type || ''} - ${participant.accommodation.duration || ''})`
        : 'No';
    document.getElementById('detail-accommodation').textContent = accommodation;

    // Show modal
    document.getElementById('detail-modal').style.display = 'flex';
}

function closeDetailModal() {
    const modal = document.getElementById('detail-modal');
    if (modal) modal.style.display = 'none';
}

console.log('Admin panel loaded');
