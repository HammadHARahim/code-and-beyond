// ========================================
// PARTICIPANT DASHBOARD - INTERACTIVE
// ========================================

document.addEventListener('DOMContentLoaded', () => {
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
function formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Generate random participant ID
function generateParticipantID() {
    const year = new Date().getFullYear();
    const num = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
    return `CB-${year}-${num}`;
}

console.log('Participant Dashboard loaded with Matrix Rain + Neural Network background');
