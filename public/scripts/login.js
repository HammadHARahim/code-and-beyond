// Circuit Board Background Animation
const canvas = document.getElementById('circuit-board');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
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

for (let x = 0; x < canvas.width; x += gridSize) {
    for (let y = 0; y < canvas.height; y += gridSize) {
        const offsetX = Math.random() * 40 - 20;
        const offsetY = Math.random() * 40 - 20;
        nodes.push(new CircuitNode(x + offsetX, y + offsetY));
    }
}

function animate() {
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

animate();

// Password Visibility Toggle
const togglePasswordBtn = document.getElementById('toggle-password');
const passwordInput = document.getElementById('password');

togglePasswordBtn.addEventListener('click', () => {
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
});

// Login Form Handler
const loginForm = document.getElementById('login-form');

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const role = document.querySelector('input[name="role"]:checked').value;

    // Hardcoded admin credentials (for development only - use backend auth in production)
    // Credentials from admin-credentials.json
    const ADMIN_EMAIL = 'admin@codebeyond.event';
    const ADMIN_PASSWORD = 'CodeBeyond2025!';

    // Check if trying to login as admin
    if (role === 'admin') {
        if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
            // Admin login successful
            localStorage.setItem('currentUser', JSON.stringify({
                email: ADMIN_EMAIL,
                role: 'admin',
                loginTime: new Date().toISOString()
            }));
            console.log('Admin login successful');
            window.location.href = 'admin.html';
            return;
        } else {
            alert('Invalid admin credentials. Please check your email and password.');
            return;
        }
    }

    // Regular participant login
    const users = JSON.parse(localStorage.getItem('codeAndBeyondUsers') || '[]');
    const user = users.find(u => u.email === email);

    // Validate credentials
    if (!user) {
        alert('Email not found. Please register first or check your email address.');
        return;
    }

    if (user.password !== password) {
        alert('Incorrect password. Please try again.');
        return;
    }

    // Store current session
    localStorage.setItem('currentUser', JSON.stringify({
        email: user.email,
        role: 'participant',
        loginTime: new Date().toISOString()
    }));

    console.log('Participant login successful:', { email });
    window.location.href = 'participant.html';
});
