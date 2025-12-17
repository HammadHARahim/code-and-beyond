// Circuit Board Background Animation (reusing from login.js)
const canvas = document.getElementById('circuit-board');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    drawCircuitBoard();
});

class CircuitNode {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.connections = [];
    }

    draw() {
        ctx.fillStyle = '#00d4ff';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#00d4ff';
        ctx.beginPath();
        ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
    }

    connect(node) {
        ctx.strokeStyle = 'rgba(0, 212, 255, 0.2)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(node.x, node.y);
        ctx.stroke();
    }
}

const nodes = [];
const gridSize = 100;

function initCircuitBoard() {
    nodes.length = 0;
    for (let x = 0; x < canvas.width; x += gridSize) {
        for (let y = 0; y < canvas.height; y += gridSize) {
            const offsetX = Math.random() * 40 - 20;
            const offsetY = Math.random() * 40 - 20;
            nodes.push(new CircuitNode(x + offsetX, y + offsetY));
        }
    }
}

function drawCircuitBoard() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    nodes.forEach((node, i) => {
        nodes.forEach((otherNode, j) => {
            if (i !== j) {
                const distance = Math.hypot(node.x - otherNode.x, node.y - otherNode.y);
                if (distance < gridSize * 1.5) {
                    node.connect(otherNode);
                }
            }
        });
        node.draw();
    });
}


initCircuitBoard();
drawCircuitBoard();

// ========================================
// TEAM MEMBERS MANAGEMENT
// ========================================

let memberCount = 0;
const teamMembersContainer = document.getElementById('team-members-container');
const addMemberBtn = document.getElementById('add-member-btn');

addMemberBtn.addEventListener('click', addTeamMember);

function addTeamMember() {
    memberCount++;

    const memberCard = document.createElement('div');
    memberCard.className = 'team-member-card';
    memberCard.dataset.memberIndex = memberCount;

    memberCard.innerHTML = `
        <div class="member-header">
            <span class="member-number">Member ${memberCount}</span>
            <button type="button" class="btn-remove-member" onclick="removeTeamMember(${memberCount})">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
            </button>
        </div>
        <div class="member-fields">
            <div class="form-group">
                <label for="member-${memberCount}-name" class="form-label">Full Name *</label>
                <input type="text" id="member-${memberCount}-name" class="form-input member-name" 
                    placeholder="Enter full name" required>
            </div>
            <div class="form-group">
                <label for="member-${memberCount}-department" class="form-label">Department *</label>
                <input type="text" id="member-${memberCount}-department" class="form-input member-department" 
                    placeholder="e.g., Computer Science" required>
            </div>
            <div class="form-group">
                <label for="member-${memberCount}-email" class="form-label">Email Address *</label>
                <input type="email" id="member-${memberCount}-email" class="form-input member-email" 
                    placeholder="email@example.com" required>
            </div>
            <div class="form-group">
                <label for="member-${memberCount}-phone" class="form-label">Phone Number</label>
                <input type="tel" id="member-${memberCount}-phone" class="form-input member-phone" 
                    placeholder="+92 300 1234567">
            </div>
        </div>
    `;

    teamMembersContainer.appendChild(memberCard);
}

function removeTeamMember(index) {
    const memberCard = document.querySelector(`[data-member-index="${index}"]`);
    if (memberCard) {
        memberCard.remove();
        updateMemberNumbers();
    }
}

function updateMemberNumbers() {
    const memberCards = teamMembersContainer.querySelectorAll('.team-member-card');
    memberCards.forEach((card, index) => {
        const memberNumber = card.querySelector('.member-number');
        memberNumber.textContent = `Member ${index + 1}`;
        card.dataset.memberIndex = index + 1;
    });
    memberCount = memberCards.length;
}

function collectTeamMembers() {
    const members = [];
    const memberCards = teamMembersContainer.querySelectorAll('.team-member-card');

    memberCards.forEach((card, index) => {
        const name = card.querySelector('.member-name').value;
        const department = card.querySelector('.member-department').value;
        const email = card.querySelector('.member-email').value;
        const phone = card.querySelector('.member-phone').value;

        members.push({
            name,
            department,
            email,
            phone: phone || null
        });
    });

    return members;
}

// Make removeTeamMember available globally
window.removeTeamMember = removeTeamMember;

//========================================
// PASSWORD VISIBILITY TOGGLE
// ========================================

const passwordInput = document.getElementById('password');
const confirmPasswordInput = document.getElementById('confirm-password');
const togglePassword = document.getElementById('toggle-password');

togglePassword.addEventListener('click', () => {
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
});

// ========================================
// PASSWORD STRENGTH CHECKER
// ========================================

const strengthFill = document.getElementById('strength-fill');
const strengthText = document.getElementById('strength-text');

function checkPasswordStrength(password) {
    if (!password) {
        strengthFill.className = 'strength-fill';
        strengthText.textContent = '';
        strengthText.className = 'strength-text';
        return null;
    }

    let strength = 0;

    // Length check
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;

    // Character variety checks
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;

    // Determine strength level
    if (strength < 3) {
        strengthFill.className = 'strength-fill weak';
        strengthText.className = 'strength-text weak';
        strengthText.textContent = 'Weak';
        return 'weak';
    } else if (strength < 5) {
        strengthFill.className = 'strength-fill medium';
        strengthText.className = 'strength-text medium';
        strengthText.textContent = 'Medium';
        return 'medium';
    } else {
        strengthFill.className = 'strength-fill strong';
        strengthText.className = 'strength-text strong';
        strengthText.textContent = 'Strong';
        return 'strong';
    }
}

