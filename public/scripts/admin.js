// ========================================
// ADMIN PANEL - SUPABASE VERSION
// ========================================

import { supabase } from './supabase-client.js';

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
// LOAD PARTICIPANTS DATA FROM SUPABASE
// ========================================

async function loadParticipants() {
    try {
        // Show loading state
        const tbody = document.getElementById('participants-tbody');
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:2rem;">Loading participants...</td></tr>';
        }

        // Fetch participants from Supabase
        const { data, error } = await supabase
            .from('participants')
            .select('*')
            .order('submitted_at', { ascending: false });

        if (error) {
            // console.error('Error loading participants:', error);
            if (tbody) {
                tbody.innerHTML = `< tr > <td colspan="7" style="text-align:center; padding:2rem; color:#ff4444;">Error loading participants: ${error.message}</td></tr > `;
            }
            return;
        }

        // Map Supabase data to our format (email is now directly in participants table)
        allParticipants = (data || []).map(p => ({
            id: p.id,
            userId: p.user_id,
            email: p.email || 'N/A',
            status: p.status,
            rejectionReason: p.rejection_reason,
            teamName: p.team_name,
            teamLead: p.team_lead,
            university: p.university,
            department: p.department,
            phone: p.phone,
            teamSize: p.team_size,
            projectTitle: p.project_title,
            category: p.project_category,
            projectDescription: p.project_description,
            problemSolved: p.problem_solved,
            techStack: p.tech_stack,
            projectUrl: p.project_url,
            videoUrl: p.video_url,
            projectDocUrl: p.project_doc_url,
            accommodation: {
                required: p.accommodation_needed,
                type: p.accommodation_type,
                duration: p.accommodation_duration
            },
            registeredAt: p.submitted_at
        }));

        filteredParticipants = [...allParticipants];

        updateStatistics();
        populateTable();

    } catch (error) {
        // console.error('Unexpected error:', error);
        alert('Failed to load participants. Please refresh the page.');
    }
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
    < tr >
    <td colspan="7" style="text-align: center; padding: 2rem; color: rgba(255, 255, 255, 0.5);">
        No participants found. Registrations will appear here.
    </td>
            </tr >
    `;
        return;
    }

    filteredParticipants.forEach((participant, index) => {
        const row = document.createElement('tr');
        row.dataset.id = participant.id;

        const statusBadge = getStatusBadge(participant.status);
        const formattedDate = formatDate(participant.registeredAt);

        row.innerHTML = `
    < td >
    <input type="checkbox" class="table-checkbox row-checkbox" data-id="${participant.id}" />
            </td >
            <td>#${String(index + 1).padStart(3, '0')}</td>
            <td>${participant.teamLead || 'N/A'}</td>
            <td>${participant.projectTitle || 'N/A'}</td>
            <td>${formatCategory(participant.category)}</td>
            <td>${formattedDate}</td>
            <td>${statusBadge}</td>
            <td>
                <button class="btn-table-action" onclick="viewParticipant('${participant.id}')" title="View">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M1 8C1 8 3 3 8 3C13 3 15 8 15 8C15 8 13 13 8 13C3 13 1 8 1 8Z"
                            stroke="currentColor" stroke-width="2" />
                        <circle cx="8" cy="8" r="2" stroke="currentColor" stroke-width="2" />
                    </svg>
                </button>
                ${participant.status === 'pending' ? `
                    <button class="btn-table-action btn-approve" onclick="approveParticipant('${participant.id}')" title="Approve">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M3 8L6 11L13 4" stroke="currentColor" stroke-width="2" />
                        </svg>
                    </button>
                    <button class="btn-table-action btn-reject" onclick="showRejectModal('${participant.id}')" title="Reject">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" stroke-width="2" />
                        </svg>
                    </button>
                ` : ''}
                <button class="btn-table-action btn-delete" onclick="deleteParticipant('${participant.id}')" title="Delete">
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
// APPROVE/REJECT FUNCTIONS - SUPABASE
// ========================================

