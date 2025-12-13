// ========================================
// SUPABASE INTEGRATION
// ========================================
import { supabase } from './supabase-client.js';

// ========================================
// LOAD PARTICIPANT DATA FROM SUPABASE
// ========================================

async function populateParticipantData() {
    try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            console.log('No user session found');
            document.querySelector('.user-name').textContent = 'Guest';
            return;
        }

        // Fetch participant data from Supabase
        const { data: participant, error } = await supabase
            .from('participants')
            .select(`
                *,
                team_members (*)
            `)
            .eq('user_id', user.id)
            .single();

        if (error) {
            console.error('Error loading participant data:', error);
            // Show friendly error message
            document.querySelector('.user-name').textContent = 'Error Loading Data';
            return;
        }

        if (!participant) {
            console.log('No registration data found');
            document.querySelector('.user-name').textContent = user.email;
            return;
        }

        // Update header
        const userName = document.querySelector('.user-name');
        const userAvatar = document.querySelector('.user-avatar');
        if (userName) userName.textContent = participant.team_lead || 'Participant';
        if (userAvatar) {
            const initials = (participant.team_lead || 'PA').split(' ').map(word => word[0]).join('').substring(0, 2).toUpperCase();
            userAvatar.textContent = initials;
        }

        // Team Information
        document.getElementById('team-name').textContent = participant.team_name || 'N/A';
        document.getElementById('team-lead').textContent = participant.team_lead || 'N/A';
        document.getElementById('university').textContent = participant.university || 'N/A';
        document.getElementById('department').textContent = participant.department || 'N/A';

        // Participant ID
        const participantId = `CB-${new Date().getFullYear()}-${participant.id.substring(0, 4).toUpperCase()}`;
        document.getElementById('participant-id').textContent = participantId;

        // Rejection Reason (if rejected)
        if (participant.status === 'rejected' && participant.rejection_reason) {
            const rejectionSection = document.getElementById('rejection-reason-section');
            const rejectionText = document.getElementById('rejection-reason-text');
            if (rejectionSection && rejectionText) {
                rejectionSection.style.display = 'block';
                rejectionText.textContent = participant.rejection_reason;
            }
        }

        document.getElementById('email').textContent = user.email || 'N/A';
        document.getElementById('phone').textContent = participant.phone || 'N/A';
        document.getElementById('team-size').textContent = participant.team_size ? `${participant.team_size} ${participant.team_size === 1 ? 'Member' : 'Members'}` : 'N/A';
        document.getElementById('team-members-count').textContent = participant.team_size || '0';

        // Update Status Badge Dynamicall
        const statusBadge = document.querySelector('.status-badge');
        if (statusBadge) {
            // Remove all status classes
            statusBadge.classList.remove('status-pending', 'status-approved', 'status-rejected');

            // Get current status
            const status = participant.status || 'pending';

            // Add appropriate class and update text
            statusBadge.classList.add(`status-${status}`);

            const statusTexts = {
                'pending': 'Pending Review',
                'approved': 'Approved ✓',
                'rejected': 'Rejected ✗'
            };

            statusBadge.innerHTML = `
                <span class="badge-dot"></span>
                ${statusTexts[status] || 'Unknown'}
            `;
        }

        // Project Details
        document.getElementById('project-title').textContent = participant.project_title || 'Untitled Project';
        document.getElementById('project-category').textContent = formatCategory(participant.project_category);
        document.getElementById('tech-stack').textContent = participant.tech_stack || 'Not specified';
        document.getElementById('project-description').textContent = participant.project_description || 'No description provided';
        document.getElementById('problem-solved').textContent = participant.problem_solved || 'Not specified';

        // Project URL
        const projectUrlContainer = document.getElementById('project-url-container');
        const projectUrlLink = document.getElementById('project-url');
        if (participant.project_url) {
            projectUrlLink.href = participant.project_url;
            projectUrlContainer.style.display = 'flex';
        } else {
            projectUrlContainer.style.display = 'none';
        }

        // Video URL
        const videoUrlContainer = document.getElementById('video-url-container');
        const videoUrlLink = document.getElementById('video-url');
        if (participant.video_url) {
            videoUrlLink.href = participant.video_url;
            videoUrlContainer.style.display = 'flex';
        } else {
            videoUrlContainer.style.display = 'none';
        }

        // Accommodation
        const accommodationSection = document.getElementById('accommodation-section');
        const accommodationDetails = document.getElementById('accommodation-details');
        const accommodationRequired = document.getElementById('accommodation-required');

        if (participant.accommodation_needed) {
            accommodationRequired.textContent = 'Yes';

            // Add additional accommodation details
            if (participant.accommodation_type || participant.accommodation_duration) {
                let detailsHTML = `
                    <div class="info-item">
                        <div class="info-label">Accommodation Required</div>
                        <div class="info-value">Yes</div>
                    </div>
                `;

                if (participant.accommodation_type) {
                    detailsHTML += `
                        <div class="info-item">
                            <div class="info-label">Type</div>
                            <div class="info-value">${formatAccommodationType(participant.accommodation_type)}</div>
                        </div>
                    `;
                }

                if (participant.accommodation_duration) {
                    detailsHTML += `
                        <div class="info-item">
                            <div class="info-label">Duration</div>
                            <div class="info-value">${formatAccommodationDuration(participant.accommodation_duration)}</div>
                        </div>
                    `;
                }

                accommodationDetails.innerHTML = detailsHTML;
            }
            accommodationSection.style.display = 'block';
        } else {
            accommodationRequired.textContent = 'No';
            accommodationSection.style.display = 'block';
        }

        // Team Members
        const teamMembersDisplay = document.getElementById('team-members-display');
        const teamMembersList = document.getElementById('team-members-list');

        if (participant.team_members && participant.team_members.length > 0) {
            teamMembersList.innerHTML = '';
            participant.team_members.forEach((member) => {
                const memberCard = document.createElement('div');
                memberCard.className = 'team-member-item';

                memberCard.innerHTML = `
                    <div class="member-name-header">${member.member_name}</div>
                    <div class="member-info-grid">
                        <div class="member-info-item">
                            <div class="member-info-label">Role</div>
                            <div class="member-info-value">${member.member_role || 'Team Member'}</div>
                        </div>
                        <div class="member-info-item">
                            <div class="member-info-label">Email</div>
                            <div class="member-info-value">${member.member_email}</div>
                        </div>
                    </div>
                `;

                teamMembersList.appendChild(memberCard);
            });
            teamMembersDisplay.style.display = 'block';
        } else {
            teamMembersDisplay.style.display = 'none';
        }

        // Registration Date
        const registeredDate = document.getElementById('registered-date');
        if (participant.submitted_at) {
            registeredDate.textContent = formatDate(participant.submitted_at);
        } else {
            registeredDate.textContent = 'Not available';
        }

    } catch (error) {
        console.error('Unexpected error loading participant data:', error);
        document.querySelector('.user-name').textContent = 'Error';
    }
}

