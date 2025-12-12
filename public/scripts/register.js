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
// PASSWORD VISIBILITY TOGGLE
// ========================================

const passwordInput = document.getElementById('password');
const confirmPasswordInput = document.getElementById('confirm-password');
const togglePassword = document.getElementById('toggle-password');
const toggleConfirmPassword = document.getElementById('toggle-confirm-password');

togglePassword.addEventListener('click', () => {
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
});

toggleConfirmPassword.addEventListener('click', () => {
    const type = confirmPasswordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    confirmPasswordInput.setAttribute('type', type);
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

// ========================================
// FILE UPLOAD HANDLER
// ========================================
const fileInput = document.getElementById('project-doc');
const fileNameDisplay = document.getElementById('file-name');

fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        fileNameDisplay.textContent = file.name;
    } else {
        fileNameDisplay.textContent = 'Upload PDF/DOC';
    }
});

// Form Submit Handler
const registerForm = document.getElementById('register-form');

registerForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Get password values
    const email = document.getElementById('email').value;
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

    const formData = {
        email: email,
        teamName: document.getElementById('team-name').value,
        teamLead: document.getElementById('team-lead').value,
        university: document.getElementById('university').value,
        department: document.getElementById('department').value,
        phone: document.getElementById('phone').value,
        teamSize: document.getElementById('team-size').value,
        accommodation: {
            required: accommodationRequired,
            type: accommodationRequired ? document.getElementById('accommodation-type').value : null,
            duration: accommodationRequired ? document.getElementById('accommodation-duration').value : null,
            specialRequirements: accommodationRequired ? document.getElementById('special-requirements').value : null
        },
        projectTitle: document.getElementById('project-title').value,
        category: document.getElementById('category').value,
        description: document.getElementById('description').value,
        problemSolved: document.getElementById('problem-solved').value,
        techStack: document.getElementById('tech-stack').value,
        projectUrl: document.getElementById('project-url').value,
        videoUrl: document.getElementById('video-url').value,
    };

    // Store credentials in localStorage (FOR DEVELOPMENT ONLY!)
    const credentials = {
        email: email,
        password: password, // WARNING: Plain text password - NOT SECURE!
        registrationData: formData,
        registeredAt: new Date().toISOString()
    };

    // Get existing users or create new array
    let users = JSON.parse(localStorage.getItem('codeAndBeyondUsers') || '[]');

    // Check if email already exists
    const existingUserIndex = users.findIndex(u => u.email === email);
    if (existingUserIndex >= 0) {
        // Update existing user
        users[existingUserIndex] = credentials;
    } else {
        // Add new user
        users.push(credentials);
    }

    localStorage.setItem('codeAndBeyondUsers', JSON.stringify(users));

    console.log('Registration submitted:', formData);

    // Show success message and redirect
    alert('Registration submitted successfully! You can now login with your credentials.');
    window.location.href = 'login.html';
});