async function approveParticipant(id) {
    if (!confirm('Approve this participant?')) return;

    try {
        const { data: { user } } = await supabase.auth.getUser();

        const { error } = await supabase
            .from('participants')
            .update({
                status: 'approved',
                reviewed_at: new Date().toISOString(),
                reviewed_by: user.id
            })
            .eq('id', id);

        if (error) {
            // console.error('Error approving participant:', error);
            alert(`Error: ${error.message} `);
            return;
        }

        alert('Participant approved!');
        loadParticipants(); // Reload data

    } catch (error) {
        // console.error('Unexpected error:', error);
        alert('Failed to approve participant.');
    }
}

async function rejectParticipant() {
    const modal = document.getElementById('reject-modal');
    const reasonInput = document.getElementById('rejection-reason');
    if (!modal || !reasonInput) return;

    const reason = reasonInput.value.trim();

    if (!reason) {
        alert('Please provide a reason for rejection');
        return;
    }

    const id = modal.dataset.id;

    try {
        const { data: { user } } = await supabase.auth.getUser();

        const { error } = await supabase
            .from('participants')
            .update({
                status: 'rejected',
                rejection_reason: reason,
                reviewed_at: new Date().toISOString(),
                reviewed_by: user.id
            })
            .eq('id', id);

        if (error) {
            // console.error('Error rejecting participant:', error);
            alert(`Error: ${error.message} `);
            return;
        }

        alert('Participant rejected');
        closeRejectModal();
        loadParticipants();

    } catch (error) {
        // console.error('Unexpected error:', error);
        alert('Failed to reject participant.');
    }
}

function showRejectModal(id) {
    const modal = document.getElementById('reject-modal');
    if (modal) {
        modal.dataset.id = id;
        modal.style.display = 'flex';
    }
}

function closeRejectModal() {
    const modal = document.getElementById('reject-modal');
    const reasonInput = document.getElementById('rejection-reason');

    if (modal) {
        modal.style.display = 'none';
        modal.dataset.id = '';
    }
    if (reasonInput) reasonInput.value = '';
}

// ========================================
// DELETE PARTICIPANT - SUPABASE
// ========================================

let currentDeleteId = '';

async function deleteParticipant(id) {
    const participant = allParticipants.find(p => p.id === id);
    if (!participant) return;

    currentDeleteId = id;
    const modal = document.getElementById('delete-modal');

    // Show participant info in delete modal
    document.getElementById('delete-team-lead').textContent = participant.teamLead || 'N/A';
    document.getElementById('delete-project').textContent = participant.projectTitle || 'N/A';

    if (modal) modal.style.display = 'flex';
}

function closeDeleteModal() {
    const modal = document.getElementById('delete-modal');
    if (modal) modal.style.display = 'none';
    currentDeleteId = '';
}

async function confirmDelete() {
    try {
        const { error } = await supabase
            .from('participants')
            .delete()
            .eq('id', currentDeleteId);

        if (error) {
            // console.error('Error deleting participant:', error);
            alert(`Error: ${error.message} `);
            return;
        }

        closeDeleteModal();
        alert('Participant deleted successfully!');
        loadParticipants();

    } catch (error) {
        // console.error('Unexpected error:', error);
        alert('Failed to delete participant.');
    }
}

// ========================================
// VIEW PARTICIPANT DETAILS
// ========================================