passwordInput.addEventListener('input', (e) => {
    checkPasswordStrength(e.target.value);
});

// ========================================
// PASSWORD MATCHING VALIDATION
// ========================================

const passwordMatchMessage = document.getElementById('password-match');

function checkPasswordMatch() {
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    if (!confirmPassword) {
        passwordMatchMessage.textContent = '';
        passwordMatchMessage.className = 'password-match-message';
        return true;
    }

    if (password === confirmPassword) {
        passwordMatchMessage.textContent = '✓ Passwords match';
        passwordMatchMessage.className = 'password-match-message match';
        return true;
    } else {
        passwordMatchMessage.textContent = '✗ Passwords do not match';
        passwordMatchMessage.className = 'password-match-message no-match';
        return false;
    }
}

confirmPasswordInput.addEventListener('input', checkPasswordMatch);
passwordInput.addEventListener('input', checkPasswordMatch);

// ========================================
// ACCOMMODATION TOGGLE
// ========================================

const accommodationYes = document.getElementById('accommodation-yes');
const accommodationNo = document.getElementById('accommodation-no');
const accommodationDetails = document.getElementById('accommodation-details');
const accommodationType = document.getElementById('accommodation-type');
const accommodationDuration = document.getElementById('accommodation-duration');

function toggleAccommodationDetails() {
    if (accommodationYes && accommodationYes.checked) {
        accommodationDetails.style.display = 'flex';
        accommodationType.setAttribute('required', 'required');
        accommodationDuration.setAttribute('required', 'required');
    } else {
        accommodationDetails.style.display = 'none';
        accommodationType.removeAttribute('required');
        accommodationDuration.removeAttribute('required');
        accommodationType.value = '';
        accommodationDuration.value = '';
    }
}

if (accommodationYes) {
    accommodationYes.addEventListener('change', toggleAccommodationDetails);
}

if (accommodationNo) {
    accommodationNo.addEventListener('change', toggleAccommodationDetails);
}

// File upload handler removed - now using URL input for project documents

// ========================================
// SUPABASE INTEGRATION
// ========================================
import { supabase } from './supabase-client.js';

// Form Submit Handler - SUPABASE VERSION
const registerForm = document.getElementById('register-form');

registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Get password values
    const email = document.getElementById('email').value.trim();
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    // Validate password strength
    const strength = checkPasswordStrength(password);
    if (!strength || strength === 'weak') {
        alert('Please use a stronger password. Your password should be at least 8 characters long and include uppercase, lowercase, and numbers.');
        return;
    }

    // Validate password match
    if (password !== confirmPassword) {
        alert('Passwords do not match. Please check and try again.');
        return;
    }

    const accommodationRequired = document.querySelector('input[name="accommodation"]:checked')?.value === 'yes';

    const participantData = {
        email: email,
        team_name: document.getElementById('team-name').value,
        team_lead: document.getElementById('team-lead').value,
        university: document.getElementById('university').value,
        department: document.getElementById('department').value,
        phone: document.getElementById('phone').value,
        team_size: parseInt(document.getElementById('team-size').value),
        accommodation_needed: accommodationRequired,
        accommodation_type: accommodationRequired ? document.getElementById('accommodation-type').value : null,
        accommodation_duration: accommodationRequired ? document.getElementById('accommodation-duration').value : null,
        special_requirements: accommodationRequired ? document.getElementById('special-requirements').value : null,
        project_title: document.getElementById('project-title').value,
        project_category: document.getElementById('category').value,
        project_description: document.getElementById('description').value,
        problem_solved: document.getElementById('problem-solved').value,
        tech_stack: document.getElementById('tech-stack').value,
        project_url: document.getElementById('project-url').value || null,
        video_url: document.getElementById('video-url').value || null,
        project_doc_url: document.getElementById('project-doc-url').value || null
    };

    const teamMembers = collectTeamMembers();

    try {
        // Show loading state
        const submitBtn = registerForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Registering...';

        // Step 1: Create Supabase auth user
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    role: 'participant'
                }
            }
        });

        if (authError) {
            console.error('Auth error:', authError);
            alert(`Registration failed: ${authError.message}`);
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
            return;
        }

        // Step 2: Insert participant data
        participantData.user_id = authData.user.id;

        const { data: participantRecord, error: participantError } = await supabase
            .from('participants')
            .insert([participantData])
            .select()
            .single();

        if (participantError) {
            console.error('Participant error:', participantError);
            alert(`Failed to save registration: ${participantError.message}`);
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
            return;
        }

        // Step 3: Insert team members if any
        if (teamMembers.length > 0) {
            const teamMemberRecords = teamMembers.map(member => ({
                participant_id: participantRecord.id,
                member_name: member.name,
                member_email: member.email,
                member_role: member.department
            }));

            const { error: membersError } = await supabase
                .from('team_members')
                .insert(teamMemberRecords);

            if (membersError) {
                console.error('Team members error:', membersError);
                // Don't fail the whole registration, just log it
                console.warn('Team members not saved, but registration successful');
            }
        }

        console.log('Registration successful:', authData.user.email);

        // Show success message and redirect
        alert('Registration submitted successfully! You can now login with your credentials.');
        window.location.href = 'login.html';

    } catch (error) {
        console.error('Unexpected error during registration:', error);
        alert('An unexpected error occurred. Please try again.');

        const submitBtn = registerForm.querySelector('button[type="submit"]');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Complete Registration';
    }
});

