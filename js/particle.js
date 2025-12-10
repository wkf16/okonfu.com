const canvas = document.getElementById('particle-canvas');
const ctx = canvas.getContext('2d');

let particles = [];
let mouse = { x: null, y: null, radius: 100 };

// Configuration
const TEXT_STRING = "okonfu"; // The name
const FONT_FAMILY = "'Outfit', sans-serif"; // Ensure this font is loaded or fallback
const PARTICLE_SIZE = 1.5;
const PARTICLE_SPACING = 4;
// const PARTICLE_COLOR = 'rgba(57, 197, 187, 0.9)'; // Hardcoded teal
const ACCENT_COLOR_RGB = "57, 197, 187";

// Handle resize
window.addEventListener('resize', init);
window.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
});
window.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
});

class Particle {
    constructor(x, y) {
        // Start close to the target for a "fade in" feel
        this.x = x + (Math.random() - 0.5) * 20;
        this.y = y + (Math.random() - 0.5) * 20;
        this.targetX = x;
        this.targetY = y;
        this.vx = 0;
        this.vy = 0;
        this.size = PARTICLE_SIZE;
        this.alpha = 0; // Start invisible

        // Physics properties
        this.friction = 0.9;
        this.ease = 0.1;

        this.driftX = (Math.random() - 0.5) * 0.5;
        this.driftY = (Math.random() - 0.5) * 0.5;

        this.fadeSpeed = 0.01 + Math.random() * 0.02;
    }

    update() {
        // Fade in
        if (this.alpha < 1) {
            this.alpha += this.fadeSpeed;
        }

        let dx = mouse.x - this.x;
        let dy = mouse.y - this.y;
        let distance = Math.sqrt(dx * dx + dy * dy);

        // Repulsion
        if (mouse.x != null && distance < mouse.radius) {
            const forceDirectionX = dx / distance;
            const forceDirectionY = dy / distance;
            const maxDistance = mouse.radius;
            const force = (maxDistance - distance) / maxDistance;
            const directionX = forceDirectionX * force * 5;
            const directionY = forceDirectionY * force * 5;

            this.vx -= directionX;
            this.vy -= directionY;
        }

        // Return to home
        let homeDx = this.targetX - this.x;
        let homeDy = this.targetY - this.y;

        // Idle drift
        if (Math.abs(homeDx) < 5 && Math.abs(homeDy) < 5) {
            this.x += Math.sin(Date.now() * 0.001 + this.targetY) * 0.1;
            this.y += Math.cos(Date.now() * 0.001 + this.targetX) * 0.1;
        }

        this.vx += homeDx * this.ease;
        this.vy += homeDy * this.ease;

        this.vx *= this.friction;
        this.vy *= this.friction;

        this.x += this.vx;
        this.y += this.vy;
    }

    draw() {
        ctx.fillStyle = `rgba(${ACCENT_COLOR_RGB}, ${this.alpha})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

function init() {
    if (!canvas) return;

    const container = canvas.parentElement;
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;

    particles = [];

    // Responsive font size
    const maxFontSize = 120;
    const padding = 40;
    const responsiveFontSize = Math.min(maxFontSize, (canvas.width - padding) / 4);

    const offscreen = document.createElement('canvas');
    const offCtx = offscreen.getContext('2d');
    offscreen.width = canvas.width;
    offscreen.height = canvas.height;

    offCtx.font = `700 ${responsiveFontSize}px ${FONT_FAMILY}`;
    offCtx.fillStyle = 'white';
    offCtx.textAlign = 'center';
    offCtx.textBaseline = 'middle';
    offCtx.fillText(TEXT_STRING, offscreen.width / 2, offscreen.height / 2);

    const textData = offCtx.getImageData(0, 0, offscreen.width, offscreen.height).data;

    for (let y = 0; y < offscreen.height; y += PARTICLE_SPACING) {
        for (let x = 0; x < offscreen.width; x += PARTICLE_SPACING) {
            const index = (y * offscreen.width + x) * 4;
            const alpha = textData[index + 3];

            if (alpha > 128) {
                particles.push(new Particle(x, y));
            }
        }
    }
}

function animate() {
    if (!canvas) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
    }

    requestAnimationFrame(animate);
}

// Load fonts then start
if (document.fonts) {
    document.fonts.ready.then(() => {
        init();
        animate();
    });
} else {
    // Fallback
    setTimeout(() => {
        init();
        animate();
    }, 500);
}