function viewParticipant(id) {
    const participant = allParticipants.find(p => p.id === id);
    if (!participant) return;

    // Status
    const statusBadge = document.getElementById('detail-status-badge');
    if (statusBadge) {
        statusBadge.className = `badge badge - ${participant.status || 'pending'} `;
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
    document.getElementById('detail-team-size').textContent = participant.teamSize ? `${participant.teamSize} ${participant.teamSize === 1 ? 'Member' : 'Members'} ` : 'N/A';

    // Project Details
    document.getElementById('detail-project-title').textContent = participant.projectTitle || 'N/A';
    document.getElementById('detail-category').textContent = formatCategory(participant.category);
    document.getElementById('detail-description').textContent = participant.projectDescription || 'N/A';
    document.getElementById('detail-problem').textContent = participant.problemSolved || 'N/A';
    document.getElementById('detail-tech').textContent = participant.techStack || 'N/A';

    // URLs
    const urlContainer = document.getElementById('detail-url-container');
    const videoContainer = document.getElementById('detail-video-container');
    const docContainer = document.getElementById('detail-doc-container');

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

    if (participant.projectDocUrl) {
        const docLink = document.getElementById('detail-doc');
        docLink.href = participant.projectDocUrl;
        docLink.textContent = participant.projectDocUrl;
        docContainer.style.display = 'block';
    } else {
        docContainer.style.display = 'none';
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

// ========================================
// SEARCH AND FILTER
// ========================================

function applyFilters() {
    const searchQuery = document.getElementById('search-input')?.value.toLowerCase() || '';
    const statusFilter = document.getElementById('status-filter')?.value || '';
    const categoryFilter = document.getElementById('category-filter')?.value || '';

    filteredParticipants = allParticipants.filter(participant => {
        // Search filter
        const matchesSearch = !searchQuery ||
            (participant.teamLead && participant.teamLead.toLowerCase().includes(searchQuery)) ||
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
            titleElement.textContent = `Registered Participants(${count} of ${total})`;
        } else {
            titleElement.textContent = 'Registered Participants';
        }
    }
}

// ========================================
// EVENT LISTENERS
// ========================================

function initializeEventListeners() {
    // Search input
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', () => applyFilters());
    }

    // Status filter
    const statusFilter = document.getElementById('status-filter');
    if (statusFilter) {
        statusFilter.addEventListener('change', () => applyFilters());
    }

    // Category filter
    const categoryFilter = document.getElementById('category-filter');
    if (categoryFilter) {
        categoryFilter.addEventListener('change', () => applyFilters());
    }

    // Clear filters
    const clearFiltersBtn = document.getElementById('clear-filters');
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', () => clearFilters());
    }

    // Close modals on outside click
    window.addEventListener('click', (e) => {
        const rejectModal = document.getElementById('reject-modal');
        const deleteModal = document.getElementById('delete-modal');
        const detailModal = document.getElementById('detail-modal');

        if (e.target === rejectModal) closeRejectModal();
        if (e.target === deleteModal) closeDeleteModal();
        if (e.target === detailModal) closeDetailModal();
    });
}

// ========================================
// Make functions globally available
// ========================================
window.viewParticipant = viewParticipant;
window.approveParticipant = approveParticipant;
window.showRejectModal = showRejectModal;
window.rejectParticipant = rejectParticipant;
window.closeRejectModal = closeRejectModal;
window.deleteParticipant = deleteParticipant;
window.closeDeleteModal = closeDeleteModal;
window.confirmDelete = confirmDelete;
window.closeDetailModal = closeDetailModal;

// ========================================
// CSV EXPORT FUNCTIONALITY
// ========================================

function exportToCSV() {
    if (filteredParticipants.length === 0) {
        alert('No participants to export');
        return;
    }

    // CSV headers
    const headers = [
        'Team Name',
        'Team Lead',
        'University',
        'Department',
        'Phone',
        'Team Size',
        'Project Title',
        'Category',
        'Description',
        'Problem Solved',
        'Tech Stack',
        'Project URL',
        'Video URL',
        'Accommodation',
        'Status',
        'Registered Date'
    ];

    // Create CSV rows
    const rows = filteredParticipants.map(p => [
        p.teamName || '',
        p.teamLead || '',
        p.university || '',
        p.department || '',
        p.phone || '',
        p.teamSize || '',
        p.projectTitle || '',
        formatCategory(p.category) || '',
        p.description || '',
        p.problemSolved || '',
        p.techStack || '',
        p.projectUrl || '',
        p.videoUrl || '',
        p.accommodation?.required ? 'Yes' : 'No',
        (p.status || 'pending').charAt(0).toUpperCase() + (p.status || 'pending').slice(1),
        formatDate(p.registeredAt)
    ]);

    // Combine headers and rows
    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `participants_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Add export button event listener
document.addEventListener('DOMContentLoaded', () => {
    const exportBtn = document.getElementById('export-btn');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportToCSV);
    }
});

window.exportToCSV = exportToCSV;
