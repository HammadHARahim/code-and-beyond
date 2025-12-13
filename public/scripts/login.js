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

// Import Supabase client
import { supabase } from './supabase-client.js';

// Login Form Handler
const loginForm = document.getElementById('login-form');

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const selectedRole = document.querySelector('input[name="role"]:checked').value;

    try {
        // Sign in with Supabase
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            if (error.message.includes('Invalid login credentials')) {
                alert('Invalid email or password. Please try again.');
            } else {
                alert(`Login failed: ${error.message}`);
            }
            return;
        }

        // Get user metadata to check role
        const userRole = data.user.user_metadata?.role || 'participant';

        // Verify role matches selection
        if (selectedRole === 'admin' && userRole !== 'admin') {
            alert('You do not have admin privileges. Please login as a participant.');
            await supabase.auth.signOut();
            return;
        }

        if (selectedRole === 'participant' && userRole === 'admin') {
            alert('Admin accounts cannot login as participants. Please select Admin role.');
            await supabase.auth.signOut();
            return;
        }

        // Successful login - redirect based on role
        console.log(`${userRole} login successful:`, data.user.email);

        if (userRole === 'admin') {
            window.location.href = 'admin.html';
        } else {
            window.location.href = 'participant.html';
        }

    } catch (error) {
        console.error('Login error:', error);
        alert('An unexpected error occurred. Please try again.');
    }
});