// Helper functions
function formatCategory(category) {
    const categoryMap = {
        'ai': 'Artificial Intelligence',
        'web': 'Web Development',
        'mobile': 'Mobile Development',
        'blockchain': 'Blockchain',
        'iot': 'Internet of Things',
        'data': 'Data Science',
        'cybersecurity': 'Cybersecurity',
        'other': 'Other'
    };
    return categoryMap[category] || category || 'Not specified';
}

function formatAccommodationType(type) {
    return type === 'male' ? 'Male Accommodation' : type === 'female' ? 'Female Accommodation' : type;
}

function formatAccommodationDuration(duration) {
    const durationMap = {
        '1-night': '1 Night',
        '2-nights': '2 Nights',
        '3-nights': '3 Nights',
        'event-only': 'Event Days Only'
    };
    return durationMap[duration] || duration;
}

// Format date
function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// ========================================
// PARTICIPANT DASHBOARD - INTERACTIVE
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    populateParticipantData(); // Populate data first
    initMatrixRainNeuralNetwork();
    initNavigation();
    initButtons();
    initAnimations();
});

// ========================================
// MATRIX RAIN + NEURAL NETWORK BACKGROUND
// ========================================

function initMatrixRainNeuralNetwork() {
    const canvas = document.getElementById('circuit-board');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Matrix rain setup
    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);
    const drops = Array(columns).fill(1);
    const matrixChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*(){}[]<>/\\|';

    // Neural network nodes
    const nodes = [];
    const nodeCount = 40;
    const maxConnections = 3;
    const connectionDistance = 200;

    // Create neural network nodes
    for (let i = 0; i < nodeCount; i++) {
        nodes.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            size: Math.random() * 3 + 2,
            pulse: Math.random() * Math.PI * 2,
            color: Math.random() > 0.5 ? '#00d4ff' : '#b537ff'
        });
    }

    function animate() {
        // Semi-transparent background for trail effect
        ctx.fillStyle = 'rgba(5, 5, 16, 0.08)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // ===== MATRIX RAIN =====
        ctx.fillStyle = '#00d4ff';
        ctx.font = `${fontSize}px monospace`;

        for (let i = 0; i < drops.length; i++) {
            // Random character from matrix chars
            const char = matrixChars[Math.floor(Math.random() * matrixChars.length)];
            const x = i * fontSize;
            const y = drops[i] * fontSize;

            // Gradient effect - brighter at the front
            const alpha = Math.min(0.8, drops[i] / 20);
            ctx.globalAlpha = alpha;
            ctx.fillStyle = drops[i] % 3 === 0 ? '#00d4ff' : '#00ffaa';

            ctx.fillText(char, x, y);

            // Reset drop to top randomly
            if (y > canvas.height && Math.random() > 0.975) {
                drops[i] = 0;
            }
            drops[i]++;
        }

        ctx.globalAlpha = 1;

        // ===== NEURAL NETWORK =====
        // Update node positions
        nodes.forEach(node => {
            node.x += node.vx;
            node.y += node.vy;

            // Bounce off edges
            if (node.x < 0 || node.x > canvas.width) node.vx *= -1;
            if (node.y < 0 || node.y > canvas.height) node.vy *= -1;

            // Keep within bounds
            node.x = Math.max(0, Math.min(canvas.width, node.x));
            node.y = Math.max(0, Math.min(canvas.height, node.y));

            node.pulse += 0.05;
        });

        // Draw connections
        let connectionCount = 0;
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                const dx = nodes[i].x - nodes[j].x;
                const dy = nodes[i].y - nodes[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < connectionDistance && connectionCount < maxConnections * nodeCount) {
                    const alpha = (1 - distance / connectionDistance) * 0.3;
                    ctx.strokeStyle = `rgba(0, 212, 255, ${alpha})`;
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(nodes[i].x, nodes[i].y);
                    ctx.lineTo(nodes[j].x, nodes[j].y);
                    ctx.stroke();
                    connectionCount++;
                }
            }
        }

        // Draw nodes
        nodes.forEach(node => {
            const pulseFactor = Math.sin(node.pulse) * 0.5 + 0.5;

            // Main node
            ctx.globalAlpha = pulseFactor * 0.8 + 0.2;
            ctx.fillStyle = node.color;
            ctx.beginPath();
            ctx.arc(node.x, node.y, node.size, 0, Math.PI * 2);
            ctx.fill();

            // Glow effect
            ctx.globalAlpha = pulseFactor * 0.4;
            const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, node.size * 3);
            gradient.addColorStop(0, node.color);
            gradient.addColorStop(1, 'transparent');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(node.x, node.y, node.size * 3, 0, Math.PI * 2);
            ctx.fill();
        });

        ctx.globalAlpha = 1;
        requestAnimationFrame(animate);
    }

    animate();

    // Resize handler
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
}

// ========================================
// NAVIGATION
// ========================================

function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();

            // Remove active from all
            navItems.forEach(nav => nav.classList.remove('active'));

            // Add active to clicked
            item.classList.add('active');

            const section = item.dataset.section;
            console.log(`Navigated to: ${section}`);
        });
    });
}

// ========================================
// BUTTON INTERACTIONS
// ========================================

function initButtons() {
    const downloadBtn = document.querySelector('.btn-download');
    const shareBtn = document.querySelector('.btn-share');

    if (downloadBtn) {
        downloadBtn.addEventListener('click', () => {
            console.log('Download pass clicked');
            alert('Your digital entry pass will be downloaded as a PDF. This feature will be available soon!');
        });
    }

    if (shareBtn) {
        shareBtn.addEventListener('click', () => {
            console.log('Share pass clicked');
            alert('Share your entry pass via:\\n• Email\\n• WhatsApp\\n• Social Media');
        });
    }
}

// ========================================
// ANIMATIONS
// ========================================

function initAnimations() {
    // Add entrance animations
    const cards = document.querySelectorAll('.glass-card');

    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';

        setTimeout(() => {
            card.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 100);
    });
}

console.log('Participant Dashboard loaded with Supabase integration');
