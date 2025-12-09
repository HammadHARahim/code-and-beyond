// ========================================
// PARTICIPANT DASHBOARD - INTERACTIVE
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    initCircuitBoard();
    initNavigation();
    initButtons();
    initAnimations();
});

// ========================================
// CIRCUIT BOARD BACKGROUND
// ========================================

function initCircuitBoard() {
    const canvas = document.getElementById('circuit-board');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const lines = [];
    const nodes = [];
    const lineCount = 30;
    const nodeCount = 50;

    // Create horizontal and vertical circuit lines
    for (let i = 0; i < lineCount; i++) {
        lines.push({
            type: Math.random() > 0.5 ? 'horizontal' : 'vertical',
            position: Math.random() * (lines.type === 'horizontal' ? canvas.height : canvas.width),
            offset: Math.random() * 100,
            speed: Math.random() * 0.5 + 0.2
        });
    }

    // Create circuit nodes
    for (let i = 0; i < nodeCount; i++) {
        nodes.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 3 + 2,
            pulse: Math.random() * Math.PI * 2
        });
    }

    function drawCircuitBoard() {
        ctx.fillStyle = 'rgba(5, 5, 16, 0.1)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw lines
        ctx.strokeStyle = '#00d4ff';
        ctx.lineWidth = 0.5;

        lines.forEach(line => {
            line.offset += line.speed;
            if (line.offset > 100) line.offset = 0;

            const alpha = Math.sin(line.offset / 100 * Math.PI) * 0.3 + 0.2;
            ctx.globalAlpha = alpha;

            ctx.beginPath();
            if (line.type === 'horizontal') {
                ctx.moveTo(0, line.position);
                ctx.lineTo(canvas.width, line.position);
            } else {
                ctx.moveTo(line.position, 0);
                ctx.lineTo(line.position, canvas.height);
            }
            ctx.stroke();
        });

        // Draw nodes
        nodes.forEach(node => {
            node.pulse += 0.05;
            const pulseFactor = Math.sin(node.pulse) * 0.5 + 0.5;

            ctx.globalAlpha = pulseFactor * 0.6;
            ctx.fillStyle = '#00d4ff';
            ctx.beginPath();
            ctx.arc(node.x, node.y, node.size, 0, Math.PI * 2);
            ctx.fill();

            // Glow effect
            ctx.globalAlpha = pulseFactor * 0.3;
            ctx.beginPath();
            ctx.arc(node.x, node.y, node.size * 2, 0, Math.PI * 2);
            ctx.fill();
        });

        ctx.globalAlpha = 1;
        requestAnimationFrame(drawCircuitBoard);
    }

    drawCircuitBoard();

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
            alert('Share your entry pass via:\n• Email\n• WhatsApp\n• Social Media');
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

console.log('Participant Dashboard loaded successfully');
