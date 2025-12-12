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

// Login Form Handler
const loginForm = document.getElementById('login-form');

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const role = document.querySelector('input[name="role"]:checked').value;

    // Get stored users from localStorage
    const users = JSON.parse(localStorage.getItem('codeAndBeyondUsers') || '[]');

    // Find user with matching email
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
        role: role,
        loginTime: new Date().toISOString()
    }));

    console.log('Login successful:', { email, role });

    // Redirect based on role
    if (role === 'admin') {
        window.location.href = 'admin.html';
    } else {
        window.location.href = 'participant.html';
    }
});
