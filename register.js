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

// File Upload Handler
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

    const formData = {
        teamName: document.getElementById('team-name').value,
        teamLead: document.getElementById('team-lead').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        teamSize: document.getElementById('team-size').value,
        projectTitle: document.getElementById('project-title').value,
        category: document.getElementById('category').value,
        description: document.getElementById('description').value,
        techStack: document.getElementById('tech-stack').value,
        projectUrl: document.getElementById('project-url').value,
        videoUrl: document.getElementById('video-url').value,
    };

    console.log('Registration submitted:', formData);

    // Show success message and redirect
    alert('Registration submitted successfully! You will receive a confirmation email shortly.');
    window.location.href = 'login.html';
});
