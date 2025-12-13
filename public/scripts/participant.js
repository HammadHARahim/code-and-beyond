// ========================================
// POPULATE PARTICIPANT DATA FROM LOCALSTORAGE
// ========================================

function populateParticipantData() {
    // Get current user session
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const email = currentUser.email;

    if (!email) {
        console.log('No user session found');
        document.querySelector('.user-name').textContent = 'Guest';
        return;
    }

    // Get all users
    const users = JSON.parse(localStorage.getItem('codeAndBeyondUsers') || '[]');
    const user = users.find(u => u.email === email);

    if (!user || !user.registrationData) {
        console.log('No registration data found');
        return;
    }

    const data = user.registrationData;

    // Update header
    const userName = document.querySelector('.user-name');
    const userAvatar = document.querySelector('.user-avatar');
    if (userName) userName.textContent = data.teamLead || 'Participant';
    if (userAvatar) {
        const initials = (data.teamLead || 'PA').split(' ').map(word => word[0]).join('').substring(0, 2).toUpperCase();
        userAvatar.textContent = initials;
    }

    // Team Information
    document.getElementById('team-name').textContent = data.teamName || 'N/A';
    document.getElementById('team-lead').textContent = data.teamLead || 'N/A';
    document.getElementById('university').textContent = data.university || 'N/A';
    document.getElementById('department').textContent = data.department || 'N/A';
    // Participant ID
    const participantId = generateParticipantID(user.registeredAt);
    document.getElementById('participant-id').textContent = participantId;

    // Rejection Reason (if rejected)
    if (user.status === 'rejected' && user.rejectionReason) {
        const rejectionSection = document.getElementById('rejection-reason-section');
        const rejectionText = document.getElementById('rejection-reason-text');
        rejectionSection.style.display = 'block';
        rejectionText.textContent = user.rejectionReason;
    }
    document.getElementById('email').textContent = email || 'N/A';
    document.getElementById('phone').textContent = data.phone || 'N/A';
    document.getElementById('team-size').textContent = data.teamSize ? `${data.teamSize} ${data.teamSize === '1' ? 'Member' : 'Members'}` : 'N/A';
    document.getElementById('team-members-count').textContent = data.teamSize || '0';

    // Project Details
    document.getElementById('project-title').textContent = data.projectTitle || 'Untitled Project';
    document.getElementById('project-category').textContent = formatCategory(data.category);
    document.getElementById('tech-stack').textContent = data.techStack || 'Not specified';
    document.getElementById('project-description').textContent = data.description || 'No description provided';
    document.getElementById('problem-solved').textContent = data.problemSolved || 'Not specified';

    // Project URL
    const projectUrlContainer = document.getElementById('project-url-container');
    const projectUrlLink = document.getElementById('project-url');
    if (data.projectUrl) {
        projectUrlLink.href = data.projectUrl;
        projectUrlContainer.style.display = 'flex';
    } else {
        projectUrlContainer.style.display = 'none';
    }

    // Video URL
    const videoUrlContainer = document.getElementById('video-url-container');
    const videoUrlLink = document.getElementById('video-url');
    if (data.videoUrl) {
        videoUrlLink.href = data.videoUrl;
        videoUrlContainer.style.display = 'flex';
    } else {
        videoUrlContainer.style.display = 'none';
    }

    // Accommodation
    const accommodationSection = document.getElementById('accommodation-section');
    const accommodationDetails = document.getElementById('accommodation-details');
    const accommodationRequired = document.getElementById('accommodation-required');

    if (data.accommodation && data.accommodation.required) {
        accommodationRequired.textContent = 'Yes';

        // Add additional accommodation details
        if (data.accommodation.type || data.accommodation.duration) {
            let detailsHTML = `
                <div class="info-item">
                    <div class="info-label">Accommodation Required</div>
                    <div class="info-value">Yes</div>
                </div>
            `;

            if (data.accommodation.type) {
                detailsHTML += `
                    <div class="info-item">
                        <div class="info-label">Type</div>
                        <div class="info-value">${formatAccommodationType(data.accommodation.type)}</div>
                    </div>
                `;
            }

            if (data.accommodation.duration) {
                detailsHTML += `
                    <div class="info-item">
                        <div class="info-label">Duration</div>
                        <div class="info-value">${formatAccommodationDuration(data.accommodation.duration)}</div>
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

    if (data.teamMembers && data.teamMembers.length > 0) {
        teamMembersList.innerHTML = '';
        data.teamMembers.forEach((member, index) => {
            const memberCard = document.createElement('div');
            memberCard.className = 'team-member-item';

            memberCard.innerHTML = `
                <div class="member-name-header">${member.name}</div>
                <div class="member-info-grid">
                    <div class="member-info-item">
                        <div class="member-info-label">Department</div>
                        <div class="member-info-value">${member.department}</div>
                    </div>
                    <div class="member-info-item">
                        <div class="member-info-label">Email</div>
                        <div class="member-info-value">${member.email}</div>
                    </div>
                    ${member.phone ? `
                    <div class="member-info-item">
                        <div class="member-info-label">Phone</div>
                        <div class="member-info-value">${member.phone}</div>
                    </div>
                    ` : ''}
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
    if (user.registeredAt) {
        registeredDate.textContent = formatDate(user.registeredAt);
    } else {
        registeredDate.textContent = 'Not available';
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

// ========================================
// UTILITIES
// ========================================

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

// Generate random participant ID
function generateParticipantID() {
    const year = new Date().getFullYear() + 1;
    const num = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
    return `CB-${year}-${num}`;
}

console.log('Participant Dashboard loaded with Matrix Rain + Neural Network background');
